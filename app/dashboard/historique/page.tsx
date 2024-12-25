'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CircleDollarSign, History, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
  child_account: {
    first_name: string;
    last_name: string;
  };
}

export default function HistoriquePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch parent profile
        const { data: parentProfile, error: parentError } = await supabase
          .from('parent_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (parentError) throw parentError;

        // Fetch transactions with child account details
        const { data: transactionData, error } = await supabase
          .from('transactions')
          .select(`
            id, 
            amount, 
            type, 
            status, 
            description, 
            created_at,
            child_account:child_accounts(first_name, last_name)
          `)
          .eq('parent_id', parentProfile.id)
          .eq('type', 'credit')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setTransactions(transactionData as Transaction[]);
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger l\'historique des transactions',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [user, toast]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'outline';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <History className="h-8 w-8 mr-4 text-indigo-700" />
          <h1 className="text-2xl font-bold">Historique des Recharges</h1>
        </div>
        {loading && <RefreshCw className="h-5 w-5 animate-spin text-gray-500" />}
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center text-gray-500">Chargement des transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-gray-500">Aucune transaction de recharge</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Compte Enfant</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell>
                      {transaction.child_account.first_name} {transaction.child_account.last_name}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      +{transaction.amount.toFixed(2)} €
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {transaction.status === 'completed' ? 'Terminé' : 
                         transaction.status === 'pending' ? 'En attente' : 
                         'Échoué'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}