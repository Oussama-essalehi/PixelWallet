'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import type { ChildAccount } from '@/lib/types';
import dynamic from 'next/dynamic';

// Import the 3D viewer with no SSR
const AvatarViewer = dynamic(
  () => import('./avatar-viewer').then((mod) => mod.AvatarViewer),
  { ssr: false }
);

interface AvatarSectionProps {
  account: ChildAccount;
  monthlySpent: number;
}

function generateMotivationalMessage(account: ChildAccount, monthlySpent: number): string {
  const savingsGoal = account.max_monthly_spend - monthlySpent;
  const percentageSpent = (monthlySpent / account.max_monthly_spend) * 100;

  if (percentageSpent < 30) {
    return `Excellent travail ${account.first_name}! Tu as dépensé très peu ce mois-ci. Continue comme ça, tu es en bonne voie pour économiser ${savingsGoal.toFixed(2)}€!`;
  } else if (percentageSpent < 60) {
    return `Bien joué ${account.first_name}! Tu gères bien ton argent. Tu peux encore économiser ${savingsGoal.toFixed(2)}€ ce mois-ci!`;
  } else if (percentageSpent < 80) {
    return `Attention ${account.first_name}, tu approches de ta limite mensuelle. Il te reste ${savingsGoal.toFixed(2)}€ à dépenser ce mois-ci.`;
  } else {
    return `${account.first_name}, tu as presque atteint ta limite mensuelle! Essaie d'économiser pour le reste du mois.`;
  }
}

export function AvatarSection({ account, monthlySpent }: AvatarSectionProps) {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setMessage(generateMotivationalMessage(account, monthlySpent));
  }, [account, monthlySpent]);

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-4">
      <div className="relative h-[300px] bg-gradient-to-b from-violet-50 to-violet-100 rounded-lg">
        <AvatarViewer gender={account.gender} />
      </div>
      <Card className="p-4 flex items-center">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="text-lg font-semibold">Message du jour</h3>
          </div>
          <p className="text-gray-600">{message}</p>
          <div className="mt-3 p-3 bg-violet-50 rounded-lg">
            <h4 className="font-semibold mb-2">Objectifs du mois :</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-violet-500 rounded-full mr-2" />
                Dépense maximale : {account.max_monthly_spend}€
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-violet-500 rounded-full mr-2" />
                Dépensé : {monthlySpent.toFixed(2)}€
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-violet-500 rounded-full mr-2" />
                Reste à dépenser : {(account.max_monthly_spend - monthlySpent).toFixed(2)}€
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
