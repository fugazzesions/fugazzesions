'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Download, Settings, FileText } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { CategoryManagerModal } from './CategoryManagerModal';
import type { DbResource, DbResourceCategory } from '@/lib/queries/resources';

interface RecursosAdminViewProps {
  categories: DbResourceCategory[];
  resources: DbResource[];
}

export function RecursosAdminView({
  categories,
  resources,
}: RecursosAdminViewProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Recursos sin categoría
  const orphans = resources.filter((r) => !r.category_id);

  return (
    <>
      {/* Strip de gestión de categorías */}
      <div className="mb-6 bg-ink text-paper rounded-md p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h4 className="font-display text-xl m-0 mb-0.5">
            Gestionar categorías
          </h4>
          <p className="text-xs text-paper/65 m-0">
            {categories.length} categorías cargadas · Agregá, renombrá o eliminá.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowCategoryModal(true)}
          className="bg-transparent! text-paper! border-paper! hover:bg-paper! hover:text-ink!"
        >
          <Settings size={14} /> Gestionar
        </Button>
      </div>

      {/* Listado por categoría */}
      {categories.map((cat) => {
        const catResources = resources.filter((r) => r.category_id === cat.id);
        if (catResources.length === 0) {
          return (
            <div key={cat.id} className="mb-7">
              <CategoryHeader name={cat.name} count={0} />
              <div className="border-2 border-dashed border-ink/30 rounded-md p-6 text-center text-xs text-ink-muted">
                Esta categoría todavía no tiene archivos.
              </div>
            </div>
          );
        }
        return (
          <div key={cat.id} className="mb-7">
            <CategoryHeader name={cat.name} count={catResources.length} />
            <ResourcesTable resources={catResources} />
          </div>
        );
      })}

      {/* Recursos sin categoría */}
      {orphans.length > 0 && (
        <div className="mb-7">
          <CategoryHeader name="Sin categoría" count={orphans.length} />
          <ResourcesTable resources={orphans} />
        </div>
      )}

      {resources.length === 0 && (
        <div className="fz-card p-12 text-center text-ink-muted">
          <p className="font-display text-3xl">Sin recursos cargados</p>
          <p className="text-sm mt-2 mb-5">
            Subí el primer PDF con el botón de arriba.
          </p>
        </div>
      )}

      {showCategoryModal && (
        <CategoryManagerModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </>
  );
}

function CategoryHeader({ name, count }: { name: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-3.5">
      <h2 className="font-display text-2xl m-0">{name}</h2>
      <div className="flex-1 fz-divider" />
      <span className="text-[11px] tracking-[0.15em] uppercase text-ink-muted">
        {count.toString().padStart(2, '0')} archivos
      </span>
    </div>
  );
}

function ResourcesTable({ resources }: { resources: DbResource[] }) {
  return (
    <div className="fz-card p-0 overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-ink text-paper">
          <tr>
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] font-bold w-14"></th>
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] font-bold">
              Archivo
            </th>
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] font-bold w-32">
              Etiqueta
            </th>
            <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.15em] font-bold w-28">
              Detalles
            </th>
            <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.15em] font-bold w-32">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr
              key={r.id}
              className="border-t border-dashed border-ink/15 hover:bg-ink/2"
            >
              <td className="px-4 py-3">
                <div className="w-9 h-10 border-2 border-ink rounded-sm flex items-center justify-center text-[9px] font-bold tracking-wider relative">
                  PDF
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-paper border-b-2 border-l-2 border-ink" />
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-bold uppercase tracking-wide leading-tight mb-0.5">
                  {r.title}
                </div>
                {r.description && (
                  <div className="text-xs text-ink-muted line-clamp-1">
                    {r.description}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                {r.tag === 'new' && <Tag variant="red">Nuevo</Tag>}
                {r.tag === 'recommended' && <Tag variant="green">Recomendado</Tag>}
              </td>
              <td className="px-4 py-3 text-xs text-ink-muted">
                {r.page_count && `${r.page_count} págs`}
                {r.page_count && r.file_size_mb && ' · '}
                {r.file_size_mb && `${r.file_size_mb} MB`}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1.5 justify-end">
                  
                    <a href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Descargar"
                    className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                  >
                    <Download size={14} />
                  </a>
                  <Link
                    href={`/admin/recursos/${r.id}`}
                    title="Editar"
                    className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                  >
                    <Pencil size={14} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}