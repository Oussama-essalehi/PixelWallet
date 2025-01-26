'use client';

import { useState, useEffect } from 'react';
import { useChildAccount } from '@/hooks/use-child-account';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { GamePurchaseCard } from '@/components/child-dashboard/game-purchase-card';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRightIcon, ArrowDownLeftIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function HistoriquePage() {
  const { account, loading } = useChildAccount();
  const [activeTab, setActiveTab] = useState('achats');
  const [gamePurchases, setGamePurchases] = useState<any[]>([]);
  const [recharges, setRecharges] = useState<any[]>([]);

  useEffect(() => {
    if (!account) return;

    async function fetchGamePurchases() {
      const { data, error } = await supabase
        .from('game_purchases')
        .select('*')
        .eq('child_account_id', account?.id);

      if (error) {
        console.error('Error fetching game purchases:', error);
      } else {
        setGamePurchases(data);
      }
    }

    fetchGamePurchases();
  }, [account]);

  useEffect(() => {
    if (!account) return;

    async function fetchRecharges() {
      const { data, error } = await supabase
        .from('recharges')
        .select(`
          *,
          parent:parent_profiles(first_name, last_name)
        `)
        .eq('child_account_id', account?.id)
        .order('created_at', { ascending: false });

      console.log('Recharges data:', data);
      if (error) {
        console.error('Error fetching recharges:', error);
      } else {
        setRecharges(data);
      }
    }

    fetchRecharges();
  }, [account]);

  if (loading) return <LoadingSpinner />;
  if (!account) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Historique</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="achats">Achats</TabsTrigger>
          <TabsTrigger value="recharges">Recharges</TabsTrigger>
        </TabsList>
        <TabsContent value="achats" className="space-y-4">
          <div>
            <ul>
              {gamePurchases.length > 0 ? (
                gamePurchases.map((purchase) => (
                  <GamePurchaseCard key={purchase.id} purchase={purchase} />
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-600">
                      Aucun achat effectué
                    </p>
                  </CardContent>
                </Card>
              )}
            </ul>
          </div>
        </TabsContent>
        <TabsContent value="recharges">
          <div>
            <ul>
              {recharges.length > 0 ? (
                recharges.map((recharge) => (
                  <Card key={recharge.id} className="mb-4 hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="flex justify-between items-start p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <ArrowUpRightIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-2xl font-bold text-green-600">+{recharge.amount} €</h3>
                          <p className="text-sm font-medium text-gray-700">
                            Recharge par {recharge.parent?.first_name} {recharge.parent?.last_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(recharge.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${recharge.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                            recharge.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                            'bg-red-100 text-red-700 border-red-200'}
                        `}
                      >
                        {recharge.status === 'completed' ? 'Terminé' : 
                         recharge.status === 'pending' ? 'En cours' : 
                         'Échoué'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-600">Aucune recharge reçue</p>
                  </CardContent>
                </Card>
              )}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}