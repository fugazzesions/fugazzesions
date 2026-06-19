import Image from 'next/image';

interface HeroProps {
  imageSrc?: string;
}

export function Hero({ imageSrc }: HeroProps) {
  return (
    <section className="px-5 sm:px-8 pt-6 pb-4">
      <div className="relative w-full aspect-video bg-paper-soft fz-border rounded-md overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt="Fugazzesions"
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        ) : (
          <PlaceholderHero />
        )}
      </div>

      {/* Lema debajo del banner */}
      <div className="font-display text-2xl text-center mt-4">
        Pizza <span className="text-red mx-2">·</span>
        Patín <span className="text-green mx-2">·</span>
        Punto
      </div>
    </section>
  );
}

function PlaceholderHero() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-1.5 border-2 border-dashed border-ink/25 rounded" />
      <div className="text-center text-ink/45">
        <div className="font-display text-3xl mb-1">tu banner va acá</div>
        <div className="text-[11px] tracking-[0.15em] uppercase">16:9 · png/jpg</div>
      </div>
    </div>
  );
}