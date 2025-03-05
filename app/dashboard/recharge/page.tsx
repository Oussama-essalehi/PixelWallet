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
import { HandCoins } from 'lucide-react';

interface VirtualCard {
  balance: number;
}

interface ChildAccount {
  id: string;
  first_name: string;
  last_name: string;
  virtual_cards?: VirtualCard;
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
      if (!user) {
        toast({
          title: 'Non authentifié',
          description: 'Veuillez vous connecter pour accéder à cette page',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Get parent profile
        const { data: parentProfile, error: parentError } = await supabase
          .from('parent_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (parentError) {
          console.error('Error fetching parent profile:', parentError);
          throw new Error('Parent profile not found');
        }

        if (!parentProfile) {
          throw new Error('Parent profile not found');
        }

        // Get child accounts with their virtual cards
        const { data: accounts, error: accountsError } = await supabase
          .from('child_accounts')
          .select(`
            id,
            first_name,
            last_name,
            virtual_cards!left (
              balance
            )
          `)
          .eq('parent_id', parentProfile.id);
         
        if (accountsError) {
          console.error('Error fetching child accounts:', accountsError);
          throw accountsError;
        }

        setChildAccounts(accounts || []);
      } catch (error: any) {
        console.error('Error in fetchChildAccounts:', error);
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de charger les comptes enfants',
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
    if (!user) {
      toast({
        title: 'Non authentifié',
        description: 'Veuillez vous connecter pour accéder à cette page',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedChildId || !amount) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un compte et saisir un montant',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Validate input
      rechargeSchema.parse({
        amount: parseFloat(amount),
        childId: selectedChildId
      });

      // Create Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        },
        body: JSON.stringify({
          childAccountId: selectedChildId,
          amount: parseFloat(amount)
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création de la session de paiement',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-8">
        <HandCoins className="h-8 w-8 mr-4 text-indigo-700" />
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
                {childAccounts.map((account) => {
                  const balance = account.virtual_cards ? account.virtual_cards.balance : 0;
                  return (
                    <SelectItem 
                      key={account.id} 
                      value={account.id}
                    >
                      {account.first_name} {account.last_name} - Solde: {balance}€
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Montant</label>
            <div className="space-y-2">
              <Input 
                type="number" 
                placeholder="Montant à recharger" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                max="1000"
                step="1"
              />
              <p className="text-sm text-gray-500">
                Note: Des frais de service de 2.9% + 0.30€ seront appliqués.
                {parseFloat(amount) > 0 && parseFloat(amount) <= 100 && (
                  <> Le montant final sera de {(parseFloat(amount) - (parseFloat(amount) * 0.028 + 0.3)).toFixed(2)}€ après frais.</>
                )}
              </p>
            </div>
          </div>

          <Button 
            onClick={handleRecharge}
            disabled={loading || !selectedChildId || !amount}
            className="w-full"
          >
            {loading ? 'Redirection vers le paiement...' : 'Procéder au paiement'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}