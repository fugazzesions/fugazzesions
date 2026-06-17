import { notFound } from 'next/navigation';
import { EventForm } from '@/components/admin/EventForm';
import { getEventById } from '@/lib/queries/events';

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

  return <EventForm event={event} />;
}