import { Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RecursosAdminView } from '@/components/admin/RecursosAdminView';
import { getResourceCategories, getResources } from '@/lib/queries/resources';
import Link from 'next/link';

export const metadata = { title: 'Recursos · Admin Fugazzesions' };

export default async function AdminRecursosPage() {
  const [categories, resources] = await Promise.all([
    getResourceCategories(),
    getResources(),
  ]);

  return (
    <div className="p-8 pb-12">
      <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-5xl leading-none mb-1">Recursos</h1>
          <p className="text-sm text-ink-muted">
            PDFs descargables organizados por categoría
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/recursos/nuevo">
            <Button variant="primary">
              <Plus size={14} /> Subir nuevo PDF
            </Button>
          </Link>
        </div>
      </div>

      <RecursosAdminView categories={categories} resources={resources} />
    </div>
  );
}