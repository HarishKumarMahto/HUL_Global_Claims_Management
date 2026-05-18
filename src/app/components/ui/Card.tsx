import { Card as MuiCard, Typography, Box } from '@mui/material';
import { ReactNode } from 'react';

type PaddingKey = 'none' | 'sm' | 'md' | 'lg';
const paddingMap: Record<PaddingKey, number> = { none: 0, sm: 1.5, md: 2, lg: 3 };

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: PaddingKey;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, padding = 'md', hover, onClick }: CardProps) {
  return (
    <MuiCard
      className={className}
      onClick={onClick}
      elevation={0}
      sx={{
        border: '1px solid #DEDED7',
        borderRadius: 2,
        p: paddingMap[padding],
        cursor: onClick ? 'pointer' : 'default',
        transition: hover ? 'box-shadow 0.2s ease, border-color 0.2s ease' : undefined,
        '&:hover': hover ? { boxShadow: '0 4px 16px rgba(0,0,0,0.10)', borderColor: 'rgba(0,102,204,0.30)' } : {},
      }}
    >
      {children}
    </MuiCard>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <Box className={className} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h6" fontWeight={600} color="text.primary" fontSize={16}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box>{action}</Box>}
    </Box>
  );
}
