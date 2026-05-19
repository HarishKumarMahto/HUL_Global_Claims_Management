import React from 'react';
import type { DocumentLifecycle } from './documentsData';

const BADGE_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  Draft:    { bg: 'bg-gray-100',    text: 'text-gray-600',   border: 'border-gray-200',   dot: 'bg-gray-400' },
  'In Use': { bg: 'bg-green-50',   text: 'text-green-700',  border: 'border-green-200',  dot: 'bg-green-500' },
  Created:  { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  Expired:  { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-400' },
  Cancelled:{ bg: 'bg-red-50',     text: 'text-red-600',    border: 'border-red-200',    dot: 'bg-red-500' },
  Withdrawn:{ bg: 'bg-yellow-50',  text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-500' },
  Obsolete: { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
};

interface DocumentLifecycleBadgeProps {
  state: DocumentLifecycle;
  size?: 'sm' | 'md';
}

export default function DocumentLifecycleBadge({ state, size = 'md' }: DocumentLifecycleBadgeProps) {
  const cfg = BADGE_CONFIG[state] ?? BADGE_CONFIG['Draft'];
  const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${sizeClass} ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {state}
    </span>
  );
}
