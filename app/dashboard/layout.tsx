'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { RouteGuard } from '@/components/route-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard area="parent">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </RouteGuard>
  );
}