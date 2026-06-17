'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { CloudUpload, X, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ImageUploaderProps {
  bucket: 'event-images' | 'event-photos';
  currentUrl?: string | null;
  onChange: (url: string | null) => void;
  aspectClass?: string;
}

export function ImageUploader({
  bucket,
  currentUrl,
  onChange,
  aspectClass = 'aspect-video',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  async function handleFileSelect(file: File) {
    setError(null);
    setUploading(true);

    try {
      // Validar tamaño (2 MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('La imagen no puede pesar más de 2 MB.');
        setUploading(false);
        return;
      }

      const supabase = createClient();
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) {
        setError(`Error al subir: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      setPreview(publicUrl);
      onChange(publicUrl);
    } catch (err) {
      console.error(err);
      setError('Algo salió mal. Intentá de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <div
        className={`
          relative ${aspectClass} bg-paper-warm border-[2.5px] border-dashed border-ink
          rounded-md overflow-hidden
          ${preview ? '' : 'cursor-pointer hover:bg-paper-warm/70'}
          transition-colors
        `}
        onClick={() => !preview && !uploading && inputRef.current?.click()}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-ink text-paper rounded-full flex items-center justify-center hover:bg-red transition-colors"
              title="Eliminar imagen"
            >
              <X size={16} />
            </button>
          </>
        ) : uploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-muted">
            <Loader2 size={32} className="animate-spin mb-2" />
            <span className="text-sm">Subiendo...</span>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink/45">
            <CloudUpload size={40} className="mb-2" />
            <span className="font-display text-xl">Click para subir</span>
            <span className="text-[10px] tracking-[0.15em] uppercase mt-1">
              JPG / PNG · máx 2 MB
            </span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red mt-2">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
      />
    </div>
  );
}