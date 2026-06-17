import { PageHeader } from '@/components/layout/PageHeader';
import { DisciplineTabs } from '@/components/classes/DisciplineTabs';
import { getActiveClasses } from '@/lib/queries/classes';

export const metadata = {
  title: 'Clases · Fugazzesions',
  description: 'Clases de patín quad e inline para todos los niveles.',
};

export default async function ClasesPage() {
  const classes = await getActiveClasses();

  const quadClasses = classes.filter((c) => c.discipline === 'quad');
  const inlineClasses = classes.filter((c) => c.discipline === 'inline');

  return (
    <>
      <PageHeader
        title="Clases"
        subtitle="Aprendé a patinar con nosotros"
      />

      <p className="px-5 sm:px-8 py-3.5 pb-7 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Enseñamos quad e inline a todos los niveles. Si nunca te subiste a unos patines
        o si querés pulir tus trucos en park, hay una clase para vos. Las clases son
        grupales, con cupos limitados, y se cierran con pizza siempre que se pueda.
      </p>

      <DisciplineTabs quadClasses={quadClasses} inlineClasses={inlineClasses} />

      <div className="pb-9"></div>
    </>
  );
}