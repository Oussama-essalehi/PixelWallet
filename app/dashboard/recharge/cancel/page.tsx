'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <Card className="p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Paiement annulé</h2>
          <p className="mt-2 text-gray-600">
            Vous avez annulé le processus de paiement.
          </p>
          <Button
            onClick={() => router.push('/dashboard/recharge')}
            className="mt-6"
          >
            Retour à la page de recharge
          </Button>
        </div>
      </Card>
    </div>
  );
}
