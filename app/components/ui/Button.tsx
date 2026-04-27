import React from 'react';
import { cn } from '@/app/lib/utils';
import { Loader2 } from 'lucide-react';

// ============================================
// BUTTON COMPONENT
// ============================================

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#3a0519] text-white hover:bg-[#5a0826] shadow-sm',
  secondary: 'bg-[#a77a0b] text-white hover:bg-[#8a6509] shadow-sm',
  success: 'bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-lg',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3.5 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
