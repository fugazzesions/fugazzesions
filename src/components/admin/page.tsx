import { Calendar, History, School, FileText } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getAllUpcomingEvents, getPastEvents } from '@/lib/queries/events';
import { getActiveClasses } from '@/lib/queries/classes';
import { getResources } from '@/lib/queries/resources';

export const metadata = { title: 'Dashboard · Admin Fugazzesions' };

export default async function AdminDashboard() {
  const [user, upcoming, past, classes, resources] = await Promise.all([
    getCurrentUser(),
    getAllUpcomingEvents(),
    getPastEvents(),
    getActiveClasses(),
    getResources(),
  ]);

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const firstName = user?.email?.split('@')[0] ?? 'amigo';

  return (
    <div className="p-8 pb-12">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-5xl leading-none m-0 capitalize">
          Buenas, {firstName}
        </h1>
        <span className="text-xs text-ink-muted tracking-wide capitalize">
          {dateStr}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-8">
        <StatCard
          icon={<Calendar size={22} />}
          number={upcoming.length}
          label="Próximos eventos"
          variant="red"
        />
        <StatCard
          icon={<History size={22} />}
          number={past.length}
          label="Eventos pasados"
        />
        <StatCard
          icon={<School size={22} />}
          number={classes.length}
          label="Clases activas"
          variant="green"
        />
        <StatCard
          icon={<FileText size={22} />}
          number={resources.length}
          label="Recursos publicados"
        />
      </div>

      {/* Placeholder — acá va a ir el resto */}
      <div className="fz-card p-6 text-center text-ink-muted">
        <p className="font-display text-2xl">Dashboard en construcción</p>
        <p className="text-sm mt-1">
          Próximamente: gestión de eventos, clases y recursos.
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  number: number;
  label: string;
  variant?: 'default' | 'red' | 'green';
}

function StatCard({ icon, number, label, variant = 'default' }: StatCardProps) {
  const iconColor = {
    default: 'text-ink',
    red: 'text-red',
    green: 'text-green',
  }[variant];

  return (
    <div className="fz-card p-4">
      <div className={`mb-2.5 ${iconColor}`}>{icon}</div>
      <div className="font-display text-4xl leading-none mb-1">{number}</div>
      <div className="text-[10px] uppercase tracking-[0.15em] text-ink-muted">
        {label}
      </div>
    </div>
  );
}