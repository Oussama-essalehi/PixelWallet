'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { 
  CreditCard, 
  GamepadIcon, 
  TrendingUp, 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { VirtualCard } from '../child-dashboard/virtual-card';
import { GamePurchaseCategory, AgeRestriction } from '@/lib/database.types';

type ChildAccount = Database['public']['Tables']['child_accounts']['Row'] & {
  parent_id: string;
  virtual_card?: {
    card_number: string;
    expiry_date: string;
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
}

export function ChildCard({ account }: { account: ChildAccount }) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<ChildDetails | null>(null);

  const fetchChildDetails = async () => {
    if (details) return;
    setLoading(true);
    try {
      // Fetch game purchases
      const { data: gamePurchasesData, error: gamePurchasesError } = await supabase
        .from('game_purchases')
        .select('*')
        .eq('child_account_id', account.id)
        .order('purchase_date', { ascending: false })
        .limit(10);

      console.log('Game purchases data:', gamePurchasesData);

      if (gamePurchasesError) {
        throw gamePurchasesError;
      }

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

      // Prepare recent purchases
      const recentPurchases = gamePurchasesData.map(purchase => ({
        id: purchase.id,
        type: 'game' as const,
        amount: purchase.amount,
        merchant: purchase.merchant,
        date: new Date(purchase.purchase_date).toLocaleDateString(),
        category: purchase.category,
        details: {
          game_name: purchase.game_name,
          age_restriction: purchase.age_restriction,
          platform: purchase.platform,
          description: purchase.description
        }
      }));

      setDetails({
        totalSpent,
        currentBalance: account.current_balance,
        maxMonthlySpend: account.max_monthly_spend || 0,
        spendingByCategory,
        recentPurchases,
        gamePurchases: gamePurchasesData
      });
    } catch (error) {
      console.error('Error fetching child details:', error);
    } finally {
      setLoading(false);
    }
  };

  const firstNameInitial = account.first_name.charAt(0).toUpperCase();

  return (
    <div>
      <Card className="w-full max-w-md">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
              {firstNameInitial}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{account.first_name} {account.last_name}</h3>
              <p className="text-2xl font-bold">{account.current_balance.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      
        {account.virtual_card && (
          <div className='p-2'>
            <VirtualCard 
              firstName={account.first_name} 
              lastName={account.last_name} 
              cardNumber={account.virtual_card.card_number} 
              expiryDate={account.virtual_card.expiry_date} 
            />
          </div>
        )}
      
        <Dialog onOpenChange={(open) => open && fetchChildDetails()}>
          <DialogTrigger asChild>
            <Button variant="default" className="w-full rounded-none rounded-b-md">
              Voir détails
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage 
                    src={`https://avatar.vercel.sh/${account.id}.svg`} 
                    alt={`${account.first_name}'s avatar`} 
                  />
                  <AvatarFallback>
                    {account.first_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{account.first_name} {account.last_name}</h2>
                  <p className="text-sm text-muted-foreground">{account.email}</p>
                </div>
              </DialogTitle>
              <DialogDescription>
                Détails financiers et activités récentes
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="achats">Achats</TabsTrigger>
                <TabsTrigger value="categories">Catégories</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="grid grid-cols-3 gap-4 mt-4">
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
                <Progress 
                  value={(details?.totalSpent || 0) / (details?.maxMonthlySpend || 1) * 100} 
                  className="mt-4" 
                />
                <p className="text-sm text-muted-foreground text-center mt-2">
                  {((details?.totalSpent || 0) / (details?.maxMonthlySpend || 1) * 100).toFixed(0)}% de l'allocation utilisé
                </p>
              </TabsContent>

              <TabsContent value="achats" className="space-y-4 p-2">
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
                            -{ purchase.amount.toFixed(2) } €
                          </h4>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Badge variant="secondary" className="bg-indigo-700 text-white hover:bg-indigo-700 hover:text-white">
                              {purchase.category}
                            </Badge>
                            <Badge variant="destructive" className="text-xs hover:bg-red-600 hover:text-white">
                              Âge: {purchase.details.age_restriction}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {purchase.date}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Badge variant="secondary" className="bg-indigo-500 text-white hover:bg-indigo-500 hover:text-white">
                            Vendeur: {purchase.merchant}
                          </Badge>
                          {purchase.details.platform && (
                            <Badge variant="secondary" className="bg-indigo-500 text-white hover:bg-indigo-500 hover:text-white">
                              Plateforme: {purchase.details.platform}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-16">
                    <p className="text-lg">Il n'y a pas encore d'achats</p>
                    <p className="text-sm">Vos achats apparaîtront ici</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="categories" className="flex items-center justify-center">
                {details?.spendingByCategory.length ? (
                  <div className="w-full space-y-2">
                    {details.spendingByCategory.map((category) => (
                      <Card key={category.category} className="p-3 mb-2">
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
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-16">
                    <p>Aucune catégorie de dépenses</p>
                    <p className="text-sm">Vos catégories apparaîtront ici</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}