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

  return { account, loading };
}