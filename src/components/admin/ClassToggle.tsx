'use client';

import { useState, useTransition } from 'react';
import { toggleClassActive } from '@/lib/mutations/classes';

interface ClassToggleProps {
  id: string;
  initialActive: boolean;
}

export function ClassToggle({ id, initialActive }: ClassToggleProps) {
  const [active, setActive] = useState(initialActive);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newState = !active;
    setActive(newState); // Optimistic update

    startTransition(async () => {
      const result = await toggleClassActive(id, newState);
      if (!result.success) {
        setActive(!newState); // Revertir si falla
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      title={active ? 'Activa — click para pausar' : 'Pausada — click para activar'}
      className={`
        w-10 h-6 rounded-full relative transition-colors shrink-0
        ${active ? 'bg-green' : 'bg-ink/30'}
      `}
    >
      <span
        className={`
          absolute top-0.5 w-5 h-5 bg-paper rounded-full transition-all
          ${active ? 'left-4.5' : 'left-0.5'}
        `}
      />
    </button>
  );
}