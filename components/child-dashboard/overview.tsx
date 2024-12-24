'use client';

import { VirtualCard } from './virtual-card';
import { BalanceCard } from './balance-card';
import { TransactionHistory } from './transaction-history';
import { OverviewStats } from './overview-stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { ChildAccount } from '@/lib/types';

interface ChildDashboardOverviewProps {
  account: ChildAccount;
}

export function ChildDashboardOverview({ account }: ChildDashboardOverviewProps) {
  if (!account.virtual_cards) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-600">
            Votre compte est en cours de configuration. Veuillez patienter...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">
        Bienvenue, {account.first_name} !
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <VirtualCard
          firstName={account.first_name}
          lastName={account.last_name}
          cardNumber={account.virtual_cards.card_number}
          expiryDate={account.virtual_cards.expiry_date}
        />
        <BalanceCard balance={account.current_balance} />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Aperçu</TabsTrigger>
          <TabsTrigger value="transactions">Historique des achats</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewStats
            dailySpent={0}
            maxDailyPurchases={account.max_daily_purchases}
            monthlySpent={0}
            maxMonthlySpend={account.max_monthly_spend}
          />
        </TabsContent>
        <TabsContent value="transactions">
          <TransactionHistory childAccountId={account.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}