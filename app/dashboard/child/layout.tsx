'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ChildDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    async function checkChildAccount() {
      if (!user) return;

      const { data: childAccount } = await supabase
        .from('child_accounts')
        .select('*')
        .eq('email', user.email)
        .single();

      setIsConfigured(!!childAccount);
      setLoading(false);
    }

    checkChildAccount();
  }, [user]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isConfigured) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Compte non configuré</AlertTitle>
          <AlertDescription>
            Votre compte n'a pas encore été configuré par vos parents. Veuillez leur communiquer
            votre adresse email pour qu'ils puissent finaliser la configuration de votre compte.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return children;
}