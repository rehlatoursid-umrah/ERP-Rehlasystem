import React from 'react';
import { cn } from '@/app/lib/utils';

// ============================================
// CARD COMPONENT
// ============================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}

export function Card({ children, className, accentColor }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
        accentColor && 'border-t-4',
        className
      )}
      style={accentColor ? { borderTopColor: accentColor } : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex justify-between items-center p-6 pb-4 border-b border-gray-100', className)}>
      <h3 className="font-bold text-[#3a0519] flex items-center gap-2 text-sm">
        {icon}
        {title}
      </h3>
      {action}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

// ============================================
// BADGE / STATUS COMPONENT
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  const colorMap: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    default: 'bg-gray-100 text-gray-600',
    primary: 'bg-[#3a0519]/10 text-[#3a0519]',
    secondary: 'bg-[#a77a0b]/10 text-[#a77a0b]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
        colorMap[variant || 'default'],
        className
      )}
    >
      {children}
    </span>
  );
}

// ============================================
// STAT CARD (Dashboard)
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: string;
}

export function StatCard({ title, value, icon, trend, color = '#3a0519' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
          {trend && (
            <p className={cn('text-[10px] mt-1 font-medium', trend.value >= 0 ? 'text-green-600' : 'text-red-600')}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}10`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-300 mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-md">{description}</p>
      {action}
    </div>
  );
}

// ============================================
// MODAL / DIALOG
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClass: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto', sizeClass[size])}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-[#3a0519]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            ✕
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ============================================
// CONFIRM DIALOG
// ============================================

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning';
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm,
  title, description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const buttonColor = {
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={cn('px-4 py-2 text-sm font-bold text-white rounded-lg transition disabled:opacity-50', buttonColor[variant])}
        >
          {loading ? 'Memproses...' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
