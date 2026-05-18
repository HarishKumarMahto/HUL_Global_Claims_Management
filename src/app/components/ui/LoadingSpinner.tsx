import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeMap = { sm: 16, md: 32, lg: 48 };

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 4 }}>
      <CircularProgress size={sizeMap[size]} thickness={3.5} />
      {text && (
        <Typography variant="body2" color="text.secondary">{text}</Typography>
      )}
    </Box>
  );
}
