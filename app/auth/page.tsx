'use client';

import { AuthForm } from '@/components/auth-form';
import { Navbar } from '@/components/navbar';
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const isSignUp = searchParams.get('signup') === 'true';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {isSignUp ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isSignUp 
              ? 'Commencez à gérer les dépenses gaming de vos enfants en toute sécurité.'
              : 'Accédez à votre compte PixelWallet pour gérer les comptes de vos enfants.'}
          </p>
        </div>
        <AuthForm defaultTab={isSignUp ? 'signup' : 'signin'} />
      </main>
    </div>
  );
}