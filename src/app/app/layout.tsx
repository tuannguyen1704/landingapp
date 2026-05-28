'use client';
import { AuthProvider } from '@/components/auth-provider';
import { AuthModalNew } from '@/components/auth-modal-new';
import { SiteHeader } from '@/components/site-header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SiteHeader />
      <main className="flex-1">
        {children}
      </main>
      <AuthModalNew />
    </AuthProvider>
  );
}
