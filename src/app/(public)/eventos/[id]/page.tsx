import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, ExternalLink } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { EventGallery } from '@/components/events/EventGallery';
import { getEventById, getEventPhotos } from '@/lib/queries/events';
import { formatLongDate, formatEventTime } from '@/lib/utils/date';
import { formatPrice } from '@/lib/utils/currency';
import { getEventStatus } from '@/lib/utils/eventStatus';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) return { title: 'Evento no encontrado · Fugazzesions' };

  return {
    title: `${event.title} · Fugazzesions`,
    description: event.description ?? undefined,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event || !event.published) {
    notFound();
  }

  const status = getEventStatus(event);
  const photos = status.isPast ? await getEventPhotos(id) : [];

  return (
    <>
      <div className="px-5 sm:px-8 pt-6 text-xs text-ink-light tracking-wide">
        <Link href="/eventos" className="hover:text-ink inline-flex items-center gap-1">
          <ArrowLeft size={11} /> Eventos
        </Link>
        <span className="mx-2 text-ink-faint">/</span>
        <span className="text-ink font-medium">{event.title}</span>
      </div>

      <div className="px-5 sm:px-8 pt-4 pb-6 flex items-end justify-between gap-4 flex-wrap">
        <h1 className="font-display text-[64px] leading-none m-0">{event.title}</h1>
        <Tag variant={status.variant} className="text-[10px] px-3 py-1.5 self-start mt-1.5">
          {status.isPast ? 'Evento finalizado' : (event.is_paid ? 'Entradas a la venta' : 'Inscripción abierta')}
        </Tag>
      </div>

      <div className="mx-5 sm:mx-8 relative aspect-video bg-paper-warm fz-border rounded-md overflow-hidden">
        {event.image_url ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink/25 text-5xl">
            ⊕
          </div>
        )}
      </div>

      <div className="px-5 sm:px-8 pt-7 pb-2 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div>
          <h2 className="font-display text-3xl mb-3">
            {status.isPast ? 'Cómo estuvo' : 'Sobre la sesión'}
          </h2>
          {event.description && (
            <div className="text-sm leading-relaxed text-ink-soft space-y-3">
              {event.description.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </div>

        <aside>
          <div className="fz-card p-5">
            <InfoRow icon={<Calendar size={18} />} label="Fecha">
              <span className="font-display text-xl font-bold">
                {formatLongDate(event.date)}
              </span>
            </InfoRow>
            <InfoRow icon={<Clock size={18} />} label="Hora">
              <span className="text-sm font-semibold">{formatEventTime(event.time)}</span>
            </InfoRow>
            {event.location_name && (
              <InfoRow icon={<MapPin size={18} />} label="Ubicación">
                <span className="text-sm font-semibold">{event.location_name}</span>
                {event.address && (
                  <span className="block text-xs text-ink-muted mt-0.5">{event.address}</span>
                )}
              </InfoRow>
            )}
            {!status.isPast && event.is_paid && event.price && (
              <InfoRow icon={<Ticket size={18} />} label="Entrada">
                <span className="font-display text-xl font-bold text-red">
                  {formatPrice(event.price)}
                </span>
              </InfoRow>
            )}

            {!status.isPast && event.ticket_url && (
              
                <a href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4"
              >
                <Button variant="primary" className="w-full">
                  Comprar entrada <ExternalLink size={14} />
                </Button>
              </a>
            )}
          </div>
        </aside>
      </div>

      {status.isPast && <EventGallery photos={photos} />}
    </>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-dashed border-ink/20 last:border-b-0">
      <div className="text-ink mt-0.5">{icon}</div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-ink-light mb-0.5">
          {label}
        </div>
        {children}
      </div>
    </div>
  );
}