import { Download, FileText, Weight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { PdfIcon } from './PdfIcon';
import type { DbResource } from '@/lib/queries/resources';

interface ResourceCardProps {
  resource: DbResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const pdfVariant =
    resource.tag === 'recommended' ? 'green' :
    resource.tag === 'new' ? 'red' :
    'default';

  return (
    <article className="relative fz-card p-5 fz-stamp flex flex-col">
      {resource.tag && (
        <div className="absolute top-4 right-4">
          <Tag variant={resource.tag === 'new' ? 'red' : 'green'}>
            {resource.tag === 'new' ? 'Nuevo' : 'Recomendado'}
          </Tag>
        </div>
      )}

      <PdfIcon variant={pdfVariant} />

      <h3 className="text-[15px] font-bold uppercase tracking-wide leading-tight mt-3.5 mb-2">
        {resource.title}
      </h3>

      {resource.description && (
        <p className="text-xs leading-relaxed text-ink-soft mb-4 grow">
          {resource.description}
        </p>
      )}

      {(resource.page_count || resource.file_size_mb) && (
        <div className="flex gap-3 text-[10px] text-ink-light tracking-wide pt-3 border-t border-dashed border-ink/20 mb-3">
          {resource.page_count && (
            <span className="flex items-center gap-1">
              <FileText size={12} /> {resource.page_count} págs
            </span>
          )}
          {resource.file_size_mb && (
            <span className="flex items-center gap-1">
              <Weight size={12} /> {resource.file_size_mb} MB
            </span>
          )}
        </div>
      )}

      
        <a href={resource.file_url}
        download
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="primary" className="w-full">
          <Download size={14} /> Descargar
        </Button>
      </a>
    </article>
  );
}