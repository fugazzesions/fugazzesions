import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  required?: boolean;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, required, hint, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-ink-soft mb-1.5">
            {label}
            {required && <span className="text-red ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full px-3 py-2.5 min-h-24 resize-y
            border-2 border-ink rounded-md
            bg-paper text-ink text-sm
            font-sans leading-relaxed
            focus:outline-none focus:shadow-[3px_3px_0_var(--color-red)]
            ${className}
          `}
          {...props}
        />
        {hint && (
          <p className="text-xs text-ink-light mt-1.5">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';