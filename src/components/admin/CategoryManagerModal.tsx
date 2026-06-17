'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Trash2, Pencil, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/mutations/resources';
import type { DbResourceCategory } from '@/lib/queries/resources';

interface CategoryManagerModalProps {
  categories: DbResourceCategory[];
  onClose: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function CategoryManagerModal({
  categories,
  onClose,
}: CategoryManagerModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    if (!newName.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await createCategory(newName.trim(), slugify(newName));
      if (!result.success) {
        setError(result.error ?? 'Error al crear');
        return;
      }
      setNewName('');
      router.refresh();
    });
  }

  function handleUpdate(id: string) {
    if (!editingName.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await updateCategory(
        id,
        editingName.trim(),
        slugify(editingName)
      );
      if (!result.success) {
        setError(result.error ?? 'Error al actualizar');
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar categoría? Los recursos asociados quedarán sin categoría.')) {
      return;
    }

    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.success) {
        setError(result.error ?? 'Error al eliminar');
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="fz-card p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-3xl leading-none mb-1">
              Gestionar categorías
            </h2>
            <p className="text-xs text-ink-muted">
              Las categorías agrupan los recursos en el sitio público
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink p-1 -mt-1 -mr-1"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-red-soft border-2 border-red rounded-md text-xs text-red">
            {error}
          </div>
        )}

        {/* Nueva categoría */}
        <div className="mb-5 pb-5 border-b border-dashed border-ink/20">
          <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-ink-soft mb-2">
            Crear nueva
          </label>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre de la categoría"
            />
            <Button
              type="button"
              variant="primary"
              onClick={handleCreate}
              disabled={isPending || !newName.trim()}
            >
              <Plus size={14} /> Crear
            </Button>
          </div>
        </div>

        {/* Listado */}
        <div className="space-y-2">
          {categories.length === 0 ? (
            <p className="text-xs text-ink-muted text-center py-4">
              No hay categorías. Creá la primera arriba.
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2.5 border-2 border-ink rounded-md bg-paper"
              >
                {editingId === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-2 py-1 border-2 border-ink rounded-md text-sm bg-paper"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleUpdate(cat.id)}
                      disabled={isPending}
                      className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-green hover:text-paper hover:border-green transition-colors"
                      title="Guardar"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                      title="Cancelar"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-semibold">{cat.name}</span>
                    <span className="text-[10px] text-ink-muted tracking-wide">
                      {cat.slug}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                      className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id)}
                      disabled={isPending}
                      className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-red hover:text-paper hover:border-red transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}