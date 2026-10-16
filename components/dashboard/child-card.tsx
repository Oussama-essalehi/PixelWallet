'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  GamepadIcon, 
  Pen, 
  TrendingUp,
  Eye,
  Shield,
  Coins,
  FileQuestion,
  CircleUserRound,
  Crown,
  Star,
  Trophy,
  Medal,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { VirtualCard } from '../child-dashboard/virtual-card';
import { EditChildProfileForm } from '../child-account/edit-profile-form';
import { calculateLevel, calculateLevelProgress } from '@/lib/xp-manager';

export type ChildAccount = Database['public']['Tables']['child_accounts']['Row'] & {
  parent_id: string;
  banned_categories?: string[];
  age_restrictions?: string[];
  virtual_cards?: {
    id: string;
    balance: number;
    stripe_card_id: string;
    stripe_cardholder_id: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    status: string;
    currency: string;
  }
};

interface ChildDetails {
  totalSpent: number;
  currentBalance: number;
  maxMonthlySpend: number;
  spendingByCategory: { category: string; amount: number; percentage: number }[];
  recentPurchases: { 
    id: string; 
    type: 'game';
    amount: number; 
    merchant: string; 
    date: string; 
    category: string;
    details: {
      game_name: string;
      age_restriction: string;
      platform?: string;
      description?: string;
    }
  }[];
  gamePurchases?: Array<{
    id: string;
    game_name: string;
    category: string;
    age_restriction: string;
    merchant: string;
    amount: number;
    purchase_date: string;
    platform?: string;
    description?: string;
  }>;
  xp: number;
  coins: number;
  quizzesTaken: number;
  quizzesPassed: number;
  dailyStreak: number;
  lastConnection: string | null;
}

interface Reward {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const getRankForLevel = (level: number): Reward => {
  if (level >= 20) return {
    title: "Maître du jeu",
    description: "Expert en gaming et gestion",
    icon: <Crown className="h-4 w-4" />,
    color: "bg-yellow-500"
  };
  if (level >= 15) return {
    title: "Expert",
    description: "Joueur chevronné",
    icon: <Star className="h-4 w-4" />,
    color: "bg-purple-500"
  };
  if (level >= 10) return {
    title: "Confirmé",
    description: "Joueur expérimenté",
    icon: <Trophy className="h-4 w-4" />,
    color: "bg-blue-500"
  };
  if (level >= 5) return {
    title: "Intermédiaire",
    description: "En bonne progression",
    icon: <Medal className="h-4 w-4" />,
    color: "bg-green-500"
  };
  return {
    title: "Débutant",
    description: "Début de l'aventure",
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-indigo-500"
  };
};

export function ChildCard({ account }: { account: ChildAccount }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<ChildDetails | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchChildDetails = async () => {
    setLoading(true);
    try {
      // Fetch game purchases
      const { data: gamePurchasesData, error: gamePurchasesError } = await supabase
        .from('game_purchases')
        .select('*')
        .eq('child_account_id', account.id)
        .order('purchase_date', { ascending: false })
        .limit(10);

      if (gamePurchasesError) throw gamePurchasesError;

      // Calculate total spent
      const totalSpent = gamePurchasesData.reduce((sum, purchase) => sum + purchase.amount, 0);
      
      // Group purchases by category
      const categoryMap = new Map<string, { amount: number; count: number }>();
      gamePurchasesData.forEach(purchase => {
        const category = purchase.category || 'Autres';
        const existing = categoryMap.get(category) || { amount: 0, count: 0 };
        categoryMap.set(category, {
          amount: existing.amount + purchase.amount,
          count: existing.count + 1
        });
      });

      const spendingByCategory = Array.from(categoryMap)
        .map(([category, data]) => ({
          category,
          amount: data.amount,
          percentage: (data.amount / totalSpent) * 100
        }))
        .sort((a, b) => b.amount - a.amount);

      // Fetch progression and quizzes
      const [
        progressionResponse,
        quizzesResponse
      ] = await Promise.all([
        supabase
          .from('user_progression')
          .select('*')
          .eq('child_account_id', account.id)
          .single(),
        
        supabase
          .from('user_quizzes')
          .select('*')
          .eq('child_account_id', account.id)
      ]);

      const xp = progressionResponse.data?.total_xp || 0;
      
      setDetails({
        totalSpent,
        currentBalance: account.virtual_cards?.balance || 0,
        maxMonthlySpend: account.max_monthly_spend || 0,
        spendingByCategory,
        recentPurchases: gamePurchasesData.map(purchase => ({
          id: purchase.id,
          type: 'game',
          amount: purchase.amount,
          merchant: purchase.merchant,
          date: new Date(purchase.purchase_date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          category: purchase.category,
          details: {
            game_name: purchase.game_name,
            age_restriction: purchase.age_restriction,
            platform: purchase.platform,
            description: purchase.description
          }
        })),
        xp,
        coins: account.coins || 0,
        quizzesTaken: quizzesResponse.data?.length || 0,
        quizzesPassed: quizzesResponse.data?.filter(q => q.score >= 2).length || 0,
        dailyStreak: progressionResponse.data?.daily_streak || 0,
        lastConnection: progressionResponse.data?.last_connection
      });
    } catch (error) {
      console.error('Error fetching child details:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchChildDetails();
  }, [account.id]);

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Header with Avatar and Name */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${account.id}`} />
              <AvatarFallback>{account.first_name[0]}{account.last_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{account.first_name} {account.last_name}</h3>
              <p className="text-sm text-gray-500">{account.email}</p>
            </div>
          </div>
        </div>

        {/* Virtual Card Display */}
        {account.virtual_cards ? (
          <VirtualCard
            firstName={account.first_name}
            lastName={account.last_name}
            brand={account.virtual_cards.brand}
            last4={account.virtual_cards.last4}
            expMonth={account.virtual_cards.exp_month}
            expYear={account.virtual_cards.exp_year}
            status={account.virtual_cards.status}
            currency={account.virtual_cards.currency}
            cardId={account.virtual_cards.stripe_card_id}
          />
        ) : (
          <Card className="relative h-[200px] w-[350px] overflow-hidden rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 p-6">
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-600">
              <CreditCard className="mb-2 h-12 w-12" />
              <p className="text-sm font-medium">Pas de carte virtuelle</p>
              <p className="mt-1 text-xs">Effectuez votre premier rechargement pour créer la carte</p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => {
            setIsDetailsDialogOpen(open);
            if (open) fetchChildDetails();
          }}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                Voir détails
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex justify-between items-center pr-4">
                  <div>
                    <DialogTitle>Détails du compte</DialogTitle>
                    <DialogDescription>
                      Statistiques et historique des achats de {account.first_name}
                    </DialogDescription>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
                    <Pen className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </DialogHeader>

              {/* Nouvelle section de stats en haut de la popup */}
              <div className="mb-6 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <CircleUserRound className="h-5 w-5 text-indigo-600 mb-2" />
                      <div className="text-lg font-bold">
                        {details ? calculateLevel(details.xp) : 1}
                      </div>
                      <div className="text-sm text-gray-500">Niveau</div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <TrendingUp className="h-5 w-5 text-green-600 mb-2" />
                      <div className="text-lg font-bold">{details?.xp || 0}</div>
                      <div className="text-sm text-gray-500">XP Total</div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <Coins className="h-5 w-5 text-yellow-600 mb-2" />
                      <div className="text-lg font-bold">{details?.coins || 0}</div>
                      <div className="text-sm text-gray-500">Coins</div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <FileQuestion className="h-5 w-5 text-purple-600 mb-2" />
                      <div className="text-lg font-bold">
                        {details?.quizzesPassed || 0}/{details?.quizzesTaken || 0}
                      </div>
                      <div className="text-sm text-gray-500">Quiz réussis</div>
                    </div>
                  </Card>
                </div>
              </div>

              {isEditDialogOpen ? (
                <div className="mt-6">
                  <EditChildProfileForm 
                    childAccount={{
                      ...account,
                      banned_categories: account.banned_categories || [],
                      age_restrictions: account.age_restrictions || []
                    }} 
                    onSuccess={() => {
                      setIsEditDialogOpen(false);
                      router.refresh();
                    }}
                  />
                </div>
              ) : (
                <Tabs defaultValue="stats">
                  <TabsList>
                    <TabsTrigger value="stats">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Statistiques
                    </TabsTrigger>
                    <TabsTrigger value="progression">
                      <Shield className="h-4 w-4 mr-2" />
                      Progression
                    </TabsTrigger>
                    <TabsTrigger value="purchases">
                      <GamepadIcon className="h-4 w-4 mr-2" />
                      Achats
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="stats" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4 text-center">
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <h4 className="font-semibold">{details?.currentBalance.toFixed(2) || '0.00'} €</h4>
                        <p className="text-sm text-muted-foreground">Solde actuel</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <h4 className="font-semibold">{details?.totalSpent.toFixed(2) || '0.00'} €</h4>
                        <p className="text-sm text-muted-foreground">Total dépensé</p>
                      </Card>
                      <Card className="p-4 text-center">
                        <GamepadIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <h4 className="font-semibold">{details?.maxMonthlySpend.toFixed(2) || '0.00'} €</h4>
                        <p className="text-sm text-muted-foreground">Allocation mensuelle</p>
                      </Card>
                    </div>

                    {details?.spendingByCategory.map((category) => (
                      <Card key={category.category} className="p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{category.category}</h4>
                          <span className="text-muted-foreground">{category.amount.toFixed(2)} €</span>
                        </div>
                        <Progress value={category.percentage} />
                        <p className="text-sm text-muted-foreground text-center mt-1">
                          {category.percentage.toFixed(0)}% des dépenses
                        </p>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="progression" className="space-y-4">
                    <div className="grid gap-4">
                      <Card className="p-4">
                        <h3 className="font-semibold mb-2">Progression</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span>Niveau {details ? calculateLevel(details.xp) : 1}</span>
                            <span>{details?.xp || 0} XP</span>
                          </div>
                          <Progress 
                            value={calculateLevelProgress(details?.xp || 0)} 
                            className="h-2"
                          />
                          {details?.lastConnection && (
                            <p className="text-sm text-gray-500 mt-2">
                              Dernière connexion: {new Date(details.lastConnection).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-semibold mb-2">Quiz</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-2xl font-bold">{details?.quizzesPassed || 0}</div>
                            <div className="text-sm text-gray-500">Quiz réussis</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold">{details?.quizzesTaken || 0}</div>
                            <div className="text-sm text-gray-500">Quiz tentés</div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4">
                        <h3 className="font-semibold mb-2">Série quotidienne</h3>
                        <div className="text-2xl font-bold">{details?.dailyStreak || 0} jours</div>
                        <div className="text-sm text-gray-500">de connexion consécutifs</div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="purchases" className="space-y-4">
                    {details?.recentPurchases.length ? (
                      <div className="grid gap-3">
                        {details.recentPurchases.map((purchase) => (
                          <Card key={purchase.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h4 className="font-semibold text-lg">{purchase.details.game_name}</h4>
                                {purchase.details.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {purchase.details.description}
                                  </p>
                                )}
                              </div>
                              <h4 className="font-semibold text-red-500 text-lg">
                                -{purchase.amount.toFixed(2)} €
                              </h4>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-2">
                                <Badge variant="secondary" className="bg-indigo-700 text-white">
                                  {purchase.category}
                                </Badge>
                                <Badge variant="destructive">
                                  Âge: {purchase.details.age_restriction}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {purchase.date}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Aucun achat pour le moment</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
}