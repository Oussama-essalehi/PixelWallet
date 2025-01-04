'use client';

import { WalletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center">
            <WalletIcon className="h-8 w-8 text-indigo-700" />
            <span className="ml-2 text-2xl font-bold text-indigo-700">PixelWallet</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900">Fonctionnalités</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900">Tarifs</Link>
            <Link href="#about" className="text-gray-600 hover:text-gray-900">À propos</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link href={user.role === 'child' ? "/dashboard-child" : "/dashboard"}>
                <Button>Tableau de bord</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline">Se connecter</Button>
                </Link>
                <Link href="/auth?signup=true">
                  <Button>S'inscrire</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}