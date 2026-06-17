'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { PdfUploader } from './PdfUploader';
import {
  createResource,
  updateResource,
  deleteResource,
  type ResourceFormData,
} from '@/lib/mutations/resources';
import type { DbResource, DbResourceCategory } from '@/lib/queries/resources';

interface ResourceFormProps {
  resource?: DbResource;
  categories: DbResourceCategory[];
}

export function ResourceForm({ resource, categories }: ResourceFormProps) {
  const router = useRouter();
  const isEdit = !!resource;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(resource?.title ?? '');
  const [description, setDescription] = useState(resource?.description ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(
    resource?.category_id ?? null
  );
  const [fileUrl, setFileUrl] = useState<string | null>(resource?.file_url ?? null);
  const [fileSizeMb, setFileSizeMb] = useState<number | null>(
    resource?.file_size_mb ?? null
  );
  const [pageCount, setPageCount] = useState<string>(
    resource?.page_count?.toString() ?? ''
  );
  const [tag, setTag] = useState<'new' | 'recommended' | null>(resource?.tag ?? null);
  const [displayOrder, setDisplayOrder] = useState<string>(
    resource?.display_order?.toString() ?? '0'
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fileUrl) {
      setError('Tenés que subir un PDF antes de guardar.');
      return;
    }

    const data: ResourceFormData = {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      file_url: fileUrl,
      file_size_mb: fileSizeMb,
      page_count: pageCount ? parseInt(pageCount, 10) : null,
      tag,
      display_order: parseInt(displayOrder, 10) || 0,
    };

    startTransition(async () => {
      if (isEdit && resource) {
        const result = await updateResource(resource.id, data);
        if (!result.success) {
          setError(result.error ?? 'Error desconocido');
          return;
        }
      } else {
        const result = await createResource(data);
        if (!result.success) {
          setError(result.error ?? 'Error desconocido');
          return;
        }
      }
      router.push('/admin/recursos');
      router.refresh();
    });
  }

  function handleDelete() {
    if (!resource) return;
    if (!confirm('¿Eliminar este recurso? El PDF también se borrará.')) return;

    startTransition(async () => {
      await deleteResource(resource.id);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 pb-12">
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="text-xs text-ink-light mb-1">
            <Link href="/admin/recursos" className="hover:text-ink">
              Recursos
            </Link>
            <span className="mx-2 text-ink-faint">/</span>
            <span>{isEdit ? 'Editar recurso' : 'Nuevo recurso'}</span>
          </div>
          <h1 className="font-display text-5xl leading-none">
            {isEdit ? 'Editar recurso' : 'Nuevo recurso'}
          </h1>
        </div>

        <div className="flex gap-2 items-center">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="w-9 h-9 border-2 border-red text-red rounded-md flex items-center justify-center hover:bg-red hover:text-paper transition-colors"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
          )}
          <Button type="submit" variant="primary" disabled={isPending}>
            <Save size={14} /> {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-soft border-2 border-red rounded-md text-xs text-red">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* Columna izquierda */}
        <div className="space-y-5">
          <FormCard title="Archivo PDF">
            <PdfUploader
              currentUrl={fileUrl}
              onChange={(data) => {
                if (data) {
                  setFileUrl(data.url);
                  setFileSizeMb(data.sizeMb);
                } else {
                  setFileUrl(null);
                  setFileSizeMb(null);
                }
              }}
            />
          </FormCard>

          <FormCard title="Datos del recurso">
            <Input
              label="Título"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué es el patín?"
            />
            <Textarea
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              hint="Breve descripción que aparece en la card del sitio público."
            />
            <Input
              label="Cantidad de páginas"
              type="number"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              placeholder="12"
              hint="Opcional. Solo informativo."
            />
          </FormCard>
        </div>

        {/* Columna derecha */}
        <aside className="space-y-5">
          <FormCard title="Categoría">
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value || null)}
              className="w-full px-3 py-2.5 border-2 border-ink rounded-md bg-paper text-ink text-sm font-sans focus:outline-none focus:shadow-[3px_3px_0_var(--color-red)]"
            >
              <option value="">— Sin categoría —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FormCard>

          <FormCard title="Etiqueta">
            <div className="space-y-2">
              <TagOption
                label="Sin etiqueta"
                desc="Sin destacar"
                checked={tag === null}
                onChange={() => setTag(null)}
              />
              <TagOption
                label="Nuevo"
                desc="Aparece con tag rojo"
                checked={tag === 'new'}
                onChange={() => setTag('new')}
                variant="red"
              />
              <TagOption
                label="Recomendado"
                desc="Aparece con tag verde"
                checked={tag === 'recommended'}
                onChange={() => setTag('recommended')}
                variant="green"
              />
            </div>
          </FormCard>

          <FormCard title="Orden">
            <Input
              label="Posición en el listado"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              hint="Número más bajo aparece primero dentro de su categoría."
            />
          </FormCard>
        </aside>
      </div>

      <div className="flex justify-between items-center mt-7 p-4 fz-card">
        <div className="text-xs text-ink-muted">
          {isEdit ? 'Los cambios se aplican al guardar' : 'Subí el PDF, completá los datos y guardá'}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/recursos">
            <Button variant="secondary" type="button">
              <X size={14} /> Cancelar
            </Button>
          </Link>
          <Button type="submit" variant="primary" disabled={isPending}>
            <Save size={14} /> {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="fz-card p-5">
      <div className="mb-4 pb-3 border-b border-dashed border-ink/20">
        <h3 className="font-display text-2xl m-0 leading-none">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TagOption({
  label,
  desc,
  checked,
  onChange,
  variant = 'default',
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
  variant?: 'default' | 'red' | 'green';
}) {
  const dotColor = {
    default: 'bg-ink',
    red: 'bg-red',
    green: 'bg-green',
  }[variant];

  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        w-full flex items-center gap-2.5 p-2.5 border-2 border-ink rounded-md text-left
        transition-colors
        ${checked ? 'bg-ink text-paper' : 'bg-paper hover:bg-paper-warm'}
      `}
    >
      <span
        className={`
          w-4.5 h-4.5 rounded-full border-2 shrink-0 relative
          ${checked ? 'border-paper' : 'border-ink'}
        `}
      >
        {checked && <span className={`absolute inset-1 ${dotColor} rounded-full`} />}
      </span>
      <div>
        <div className="text-xs font-bold uppercase tracking-widest leading-tight">
          {label}
        </div>
        <div className={`text-xs ${checked ? 'text-paper/60' : 'text-ink-muted'}`}>
          {desc}
        </div>
      </div>
    </button>
  );
}