'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { VirtualCard } from '@/components/child-dashboard/virtual-card';
import { BalanceCard } from '@/components/child-dashboard/balance-card';
import { TransactionHistory } from '@/components/child-dashboard/transaction-history';
import { OverviewStats } from '@/components/child-dashboard/overview-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ChildAccount {
  id: string;
  first_name: string;
  last_name: string;
  current_balance: number;
  max_daily_purchases: number;
  max_monthly_spend: number;
  virtual_card: {
    card_number: string;
    expiry_date: string;
  };
}

export default function ChildDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<ChildAccount | null>(null);
  const [stats, setStats] = useState({
    dailySpent: 0,
    monthlySpent: 0,
  });

  useEffect(() => {
    async function fetchChildAccount() {
      if (!user) return;

      const { data } = await supabase
        .from('child_accounts')
        .select(`
          *,
          virtual_card:virtual_cards(
            card_number,
            expiry_date
          )
        `)
        .eq('email', user.email)
        .single();

      setAccount(data);

      // Fetch today's spending
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: dailyTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('child_account_id', data.id)
        .gte('created_at', today.toISOString());

      const dailySpent = dailyTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Fetch this month's spending
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const { data: monthlyTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('child_account_id', data.id)
        .gte('created_at', firstDayOfMonth.toISOString());

      const monthlySpent = monthlyTransactions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      setStats({ dailySpent, monthlySpent });
      setLoading(false);
    }

    fetchChildAccount();
  }, [user]);

  if (loading || !account) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">
        Bienvenue, {account.first_name} !
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <VirtualCard
            firstName={account.first_name}
            lastName={account.last_name}
            cardNumber={account.virtual_card.card_number}
            expiryDate={account.virtual_card.expiry_date}
          />
        </div>
        <div>
          <BalanceCard
            balance={account.current_balance}
            lastRecharge={{
              amount: 50,
              date: '2024-03-20',
              by: 'Maman',
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="transactions">Historique des achats</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewStats
            dailySpent={stats.dailySpent}
            maxDailyPurchases={account.max_daily_purchases}
            monthlySpent={stats.monthlySpent}
            maxMonthlySpend={account.max_monthly_spend}
          />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionHistory childAccountId={account.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}