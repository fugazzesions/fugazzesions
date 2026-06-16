interface PdfIconProps {
  variant?: 'default' | 'red' | 'green';
  size?: 'sm' | 'lg';
}

const variantClasses = {
  default: 'text-ink border-ink',
  red: 'text-red border-red',
  green: 'text-green border-green',
};

const sizeClasses = {
  sm: 'w-9 h-10 text-[9px]',
  lg: 'w-12 h-14 text-[11px]',
};

export function PdfIcon({ variant = 'default', size = 'lg' }: PdfIconProps) {
  return (
    <div
      className={`
        relative bg-paper-soft border-2 rounded-sm
        flex items-center justify-center
        font-bold tracking-wider
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      PDF
      {/* Esquina doblada */}
      <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-paper border-b-2 border-l-2 border-current" />
    </div>
  );
}