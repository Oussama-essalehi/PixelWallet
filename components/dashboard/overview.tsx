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
  virtual_card: {
    card_number: string;
    expiry_date: string;
  }
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
          const { data: accounts, error } = await supabase
            .from('child_accounts')
            .select(`
              *,
              virtual_card:virtual_cards(card_number, expiry_date)
            `)
            .eq('parent_id', parentProfile.id);

          if (error) throw error;
          
          // Transformer les données pour correspondre au type ChildAccount
          const enrichedAccounts = accounts?.map(account => ({
            ...account,
            virtual_card: account.virtual_card ? {
              card_number: account.virtual_card.card_number,
              expiry_date: account.virtual_card.expiry_date
            } : undefined
          })) || [];

          setChildAccounts(enrichedAccounts);
        }
      } catch (error) {
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
        <h1 className="text-2xl font-bold">Tableau de bord Parent</h1>
        <Link href="/dashboard/ajouter-enfant">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un enfant
          </Button>
        </Link>
      </div>

      {childAccounts.length === 0 ? (
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