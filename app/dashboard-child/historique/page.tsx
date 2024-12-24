'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionHistory } from '@/components/child-dashboard/transaction-history';
import { RechargeHistory } from '@/components/child-dashboard/recharge-history';
import { useChildAccount } from '@/hooks/use-child-account';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HistoriquePage() {
  const { account, loading } = useChildAccount();
  const [activeTab, setActiveTab] = useState('achats');

  if (loading) return <LoadingSpinner />;
  if (!account) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historique des transactions</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="achats">Achats</TabsTrigger>
          <TabsTrigger value="recharges">Recharges</TabsTrigger>
        </TabsList>
        <TabsContent value="achats">
          <TransactionHistory childAccountId={account.id} />
        </TabsContent>
        <TabsContent value="recharges">
          <RechargeHistory childAccountId={account.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}