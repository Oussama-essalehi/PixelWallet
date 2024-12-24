'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: number;
  created_at: string;
  child_account: {
    first_name: string;
    last_name: string;
  };
}

export default function RechargesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const { data: parentProfile } = await supabase
          .from('parent_profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();

        if (parentProfile) {
          const { data, error } = await supabase
            .from('transactions')
            .select(`
              *,
              child_account:child_accounts(first_name, last_name)
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setTransactions(data || []);
        }
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger l\'historique des recharges',
          variant: 'destructive',
        });
      }
    }

    if (user) {
      fetchTransactions();
    }
  }, [user, toast]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Historique des recharges</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    Recharge pour {transaction.child_account.first_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-green-600">
                  +{transaction.amount.toFixed(2)} €
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}