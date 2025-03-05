'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { CreditCard, WalletIcon, EyeIcon, EyeOffIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
  const [cvc, setCvc] = useState('');
  const { user } = useAuth();

  const handleToggleCardNumber = async () => {
    if (!showCardNumber) {
      try {
        const response = await fetch('/api/stripe/get-card-number', {
          method: 'POST',
          body: JSON.stringify({ cardId }),
          headers: {
            'Content-Type': 'application/json',
            'user': JSON.stringify(user)
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCardNumber(data.cardNumber);
          setCvc(data.cvc);
        } else {
          console.error('Failed to retrieve card number');
        }
      } catch (error) {
        console.error('Error fetching card details:', error);
      }
    }
    setShowCardNumber(!showCardNumber);
  };

  return (
    <Card className="relative h-[200px] w-[350px] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-800 p-6">
      <div className="flex items-center mb-4">
        <WalletIcon className="h-8 w-8 text-white" />
        <span className="ml-2 text-xl font-bold text-white">PixelWallet</span>
      </div>
      <div className="absolute right-4 top-4">
        <svg fill="#ffffff" width="64px" height="64px" viewBox="0 4 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><title>Visa icon</title><path d="M17.445 8.623c-.387-.146-.99-.301-1.74-.301-1.92 0-3.275.968-3.285 2.355-.012 1.02.964 1.594 1.701 1.936.757.35 1.01.57 1.008.885-.005.477-.605.693-1.162.693-.766 0-1.186-.107-1.831-.375l-.239-.111-.271 1.598c.466.195 1.306.362 2.175.375 2.041 0 3.375-.961 3.391-2.439.016-.813-.51-1.43-1.621-1.938-.674-.33-1.094-.551-1.094-.886 0-.296.359-.612 1.109-.612.645-.01 1.096.129 1.455.273l.18.081.271-1.544-.047.01zm4.983-.17h-1.5c-.467 0-.816.127-1.021.591l-2.885 6.534h2.041l.408-1.07 2.49.002c.061.25.24 1.068.24 1.068H24l-1.572-7.125zM9.66 8.393h1.943l-1.215 7.129H8.444L9.66 8.391v.002zm-4.939 3.929l.202.99 1.901-4.859h2.059l-3.061 7.115H3.768l-1.68-6.026c-.035-.103-.078-.173-.18-.237C1.34 9.008.705 8.766 0 8.598l.025-.15h3.131c.424.016.766.15.883.604l.682 3.273v-.003zm15.308.727l.775-1.994c-.01.02.16-.412.258-.68l.133.615.449 2.057h-1.615v.002z"></path></g></svg>
      </div>
      <div className="mt-6 space-y-4 text-white">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">Numéro de carte</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-medium tracking-wider">
              {showCardNumber ? 
                cardNumber.match(/.{1,4}/g)?.join(' ') : 
                '**** **** **** ' + last4
              }
            </p>
            <button onClick={handleToggleCardNumber}>
              {showCardNumber ? 
                <EyeOffIcon className="h-5 w-5 text-white" /> : 
                <EyeIcon className="h-5 w-5 text-white" />
              }
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-white/80">Titulaire</p>
            <p className="text-sm font-medium">{firstName} {lastName}</p>
          </div>
          {showCardNumber && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-white/80">CVC</p>
              <p className="text-sm font-medium">{cvc}</p>
            </div>
          )}
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