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
      {/* Toggle */}
      <div className="px-8 mb-2">
        <div className="inline-flex border-[2.5px] border-ink rounded-md overflow-hidden">
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
      <div className="px-8 pt-7 pb-3.5 flex items-center gap-3">
        <h2 className="font-display text-3xl">
          Niveles disponibles · {active === 'quad' ? 'Quad' : 'Inline'}
        </h2>
        <div className="flex-1 fz-divider" />
      </div>

      {/* Grid */}
      {classes.length > 0 ? (
        <div className="px-8 grid grid-cols-3 gap-4">
          {classes.map((c) => (
            <ClassCard key={c.id} classData={c} />
          ))}
        </div>
      ) : (
        <div className="px-8 py-12 text-center text-ink-muted">
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
        px-5 py-3 text-xs font-bold uppercase tracking-[0.12em]
        flex items-center gap-2
        ${active ? 'bg-ink text-paper' : 'bg-transparent text-ink hover:bg-ink/5'}
      `}
    >
      {label}
      <span
        className={`
          text-[10px] px-1.5 py-0.5 rounded-full
          ${active ? 'bg-paper/15' : 'bg-ink/10'}
        `}
      >
        {count}
      </span>
    </button>
  );
}