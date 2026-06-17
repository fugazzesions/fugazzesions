import { ResourceForm } from '@/components/admin/ResourceForm';
import { getResourceCategories } from '@/lib/queries/resources';

export const metadata = { title: 'Nuevo recurso · Admin Fugazzesions' };

export default async function NuevoRecursoPage() {
  const categories = await getResourceCategories();
  return <ResourceForm categories={categories} />;
}