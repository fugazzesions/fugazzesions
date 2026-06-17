import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="px-5 sm:px-8 py-20 text-center">
      <h1 className="font-display text-[120px] leading-none text-red">404</h1>
      <p className="font-display text-3xl mt-2">Página no encontrada</p>
      <p className="text-sm text-ink-muted mt-2">
        El evento o página que buscás no existe o fue eliminada.
      </p>
      <div className="mt-6">
        <Link href="/">
          <Button variant="primary">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}