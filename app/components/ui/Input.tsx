import React from 'react';
import { cn } from '@/app/lib/utils';

// ============================================
// INPUT COMPONENT
// Replaces all .input-field / .input-block styles
// ============================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none bg-white transition-all duration-200',
              'focus:border-[#a77a0b] focus:ring-2 focus:ring-[#fdf8e8]',
              'placeholder:text-gray-400',
              icon && 'pl-10',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] text-red-500 mt-1 font-medium">{error}</p>}
        {helperText && !error && <p className="text-[10px] text-gray-400 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// TEXTAREA COMPONENT
// ============================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none bg-white transition-all duration-200 resize-y',
            'focus:border-[#a77a0b] focus:ring-2 focus:ring-[#fdf8e8]',
            'placeholder:text-gray-400',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-red-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================
// SELECT COMPONENT
// ============================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wide">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none bg-white transition-all duration-200 cursor-pointer',
            'focus:border-[#a77a0b] focus:ring-2 focus:ring-[#fdf8e8]',
            error && 'border-red-400',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-[10px] text-red-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
