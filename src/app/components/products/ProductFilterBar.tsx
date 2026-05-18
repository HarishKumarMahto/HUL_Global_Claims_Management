import { useState, useRef, useEffect } from 'react';
import { X, Plus, ChevronDown, Check, Filter } from 'lucide-react';
import {
  PRODUCT_TYPES,
  LIFECYCLE_STATES,
} from './productData';
import { BUSINESS_GROUPS, CATEGORIES } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductFilter {
  id: string;
  column: string;
  condition: string;
  value: string;
}

interface ProductFilterBarProps {
  filters: ProductFilter[];
  onFiltersChange: (filters: ProductFilter[]) => void;
}

// ─── Column/Condition definitions ─────────────────────────────────────────────

export const FILTER_COLUMNS = [
  { id: 'name',           label: 'Product Name' },
  { id: 'productId',      label: 'Product ID' },
  { id: 'type',           label: 'Product Type' },
  { id: 'lifecycleState', label: 'Lifecycle State' },
  { id: 'brand',          label: 'Brand' },
  { id: 'businessGroup',  label: 'Business Group' },
  { id: 'category',       label: 'Category' },
  { id: 'createdBy',      label: 'Created By' },
];

export const FILTER_CONDITIONS = [
  { id: 'includes',       label: 'Includes' },
  { id: 'equals',         label: 'Equals' },
  { id: 'not_equals',     label: 'Not Equals' },
  { id: 'is_blank',       label: 'Is Blank' },
  { id: 'is_not_blank',   label: 'Is Not Blank' },
];

const ENUM_VALUES: Record<string, string[]> = {
  type:           PRODUCT_TYPES,
  lifecycleState: [...LIFECYCLE_STATES],
  businessGroup:  BUSINESS_GROUPS,
  category:       Object.values(CATEGORIES).flat(),
};

// ─── Apply filter logic (exported for use in ProductsLandingPage) ─────────────

export function applyProductFilters<T extends Record<string, unknown>>(
  list: T[],
  filters: ProductFilter[]
): T[] {
  return filters.reduce((acc, f) => {
    if (!f.condition) return acc;
    // skip if value is required but empty
    if (!['is_blank', 'is_not_blank'].includes(f.condition) && !f.value) return acc;

    return acc.filter(item => {
      const raw = String(item[f.column] ?? '').toLowerCase();
      const fv  = f.value.toLowerCase();
      switch (f.condition) {
        case 'equals':       return raw === fv;
        case 'not_equals':   return raw !== fv;
        case 'includes':     return raw.includes(fv);
        case 'is_blank':     return !raw.trim();
        case 'is_not_blank': return !!raw.trim();
        default:             return true;
      }
    });
  }, list);
}

// ─── Filter Builder Popover ───────────────────────────────────────────────────

function FilterBuilderPopover({
  onAdd,
  onClose,
}: {
  onAdd: (f: Omit<ProductFilter, 'id'>) => void;
  onClose: () => void;
}) {
  const [column,    setColumn]    = useState('name');
  const [condition, setCondition] = useState('includes');
  const [value,     setValue]     = useState('');

  const needsValue = !['is_blank', 'is_not_blank'].includes(condition);
  const enumOpts   = ENUM_VALUES[column];

  const handleApply = () => {
    if (needsValue && !value) return;
    onAdd({ column, condition, value: needsValue ? value : '' });
    onClose();
  };

  return (
    <div className="absolute left-0 top-full mt-2 z-30 bg-white border border-pebble rounded-xl shadow-xl p-4 w-[480px]">
      <div className="text-sm text-night mb-3" style={{ fontWeight: 600 }}>Add Filter</div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {/* Column */}
        <div className="relative">
          <select
            value={column}
            onChange={e => { setColumn(e.target.value); setValue(''); }}
            className="appearance-none pl-3 pr-8 py-2 border border-pebble rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky min-w-[150px]"
          >
            {FILTER_COLUMNS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Condition */}
        <div className="relative">
          <select
            value={condition}
            onChange={e => setCondition(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 border border-pebble rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky min-w-[140px]"
          >
            {FILTER_CONDITIONS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Value */}
        {needsValue && (
          enumOpts ? (
            <div className="relative">
              <select
                value={value}
                onChange={e => setValue(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 border border-pebble rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky min-w-[150px]"
              >
                <option value="">— Any —</option>
                {enumOpts.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ) : (
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApply()}
              placeholder="Filter value..."
              className="px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky min-w-[150px]"
              autoFocus
            />
          )
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          disabled={needsValue && !value}
          className="px-4 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
}

// ─── Applied Filter Chip ──────────────────────────────────────────────────────

function FilterChip({
  filter,
  onRemove,
}: {
  filter: ProductFilter;
  onRemove: () => void;
}) {
  const colLabel  = FILTER_COLUMNS.find(c => c.id === filter.column)?.label ?? filter.column;
  const condLabel = FILTER_CONDITIONS.find(c => c.id === filter.condition)?.label ?? filter.condition;

  const needsValue = !['is_blank', 'is_not_blank'].includes(filter.condition);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-pale border border-sky/20 rounded-full text-xs text-sky">
      <span className="font-medium">{colLabel}</span>
      <span className="text-sky/60">{condLabel}</span>
      {needsValue && filter.value && (
        <span className="font-medium">&quot;{filter.value}&quot;</span>
      )}
      <button
        onClick={onRemove}
        className="ml-0.5 p-0.5 rounded-full hover:bg-sky/20 transition-colors"
        title="Remove filter"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Main ProductFilterBar ────────────────────────────────────────────────────

export default function ProductFilterBar({
  filters,
  onFiltersChange,
}: ProductFilterBarProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowBuilder(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addFilter = (f: Omit<ProductFilter, 'id'>) => {
    const newFilter: ProductFilter = { ...f, id: String(Date.now()) };
    onFiltersChange([...filters, newFilter]);
  };

  const removeFilter = (id: string) => {
    onFiltersChange(filters.filter(f => f.id !== id));
  };

  const clearAll = () => onFiltersChange([]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter icon + Add button */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setShowBuilder(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-colors ${
              showBuilder
                ? 'border-sky bg-pale text-sky'
                : 'border-pebble text-gray-600 hover:border-sky hover:bg-pale hover:text-sky'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Filter
          </button>
        </div>

        {/* Applied filter chips */}
        {filters.map(f => (
          <FilterChip key={f.id} filter={f} onRemove={() => removeFilter(f.id)} />
        ))}

        {/* Clear all */}
        {filters.length > 1 && (
          <button
            onClick={clearAll}
            className="px-2.5 py-1 text-xs text-gray-500 hover:text-red-500 border border-transparent hover:border-red-200 hover:bg-red-50 rounded-full transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Builder popover */}
      {showBuilder && (
        <FilterBuilderPopover
          onAdd={addFilter}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}
