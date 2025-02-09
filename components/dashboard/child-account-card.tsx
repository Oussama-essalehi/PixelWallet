'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/lib/database.types';

type ChildAccount = Database['public']['Tables']['child_accounts']['Row'];

interface ChildAccountCardProps {
  account: ChildAccount;
}

export function ChildAccountCard({ account }: ChildAccountCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{account.first_name} {account.last_name}</span>
          <span className="text-lg font-normal text-gray-600">
            €{account.balance.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Daily Limit: €{account.max_daily_purchases}</p>
            <p>Monthly Limit: €{account.max_monthly_spend}</p>
          </div>
          <Button className="w-full" variant="outline">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}