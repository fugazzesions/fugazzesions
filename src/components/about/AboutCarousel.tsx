'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DbAboutPhoto } from '@/lib/queries/aboutPhotos';

interface AboutCarouselProps {
  photos: DbAboutPhoto[];
}

export function AboutCarousel({ photos }: AboutCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (photos.length === 0) return null;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative">
      {/* Imagen actual */}
      <div className="relative aspect-4/5 bg-paper-warm fz-border rounded-md overflow-hidden">
        <Image
          key={photos[currentIndex].id}
          src={photos[currentIndex].image_url}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 1000px"
          priority
        />

        {/* Flechas */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-ink/90 text-paper rounded-full flex items-center justify-center hover:bg-red transition-colors"
              aria-label="Foto anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-ink/90 text-paper rounded-full flex items-center justify-center hover:bg-red transition-colors"
              aria-label="Foto siguiente"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Contador */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-ink/90 text-paper text-xs px-3 py-1.5 rounded-full font-semibold tracking-wide">
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Dots */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {photos.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={`
                w-2 h-2 rounded-full transition-all
                ${i === currentIndex ? 'bg-ink w-6' : 'bg-ink/30 hover:bg-ink/50'}
              `}
              aria-label={`Ir a foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}