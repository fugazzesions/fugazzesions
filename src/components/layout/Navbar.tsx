'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '/eventos', label: 'eventos' },
  { href: '/clases', label: 'clases' },
  { href: '/quienes-somos', label: 'quiénes somos' },
  { href: '/recursos', label: 'recursos' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Cerrar menú automáticamente al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className="sticky top-0 z-30 bg-paper/95 backdrop-blur-md">
        <div className="relative flex items-center justify-between px-5 sm:px-8 py-3">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center"
            aria-label="Inicio"
          >
            <Image
              src="/logo-fugazzesions.png"
              alt="Fugazzesions"
              width={200}
              height={60}
              priority
              className="h-8 sm:h-10 w-auto"
            />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex gap-6 list-none m-0 p-0">
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

          {/* Mobile burger */}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center border-2 border-ink rounded-md"
            aria-label="Menú"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Línea divisoria inferior */}
          <div className="absolute left-4 right-4 bottom-0 fz-divider" />
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-paper z-20 px-5 py-6">
          <ul className="flex flex-col gap-2 list-none m-0 p-0">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`
                      block py-3 px-4 rounded-md
                      text-lg font-medium lowercase tracking-wide
                      border-2
                      ${isActive
                        ? 'bg-paper-soft text-red border-red'
                        : 'bg-paper text-ink border-ink/15 hover:border-ink'
                      }
                    `}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}