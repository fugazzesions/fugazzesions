'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Email o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    // Login exitoso → al dashboard
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-9">
          <Link href="/" className="font-display text-5xl font-bold">
            Fugazzesions
          </Link>
          <p className="text-[10px] uppercase tracking-[0.2em] text-ink-light mt-1">
            Panel admin
          </p>
        </div>

        {/* Card del form */}
        <div className="fz-card p-8">
          <h1 className="font-display text-3xl mb-1">Iniciar sesión</h1>
          <p className="text-xs text-ink-muted mb-6">
            Acceso solo para el equipo de Fugazzesions
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Contraseña"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-soft border-2 border-red rounded-md text-xs text-red">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : (
                <>Iniciar sesión <LogIn size={14} /></>
              )}
            </Button>
          </form>
        </div>

        {/* Link volver al sitio */}
        <div className="text-center mt-5">
          <Link
            href="/"
            className="text-xs text-ink-muted hover:text-ink tracking-wide"
          >
            ← Volver al sitio
          </Link>
        </div>
      </div>
    </div>
  );
}