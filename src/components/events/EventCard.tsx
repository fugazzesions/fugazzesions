import Link from 'next/link';
import Image from 'next/image';
import { Clock, MapPin, ImageIcon } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string | null;
  status: {
    label: string;
    variant: 'red' | 'green' | 'gray';
  };
}

export function EventCard({
  id,
  title,
  date,
  time,
  location,
  imageUrl,
  status,
}: EventCardProps) {
  return (
    <Link
      href={`/eventos/${id}`}
      className="block fz-card fz-stamp overflow-hidden"
    >
      {/* Imagen */}
      <div className="relative aspect-4/3 bg-paper-warm border-b-[2.5px] border-ink">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink/25">
            <ImageIcon size={32} />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <Tag variant={status.variant}>{status.label}</Tag>
        </div>
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="font-display text-lg leading-none mb-1.5">{date}</div>
        <div className="text-sm font-bold uppercase tracking-wider mb-1.5">
          {title}
        </div>
        <div className="text-xs text-ink-muted flex items-center gap-1.5">
          <Clock size={12} /> {time}
        </div>
        <div className="text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
          <MapPin size={12} /> {location}
        </div>
      </div>
    </Link>
  );
}