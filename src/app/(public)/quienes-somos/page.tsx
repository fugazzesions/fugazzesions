import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Polaroid } from '@/components/ui/Polaroid';
import { AboutCarousel } from '@/components/about/AboutCarousel';
import { getAboutPhotos } from '@/lib/queries/aboutPhotos';
import {
  foundersContent,
  collaboratorsContent,
} from '@/content/quienes-somos';

export const metadata = {
  title: 'Quiénes somos · Fugazzesions',
  description: 'La comunidad, los fundadores y los valores de Fugazzesions.',
};

const polaroidRotations = ['left', 'right', 'slight-left'] as const;

export default async function QuienesSomosPage() {
  const aboutPhotos = await getAboutPhotos();

  return (
    <>
      <PageHeader
        title="Quiénes somos"
        subtitle="Detrás del proyecto"
      />

      {/* SOBRE EL PROYECTO + CARRUSEL */}
      <div className="px-5 sm:px-8 pt-9 pb-3.5 flex items-center gap-3">
        <h2 className="font-display text-3xl">Sobre el proyecto</h2>
        <div className="flex-1 fz-divider" />
      </div>

      <div className="px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-4 text-base leading-relaxed text-ink-soft">
          <p>
            Fugazzesions es un proyecto autogestivo organizado por patinadores para patinadores.
          </p>
          <p>
            Nuestra idea es simple: aportar a la escena del patín con eventos y clases para todos los niveles, con el fin de dar nuestro granito de arena para el progreso del deporte.
          </p>
        </div>

        <div className="max-w-md mx-auto w-full lg:mx-0">
          <AboutCarousel photos={aboutPhotos} />
        </div>
      </div>

      {/* EQUIPO */}
      <div className="px-5 sm:px-8 pt-9 pb-3.5 flex items-center gap-3">
        <h2 className="font-display text-3xl">Los que sostienen el proyecto</h2>
        <div className="flex-1 fz-divider" />
      </div>

      <div className="px-5 sm:px-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-3.5 items-stretch">
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
          className="bg-ink text-paper border border-ink rounded-sm p-4 relative flex flex-col justify-center transition-transform duration-150 hover:rotate-0 hover:-translate-y-1 hover:z-10 rotate-1"
        >
          <div
            className="absolute -top-2.5 left-1/2 w-12 h-4 border border-black/20"
            style={{
              background: 'rgba(184, 30, 42, 0.6)',
              transform: 'translateX(-50%) rotate(4deg)',
            }}
          />
          <div className="font-display text-2xl leading-tight mb-2.5">
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
      <div className="mx-5 sm:mx-8 mt-9 mb-7 bg-ink text-paper p-7 rounded-md flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-3xl leading-none mb-1">
            ¿Querés <span className="text-red">patinar con nosotros</span>?
          </h3>
          <p className="m-0 text-xs tracking-wide text-paper/65">
            Sumate a una clase, a un evento, o simplemente vení a patinar!
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/clases">
            <button className="px-4 py-3 bg-red border-2 border-red text-paper text-[11px] font-bold uppercase tracking-[0.15em] rounded-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-paper)] transition-all">
              Ver clases
            </button>
          </Link>
          <Link href="/eventos">
            <button className="px-4 py-3 bg-transparent border-2 border-paper text-paper text-[11px] font-bold uppercase tracking-[0.15em] rounded-md hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-paper)] transition-all">
              Próximos eventos
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}