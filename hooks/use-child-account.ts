'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { ChildAccount } from '@/lib/types';

export function useChildAccount() {
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
            stripe_card_id,
            stripe_cardholder_id,
            last4,
            brand,
            exp_month,
            exp_year,
            status,
            currency
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

  return { account, loading };
}