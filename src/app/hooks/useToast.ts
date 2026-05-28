import { useState, useCallback } from 'react';
import type { ToastType } from '../components/ui/Toast';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((args: { type: ToastType; title?: string; message: string } | ToastType, messageStr?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    if (typeof args === 'object') {
      setToasts(prev => [...prev, { id, type: args.type, message: args.message }]);
    } else {
      setToasts(prev => [...prev, { id, type: args, message: messageStr || '' }]);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string) => showToast('success', message), [showToast]);
  const error = useCallback((message: string) => showToast('error', message), [showToast]);
  const warning = useCallback((message: string) => showToast('warning', message), [showToast]);
  const info = useCallback((message: string) => showToast('info', message), [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
