import { notFound } from 'next/navigation';
import { EventForm } from '@/components/admin/EventForm';
import { EventGalleryManager } from '@/components/admin/EventGalleryManager';
import { getEventById, getEventPhotos } from '@/lib/queries/events';

export const metadata = { title: 'Editar evento · Admin Fugazzesions' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarEventoPage({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const today = new Date().toISOString().split('T')[0];
  const isPast = event.date < today;

  // Si es evento pasado, cargamos sus fotos
  const photos = isPast ? await getEventPhotos(id) : [];

  return (
    <>
      <EventForm event={event} />

      {/* Manager de galería: solo para eventos pasados */}
      {isPast && (
        <div className="px-5 sm:px-8 pb-12 -mt-4">
          <div className="fz-card p-5">
            <div className="flex items-baseline gap-2.5 mb-4 pb-3 border-b border-dashed border-ink/20">
              <h3 className="font-display text-2xl m-0 leading-none">
                Galería de fotos
              </h3>
              <span className="text-[11px] text-ink-light tracking-wide">
                Fotos del evento finalizado
              </span>
            </div>
            <EventGalleryManager eventId={event.id} photos={photos} />
          </div>
        </div>
      )}
    </>
  );
}