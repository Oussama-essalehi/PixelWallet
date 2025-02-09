'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChildDashboardOverview } from '@/components/child-dashboard/overview';
import { AvatarSection } from '@/components/child-dashboard/avatar-section';
import type { ChildAccount } from '@/lib/types';

export default function ChildDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<ChildAccount | null>(null);
  const [monthlySpent, setMonthlySpent] = useState(0);

  useEffect(() => {
    async function fetchAccount() {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('child_accounts')
        .select(`
          *,
          virtual_cards (
            stripe_card_id,
            stripe_cardholder_id,
            last4,
            brand,
            exp_month,
            exp_year,
            status,
            currency,
            balance
          )
        `)
        .eq('email', user.email)
        .single();

      if (error) throw error;

      // Fetch monthly spending
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      
      const { data: monthlyTotal } = await supabase
        .from('game_purchases')
        .select('amount')
        .eq('child_account_id', data.id)
        .gte('purchase_date', firstDayOfMonth.toISOString())
        .lte('purchase_date', currentDate.toISOString());

      if (monthlyTotal) {
        setMonthlySpent(monthlyTotal.reduce((sum, purchase) => sum + purchase.amount, 0));
      }

      setAccount(data);
      setLoading(false);
    }

    fetchAccount();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (!account) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">
        Content de te revoir, {account.first_name} !
      </h1>

      <AvatarSection account={account} monthlySpent={monthlySpent} />
      
      <div className="mt-8">
        <ChildDashboardOverview account={account} />
      </div>
    </div>
  );
}