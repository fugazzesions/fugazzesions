import { User } from 'lucide-react';
import Image from 'next/image';

interface PolaroidProps {
  name: string;
  role?: string;
  imageUrl?: string;
  rotation?: 'left' | 'right' | 'slight-left';
}

const rotationClass = {
  left: '-rotate-[1.5deg]',
  right: 'rotate-[1deg]',
  'slight-left': '-rotate-[0.8deg]',
};

export function Polaroid({ name, role, imageUrl, rotation = 'left' }: PolaroidProps) {
  return (
    <div
      className={`
        relative bg-paper-soft border border-ink rounded-sm
        p-2.5 pb-4
        cursor-pointer transition-transform duration-150
        hover:rotate-0 hover:-translate-y-1 hover:z-10
        flex flex-col
        ${rotationClass[rotation]}
      `}
    >
      {/* Cinta */}
      <div
        className="absolute -top-2.5 left-1/2 w-12 h-4 border border-black/10"
        style={{
          background: 'rgba(212, 200, 170, 0.7)',
          transform: 'translateX(-50%) rotate(-3deg)',
        }}
      />

      {/* Foto */}
      <div className="aspect-square bg-paper-warm flex items-center justify-center text-ink/30 mb-2.5 relative overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="300px" />
        ) : (
          <User size={40} />
        )}
      </div>

      <div className="text-center">
        <div className="font-display text-xl leading-none mb-0.5">{name}</div>
        {role && (
          <div className="text-[10px] uppercase tracking-[0.15em] text-ink-light">
            {role}
          </div>
        )}
      </div>
    </div>
  );
}