'use client';

import { ChildDashboardSidebar } from '@/components/child-dashboard/sidebar';
import { RouteGuard } from '@/components/route-guard';

export default function ChildDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard area="child">
      <div className="flex h-screen bg-gray-50">
        <ChildDashboardSidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}