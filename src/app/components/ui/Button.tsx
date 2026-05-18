import { Button as MuiButton, CircularProgress } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material';
import { ReactNode, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
}

const sizeMap: Record<ButtonSize, MuiButtonProps['size']> = {
  sm: 'small', md: 'medium', lg: 'large',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  disabled,
  onClick,
  type = 'button',
  className,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const startIcon = !loading && iconPosition === 'left' ? icon : undefined;
  const endIcon = !loading && iconPosition === 'right' ? icon : undefined;

  const variantProps: Partial<MuiButtonProps> = (() => {
    switch (variant) {
      case 'primary':   return { variant: 'contained', color: 'primary' };
      case 'secondary': return { variant: 'outlined',  color: 'primary' };
      case 'danger':    return { variant: 'contained', color: 'error' };
      case 'ghost':     return { variant: 'text',      color: 'primary' };
      case 'tertiary':  return {
        variant: 'contained',
        sx: { bgcolor: '#F6F7F0', color: '#133062', boxShadow: 'none',
              '&:hover': { bgcolor: '#DEDED7', boxShadow: 'none' } },
      };
    }
  })();

  return (
    <MuiButton
      {...variantProps}
      size={sizeMap[size]}
      disabled={isDisabled}
      onClick={onClick as any}
      type={type}
      className={className}
      style={style}
      startIcon={loading ? <CircularProgress size={13} color="inherit" /> : startIcon}
      endIcon={endIcon}
    >
      {children}
    </MuiButton>
  );
}
