import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface EventListRowProps {
  id: string;
  title: string;
  day: string;       // "31 may"
  year: string;      // "2025"
  meta: string;      // "Centro Cultural Recoleta · 16:00 hs"
}

export function EventListRow({ id, title, day, year, meta }: EventListRowProps) {
  return (
    <Link
      href={`/eventos/${id}`}
      className="grid grid-cols-[80px_1fr_auto] items-center gap-5 p-4 bg-paper-soft border-2 border-ink rounded-md fz-stamp"
    >
      <div className="font-display text-2xl leading-none">
        {day}
        <span className="block text-[11px] text-ink-light font-sans tracking-wider mt-0.5">
          {year}
        </span>
      </div>
      <div>
        <div className="text-sm font-bold uppercase tracking-wider mb-0.5">
          {title}
        </div>
        <div className="text-xs text-ink-muted">{meta}</div>
      </div>
      <ArrowRight size={18} className="text-ink" />
    </Link>
  );
}