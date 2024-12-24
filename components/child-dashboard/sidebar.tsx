'use client';

import { LayoutDashboard, CreditCard, Settings, LogOut, WalletIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function ChildDashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { href: '/dashboard-child', label: 'Aperçu', icon: LayoutDashboard },
    { href: '/dashboard-child/historique', label: 'Historique', icon: CreditCard },
    { href: '/dashboard-child/parametres', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center">
          <WalletIcon className="h-8 w-8 text-indigo-700" />
          <span className="ml-2 text-2xl font-bold text-indigo-700">PixelWallet</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100",
                  pathname === href && "bg-indigo-50 text-indigo-700"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-red-600 hover:bg-red-100"
        >
          <LogOut className="h-5 w-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}