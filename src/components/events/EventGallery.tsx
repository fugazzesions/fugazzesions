import Image from 'next/image';
import { CameraOff } from 'lucide-react';
import type { DbEventPhoto } from '@/lib/queries/events';

interface EventGalleryProps {
  photos: DbEventPhoto[];
}

export function EventGallery({ photos }: EventGalleryProps) {
  if (photos.length === 0) {
    return <EmptyGallery />;
  }

  return (
    <section className="px-5 sm:px-8 pt-7 pb-9">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-3xl">Galería</h2>
        <div className="flex-1 fz-divider" />
        <span className="text-[11px] tracking-[0.15em] uppercase text-ink-muted">
          {photos.length.toString().padStart(2, '0')} fotos
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-2">
        {photos.map((photo, i) => (
          <Polaroid key={photo.id} src={photo.image_url} index={i} />
        ))}
      </div>
    </section>
  );
}

function Polaroid({ src, index }: { src: string; index: number }) {
  // Rotaciones sutiles alternadas
  const rotations = ['-rotate-[1.5deg]', 'rotate-[1deg]', '-rotate-[0.5deg]'];
  const rotation = rotations[index % rotations.length];

  return (
    <div
      className={`
        relative bg-paper-soft border border-ink rounded-sm
        p-2.5 pb-7
        cursor-pointer transition-transform duration-150
        hover:rotate-0 hover:-translate-y-1 hover:z-10
        ${rotation}
      `}
    >
      {/* Cinta adhesiva */}
      <div
        className="absolute -top-2.5 left-1/2 w-12 h-4 border border-black/10"
        style={{
          background: 'rgba(212, 200, 170, 0.7)',
          transform: 'translateX(-50%) rotate(-3deg)',
        }}
      />
      <div className="relative aspect-square bg-paper-warm">
        <Image src={src} alt="" fill className="object-cover" sizes="300px" />
      </div>
    </div>
  );
}

function EmptyGallery() {
  return (
    <section className="px-5 sm:px-8 pt-7 pb-9">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-display text-3xl">Galería</h2>
        <div className="flex-1 fz-divider" />
      </div>

      <div className="bg-paper-soft border-[2.5px] border-dashed border-ink rounded-md py-12 px-5 sm:px-8 text-center">
        <CameraOff size={44} className="inline-block text-ink/35 mb-3" />
        <p className="font-display text-2xl text-ink">
          Próximamente publicaremos fotos de este evento
        </p>
        <p className="text-xs text-ink-light tracking-wide mt-1">
          Volvé a visitar esta página en los próximos días
        </p>
      </div>
    </section>
  );
}