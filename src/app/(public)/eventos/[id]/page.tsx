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
      {/* Breadcrumb */}
      <div className="px-5 sm:px-8 pt-6 text-xs text-ink-light tracking-wide">
        <Link href="/eventos" className="hover:text-ink inline-flex items-center gap-1">
          <ArrowLeft size={11} /> Eventos
        </Link>
        <span className="mx-2 text-ink-faint">/</span>
        <span className="text-ink font-medium">{event.title}</span>
      </div>

      {/* Título + status */}
      <div className="px-5 sm:px-8 pt-4 pb-6 flex items-end justify-between gap-4 flex-wrap">
        <h1 className="font-display text-6xl leading-none m-0">{event.title}</h1>
        <Tag variant={status.variant} className="text-[10px] px-3 py-1.5 self-start mt-1.5">
          {status.isPast
            ? 'Evento finalizado'
            : event.is_paid
              ? 'Entradas a la venta'
              : 'Inscripción abierta'}
        </Tag>
      </div>

      {/* Banner (flyer) */}
      {event.image_url ? (
        <div className="px-5 sm:px-8 flex justify-center">
          <div className="relative fz-border rounded-md overflow-hidden max-w-md w-full">
            <Image
              src={event.image_url}
              alt={event.title}
              width={1200}
              height={1500}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      ) : (
        <div className="mx-5 sm:mx-8 relative aspect-video bg-paper-warm fz-border rounded-md overflow-hidden flex items-center justify-center text-ink/25 text-5xl">
          ⊕
        </div>
      )}

      {/* "Sobre la sesión" / "Cómo estuvo" */}
      <div className="px-5 sm:px-8 pt-10 pb-6 max-w-3xl">
        <h2 className="font-display text-3xl mb-3">
          {status.isPast ? 'Cómo estuvo' : 'Sobre la sesión'}
        </h2>
        {event.description && (
          <div className="text-base leading-relaxed text-ink-soft space-y-3">
            {event.description.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </div>

      {/* Cuadro de info horizontal */}
      <div className="px-5 sm:px-8 pb-8">
        <div className="fz-card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoBlock icon={<Calendar size={20} />} label="Fecha">
              <span className="font-display text-xl font-bold leading-tight">
                {formatLongDate(event.date)}
              </span>
            </InfoBlock>

            <InfoBlock icon={<Clock size={20} />} label="Hora">
              <span className="text-base font-semibold">{formatEventTime(event.time)}</span>
            </InfoBlock>

            {event.location_name && (
              <InfoBlock icon={<MapPin size={20} />} label="Ubicación">
                <span className="text-base font-semibold">{event.location_name}</span>
                {event.address && (
                  <span className="block text-xs text-ink-muted mt-0.5">{event.address}</span>
                )}
              </InfoBlock>
            )}

            {!status.isPast && event.is_paid && event.price && (
              <InfoBlock icon={<Ticket size={20} />} label="Entrada">
                <span className="font-display text-xl font-bold text-red">
                  {formatPrice(event.price)}
                </span>
              </InfoBlock>
            )}
          </div>

          {/* CTA comprar entrada */}
          {!status.isPast && event.ticket_url && (
            <div className="mt-6 pt-6 border-t border-dashed border-ink/20 flex justify-center">
              
              <a href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="px-8">
                  Comprar entrada <ExternalLink size={14} />
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Galería para eventos pasados */}
      {status.isPast && <EventGallery photos={photos} />}
    </>
  );
}

function InfoBlock({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-ink-light">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.15em] font-bold">
          {label}
        </span>
      </div>
      <div className="text-ink">{children}</div>
    </div>
  );
}