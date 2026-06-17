import { notFound } from 'next/navigation';
import { ResourceForm } from '@/components/admin/ResourceForm';
import { getResourceById, getResourceCategories } from '@/lib/queries/resources';

export const metadata = { title: 'Editar recurso · Admin Fugazzesions' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarRecursoPage({ params }: PageProps) {
  const { id } = await params;
  const [resource, categories] = await Promise.all([
    getResourceById(id),
    getResourceCategories(),
  ]);

  if (!resource) {
    notFound();
  }

  return <ResourceForm resource={resource} categories={categories} />;
}