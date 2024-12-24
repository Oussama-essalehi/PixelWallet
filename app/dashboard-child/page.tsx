'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChildDashboardOverview } from '@/components/child-dashboard/overview';
import type { ChildAccount } from '@/lib/types';

export default function ChildDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<ChildAccount | null>(null);

  useEffect(() => {
    async function fetchAccount() {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('child_accounts')
        .select(`
          *,
          virtual_cards (
            card_number,
            expiry_date
          )
        `)
        .eq('email', user.email)
        .single();

      if (error) throw error;
      setAccount(data);
      setLoading(false);
    }

    fetchAccount();
  }, [user]);

  if (loading) return <LoadingSpinner />;
  if (!account) return null;

  return <ChildDashboardOverview account={account} />;
}