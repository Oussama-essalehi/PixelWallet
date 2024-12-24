'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ShoppingBag } from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  merchant_name: string;
  merchant_category: string;
  status: string;
  created_at: string;
}

interface TransactionHistoryProps {
  childAccountId: string;
}

export function TransactionHistory({ childAccountId }: TransactionHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchTransactions() {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('child_account_id', childAccountId)
        .order('created_at', { ascending: false })
        .limit(10);

      setTransactions(data || []);
      setLoading(false);
    }

    fetchTransactions();
  }, [childAccountId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <ShoppingBag className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Aucun achat pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Derniers achats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{transaction.merchant_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.created_at).toLocaleDateString()} - {transaction.merchant_category}
                </p>
              </div>
              <p className="font-bold text-red-600">
                -{transaction.amount.toFixed(2)} €
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}