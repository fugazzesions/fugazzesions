import { notFound } from 'next/navigation';
import { ClassForm } from '@/components/admin/ClassForm';
import { getClassById } from '@/lib/queries/classes';

export const metadata = { title: 'Editar clase · Admin Fugazzesions' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClasePage({ params }: PageProps) {
  const { id } = await params;
  const classData = await getClassById(id);

  if (!classData) {
    notFound();
  }

  return <ClassForm classData={classData} />;
}