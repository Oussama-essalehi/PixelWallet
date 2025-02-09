'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleSuccess() {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError('Session ID not found');
        setLoading(false);
        return;
      }

      try {
        // Verify the payment status
        const response = await fetch('/api/stripe/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    }

    handleSuccess();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 mx-auto flex items-center justify-center">
              <span className="text-red-600 text-xl">❌</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">Une erreur est survenue</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <Button
              onClick={() => router.push('/dashboard/recharge')}
              className="mt-6"
            >
              Retour
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Paiement réussi!</h2>
          <p className="mt-2 text-gray-600">
            La recharge a été effectuée avec succès.
          </p>
          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-6"
          >
            Retour au tableau de bord
          </Button>
        </div>
      </Card>
    </div>
  );
}
