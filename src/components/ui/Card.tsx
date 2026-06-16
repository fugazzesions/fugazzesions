import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({
  children,
  hoverable = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`fz-card p-5 ${hoverable ? 'fz-stamp cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}