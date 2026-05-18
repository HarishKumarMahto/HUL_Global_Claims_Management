import { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, debounceMs);

  useEffect(() => { onChange(debouncedValue); }, [debouncedValue, onChange]);
  useEffect(() => { setLocalValue(value); }, [value]);

  return (
    <TextField
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      size="small"
      className={className}
      sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
          </InputAdornment>
        ),
        endAdornment: localValue ? (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => { setLocalValue(''); onChange(''); }} edge="end">
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
    />
  );
}
