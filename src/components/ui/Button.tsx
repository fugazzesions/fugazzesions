import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-paper border-ink hover:fz-stamp-red',
  secondary: 'bg-transparent text-ink border-ink hover:bg-ink hover:text-paper',
  danger: 'bg-transparent text-red border-red hover:bg-red hover:text-paper',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-[10px]',
  md: 'px-4 py-2.5 text-[11px]',
  lg: 'px-5 py-3 text-xs',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-1.5
        border-2 rounded-md
        font-bold uppercase tracking-[0.15em]
        fz-stamp
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}