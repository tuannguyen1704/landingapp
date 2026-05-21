'use client';
import { SiteHeader } from '@/components/site-header';
import { SidebarNav } from '@/components/sidebar-nav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <SidebarNav />
      <main className="flex-1 md:pl-14">
        {children}
      </main>
    </>
  );
}
