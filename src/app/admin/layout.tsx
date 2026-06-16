import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AdminLayoutClient userEmail={user?.email ?? null}>
      {children}
    </AdminLayoutClient>
  );
}