import { AboutPhotosManager } from '@/components/admin/AboutPhotosManager';
import { getAboutPhotos } from '@/lib/queries/aboutPhotos';

export const metadata = { title: 'Quiénes somos · Admin Fugazzesions' };

export default async function AdminQuienesSomosPage() {
  const photos = await getAboutPhotos();

  return (
    <div className="p-8 pb-12">
      <div className="mb-7">
        <h1 className="font-display text-5xl leading-none mb-1">Quiénes somos</h1>
        <p className="text-sm text-ink-muted">
          Gestioná las fotos del carrusel que aparece en la página /quienes-somos
        </p>
      </div>

      <div className="fz-card p-5">
        <div className="mb-4 pb-3 border-b border-dashed border-ink/20">
          <h3 className="font-display text-2xl m-0 leading-none">
            Carrusel de fotos
          </h3>
          <p className="text-xs text-ink-muted mt-1">
            Estas fotos rotan en la sección de quiénes somos. Podés subir todas las que quieras.
          </p>
        </div>
        <AboutPhotosManager photos={photos} />
      </div>
    </div>
  );
}