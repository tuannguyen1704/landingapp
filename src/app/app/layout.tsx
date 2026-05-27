'use client';
import { AuthProvider } from '@/components/auth-provider';
import { AuthModalNew } from '@/components/auth-modal-new';
import { SiteHeader } from '@/components/site-header';
import { SidebarNav } from '@/components/sidebar-nav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SiteHeader />
      <SidebarNav />
      <main className="flex-1 md:pl-14">
        {children}
      </main>
      <AuthModalNew />
    </AuthProvider>
  );
}
