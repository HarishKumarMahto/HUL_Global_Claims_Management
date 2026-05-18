import { Chip } from '@mui/material';
import { ReactNode } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const colorMap: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  default: { bg: '#C2E0FF', color: '#0066CC',  border: 'rgba(0,102,204,0.25)' },
  success: { bg: '#f0fdf4', color: '#15803d',  border: '#bbf7d0' },
  warning: { bg: '#fffbeb', color: '#b45309',  border: '#fde68a' },
  danger:  { bg: '#fef2f2', color: '#b91c1c',  border: '#fecaca' },
  info:    { bg: '#eff6ff', color: '#1d4ed8',  border: '#bfdbfe' },
  neutral: { bg: '#f9fafb', color: '#374151',  border: '#e5e7eb' },
};

const sizeStyles: Record<BadgeSize, { height: number; fontSize: number; px: number }> = {
  sm: { height: 18, fontSize: 10, px: 6 },
  md: { height: 22, fontSize: 11, px: 8 },
  lg: { height: 26, fontSize: 13, px: 10 },
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot,
}: BadgeProps) {
  const { bg, color, border } = colorMap[variant];
  const { height, fontSize, px } = sizeStyles[size];

  return (
    <Chip
      label={
        dot ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
            {children}
          </span>
        ) : children
      }
      className={className}
      sx={{
        bgcolor: bg,
        color,
        border: `1px solid ${border}`,
        height,
        fontSize,
        fontWeight: 500,
        borderRadius: '9999px',
        px: `${px}px`,
        '& .MuiChip-label': { px: 0 },
      }}
    />
  );
}
