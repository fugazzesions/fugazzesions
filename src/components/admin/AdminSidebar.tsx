'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  School,
  FileText,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface AdminSidebarProps {
  userEmail: string;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
  { href: '/admin/clases', label: 'Clases', icon: School },
  { href: '/admin/recursos', label: 'Recursos', icon: FileText },
];

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  // Primera letra del email para el avatar
  const initial = userEmail.charAt(0).toUpperCase();

  return (
    <aside className="bg-ink text-paper p-4 flex flex-col min-h-screen">
      {/* Brand */}
      <div className="font-display text-3xl mb-1 px-2">Fugazzesions</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-paper/50 mb-7 px-2">
        Panel admin
      </div>

      {/* Nav principal */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-2.5 rounded-md
                text-sm flex items-center gap-2.5
                transition-colors
                ${isActive
                  ? 'bg-red text-paper font-semibold'
                  : 'text-paper/70 hover:bg-paper/5 hover:text-paper'
                }
              `}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px bg-paper/10 my-5 mx-2" />

      {/* Link al sitio público */}
      <nav>
        <Link
          href="/"
          target="_blank"
          className="px-3 py-2.5 rounded-md text-sm text-paper/70 hover:bg-paper/5 hover:text-paper flex items-center gap-2.5 transition-colors"
        >
          <ExternalLink size={16} />
          Ver sitio público
        </Link>
      </nav>

      {/* User card abajo */}
      <div className="mt-auto p-3 rounded-md bg-paper/5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-red text-paper flex items-center justify-center font-semibold text-xs">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-paper truncate">
            {userEmail.split('@')[0]}
          </div>
          <div className="text-[10px] text-paper/50 truncate">{userEmail}</div>
        </div>
        <button
          onClick={handleLogout}
          className="text-paper/50 hover:text-red transition-colors p-1"
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}