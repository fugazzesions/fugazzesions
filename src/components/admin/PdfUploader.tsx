'use client';

import { useState, useRef } from 'react';
import { CloudUpload, X, Loader2, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface PdfUploaderProps {
  currentUrl?: string | null;
  onChange: (data: { url: string; sizeMb: number } | null) => void;
}

export function PdfUploader({ currentUrl, onChange }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(
    currentUrl ? currentUrl.split('/').pop() ?? null : null
  );

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    try {
      // Validar tamaño (10 MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('El PDF no puede pesar más de 10 MB.');
        setUploading(false);
        return;
      }

      // Validar tipo
      if (file.type !== 'application/pdf') {
        setError('Solo se aceptan archivos PDF.');
        setUploading(false);
        return;
      }

      const supabase = createClient();
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, file);

      if (uploadError) {
        setError(`Error al subir: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      const sizeMb = Math.round((file.size / (1024 * 1024)) * 100) / 100;

      setFilename(fileName);
      onChange({ url: publicUrl, sizeMb });
    } catch (err) {
      console.error(err);
      setError('Algo salió mal. Intentá de nuevo.');
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setFilename(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div>
      <div
        className={`
          relative border-[2.5px] border-dashed border-ink rounded-md
          ${filename ? 'bg-paper-soft p-4' : 'bg-paper-warm p-5 sm:p-8cursor-pointer hover:bg-paper-warm/70'}
          transition-colors
        `}
        onClick={() => !filename && !uploading && inputRef.current?.click()}
      >
        {filename ? (
          <div className="flex items-center gap-3">
            <FileText size={28} className="text-red shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{filename}</div>
              <div className="text-xs text-ink-muted mt-0.5">PDF cargado</div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="w-8 h-8 bg-ink text-paper rounded-full flex items-center justify-center hover:bg-red transition-colors shrink-0"
              title="Eliminar"
            >
              <X size={16} />
            </button>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center text-ink-muted">
            <Loader2 size={32} className="animate-spin mb-2" />
            <span className="text-sm">Subiendo PDF...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-ink/45">
            <CloudUpload size={40} className="mb-2" />
            <span className="font-display text-xl">Click para subir un PDF</span>
            <span className="text-[10px] tracking-[0.15em] uppercase mt-1">
              Máx 10 MB
            </span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red mt-2">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}