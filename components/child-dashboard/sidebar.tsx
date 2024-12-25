'use client';

import { LayoutDashboard, CreditCard, Settings, LogOut, WalletIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export function ChildDashboardSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    first_name: string;
    last_name: string;
    account_type: string;
  } | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from('child_accounts')
        .select('first_name, last_name')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setUserProfile({
          first_name: data.first_name,
          last_name: data.last_name,
          account_type: user.user_metadata?.account_type || 'Child'
        });
      }
    }

    fetchUserProfile();
  }, [user]);

  const getUserInitials = () => {
    if (!userProfile) return '?';
    return `${userProfile.first_name[0].toUpperCase()}${userProfile.last_name[0].toUpperCase()}`;
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

      {userProfile && (
        <div className="p-4 border-t bg-gray-50 flex items-center space-x-4">
          <div 
            className="w-12 h-12 
            bg-gradient-to-r from-violet-600 to-indigo-600
            rounded-full flex items-center justify-center 
            font-bold text-white text-xl 
            shadow-md"
          >
            {getUserInitials()}
          </div>
          <div>
            <p className="font-semibold">{`${userProfile.first_name} ${userProfile.last_name}`}</p>
            <p className="text-sm text-indigo-700 font-bold">
              {userProfile.account_type === 'parent' ? 'Parent' : 'Enfant'}
            </p>
          </div>
        </div>
      )}

      <div className="p-2 border-t bg-gray-50">
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