'use client';

import { useState, useTransition } from 'react';
import { Trash2, X } from 'lucide-react';
import { deleteEvent } from '@/lib/mutations/events';
import { Button } from '@/components/ui/Button';

interface DeleteEventButtonProps {
  id: string;
  title: string;
}

export function DeleteEventButton({ id, title }: DeleteEventButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteEvent(id);
      setShowModal(false);
    });
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title="Eliminar"
        className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-red hover:text-paper hover:border-red transition-colors"
      >
        <Trash2 size={14} />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="fz-card p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="font-display text-3xl leading-none">
                ¿Eliminar evento?
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-ink-muted hover:text-ink p-1 -mt-1 -mr-1"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-ink-soft mb-2">
              Estás por eliminar el evento:
            </p>
            <p className="font-bold uppercase tracking-wide text-sm mb-5">
              {title}
            </p>
            <p className="text-xs text-ink-muted mb-6">
              Esta acción es permanente y también eliminará todas las fotos asociadas.
              No se puede deshacer.
            </p>

            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}