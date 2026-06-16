interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-8 pt-9 pb-2 flex items-end gap-3.5 flex-wrap">
      <h1 className="font-display text-6xl font-bold leading-none m-0">
        {title}
      </h1>
      {subtitle && (
        <span className="text-[13px] text-ink-muted pb-2">{subtitle}</span>
      )}
    </div>
  );
}