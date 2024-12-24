'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import { VirtualCard } from '../child-dashboard/virtual-card';

type ChildAccount = Database['public']['Tables']['child_accounts']['Row'] & {
  virtual_card?: {
    card_number: string;
    expiry_date: string;
  }
};

interface ChildCardProps {
  account: ChildAccount;
}

export function ChildCard({ account }: ChildCardProps) {
  const firstNameInitial = account.first_name.charAt(0).toUpperCase();

  return (
    <div>
      <Card className="w-full max-w-md">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
              {firstNameInitial}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{account.first_name} {account.last_name}</h3>
              <p className="text-2xl font-bold">{account.current_balance.toFixed(2)} €</p>
            </div>
          </div>
        </div>
      
        {account.virtual_card && (
          <div className='p-2'>
            <VirtualCard 
              firstName={account.first_name} 
              lastName={account.last_name} 
              cardNumber={account.virtual_card.card_number} 
              expiryDate={account.virtual_card.expiry_date} 
            />
          </div>
        )}
      
        <Link href={`/dashboard/enfant/${account.id}`}>
          <Button className="w-full" variant="outline">
            Voir détails
          </Button>
        </Link>
      </Card>
    </div>
  );
}