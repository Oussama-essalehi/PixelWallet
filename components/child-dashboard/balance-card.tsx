'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BalanceCardProps {
  balance: number;
  lastRecharge?: {
    amount: number;
    date: string;
    by: string;
  };
}

export function BalanceCard({ balance, lastRecharge }: BalanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Solde disponible</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{balance} €</div>
        {lastRecharge && (
          <p className="text-sm text-gray-500 mt-2">
            Dernière recharge : {lastRecharge.amount.toFixed(2)} € par {lastRecharge.by} le{' '}
            {new Date(lastRecharge.date).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}