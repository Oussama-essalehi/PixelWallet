'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <h3 className="text-xl font-semibold mb-4">Aucun compte enfant</h3>
      <p className="text-gray-600 mb-8">
        Vous n'avez pas encore ajouté d'enfant à votre compte. 
        Commencez par ajouter votre premier enfant pour gérer son portefeuille gaming.
      </p>
      <Link href="/dashboard/ajouter-enfant">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un enfant
        </Button>
      </Link>
    </Card>
  );
}