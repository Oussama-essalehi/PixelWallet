'use client';

import { WalletIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface VirtualCardProps {
  firstName: string;
  lastName: string;
  cardNumber: string;
  expiryDate: string;
}

export function VirtualCard({ firstName, lastName, cardNumber, expiryDate }: VirtualCardProps) {
  return (
    <Card className="relative w-full h-full max-w-[420px] aspect-[1.8/1] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-6 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      {/* Logo */}
      <div className="flex items-center mb-8">
        <WalletIcon className="h-8 w-8" />
        <span className="ml-2 text-xl font-bold">PixelWallet</span>
      </div>

      {/* Card Number */}
      <div className="mb-6">
        <div className="text-2xl tracking-wider font-mono">
          {cardNumber.match(/.{1,4}/g)?.join(' ')}
        </div>
      </div>

      {/* Card Holder & Expiry */}
      <div className="flex justify-between items-end mt-auto absolute bottom-6 left-6 right-6">
        <div>
          <div className="text-xs opacity-75 mb-1">TITULAIRE</div>
          <div className="font-medium">{`${firstName} ${lastName}`}</div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-75 mb-1">EXPIRE</div>
          <div className="font-medium">{expiryDate}</div>
        </div>
      </div>
    </Card>
  );
}