'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface OverviewStatsProps {
  dailySpent: number;
  maxDailyPurchases: number;
  monthlySpent: number;
  maxMonthlySpend: number;
}

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 2
};

export function OverviewStats({
  dailySpent,
  maxDailyPurchases,
  monthlySpent,
  maxMonthlySpend,
}: OverviewStatsProps) {
  const dailyProgress = (dailySpent / maxDailyPurchases) * 100;
  const monthlyProgress = (monthlySpent / maxMonthlySpend) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Dépenses du jour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={dailyProgress} />
            <div className="flex justify-between text-sm">
              <span>{dailySpent.toFixed(2)} €</span>
              <span className="text-gray-500">Maximum: {maxDailyPurchases.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dépenses du mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={monthlyProgress} />
            <div className="flex justify-between text-sm">
              <span>{monthlySpent.toFixed(2)} €</span>
              <span className="text-gray-500">Maximum: {maxMonthlySpend.toFixed(2)} €</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}