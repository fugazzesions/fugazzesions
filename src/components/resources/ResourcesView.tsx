'use client';

import { useState } from 'react';
import { ResourceCard } from './ResourceCard';
import type { DbResource, DbResourceCategory } from '@/lib/queries/resources';

interface ResourcesViewProps {
  categories: DbResourceCategory[];
  resources: DbResource[];
}

export function ResourcesView({ categories, resources }: ResourcesViewProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const visibleCategories =
    activeFilter === 'all'
      ? categories
      : categories.filter((c) => c.slug === activeFilter);

  return (
    <>
      {/* Tabs estilo solapa (como Eventos) */}
      <div className="pb-6">
        <div className="flex gap-2.5 border-b-2 border-ink mx-4 flex-wrap">
          <FilterPill
            label="Todos"
            count={resources.length}
            active={activeFilter === 'all'}
            onClick={() => setActiveFilter('all')}
          />
          {categories.map((cat) => {
            const count = resources.filter((r) => r.category_id === cat.id).length;
            return (
              <FilterPill
                key={cat.id}
                label={cat.name}
                count={count}
                active={activeFilter === cat.slug}
                onClick={() => setActiveFilter(cat.slug)}
              />
            );
          })}
        </div>
      </div>

      {/* Listado agrupado por categoría */}
      {visibleCategories.map((cat) => {
        const catResources = resources
          .filter((r) => r.category_id === cat.id)
          .sort((a, b) => a.display_order - b.display_order);

        if (catResources.length === 0) return null;

        return (
          <div key={cat.id} className="mb-9">
            <div className="px-5 sm:px-8 pt-2 pb-3.5 flex items-center gap-3">
              <h2 className="font-display text-3xl">{cat.name}</h2>
              <div className="flex-1 fz-divider" />
              <span className="text-[11px] tracking-[0.15em] uppercase text-ink-muted">
                {catResources.length.toString().padStart(2, '0')} archivos
              </span>
            </div>

            <div className="px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </div>
        );
      })}

      {visibleCategories.every(
        (cat) => resources.filter((r) => r.category_id === cat.id).length === 0
      ) && (
        <div className="px-5 sm:px-8 py-12 text-center text-ink-muted">
          <p className="font-display text-2xl">No hay recursos en esta categoría</p>
        </div>
      )}
    </>
  );
}

function FilterPill({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2.5 border-2 border-ink border-b-0 rounded-t-md
        text-xs font-bold uppercase tracking-[0.1em]
        relative top-0.5
        flex items-center gap-2
        ${active ? 'bg-paper text-ink' : 'bg-ink text-paper'}
      `}
    >
      {label}
      <span className="text-[10px] opacity-60">
        {count.toString().padStart(2, '0')}
      </span>
    </button>
  );
}