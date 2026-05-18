import { Tooltip as MuiTooltip } from '@mui/material';
import { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  return (
    <MuiTooltip title={content} placement={position} arrow>
      {/* MUI Tooltip needs a single forwardRef child; wrap if needed */}
      <span style={{ display: 'inline-flex' }}>{children}</span>
    </MuiTooltip>
  );
}
