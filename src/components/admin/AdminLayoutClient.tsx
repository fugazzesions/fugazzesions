'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutClientProps {
  userEmail: string | null;
  children: React.ReactNode;
}

export function AdminLayoutClient({ userEmail, children }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // El login no usa sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <AdminSidebar userEmail={userEmail ?? ''} />
      <main className="overflow-x-hidden">{children}</main>
    </div>
  );
}