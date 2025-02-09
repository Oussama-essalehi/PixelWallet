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

interface ChildDashboardOverviewProps {
  account: ChildAccount;
}

export function ChildDashboardOverview({ account }: ChildDashboardOverviewProps) {
  const [gamePurchases, setGamePurchases] = useState<any[]>([]);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [dailySpent, setDailySpent] = useState(0);

  useEffect(() => {
    async function fetchGamePurchases() {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const today = new Date().toISOString();

      const { data: purchases, error } = await supabase
        .from('game_purchases')
        .select('*')
        .eq('child_account_id', account.id)
        .order('purchase_date', { ascending: false })
        .limit(5);

      const { data: monthlyTotal } = await supabase
        .from('game_purchases')
        .select('amount')
        .eq('child_account_id', account.id)
        .gte('purchase_date', firstDayOfMonth.toISOString())
        .lte('purchase_date', currentDate.toISOString());

      if (purchases) setGamePurchases(purchases);
      if (monthlyTotal) setMonthlySpent(monthlyTotal.reduce((sum, purchase) => sum + purchase.amount, 0));
    }

    fetchGamePurchases();
  }, [account.id]);

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
      <div className="grid md:grid-cols-2 gap-6 mb-8">
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="transactions">Derniers achats</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewStats
            dailySpent={dailySpent}
            maxDailyPurchases={account.max_daily_purchases}
            monthlySpent={monthlySpent}
            maxMonthlySpend={account.max_monthly_spend}
          />
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          {gamePurchases.length > 0 ? (
            gamePurchases.map((purchase) => (
              <GamePurchaseCard key={purchase.id} purchase={purchase} />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-600">
                  Aucun achat récent
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}