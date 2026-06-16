import { ReactNode } from 'react';

type TagVariant = 'default' | 'red' | 'green' | 'gray' | 'outline';

interface TagProps {
  children: ReactNode;
  variant?: TagVariant;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  default: 'bg-ink text-paper',
  red: 'bg-red text-paper',
  green: 'bg-green text-paper',
  gray: 'bg-ink-muted text-paper',
  outline: 'bg-transparent text-red border border-red',
};

export function Tag({ children, variant = 'default', className = '' }: TagProps) {
  return (
    <span
      className={`
        inline-block
        text-[9px] uppercase tracking-[0.15em] font-bold
        px-2 py-1 rounded-sm
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}