'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChildAccountCard } from './child-account-card';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/lib/database.types';

type ChildAccount = Database['public']['Tables']['child_accounts']['Row'];

export function ChildAccountsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [childAccounts, setChildAccounts] = useState<ChildAccount[]>([]);

  useEffect(() => {
    async function fetchChildAccounts() {
      try {
        const { data: parentProfile } = await supabase
          .from('parent_profiles')
          .select('id')
          .eq('user_id', user?.id)
          .single();

        if (parentProfile) {
          const { data: accounts, error } = await supabase
            .from('child_accounts')
            .select('*')
            .eq('parent_id', parentProfile.id);

          if (error) throw error;
          setChildAccounts(accounts || []);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch child accounts',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchChildAccounts();
    }
  }, [user, toast]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Child Accounts</h2>
        <Button>Add Child Account</Button>
      </div>
      
      {childAccounts.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-600">No child accounts found. Add one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {childAccounts.map((account) => (
            <ChildAccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}