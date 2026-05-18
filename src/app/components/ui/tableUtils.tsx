/**
 * Shared table UI utilities — used across Projects and Products tables
 * for visual consistency throughout the application.
 */
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Sort icon (identical to ProjectTable) ──────────────────────────────────
export function SortIcon({ col, sortCol, sortDir }: {
  col: string;
  sortCol: string | null;
  sortDir: 'asc' | 'desc' | null;
}) {
  if (sortCol !== col) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-300" />;
  if (sortDir === 'asc') return <ArrowUp className="w-3.5 h-3.5 text-sky" />;
  return <ArrowDown className="w-3.5 h-3.5 text-sky" />;
}

// ─── Avatar initials (identical to ProjectTable) ────────────────────────────
export function AvatarInitials({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <div
      className="w-6 h-6 rounded-full bg-sky text-white flex items-center justify-center text-xs flex-shrink-0"
      title={name}
      style={{ fontSize: 10, fontWeight: 600 }}
    >
      {initials}
    </div>
  );
}

// ─── Table container shell ───────────────────────────────────────────────────
export function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl border border-pebble overflow-hidden shadow-sm">
      {children}
    </div>
  );
}

// ─── Table toolbar bar (above the table) ────────────────────────────────────
export function TableToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-pebble flex items-center justify-between bg-earth/50 flex-shrink-0">
      {children}
    </div>
  );
}

// ─── Table scroll container ──────────────────────────────────────────────────
export function TableScrollArea({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 overflow-auto no-scrollbar">
      {children}
    </div>
  );
}

// ─── Pagination footer ───────────────────────────────────────────────────────
export function TablePagination({
  currentPage, totalPages, totalRecords, startIndex, itemsPerPage, label,
  onPrev, onNext, onPageSelect,
}: {
  currentPage: number; totalPages: number; totalRecords: number;
  startIndex: number; itemsPerPage: number; label: string;
  onPrev: () => void; onNext: () => void; onPageSelect?: (p: number) => void;
}) {
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1;
    if (currentPage <= 4) return i + 1;
    if (currentPage >= totalPages - 3) return totalPages - 6 + i;
    return currentPage - 3 + i;
  });

  return (
    <div className="px-4 py-3 border-t border-pebble flex items-center justify-between bg-earth/30 flex-shrink-0">
      <div className="text-xs text-gray-400">
        {totalRecords === 0 ? `0 ${label}` : (
          <>Showing {Math.min(startIndex + 1, totalRecords)}–{Math.min(startIndex + itemsPerPage, totalRecords)} of {totalRecords} {label}</>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onPrev} disabled={currentPage === 1}
          className="p-1.5 rounded-lg hover:bg-earth disabled:opacity-30 transition-colors border border-pebble focus:outline-none focus:ring-2 focus:ring-sky">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onPageSelect?.(p)}
            className={`min-w-[28px] h-7 rounded-lg text-xs transition-colors ${p === currentPage ? 'bg-sky text-white' : 'text-gray-600 hover:bg-earth border border-pebble'}`}>
            {p}
          </button>
        ))}
        <button onClick={onNext} disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg hover:bg-earth disabled:opacity-30 transition-colors border border-pebble focus:outline-none focus:ring-2 focus:ring-sky">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Unified status badge ────────────────────────────────────────────────────
// Single source of truth for ALL status/lifecycle badges across the app.

export const PROJECT_STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  'Draft':               { bg: '#F3F4F6', text: '#6B7280' },
  'In Progress':         { bg: '#DBEAFE', text: '#1D4ED8' },
  'Under Review':        { bg: '#FEF3C7', text: '#92400E' },
  'Completed':           { bg: '#D1FAE5', text: '#065F46' },
  'Archived':            { bg: '#F3F4F6', text: '#9CA3AF' },
  'Cancelled':           { bg: '#FEE2E2', text: '#DC2626' },
};

export const STAGE_STYLES: Record<string, { bg: string; text: string }> = {
  'Draft':                    { bg: '#F3F4F6', text: '#9CA3AF' },
  'Substantiate':             { bg: '#DBEAFE', text: '#1D4ED8' },
  'Review & Risk Assessment': { bg: '#FEF3C7', text: '#92400E' },
  'Complete':                 { bg: '#D1FAE5', text: '#065F46' },
};

export const SCOPE_STYLES: Record<string, { bg: string; text: string }> = {
  'Global':   { bg: '#0066CC', text: '#FFFFFF' },
  'Regional': { bg: '#C2E0FF', text: '#0066CC' },
  'Local':    { bg: '#F6F7F0', text: '#6B7280' },
};

export const PRODUCT_LIFECYCLE_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Created':   { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' },
  'In-use':    { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  'Obsolete':  { bg: '#F3F4F6', text: '#9CA3AF', dot: '#9CA3AF' },
  'Cancelled': { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
};

export function StatusBadge({ label, style }: { label: string; style: { bg: string; text: string } }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
      style={{ background: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
export function TableEmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="py-20 text-center">
      <div className="w-14 h-14 bg-earth rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
        {icon}
      </div>
      <div className="text-gray-500 text-sm" style={{ fontWeight: 500 }}>{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Filter chip ─────────────────────────────────────────────────────────────
export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale text-sky rounded-full text-xs">
      {label}
      <button onClick={onRemove} className="hover:text-dark ml-0.5">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

// ─── Date formatting ─────────────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

// ─── Risk level options ───────────────────────────────────────────────────────
export const RISK_LEVEL_OPTIONS = ['Low', 'Medium', 'High', 'Very High'] as const;