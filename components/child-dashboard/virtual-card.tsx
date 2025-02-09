'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CreditCard, WalletIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

interface VirtualCardProps {
  firstName: string;
  lastName: string;
  brand: string;
  last4: string;
  status: string;
  currency: string;
  expMonth: number;
  expYear: number;
  cardId: string;
}

export function VirtualCard({ firstName, lastName, brand, last4, expMonth, expYear, cardId }: VirtualCardProps) {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const handleToggleCardNumber = async () => {
    if (!showCardNumber) {
      const response = await fetch('/api/stripe/get-card-number', {
        method: 'POST',
        body: JSON.stringify({ cardId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(response);
      if (response.ok) {
        const data = await response.json();
        setCardNumber(data.cardNumber);
      } else {
        console.error('Failed to retrieve card number');
      }
    }
  };

  return (
    <Card className="relative h-[200px] w-[350px] overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-violet-900 p-6">
      <div className="flex items-center mb-4">
        <WalletIcon className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-bold text-white">PixelWallet</span>
      </div>
      <div className="absolute right-4 top-4">
        <CreditCard className="h-8 w-8 text-white/80" />
      </div>
      <div className="mt-6 space-y-4 text-white">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">Numéro de carte</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-medium tracking-wider">
              {showCardNumber ? cardNumber : '**** **** **** ' + last4}
            </p>
            <button onClick={() => {
              setShowCardNumber(!showCardNumber);
              if (!showCardNumber) handleToggleCardNumber();
            }}>
              {showCardNumber ? <EyeOffIcon className="h-5 w-5 text-white" /> : <EyeIcon className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-white/80">Titulaire</p>
            <p className="text-sm font-medium">{firstName} {lastName}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-white/80">Expire le</p>
            <p className="text-sm font-medium">
              {expMonth.toString().padStart(2, '0')}/
              {expYear.toString().slice(-2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}