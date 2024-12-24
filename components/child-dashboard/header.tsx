'use client';

import { WalletIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function ChildDashboardHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <WalletIcon className="h-8 w-8 text-indigo-700" />
            <span className="ml-2 text-2xl font-bold text-indigo-700">PixelWallet</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
        </div>
      </div>
    </header>
  );
}