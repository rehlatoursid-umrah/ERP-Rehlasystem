import React from 'react';
import { cn } from '@/app/lib/utils';

// ============================================
// PAGE HEADER COMPONENT
// ============================================

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn(
      'flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6 mb-8',
      className
    )}>
      <div>
        <h1 className="text-2xl font-bold text-[#3a0519] flex items-center gap-2">
          {icon}
          {title}
        </h1>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ============================================
// SECTION HEADER (inside cards/forms)
// ============================================

interface SectionHeaderProps {
  number?: number | string;
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function SectionHeader({ number, title, icon, action }: SectionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
      <h3 className="font-bold text-[#3a0519] flex items-center gap-2 text-sm">
        {icon}
        {number ? `${number}. ` : ''}{title}
      </h3>
      {action}
    </div>
  );
}
