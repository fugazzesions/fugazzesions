import Link from 'next/link';
import { Plus, Eye, Pencil, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { createClient } from '@/lib/supabase/server';
import { formatEventDate, formatEventTime } from '@/lib/utils/date';
import { DeleteEventButton } from '@/components/admin/DeleteEventButton';

export const metadata = { title: 'Eventos · Admin Fugazzesions' };

export default async function AdminEventosPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: false });

  const today = new Date().toISOString().split('T')[0];
  const allEvents = events ?? [];
  const upcoming = allEvents.filter((e) => e.date >= today && e.published);
  const past = allEvents.filter((e) => e.date < today && e.published);

  return (
    <div className="p-5 sm:p-8pb-12">
      {/* Topbar */}
      <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-5xl leading-none mb-1">Eventos</h1>
          <p className="text-sm text-ink-muted">
            Gestioná todos los eventos: próximos, pasados y borradores
          </p>
        </div>
        <Link href="/admin/eventos/nuevo">
          <Button variant="primary">
            <Plus size={14} /> Nuevo evento
          </Button>
        </Link>
      </div>

      {/* Stats rápidas */}
      <div className="flex gap-2 mb-5">
        <FilterPill label="Todos" count={allEvents.length} />
        <FilterPill label="Próximos" count={upcoming.length} />
        <FilterPill label="Pasados" count={past.length} />
      </div>

      {/* Tabla */}
      <div className="fz-card overflow-hidden p-0">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-bold">
                Evento
              </th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-bold w-32">
                Fecha
              </th>
              <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-bold w-36">
                Estado
              </th>
              <th className="text-right px-4 py-3 text-[10px] uppercase tracking-[0.15em] font-bold w-36">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {allEvents.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-ink-muted">
                  <p className="font-display text-2xl">No hay eventos cargados</p>
                  <p className="text-xs mt-1">Creá el primero con el botón de arriba</p>
                </td>
              </tr>
            )}

            {allEvents.map((event) => {
              const isPast = event.date < today;
              const isDraft = !event.published;

              return (
                <tr
                  key={event.id}
                  className="border-t border-dashed border-ink/15 hover:bg-ink/2"
                >
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-bold uppercase tracking-wide">
                      {event.title}
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      {event.location_name ?? 'Sin ubicación'} ·{' '}
                      {formatEventTime(event.time)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-display text-lg leading-none">
                      {formatEventDate(event.date)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    {isDraft ? (
                      <Tag variant="gray">Borrador</Tag>
                    ) : isPast ? (
                      <Tag variant="gray">Finalizado</Tag>
                    ) : (
                      <Tag variant="red">Próximo</Tag>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5 justify-end">
                      <Link
                        href={`/eventos/${event.id}`}
                        target="_blank"
                        title="Ver en sitio público"
                        className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/admin/eventos/${event.id}`}
                        title="Editar"
                        className="w-8 h-8 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <DeleteEventButton id={event.id} title={event.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterPill({ label, count }: { label: string; count: number }) {
  return (
    <div className="px-3.5 py-1.5 border-2 border-ink rounded-full text-[11px] font-bold uppercase tracking-[0.12em] inline-flex items-center gap-2">
      <span>{label}</span>
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-ink/10">
        {count.toString().padStart(2, '0')}
      </span>
    </div>
  );
}