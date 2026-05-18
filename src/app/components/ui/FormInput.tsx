import { TextField, InputAdornment } from '@mui/material';
import { InputHTMLAttributes, ReactNode } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  required?: boolean;
  icon?: ReactNode;
}

export default function FormInput({
  label,
  error,
  success,
  helperText,
  required,
  icon,
  className,
  disabled,
  placeholder,
  value,
  onChange,
  type,
  name,
  id,
}: FormInputProps) {
  const hasError   = !!error;
  const hasSuccess = !!success && !error;

  const helperMsg = error || (success && !error ? success : helperText) || undefined;

  return (
    <TextField
      label={label}
      required={required}
      error={hasError}
      // MUI helperText shows below the field
      helperText={helperMsg}
      placeholder={placeholder}
      value={value}
      onChange={onChange as any}
      disabled={disabled}
      type={type}
      name={name}
      id={id}
      className={className}
      fullWidth
      size="small"
      color={hasSuccess ? 'success' : 'primary'}
      focused={hasSuccess ? true : undefined}
      InputProps={{
        startAdornment: icon ? (
          <InputAdornment position="start">{icon}</InputAdornment>
        ) : undefined,
        endAdornment: (hasError || hasSuccess) ? (
          <InputAdornment position="end">
            {hasError   && <ErrorIcon        sx={{ fontSize: 16, color: 'error.main' }} />}
            {hasSuccess && <CheckCircleIcon  sx={{ fontSize: 16, color: 'success.main' }} />}
          </InputAdornment>
        ) : undefined,
      }}
      FormHelperTextProps={{
        sx: { color: hasError ? 'error.main' : hasSuccess ? 'success.main' : 'text.secondary' },
      }}
    />
  );
}
