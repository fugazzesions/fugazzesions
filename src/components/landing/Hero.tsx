import Image from 'next/image';

interface HeroProps {
  imageSrc?: string;
}

export function Hero({ imageSrc }: HeroProps) {
  return (
    <section className="relative w-full aspect-video bg-paper-soft overflow-hidden">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt="Fugazzesions"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <PlaceholderHero />
      )}
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