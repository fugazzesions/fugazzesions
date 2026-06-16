'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/eventos', label: 'eventos' },
  { href: '/clases', label: 'clases' },
  { href: '/quienes-somos', label: 'quiénes somos' },
  { href: '/recursos', label: 'recursos' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="relative flex items-center justify-between px-8 py-4">
      {/* Logo */}
      <Link href="/" className="font-display text-2xl font-bold">
        Fugazzesions
      </Link>

      {/* Links */}
      <ul className="flex gap-6 list-none m-0 p-0">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`
                  text-[13px] font-medium lowercase tracking-wide
                  relative pb-1
                  ${isActive ? 'text-red' : 'text-ink hover:text-red'}
                `}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-red rounded" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Línea divisoria inferior */}
      <div className="absolute left-4 right-4 bottom-0 fz-divider" />
    </nav>
  );
}