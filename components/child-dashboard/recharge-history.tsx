'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PiggyBank } from 'lucide-react';

interface Recharge {
  id: string;
  amount: number;
  created_at: string;
  parent_profile: {
    first_name: string;
    last_name: string;
  };
}

interface RechargeHistoryProps {
  childAccountId: string;
}

export function RechargeHistory({ childAccountId }: RechargeHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [recharges, setRecharges] = useState<Recharge[]>([]);

  useEffect(() => {
    async function fetchRecharges() {
      const { data } = await supabase
        .from('recharges')
        .select(`
          *,
          parent_profile:parent_profiles(first_name, last_name)
        `)
        .eq('child_account_id', childAccountId)
        .order('created_at', { ascending: false });

      setRecharges(data || []);
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

  return (
    <div className="space-y-4">
      {recharges.map((recharge) => (
        <div
          key={recharge.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white"
        >
          <div>
            <p className="font-medium">
              Recharge par {recharge.parent_profile.first_name}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(recharge.created_at).toLocaleDateString()}
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