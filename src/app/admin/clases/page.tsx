import Link from 'next/link';
import {
  Plus,
  Pencil,
  ExternalLink,
  Calendar,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { ClassToggle } from '@/components/admin/ClassToggle';
import { DeleteClassButton } from '@/components/admin/DeleteClassButton';
import { getAllClasses } from '@/lib/queries/classes';
import { formatPrice } from '@/lib/utils/currency';

export const metadata = { title: 'Clases · Admin Fugazzesions' };

export default async function AdminClasesPage() {
  const allClasses = await getAllClasses();
  const quad = allClasses.filter((c) => c.discipline === 'quad');
  const inline = allClasses.filter((c) => c.discipline === 'inline');

  return (
    <div className="p-8 pb-12">
      {/* Topbar */}
      <div className="flex items-end justify-between mb-7 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-5xl leading-none mb-1">Clases</h1>
          <p className="text-sm text-ink-muted">
            Gestioná los niveles disponibles de Quad e Inline
          </p>
        </div>
        <Link href="/admin/clases/nuevo">
          <Button variant="primary">
            <Plus size={14} /> Nueva clase
          </Button>
        </Link>
      </div>

      {/* Sección Quad */}
      <DisciplineSection title="Quad" classes={quad} />

      {/* Sección Inline */}
      <DisciplineSection title="Inline" classes={inline} />

      {/* Estado vacío total */}
      {allClasses.length === 0 && (
        <div className="fz-card p-12 text-center text-ink-muted mt-6">
          <p className="font-display text-3xl">Sin clases cargadas</p>
          <p className="text-sm mt-2 mb-5">
            Creá la primera clase con el botón de arriba.
          </p>
        </div>
      )}
    </div>
  );
}

function DisciplineSection({
  title,
  classes,
}: {
  title: string;
  classes: Awaited<ReturnType<typeof getAllClasses>>;
}) {
  if (classes.length === 0) return null;

  return (
    <div className="mb-9">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display text-3xl m-0">{title}</h2>
        <div className="flex-1 fz-divider" />
        <span className="text-[11px] tracking-[0.15em] uppercase text-ink-muted">
          {classes.length.toString().padStart(2, '0')} niveles
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {classes.map((c) => (
          <ClassAdminCard key={c.id} classData={c} />
        ))}
      </div>
    </div>
  );
}

function ClassAdminCard({
  classData: c,
}: {
  classData: Awaited<ReturnType<typeof getAllClasses>>[number];
}) {
  return (
    <article className={`fz-card p-5 relative ${!c.active ? 'opacity-65' : ''}`}>
      {/* Estado tag */}
      <div className="absolute top-3.5 right-3.5">
        <Tag variant={c.active ? 'green' : 'gray'}>
          {c.active ? 'Activa' : 'Pausada'}
        </Tag>
      </div>

      {/* Header */}
      <div className="pb-3 mb-3.5 border-b border-dashed border-ink/20 flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-ink-light mb-1">
            Nivel {c.level.toString().padStart(2, '0')}
          </div>
          <div className="text-lg font-bold uppercase tracking-wide leading-tight">
            {c.level_name}
          </div>
        </div>
        <ClassToggle id={c.id} initialActive={c.active} />
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 mb-4">
        {c.schedule_days && (
          <MetaRow icon={<Calendar size={13} />} text={c.schedule_days} />
        )}
        {c.schedule_time && (
          <MetaRow icon={<Clock size={13} />} text={c.schedule_time} />
        )}
        {c.location && (
          <MetaRow icon={<MapPin size={13} />} text={c.location} />
        )}
        {c.capacity && (
          <MetaRow icon={<Users size={13} />} text={`Cupo ${c.capacity}`} />
        )}
      </div>

      {/* Precio */}
      {c.price && (
        <div className="flex items-baseline justify-between pt-3 mb-3 border-t-[1.5px] border-ink">
          <span className="text-[10px] uppercase tracking-[0.15em] text-ink-light">
            Mensual
          </span>
          <span className="font-display text-xl font-bold text-red">
            {formatPrice(c.price)}
          </span>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-1.5">
        <Link
          href={`/admin/clases/${c.id}`}
          className="flex-1 px-3 py-2 border-[1.5px] border-ink rounded-md text-[10px] font-bold uppercase tracking-[0.12em] flex items-center justify-center gap-1.5 hover:bg-ink hover:text-paper transition-colors"
        >
          <Pencil size={13} /> Editar
        </Link>
        {c.form_url && (
          
            <a href={c.form_url}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir formulario"
            className="w-9 h-9 border-[1.5px] border-ink rounded-md flex items-center justify-center hover:bg-ink hover:text-paper transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        )}
        <DeleteClassButton id={c.id} name={`${c.discipline} · ${c.level_name}`} />
      </div>
    </article>
  );
}

function MetaRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-soft">
      <span className="text-ink">{icon}</span> {text}
    </div>
  );
}