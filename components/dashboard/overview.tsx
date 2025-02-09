'use client';

import { useEffect, useState } from 'react';
import { ChildCard } from './child-card';
import { EmptyState } from './empty-state';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import { Plus } from 'lucide-react';

type ChildAccount = Database['public']['Tables']['child_accounts']['Row'] & {
  virtual_cards: {
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
  }[]
};

export function Overview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChildAccounts() {
      try {
        const { data: parentProfile } = await supabase
          .from('parent_profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();

        if (parentProfile) {
          // Get child accounts with their virtual cards
          const { data: childAccounts, error: childAccountsError } = await supabase
            .from('child_accounts')
            .select(`
              *,
              virtual_cards (
                id,
                balance,
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
            .eq('parent_id', parentProfile.id);

          if (childAccountsError) {
            console.error('Error fetching child accounts:', childAccountsError);
            throw childAccountsError;
          }

          console.log('Fetched child accounts:', childAccounts);

          setChildAccounts(childAccounts);
        }
      } catch (error: any) {
        console.error('Error in fetchChildAccounts:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les comptes enfants',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchChildAccounts();
    }
  }, [user, toast]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <Link href="/dashboard/ajouter-enfant">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un enfant
          </Button>
        </Link>
      </div>

      {loading ? (
        <div>Chargement...</div>
      ) : childAccounts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {childAccounts.map((account) => (
            <ChildCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}