import { Box, Typography, Button } from '@mui/material';
import { ElementType } from 'react';

// Accepts either a Lucide icon component or an MUI SvgIcon — both are just React components
interface EmptyStateProps {
  icon: ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 10, px: 2, textAlign: 'center' }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <Icon style={{ width: 32, height: 32, color: '#9ca3af' }} />
      </Box>

      <Typography variant="h6" fontWeight={600} color="text.primary" mb={0.75}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" maxWidth={400} mb={3}>
        {description}
      </Typography>

      {action && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant={action.variant === 'secondary' ? 'outlined' : 'contained'}
            color="primary"
            size="medium"
            onClick={action.onClick}
            disableElevation
          >
            {action.label}
          </Button>
          {secondaryAction && (
            <Button variant="text" color="inherit" size="medium" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
