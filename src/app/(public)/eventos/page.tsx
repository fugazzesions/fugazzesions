import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { EventCard } from '@/components/events/EventCard';
import { EventListRow } from '@/components/events/EventListRow';
import { getAllUpcomingEvents, getPastEvents } from '@/lib/queries/events';
import { formatEventDate, formatEventTime, formatArchiveDate } from '@/lib/utils/date';
import { getEventStatus } from '@/lib/utils/eventStatus';

export const metadata = {
  title: 'Eventos · Fugazzesions',
  description: 'Sesiones, encuentros y fugazzesions oficiales.',
};

export default async function EventosPage() {
  const [upcoming, past] = await Promise.all([
    getAllUpcomingEvents(),
    getPastEvents(),
  ]);

  return (
    <>
      <PageHeader
        title="Eventos"
        subtitle="Sesiones, encuentros y fugazzesions oficiales"
      />

      <div className="pt-7">
        <Tabs
          tabs={[
            {
              id: 'upcoming',
              label: 'Próximos',
              count: upcoming.length,
              content: <UpcomingGrid events={upcoming} />,
            },
            {
              id: 'past',
              label: 'Pasados',
              count: past.length,
              content: <PastList events={past} />,
            },
          ]}
        />
      </div>
    </>
  );
}

function UpcomingGrid({ events }: { events: Awaited<ReturnType<typeof getAllUpcomingEvents>> }) {
  if (events.length === 0) {
    return (
      <div className="px-5 sm:px-8 py-12 text-center text-ink-muted">
        <p className="font-display text-2xl">No hay eventos próximos</p>
        <p className="text-sm mt-1">Volvé a visitarnos pronto.</p>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-8 pt-7 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}

function PastList({ events }: { events: Awaited<ReturnType<typeof getPastEvents>> }) {
  if (events.length === 0) {
    return (
      <div className="px-5 sm:px-8 py-12 text-center text-ink-muted">
        <p className="font-display text-2xl">Sin eventos en el archivo</p>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-8 pt-7 pb-9 flex flex-col gap-2.5">
      {events.map((event) => {
        const { day, year } = formatArchiveDate(event.date);
        const meta = [
          event.location_name,
          formatEventTime(event.time),
        ].filter(Boolean).join(' · ');

        return (
          <EventListRow
            key={event.id}
            id={event.id}
            title={event.title}
            day={day}
            year={year}
            meta={meta}
          />
        );
      })}
    </div>
  );
}