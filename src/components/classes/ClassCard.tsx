import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils/currency';
import type { DbClass } from '@/lib/queries/classes';

interface ClassCardProps {
  classData: DbClass;
}

export function ClassCard({ classData: c }: ClassCardProps) {
  const accentColor =
    c.level === 1 ? '' : c.level === 2 ? 'text-red/20' : 'text-green/20';

  return (
    <article className="relative fz-card p-5 fz-stamp">
      {/* Número grande de fondo */}
      <div className={`absolute top-3 right-4 font-display text-5xl leading-none text-ink/15 ${accentColor}`}>
        {c.level.toString().padStart(2, '0')}
      </div>

      <div className="text-[11px] uppercase tracking-[0.2em] text-ink-light mb-1">
        Nivel
      </div>
      <div className="text-xl font-bold uppercase tracking-wide mb-3.5">
        {c.level_name}
      </div>

      {c.description && (
        <p className="text-[13px] leading-relaxed text-ink-soft mb-4">
          {c.description}
        </p>
      )}

      {/* Meta info */}
      <div className="flex flex-col gap-1.5 pt-3.5 border-t border-dashed border-ink/25">
        {c.schedule_days && (
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Calendar size={14} className="text-ink" /> {c.schedule_days}
          </div>
        )}
        {c.schedule_time && (
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Clock size={14} className="text-ink" /> {c.schedule_time}
          </div>
        )}
        {c.location && (
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <MapPin size={14} className="text-ink" /> {c.location}
          </div>
        )}
        {c.capacity && (
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <Users size={14} className="text-ink" /> Cupo: {c.capacity} personas
          </div>
        )}
      </div>

      {/* Precio */}
      {c.price && (
        <div className="flex items-baseline justify-between pt-3 mt-3.5 border-t-[1.5px] border-ink">
          <span className="text-[10px] uppercase tracking-[0.15em] text-ink-light">
            Mensual
          </span>
          <span className="font-display text-2xl font-bold text-red">
            {formatPrice(c.price)}
          </span>
        </div>
      )}

      {/* CTA */}
      {c.form_url && (
        
          <a href={c.form_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-3.5"
        >
          <Button variant="primary" className="w-full">
            Inscribirme <ExternalLink size={13} />
          </Button>
        </a>
      )}
    </article>
  );
}