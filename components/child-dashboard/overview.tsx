'use client';

import { useState, useEffect } from 'react';
import { VirtualCard } from './virtual-card';
import { BalanceCard } from './balance-card';
import { OverviewStats } from './overview-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import type { ChildAccount } from '@/lib/types';
import { GamePurchaseCard } from './game-purchase-card';
import { UserStats } from './user-stats';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarSection } from './avatar-section';
import { UserLevel } from './user-level';
import { awardXP, XP_ACTIONS } from '@/lib/xp-manager';
import { QuizSection } from './quiz-section';
import { toast } from 'sonner';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { subMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChildDashboardOverviewProps {
  account: ChildAccount;
}

export function ChildDashboardOverview({ account }: ChildDashboardOverviewProps) {
  const [gamePurchases, setGamePurchases] = useState<any[]>([]);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [dailySpent, setDailySpent] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [spendingHistory, setSpendingHistory] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [dailyBonusAwarded, setDailyBonusAwarded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const [purchasesResponse, monthlyTotalResponse, statsResponse] = await Promise.all([
        supabase
          .from('game_purchases')
          .select('*')
          .eq('child_account_id', account.id)
          .order('purchase_date', { ascending: false })
          .limit(5),
        
        supabase
          .from('game_purchases')
          .select('amount')
          .eq('child_account_id', account.id)
          .gte('purchase_date', firstDayOfMonth.toISOString())
          .lte('purchase_date', currentDate.toISOString()),
        
        supabase.rpc('get_purchase_statistics', { account_id: account.id })
      ]);

      if (purchasesResponse.data) setGamePurchases(purchasesResponse.data);
      if (monthlyTotalResponse.data) {
        setMonthlySpent(monthlyTotalResponse.data.reduce((sum, purchase) => sum + purchase.amount, 0));
      }
      if (statsResponse.data) setStats(statsResponse.data);
    }

    fetchData();
  }, [account.id]);

  useEffect(() => {
    async function handleDailyLogin() {
      if (dailyBonusAwarded) return;

      try {
        const { data: lastConnection } = await supabase
          .from('user_progression')
          .select('last_connection, daily_streak')
          .eq('child_account_id', account.id)
          .single();

        const now = new Date();
        const lastLoginDate = lastConnection?.last_connection 
          ? new Date(lastConnection.last_connection) 
          : null;

        // Vérifier si l'utilisateur s'est déjà connecté aujourd'hui
        if (lastLoginDate && format(new Date(lastLoginDate), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
          setDailyBonusAwarded(true); // Marquer comme déjà attribué aujourd'hui
          return; // Ne pas donner de bonus si déjà connecté aujourd'hui
        }

        // Si on arrive ici, c'est une nouvelle journée
        const isConsecutiveDay = lastLoginDate && 
          format(addDays(new Date(lastLoginDate), 1), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

        // Calculer le nouveau streak
        const newStreak = isConsecutiveDay 
          ? (lastConnection?.daily_streak || 0) + 1 
          : 1;

        // Mettre à jour last_connection et daily_streak
        await supabase
          .from('user_progression')
          .update({ 
            last_connection: now.toISOString(),
            daily_streak: newStreak
          })
          .eq('child_account_id', account.id);

        // Attribuer XP pour la connexion quotidienne
        const result = await awardXP(account.id, XP_ACTIONS.DAILY_LOGIN, 'DAILY_LOGIN');
        
        if (result.success) {
          setDailyBonusAwarded(true);
          toast.success(`+${XP_ACTIONS.DAILY_LOGIN} XP`, {
            description: `Bonus de connexion quotidienne ! (${newStreak} jours consécutifs)`,
            duration: 3000,
          });

          if (result.leveledUp) {
            toast.success(`Niveau ${result.newLevel} atteint !`, {
              description: "Félicitations, vous avez gagné un niveau !",
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('Error handling daily login:', error);
      }
    }

    handleDailyLogin();
  }, [account.id, dailyBonusAwarded]);

  // Fonction pour récupérer les données selon la période
  async function fetchSpendingHistory(period: string) {
    let startDate;
    const now = new Date();

    switch (period) {
      case '7d':
        startDate = subMonths(now, 0);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '1m':
        startDate = subMonths(now, 1);
        break;
      case '3m':
        startDate = subMonths(now, 3);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      case '1y':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subMonths(now, 6);
    }

    const { data: historyData } = await supabase
      .from('game_purchases')
      .select('amount, purchase_date')
      .eq('child_account_id', account.id)
      .gte('purchase_date', startDate.toISOString())
      .order('purchase_date');

    if (historyData) {
      const groupingFormat = period === '7d' ? 'dd MMM' : 'MMM yyyy';
      
      // Grouper les dépenses par période
      const groupedData = historyData.reduce((acc: any, purchase: any) => {
        const dateKey = format(new Date(purchase.purchase_date), groupingFormat, { locale: fr });
        acc[dateKey] = (acc[dateKey] || 0) + purchase.amount;
        return acc;
      }, {});

      // Convertir en format pour Recharts
      const chartData = Object.entries(groupedData).map(([date, total]) => ({
        date,
        total,
      }));

      setSpendingHistory(chartData);
    }
  }

  useEffect(() => {
    fetchSpendingHistory(selectedPeriod);
  }, [selectedPeriod, account.id]);

  if (!account.virtual_cards) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">
            Votre compte est en cours de configuration. Veuillez patienter...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">
        Content de te revoir, {account.first_name} !
      </h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="wallet">Portefeuille</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="space-y-8">
            {/* Profile Header */}
            <AvatarSection account={account} monthlySpent={monthlySpent} />

            {/* User Level & Progress */}
            <UserLevel childAccountId={account.id} />

            {/* Quiz Section */}
            <QuizSection childAccountId={account.id} />
          </div>
        </TabsContent>

        <TabsContent value="wallet">
          <div className="space-y-8">
            {/* Virtual Card and Balance */}
            <div className="grid md:grid-cols-2 gap-6">
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
              <BalanceCard balance={account.virtual_cards.balance} />
            </div>

            {/* Statistics Grid - Moved here from profile tab */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <UserStats stats={stats} />
            </div>

            {/* Spending Stats */}
            <OverviewStats
              dailySpent={dailySpent}
              maxDailyPurchases={account.max_daily_purchases}
              monthlySpent={monthlySpent}
              maxMonthlySpend={account.max_monthly_spend}
            />
            
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Évolution des dépenses</h3>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sélectionner la période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 derniers jours</SelectItem>
                      <SelectItem value="1m">Dernier mois</SelectItem>
                      <SelectItem value="3m">3 derniers mois</SelectItem>
                      <SelectItem value="6m">6 derniers mois</SelectItem>
                      <SelectItem value="1y">Dernière année</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={spendingHistory}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#6b7280' }}
                      />
                      <YAxis 
                        tick={{ fill: '#6b7280' }}
                        tickLine={{ stroke: '#6b7280' }}
                        tickFormatter={(value) => `${value}€`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.5rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}€`, 'Dépenses']}
                        labelStyle={{ color: '#374151' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#6366f1"
                        strokeWidth={2}
                        dot={{
                          fill: '#6366f1',
                          strokeWidth: 2,
                          r: 4,
                        }}
                        activeDot={{
                          fill: '#4f46e5',
                          strokeWidth: 2,
                          r: 6,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  {selectedPeriod === '7d' ? 'Dépenses quotidiennes' : 'Dépenses mensuelles'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}