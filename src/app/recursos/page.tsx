import { Mail } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { ResourcesView } from '@/components/resources/ResourcesView';
import { getResourceCategories, getResources } from '@/lib/queries/resources';

export const metadata = {
  title: 'Recursos · Fugazzesions',
  description: 'PDFs descargables: guías, materiales y consejos sobre patín.',
};

export default async function RecursosPage() {
  const [categories, resources] = await Promise.all([
    getResourceCategories(),
    getResources(),
  ]);

  return (
    <>
      <PageHeader
        title="Recursos"
        subtitle="Guías, materiales y descargas"
      />

      <p className="px-8 pt-3 pb-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
        PDFs descargables sobre patín, técnica y equipamiento. Material pensado para
        ayudarte a arrancar y mejorar, en tu propio tiempo y a tu propio ritmo.
      </p>

      <ResourcesView categories={categories} resources={resources} />

      {/* Bloque sugerir recurso */}
      <div className="mx-8 my-6 bg-paper-soft border-[2.5px] border-dashed border-ink rounded-md p-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-60">
          <h3 className="font-display text-2xl leading-none mb-1">
            ¿Falta algún recurso?
          </h3>
          <p className="text-xs text-ink-muted m-0">
            Escribinos y lo armamos. Si te sirvió a vos, le sirve a alguien más.
          </p>
        </div>
        <a href="mailto:hola@fugazzesions.com">
          <Button variant="secondary">
            <Mail size={14} /> Contactar
          </Button>
        </a>
      </div>

      <div className="pb-9"></div>
    </>
  );
}