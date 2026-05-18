import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('unilever-theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('unilever-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('unilever-theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to Light mode' : 'Switch to Night mode'}
      title={isDark ? 'Switch to Light mode' : 'Switch to Night mode'}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: isDark ? '1px solid #1A3566' : '1px solid #85C2FF',
        background: isDark ? '#133062' : '#C2E0FF',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.25s ease',
        outline: 'none',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: isDark ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: isDark ? '#23E7FF' : '#0066CC',
          transition: 'left 0.25s ease, background 0.25s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
