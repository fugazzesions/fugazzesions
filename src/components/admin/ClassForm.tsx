'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { DeleteClassButton } from './DeleteClassButton';
import { createClass, updateClass, type ClassFormData } from '@/lib/mutations/classes';
import type { DbClass } from '@/lib/queries/classes';

interface ClassFormProps {
  classData?: DbClass;
}

export function ClassForm({ classData }: ClassFormProps) {
  const router = useRouter();
  const isEdit = !!classData;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [discipline, setDiscipline] = useState<'quad' | 'inline'>(
    classData?.discipline ?? 'quad'
  );
  const [level, setLevel] = useState<string>(classData?.level?.toString() ?? '1');
  const [levelName, setLevelName] = useState(classData?.level_name ?? '');
  const [description, setDescription] = useState(classData?.description ?? '');
  const [scheduleDays, setScheduleDays] = useState(classData?.schedule_days ?? '');
  const [scheduleTime, setScheduleTime] = useState(classData?.schedule_time ?? '');
  const [location, setLocation] = useState(classData?.location ?? '');
  const [capacity, setCapacity] = useState<string>(
    classData?.capacity?.toString() ?? ''
  );
  const [price, setPrice] = useState<string>(classData?.price?.toString() ?? '');
  const [formUrl, setFormUrl] = useState(classData?.form_url ?? '');
  const [active, setActive] = useState(classData?.active ?? true);
  const [displayOrder, setDisplayOrder] = useState<string>(
    classData?.display_order?.toString() ?? '0'
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: ClassFormData = {
      discipline,
      level: parseInt(level, 10),
      level_name: levelName.trim(),
      description: description.trim(),
      schedule_days: scheduleDays.trim(),
      schedule_time: scheduleTime.trim(),
      location: location.trim(),
      capacity: capacity ? parseInt(capacity, 10) : null,
      price: price ? parseInt(price, 10) : null,
      form_url: formUrl.trim(),
      active,
      display_order: parseInt(displayOrder, 10) || 0,
    };

    startTransition(async () => {
      if (isEdit && classData) {
        const result = await updateClass(classData.id, data);
        if (!result.success) {
          setError(result.error ?? 'Error desconocido');
          return;
        }
      } else {
        const result = await createClass(data);
        if (!result.success) {
          setError(result.error ?? 'Error desconocido');
          return;
        }
      }
      router.push('/admin/clases');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 pb-12">
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="text-xs text-ink-light mb-1">
            <Link href="/admin/clases" className="hover:text-ink">
              Clases
            </Link>
            <span className="mx-2 text-ink-faint">/</span>
            <span>{isEdit ? 'Editar clase' : 'Nueva clase'}</span>
          </div>
          <h1 className="font-display text-5xl leading-none">
            {isEdit ? 'Editar clase' : 'Nueva clase'}
          </h1>
        </div>

        <div className="flex gap-2 items-center">
          {isEdit && classData && (
            <DeleteClassButton
              id={classData.id}
              name={`${classData.discipline} · ${classData.level_name}`}
            />
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
          {/* Datos básicos */}
          <FormCard title="Disciplina y nivel">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-ink-soft mb-1.5">
                Disciplina <span className="text-red ml-1">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <DisciplineOption
                  label="Quad"
                  active={discipline === 'quad'}
                  onClick={() => setDiscipline('quad')}
                />
                <DisciplineOption
                  label="Inline"
                  active={discipline === 'inline'}
                  onClick={() => setDiscipline('inline')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Nivel (número)"
                type="number"
                required
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                hint="1, 2, 3..."
              />
              <Input
                label="Nombre del nivel"
                required
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                placeholder="Principiante"
              />
            </div>

            <Textarea
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </FormCard>

          {/* Horarios y lugar */}
          <FormCard title="Horarios y lugar">
            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Días"
                value={scheduleDays}
                onChange={(e) => setScheduleDays(e.target.value)}
                placeholder="Martes y jueves"
              />
              <Input
                label="Horario"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                placeholder="18:00 – 19:30 hs"
              />
            </div>
            <Input
              label="Ubicación"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Parque Centenario"
            />
            <Input
              label="Cupo (personas)"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="8"
            />
          </FormCard>

          {/* Costo + inscripción */}
          <FormCard title="Precio e inscripción">
            <Input
              label="Precio mensual (ARS)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="28000"
              hint="Sin separadores. Dejar vacío si es gratis."
            />
            <Input
              label="Link del Google Form"
              type="url"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://forms.gle/..."
              hint="El botón 'Inscribirme' del sitio público apunta acá."
            />
          </FormCard>
        </div>

        {/* Columna derecha */}
        <aside className="space-y-5">
          <FormCard title="Estado">
            <div className="space-y-2">
              <RadioOption
                label="Activa"
                desc="Visible en /clases público"
                checked={active}
                onChange={() => setActive(true)}
              />
              <RadioOption
                label="Pausada"
                desc="No aparece en el sitio público"
                checked={!active}
                onChange={() => setActive(false)}
              />
            </div>
          </FormCard>

          <FormCard title="Orden">
            <Input
              label="Posición en el listado"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              hint="Número más bajo aparece primero dentro de su disciplina."
            />
          </FormCard>
        </aside>
      </div>

      <div className="flex justify-between items-center mt-7 p-4 fz-card">
        <div className="text-xs text-ink-muted">
          {isEdit ? 'Los cambios se aplican al guardar' : 'Completá los campos y guardá'}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/clases">
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

function DisciplineOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        py-3 border-2 border-ink rounded-md text-xs font-bold uppercase tracking-[0.12em]
        transition-colors
        ${active ? 'bg-ink text-paper' : 'bg-paper hover:bg-paper-warm'}
      `}
    >
      {label}
    </button>
  );
}

function RadioOption({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        w-full flex items-center gap-2.5 p-3 border-2 border-ink rounded-md text-left
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
        {checked && <span className="absolute inset-1 bg-red rounded-full" />}
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