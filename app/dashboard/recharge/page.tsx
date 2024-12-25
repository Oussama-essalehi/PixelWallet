'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { CircleDollarSign, CreditCard } from 'lucide-react';

interface ChildAccount {
  id: string;
  first_name: string;
  last_name: string;
  current_balance: number;
}

export default function RechargePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch child accounts for the parent
  useEffect(() => {
    async function fetchChildAccounts() {
      if (!user) return;

      try {
        const { data: parentProfile } = await supabase
          .from('parent_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (parentProfile) {
          const { data: accounts, error } = await supabase
            .from('child_accounts')
            .select('id, first_name, last_name, current_balance')
            .eq('parent_id', parentProfile.id);

          if (error) throw error;
          setChildAccounts(accounts || []);
        }
      } catch (error: any) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les comptes enfants',
          variant: 'destructive',
        });
      }
    }

    fetchChildAccounts();
  }, [user, toast]);

  // Validation schema
  const rechargeSchema = z.object({
    amount: z.number().positive().max(1000, "Le montant maximum est de 1000€"),
    childId: z.string().uuid()
  });

  const handleRecharge = async () => {
    if (!user) return;
  
    try {
      // Validate inputs
      const parsedAmount = parseFloat(amount);
      rechargeSchema.parse({
        amount: parsedAmount,
        childId: selectedChildId
      });
  
      setLoading(true);
  
      // Fetch parent profile using authenticated user's ID
      const { data: parentProfile, error: parentError } = await supabase
        .from('parent_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
  
      if (parentError) throw parentError;
  
      // Verify the child account belongs to this parent
      const { data: childAccount, error: childError } = await supabase
        .from('child_accounts')
        .select('id')
        .eq('id', selectedChildId)
        .eq('parent_id', parentProfile.id)
        .single();
  
      if (childError) throw new Error('Compte enfant invalide');
  
      // Insert transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          parent_id: parentProfile.id,
          child_account_id: childAccount.id,
          amount: parsedAmount,
          type: 'credit',
          description: 'Rechargement de compte',
          status: 'completed'
        });
  
      if (transactionError) throw transactionError;
  
      toast({
        title: 'Succès',
        description: `Rechargement de ${parsedAmount}€ effectué`,
      });
  
      // Reset form
      setSelectedChildId(null);
      setAmount('');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'effectuer le rechargement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <CircleDollarSign className="h-8 w-8 mr-4 text-indigo-700" />
        <h1 className="text-2xl font-bold">Recharger un compte enfant</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un compte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Compte enfant</label>
            <Select 
              value={selectedChildId || ''} 
              onValueChange={setSelectedChildId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un compte" />
              </SelectTrigger>
              <SelectContent>
                {childAccounts.map(account => (
                  <SelectItem 
                    key={account.id} 
                    value={account.id}
                  >
                    {`${account.first_name} ${account.last_name} (Solde: ${account.current_balance.toFixed(2)}€)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Montant</label>
            <Input 
              type="number" 
              placeholder="Montant à recharger" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max="1000"
              step="0.01"
            />
          </div>

          <Button 
            onClick={handleRecharge} 
            disabled={!selectedChildId || !amount || loading}
            className="w-full"
          >
            {loading ? 'Rechargement en cours...' : 'Recharger'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}