import { Skeleton as MuiSkeleton, Box } from '@mui/material';
import { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className, width, height, variant = 'rectangular' }: SkeletonProps) {
  const style: CSSProperties = {};
  if (width)  style.width  = typeof width  === 'number' ? `${width}px`  : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <MuiSkeleton
      variant={variant === 'text' ? 'text' : variant === 'circular' ? 'circular' : 'rectangular'}
      className={className}
      style={style}
      sx={{ borderRadius: variant === 'rectangular' ? 1 : undefined }}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {Array.from({ length: columns }).map((_, i) => (
          <MuiSkeleton key={i} variant="rectangular" height={40} sx={{ flex: 1, borderRadius: 1 }} />
        ))}
      </Box>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <Box key={r} sx={{ display: 'flex', gap: 1.5 }}>
          {Array.from({ length: columns }).map((_, c) => (
            <MuiSkeleton key={c} variant="rectangular" height={48} sx={{ flex: 1, borderRadius: 1 }} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

export function CardSkeleton() {
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid #DEDED7', p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <MuiSkeleton variant="rectangular" height={24} width="60%" sx={{ borderRadius: 1 }} />
      <MuiSkeleton variant="rectangular" height={16} width="40%" sx={{ borderRadius: 1 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        <MuiSkeleton variant="rectangular" height={12} sx={{ borderRadius: 1 }} />
        <MuiSkeleton variant="rectangular" height={12} sx={{ borderRadius: 1 }} />
        <MuiSkeleton variant="rectangular" height={12} width="80%" sx={{ borderRadius: 1 }} />
      </Box>
    </Box>
  );
}
