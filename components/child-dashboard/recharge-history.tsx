'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PiggyBank } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  created_at: string;
  parent_id: string;
  parent: {
    id: string;
    first_name: string;
    last_name: string;
  };
  child_account: {
    first_name: string;
    last_name: string;
  };
}

interface RechargeHistoryProps {
  childAccountId: string;
}

export function RechargeHistory({ childAccountId }: RechargeHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [recharges, setRecharges] = useState<Transaction[]>([]);

  useEffect(() => {
    async function fetchRecharges() {
      const { data: rechargeData, error } = await supabase
        .from('recharges')
        .select(`
          *,
          parent:parent_profiles(first_name, last_name)
        `)
        .eq('child_account_id', childAccountId)
        .order('created_at', { ascending: false });

      console.log('Recharges data:', rechargeData);
      
      if (error) {
        console.error('Error fetching recharges:', error);
        return;
      }

      setRecharges(rechargeData || []);
      setLoading(false);
    }

    fetchRecharges();
  }, [childAccountId]);

  if (loading) return <LoadingSpinner />;

  if (recharges.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            <PiggyBank className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Aucune recharge pour le moment</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log(recharges[0].parent?.first_name);

  return (
    <div className="space-y-4">
      {recharges.map((recharge) => (
        <div
          key={recharge.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white"
        >
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-800">
                Recharge par {recharge.parent?.first_name} {recharge.parent?.last_name}
              </p>
              <Badge 
                variant={
                  recharge.status === 'completed' ? 'default' : 
                  recharge.status === 'pending' ? 'outline' : 
                  'destructive'
                }
              >
                {recharge.status === 'completed' ? 'Terminé' : 
                 recharge.status === 'pending' ? 'En cours' : 
                 'Échoué'}
              </Badge>
            </div>
            {recharge.description && (
              <p className="text-sm text-gray-600 mt-1">
                {recharge.description}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {new Date(recharge.created_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <p className="font-bold text-green-600">
            +{recharge.amount.toFixed(2)} €
          </p>
        </div>
      ))}
    </div>
  );
}