'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type AccountType = 'parent' | 'child' | 'unknown';

// Same rules as signIn() in lib/auth.ts
async function getAccountType(user: User): Promise<AccountType> {
  if (user.user_metadata?.account_type === 'child') return 'child';

  const { data: childAccount } = await supabase
    .from('child_accounts')
    .select('id')
    .eq('email', user.email)
    .maybeSingle();
  if (childAccount) return 'child';

  const { data: parentProfile } = await supabase
    .from('parent_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  // A parent without a profile hasn't finished onboarding yet
  return parentProfile ? 'parent' : 'unknown';
}

interface RouteGuardProps {
  area: 'parent' | 'child';
  children: React.ReactNode;
}

// Client-side replacement for the old middleware: the Supabase session lives
// in localStorage, so it can only be checked in the browser.
export function RouteGuard({ area, children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    let cancelled = false;

    getAccountType(user).then((accountType) => {
      if (cancelled) return;

      if (area === 'child' && accountType !== 'child') {
        router.replace('/dashboard');
      } else if (area === 'parent' && accountType === 'child') {
        router.replace('/dashboard-child');
      } else if (area === 'parent' && accountType === 'unknown' && pathname === '/dashboard') {
        router.replace('/onboarding');
      } else {
        setAllowed(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, loading, area, pathname, router]);

  if (!allowed) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}
