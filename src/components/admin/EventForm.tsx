'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, X, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ImageUploader } from './ImageUploader';
import { DeleteEventButton } from './DeleteEventButton';
import { createEvent, updateEvent, type EventFormData } from '@/lib/mutations/events';
import type { DbEvent } from '@/lib/queries/events';

interface EventFormProps {
  event?: DbEvent;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEdit = !!event;

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Estado del formulario
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [date, setDate] = useState(event?.date ?? '');
  const [time, setTime] = useState(event?.time?.slice(0, 5) ?? '');
  const [locationName, setLocationName] = useState(event?.location_name ?? '');
  const [address, setAddress] = useState(event?.address ?? '');
  const [imageUrl, setImageUrl] = useState<string | null>(event?.image_url ?? null);
  const [isPaid, setIsPaid] = useState(event?.is_paid ?? false);
  const [price, setPrice] = useState<string>(event?.price?.toString() ?? '');
  const [ticketUrl, setTicketUrl] = useState(event?.ticket_url ?? '');
  const [published, setPublished] = useState(event?.published ?? false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: EventFormData = {
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location_name: locationName.trim(),
      address: address.trim(),
      image_url: imageUrl,
      is_paid: isPaid,
      price: isPaid && price ? parseInt(price, 10) : null,
      ticket_url: isPaid && ticketUrl ? ticketUrl.trim() : null,
      published,
    };

    startTransition(async () => {
      if (isEdit && event) {
        const result = await updateEvent(event.id, data);
        if (!result.success) {
          setError(result.error ?? 'Error desconocido');
          return;
        }
        router.push('/admin/eventos');
        router.refresh();
      } else {
        const result = await createEvent(data);
        if (!result.success) {
          setError(result.error ?? 'Error desconocido');
          return;
        }
        router.push('/admin/eventos');
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 pb-12">
      {/* Topbar */}
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div>
          <div className="text-xs text-ink-light mb-1">
            <Link href="/admin/eventos" className="hover:text-ink">
              Eventos
            </Link>
            <span className="mx-2 text-ink-faint">/</span>
            <span>{isEdit ? 'Editar evento' : 'Nuevo evento'}</span>
          </div>
          <h1 className="font-display text-5xl leading-none">
            {isEdit ? 'Editar evento' : 'Nuevo evento'}
          </h1>
        </div>

        <div className="flex gap-2 items-center">
          {isEdit && event && (
            <>
              <DeleteEventButton id={event.id} title={event.title} />
              <Link href={`/eventos/${event.id}`} target="_blank">
                <Button variant="secondary" type="button">
                  <Eye size={14} /> Vista previa
                </Button>
              </Link>
            </>
          )}
          <Button type="submit" variant="primary" disabled={isPending}>
            <Save size={14} /> {isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      {/* Error general */}
      {error && (
        <div className="mb-5 p-3 bg-red-soft border-2 border-red rounded-md text-xs text-red">
          {error}
        </div>
      )}

      {/* Grid 2 columnas */}
      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* Columna izquierda */}
        <div className="space-y-5">
          {/* Datos básicos */}
          <FormCard title="Datos del evento" desc="Información principal">
            <Input
              label="Título"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Fugazzesion #13"
            />

            <Textarea
              label="Descripción"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              hint="Aparece en la página del evento. Podés separar párrafos con doble enter."
              rows={5}
            />

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Fecha"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <Input
                label="Hora"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <Input
              label="Lugar"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Palermo, CABA"
            />

            <Input
              label="Dirección"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. del Libertador 2500"
              hint="Opcional. Se usa para el mapa embebido en el futuro."
            />
          </FormCard>

          {/* Imagen */}
          <FormCard title="Imagen principal" desc="Foto del evento · 16:9 recomendado">
            <ImageUploader
              bucket="event-images"
              currentUrl={imageUrl}
              onChange={setImageUrl}
            />
          </FormCard>

          {/* Entradas */}
          <FormCard title="Entradas" desc="¿El evento tiene costo?">
            <Toggle
              label="Evento pago"
              sublabel="Mostrar precio y botón de compra"
              checked={isPaid}
              onChange={setIsPaid}
            />

            {isPaid && (
              <div className="grid grid-cols-2 gap-3.5 mt-3">
                <Input
                  label="Precio"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="8000"
                  hint="En ARS, sin separadores"
                />
                <Input
                  label="Link de compra"
                  type="url"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}
          </FormCard>
        </div>

        {/* Columna derecha */}
        <aside className="space-y-5">
          {/* Estado */}
          <FormCard title="Publicación" desc="¿Visible en el sitio público?">
            <div className="space-y-2">
              <RadioOption
                label="Publicado"
                desc="Visible en el sitio"
                checked={published}
                onChange={() => setPublished(true)}
              />
              <RadioOption
                label="Borrador"
                desc="Solo visible en el admin"
                checked={!published}
                onChange={() => setPublished(false)}
              />
            </div>
          </FormCard>

          {/* Info */}
          <div className="bg-ink text-paper rounded-md p-5">
            <h4 className="font-display text-xl mb-2">Tip</h4>
            <p className="text-xs leading-relaxed text-paper/75 m-0">
              El estado <strong className="text-paper font-semibold">Próximo / Finalizado</strong>{' '}
              se calcula automáticamente según la fecha. Vos solo gestionás si está{' '}
              <strong className="text-paper font-semibold">Publicado</strong> o en{' '}
              <strong className="text-paper font-semibold">Borrador</strong>.
            </p>
          </div>

          {isEdit && event && (
            <FormCard title="Información" desc="Metadata del evento">
              <div className="text-xs text-ink-soft space-y-1.5">
                <div>
                  <strong>Creado:</strong>{' '}
                  {new Date(event.created_at).toLocaleDateString('es-AR')}
                </div>
                <div>
                  <strong>Última edición:</strong>{' '}
                  {new Date(event.updated_at).toLocaleDateString('es-AR')}
                </div>
              </div>
            </FormCard>
          )}
        </aside>
      </div>

      {/* Acciones inferiores */}
      <div className="flex justify-between items-center mt-7 p-4 fz-card">
        <div className="text-xs text-ink-muted">
          {isEdit ? 'Los cambios se aplican al guardar' : 'Completá los campos y guardá'}
        </div>
        <div className="flex gap-2">
          <Link href="/admin/eventos">
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

// ─── Subcomponentes auxiliares ──────────────────────────────────────

function FormCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fz-card p-5">
      <div className="flex items-baseline gap-2.5 mb-4 pb-3 border-b border-dashed border-ink/20">
        <h3 className="font-display text-2xl m-0 leading-none">{title}</h3>
        <span className="text-[11px] text-ink-light tracking-wide">{desc}</span>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Toggle({
  label,
  sublabel,
  checked,
  onChange,
}: {
  label: string;
  sublabel: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border-2 border-ink rounded-md bg-paper">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`
          w-10 h-6 rounded-full relative transition-colors shrink-0
          ${checked ? 'bg-green' : 'bg-ink/30'}
        `}
      >
        <span
          className={`
            absolute top-0.5 w-5 h-5 bg-paper rounded-full transition-all
            ${checked ? 'left-4.5' : 'left-0.5'}
          `}
        />
      </button>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-ink-muted">{sublabel}</div>
      </div>
    </div>
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
        {checked && (
          <span className="absolute inset-1 bg-red rounded-full" />
        )}
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