'use client';

import { useState, useRef, useTransition } from 'react';
import Image from 'next/image';
import { CloudUpload, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { addAboutPhoto, deleteAboutPhoto } from '@/lib/mutations/aboutPhotos';
import type { DbAboutPhoto } from '@/lib/queries/aboutPhotos';

interface AboutPhotosManagerProps {
  photos: DbAboutPhoto[];
}

export function AboutPhotosManager({ photos }: AboutPhotosManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      if (file.size > 2 * 1024 * 1024) {
        setError(`"${file.name}" pesa más de 2 MB, no se subió.`);
        continue;
      }

      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('about-photos')
        .upload(fileName, file);

      if (uploadError) {
        setError(`Error al subir "${file.name}": ${uploadError.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('about-photos')
        .getPublicUrl(fileName);

      const result = await addAboutPhoto(publicUrl);
      if (!result.success) {
        setError(`Error guardando "${file.name}": ${result.error}`);
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleDelete(photoId: string) {
    if (!confirm('¿Eliminar esta foto?')) return;

    startTransition(async () => {
      await deleteAboutPhoto(photoId);
    });
  }

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-video bg-paper-warm border-2 border-dashed border-ink rounded-md cursor-pointer hover:bg-paper-warm/70 transition-colors"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-muted">
            <Loader2 size={32} className="animate-spin mb-2" />
            <span className="text-sm">Subiendo fotos...</span>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink/45">
            <CloudUpload size={40} className="mb-2" />
            <span className="font-display text-xl">Click para subir fotos</span>
            <span className="text-[10px] tracking-[0.15em] uppercase mt-1">
              JPG / PNG · máx 2 MB cada una · Múltiples a la vez
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
            }
          }}
        />
      </div>

      {error && <p className="text-xs text-red">{error}</p>}

      {photos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-display text-xl m-0">Fotos cargadas</h4>
            <span className="text-[11px] text-ink-muted tracking-wide">
              {photos.length.toString().padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square bg-paper-warm border-2 border-ink rounded-md overflow-hidden group"
              >
                <Image
                  src={photo.image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="200px"
                />
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  disabled={isPending}
                  className="absolute top-1.5 right-1.5 w-7 h-7 bg-ink/90 text-paper rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red transition-all"
                  title="Eliminar foto"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length === 0 && !uploading && (
        <p className="text-xs text-ink-muted text-center py-2">
          Sin fotos cargadas. Subí las primeras para que aparezcan en el carrusel.
        </p>
      )}
    </div>
  );
}