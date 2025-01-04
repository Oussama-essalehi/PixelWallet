import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GamepadIcon } from 'lucide-react';

interface GamePurchaseCardProps {
  purchase: {
    id: string;
    game_name: string;
    category: string;
    amount: number;
    purchase_date: string;
    merchant: string;
    platform?: string;
    age_restriction: string;
    description?: string;
  };
}

export function GamePurchaseCard({ purchase }: GamePurchaseCardProps) {
  return (
    <Card className="mb-4 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="flex justify-between items-start p-6">
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-purple-100 p-3 rounded-full">
              <GamepadIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{purchase.game_name}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                Plateforme: {purchase.platform || 'PC'}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                {purchase.category}
              </Badge>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                {purchase.age_restriction}+
              </Badge>
            </div>
            {purchase.description && (
              <p className="text-xs text-gray-500 italic">
                {purchase.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h4 className="text-2xl font-bold text-red-600">-{purchase.amount.toFixed(2)} €</h4>
          <p className="text-xs text-gray-500">
            {new Date(purchase.purchase_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
