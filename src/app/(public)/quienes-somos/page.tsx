import Link from 'next/link';
import { Flame, Pizza, Asterisk, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Polaroid } from '@/components/ui/Polaroid';
import { Button } from '@/components/ui/Button';
import {
  manifestoContent,
  valuesContent,
  foundersContent,
  collaboratorsContent,
} from '@/content/quienes-somos';

export const metadata = {
  title: 'Quiénes somos · Fugazzesions',
  description: 'La comunidad, los fundadores y los valores de Fugazzesions.',
};

const iconMap: Record<string, LucideIcon> = {
  Flame,
  Pizza,
  Asterisk,
};

const valueVariantStyles = {
  default: { iconClass: 'text-ink' },
  red: { iconClass: 'text-red' },
  green: { iconClass: 'text-green' },
};

const polaroidRotations = ['left', 'right', 'slight-left'] as const;

export default function QuienesSomosPage() {
  return (
    <>
      <PageHeader
        title="Quiénes somos"
        subtitle="La gente, la idea y la pizza"
      />

      {/* MANIFIESTO */}
      <div className="px-8 pt-7 grid grid-cols-2 gap-8">
        <div>
          <h2 className="font-display text-4xl leading-none mb-3.5">
            {manifestoContent.headline.main}{' '}
            <span className="text-red">{manifestoContent.headline.accent}</span>
          </h2>
          {manifestoContent.paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-ink-soft mb-3.5 [&_strong]:bg-ink [&_strong]:text-paper [&_strong]:px-1.5 [&_strong]:font-medium"
              dangerouslySetInnerHTML={{ __html: para }}
            />
          ))}
        </div>

        {/* Quote box */}
        <div className="relative bg-ink text-paper p-7 rounded-md flex flex-col justify-center">
          <span
            className="absolute -top-2.5 left-5 font-display text-[100px] leading-none text-red"
            aria-hidden
          >
            &ldquo;
          </span>
          <div className="font-display text-3xl leading-tight mb-4 relative z-10">
            {manifestoContent.quote.text}
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-paper/50">
            — {manifestoContent.quote.sig}
          </div>
        </div>
      </div>

      {/* VALORES */}
      <div className="px-8 pt-9 pb-3.5 flex items-center gap-3">
        <h2 className="font-display text-3xl">Lo que nos mueve</h2>
        <div className="flex-1 fz-divider" />
      </div>

      <div className="px-8 grid grid-cols-3 gap-4">
        {valuesContent.map((v) => {
          const Icon = iconMap[v.icon];
          const styles = valueVariantStyles[v.variant];
          return (
            <div key={v.num} className="fz-card p-5">
              <div className="font-display text-base text-ink/40 mb-1.5">{v.num}</div>
              {Icon && (
                <Icon size={30} className={`mb-3 ${styles.iconClass}`} />
              )}
              <div className="text-base font-bold uppercase tracking-wider mb-2">
                {v.title}
              </div>
              <p className="text-[13px] leading-relaxed text-ink-soft">{v.text}</p>
            </div>
          );
        })}
      </div>

      {/* EQUIPO */}
      <div className="px-8 pt-9 pb-3.5 flex items-center gap-3">
        <h2 className="font-display text-3xl">Los que sostienen el proyecto</h2>
        <div className="flex-1 fz-divider" />
      </div>

      <div className="px-8 grid grid-cols-4 gap-6 mt-3.5 items-stretch">
        {foundersContent.map((founder, i) => (
          <Polaroid
            key={i}
            name={founder.name}
            role={founder.role}
            rotation={polaroidRotations[i % polaroidRotations.length]}
          />
        ))}

        {/* Bloque colaboradores */}
        <div
          className="bg-ink text-paper border border-ink rounded-sm p-4 relative flex flex-col justify-center transition-transform duration-150 hover:rotate-0 hover:-translate-y-1 hover:z-10 rotate-[1.2deg]"
        >
          <div
            className="absolute -top-2.5 left-1/2 w-12 h-4 border border-black/20"
            style={{
              background: 'rgba(184, 30, 42, 0.6)',
              transform: 'translateX(-50%) rotate(4deg)',
            }}
          />
          <div className="font-display text-[26px] leading-tight mb-2.5">
            + {collaboratorsContent.title.replace(collaboratorsContent.accent, '')}
            <span className="text-red">{collaboratorsContent.accent}</span>
          </div>
          <p className="text-xs leading-relaxed text-paper/80 m-0">
            {collaboratorsContent.text}
          </p>
          <em className="block text-paper/50 text-[10px] not-italic mt-2 tracking-wide">
            {collaboratorsContent.footnote}
          </em>
        </div>
      </div>

      {/* CTA STRIP */}
      <div className="mx-8 mt-9 mb-7 bg-ink text-paper p-7 rounded-md flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-3xl leading-none mb-1">
            ¿Querés <span className="text-red">patinar con nosotros</span>?
          </h3>
          <p className="m-0 text-xs tracking-wide text-paper/65">
            Sumate a una clase, a un evento, o simplemente vení a rodar
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/clases">
            <button className="px-4 py-3 bg-red border-2 border-red text-paper text-[11px] font-bold uppercase tracking-[0.15em] rounded-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-paper)] transition-all">
              Ver clases
            </button>
          </Link>
          <Link href="/eventos">
            <button className="px-4 py-3 bg-transparent border-2 border-paper text-paper text-[11px] font-bold uppercase tracking-[0.15em] rounded-md hover:-translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-paper)] transition-all">
              Próximos eventos
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}