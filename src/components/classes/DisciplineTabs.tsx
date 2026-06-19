'use client';

import { useState } from 'react';
import { ClassCard } from './ClassCard';
import type { DbClass } from '@/lib/queries/classes';

interface DisciplineTabsProps {
  quadClasses: DbClass[];
  inlineClasses: DbClass[];
}

export function DisciplineTabs({ quadClasses, inlineClasses }: DisciplineTabsProps) {
  const [active, setActive] = useState<'quad' | 'inline'>('quad');

  const classes = active === 'quad' ? quadClasses : inlineClasses;

  return (
    <>
      {/* Tabs estilo solapa (como Eventos) */}
      <div className="pt-7">
        <div className="flex gap-2.5 border-b-2 border-ink mx-4">
          <DiscButton
            label="Quad"
            count={quadClasses.length}
            active={active === 'quad'}
            onClick={() => setActive('quad')}
          />
          <DiscButton
            label="Inline"
            count={inlineClasses.length}
            active={active === 'inline'}
            onClick={() => setActive('inline')}
          />
        </div>
      </div>

      {/* Section head */}
      <div className="px-5 sm:px-8 pt-7 pb-3.5 flex items-center gap-3">
        <h2 className="font-display text-3xl">
          Niveles disponibles · {active === 'quad' ? 'Quad' : 'Inline'}
        </h2>
        <div className="flex-1 fz-divider" />
      </div>

      {/* Grid */}
      {classes.length > 0 ? (
        <div className="px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <ClassCard key={c.id} classData={c} />
          ))}
        </div>
      ) : (
        <div className="px-5 sm:px-8 py-12 text-center text-ink-muted">
          <p className="font-display text-2xl">No hay clases activas en este momento</p>
          <p className="text-sm mt-1">Volvé a visitarnos pronto.</p>
        </div>
      )}
    </>
  );
}

function DiscButton({
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