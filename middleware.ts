import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if user is authenticated
  if (!session && (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/dashboard-child'))) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (session) {
    // Get account type
    const { data: accountType } = await supabase.rpc(
      'get_account_type',
      { user_id: session.user.id }
    );

    // Redirect parent to parent dashboard
    if (accountType === 'parent' && req.nextUrl.pathname.startsWith('/dashboard-child')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Redirect child to child dashboard
    if (accountType === 'child' && req.nextUrl.pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/dashboard-child', req.url));
    }

    // Redirect to onboarding if parent profile doesn't exist
    if (accountType === 'unknown' && req.nextUrl.pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard-child/:path*', '/onboarding'],
};