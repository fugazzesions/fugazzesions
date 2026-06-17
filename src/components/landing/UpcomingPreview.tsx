import Link from 'next/link';
import { EventCard } from '@/components/events/EventCard';
import { getUpcomingEvents } from '@/lib/queries/events';
import { formatEventDate, formatEventTime } from '@/lib/utils/date';
import { getEventStatus } from '@/lib/utils/eventStatus';

export async function UpcomingPreview() {
  const events = await getUpcomingEvents(3);

  if (events.length === 0) {
    return null; // Si no hay eventos, no se renderiza la sección
  }

  return (
    <section className="px-5 sm:px-8 pt-10 pb-10 border-t-[1.5px] border-ink">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-3xl">Próximas sesiones</h2>
        <div className="flex-1 fz-divider" />
        <Link
          href="/eventos"
          className="text-[10px] tracking-[0.2em] uppercase text-ink-muted font-semibold hover:text-red"
        >
          Ver todo
        </Link>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            title={event.title}
            date={formatEventDate(event.date)}
            time={formatEventTime(event.time)}
            location={event.location_name ?? 'Por confirmar'}
            imageUrl={event.image_url}
            status={getEventStatus(event)}
          />
        ))}
      </div>
    </section>
  );
}