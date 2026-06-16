import Link from 'next/link';

interface QuickSection {
  num: string;
  title: string;
  sub: string;
  href: string;
  variant?: 'default' | 'red' | 'green';
}

const sections: QuickSection[] = [
  {
    num: '01',
    title: 'Eventos',
    sub: 'Próximos, en curso y pasados',
    href: '/eventos',
    variant: 'red',
  },
  {
    num: '02',
    title: 'Clases',
    sub: 'Quad & Inline',
    href: '/clases',
  },
  {
    num: '03',
    title: 'Recursos',
    sub: 'Guías y descargas',
    href: '/recursos',
    variant: 'green',
  },
];

const variantBg = {
  default: 'bg-paper-soft',
  red: 'bg-red-soft',
  green: 'bg-green-soft',
};

const variantArrow = {
  default: 'text-ink',
  red: 'text-red',
  green: 'text-green',
};

export function QuickSections() {
  return (
    <section className="px-8 py-2 grid grid-cols-3 gap-3.5 mb-9">
      {sections.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className={`
            relative fz-card fz-stamp p-5
            ${variantBg[s.variant ?? 'default']}
          `}
        >
          <span
            className={`absolute top-3.5 right-3.5 text-lg ${variantArrow[s.variant ?? 'default']}`}
            aria-hidden
          >
            ↗
          </span>
          <div className="font-display text-lg text-ink/40 mb-1.5">{s.num}</div>
          <div className="text-sm font-bold uppercase tracking-[0.08em] mb-1">
            {s.title}
          </div>
          <div className="text-xs text-ink-muted">{s.sub}</div>
        </Link>
      ))}
    </section>
  );
}