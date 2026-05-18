import { useState, useMemo, useEffect } from 'react';
import {
  X, Plus, ChevronDown, Check, Search,
  ArrowUpDown, ChevronUp, SlidersHorizontal,
  Binoculars, ChevronLeft, ChevronRight
} from 'lucide-react';
import { TablePagination } from '../ui/tableUtils';

import {
  ProductItem,
  getLifecycleBadgeStyle,
  getProductTypeBg,
  getProductTypeColor,
  PRODUCT_TYPE_META,
  initialProducts,
  LIFECYCLE_STATES,
  PRODUCT_TYPES,
  ProductType,
} from './productData';
import { BUSINESS_GROUPS, CATEGORIES } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SelectionMode = 'single' | 'multi';

export interface AdvancedSearchFilter {
  column: string;
  condition: string;
  value: string;
}

interface AdvancedProductSearchProps {
  isOpen: boolean;
  onClose: (selected: ProductItem[]) => void;
  selectionMode?: SelectionMode;
  initialProducts?: ProductItem[];
  contextLabel?: string; // e.g. "Technology 1", "Parent Product"
  onCreateProduct?: (type?: ProductType) => void;
}

// ─── Column definitions ───────────────────────────────────────────────────────

const SEARCH_COLUMNS = [
  { id: 'name', label: 'Product Name' },
  { id: 'productId', label: 'Product ID' },
  { id: 'type', label: 'Product Type' },
  { id: 'lifecycleState', label: 'Lifecycle State' },
  { id: 'brand', label: 'Brand' },
  { id: 'businessGroup', label: 'Business Group' },
  { id: 'category', label: 'Category' },
  { id: 'createdBy', label: 'Created By' },
];

const CONDITIONS = [
  { id: 'equals', label: 'Equals' },
  { id: 'not_equals', label: 'Not Equals' },
  { id: 'includes', label: 'Includes' },
  { id: 'is_blank', label: 'Is Blank' },
  { id: 'is_not_blank', label: 'Is Not Blank' },
];

// Enum-type columns that get a dropdown for value
const ENUM_VALUES: Record<string, string[]> = {
  type: PRODUCT_TYPES,
  lifecycleState: [...LIFECYCLE_STATES],
  businessGroup: BUSINESS_GROUPS,
  category: Object.values(CATEGORIES).flat(),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function matchesFilter(product: ProductItem, filter: AdvancedSearchFilter): boolean {
  if (!['is_blank', 'is_not_blank'].includes(filter.condition) && !filter.value) {
    return true; // Skip filter if required value is empty/Any
  }

  const raw = (product as Record<string, unknown>)[filter.column];
  const val = String(raw ?? '').toLowerCase();
  const fv = filter.value.toLowerCase();

  switch (filter.condition) {
    case 'equals': return val === fv;
    case 'not_equals': return val !== fv;
    case 'includes': return val.includes(fv);
    case 'is_blank': return !val.trim();
    case 'is_not_blank': return !!val.trim();
    default: return true;
  }
}

// ─── FilterRow sub-component ──────────────────────────────────────────────────

function FilterRow({
  filter,
  index,
  onChange,
  onRemove,
}: {
  filter: AdvancedSearchFilter;
  index: number;
  onChange: (i: number, f: AdvancedSearchFilter) => void;
  onRemove: (i: number) => void;
}) {
  const needsValue = !['is_blank', 'is_not_blank'].includes(filter.condition);
  const enumOpts = ENUM_VALUES[filter.column];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Column selector */}
      <div className="relative">
        <select
          value={filter.column}
          onChange={e => onChange(index, { ...filter, column: e.target.value, value: '' })}
          className="appearance-none pl-3 pr-8 py-2 border border-pebble rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky min-w-[160px]"
        >
          {SEARCH_COLUMNS.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Condition selector */}
      <div className="relative">
        <select
          value={filter.condition}
          onChange={e => onChange(index, { ...filter, condition: e.target.value })}
          className="appearance-none pl-3 pr-8 py-2 border border-pebble rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky min-w-[150px]"
        >
          {CONDITIONS.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Value input / dropdown */}
      {needsValue && (
        enumOpts ? (
          <div className="relative">
            <select
              value={filter.value}
              onChange={e => onChange(index, { ...filter, value: e.target.value })}
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
            value={filter.value}
            onChange={e => onChange(index, { ...filter, value: e.target.value })}
            placeholder="Filter value..."
            className="px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky min-w-[150px]"
          />
        )
      )}

      {/* Remove filter */}
      <button
        onClick={() => onRemove(index)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove filter"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdvancedProductSearch({
  isOpen,
  onClose,
  selectionMode = 'single',
  initialProducts: productPool,
  contextLabel = 'Product',
  onCreateProduct,
}: AdvancedProductSearchProps) {
  const pool = productPool ?? initialProducts;

  const [filters, setFilters] = useState<AdvancedSearchFilter[]>([
    { column: 'name', condition: 'includes', value: '' },
  ]);
  const [appliedFilters, setAppliedFilters] = useState<AdvancedSearchFilter[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortCol, setSortCol] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [includeArchived, setIncludeArchived] = useState(false);
  const PAGE_SIZE = 5;

  // reset on open/close
  useEffect(() => {
    if (isOpen) {
      setFilters([{ column: 'name', condition: 'includes', value: '' }]);
      setAppliedFilters([]);
      setGlobalSearch('');
      setIncludeArchived(false);
      setSelected(new Set());
      setHasSearched(false);
      setCurrentPage(1);
    }
  }, [isOpen]);

  const inferredType = useMemo<ProductType | undefined>(() => {
    // Look for a filter matching the "type" column
    const typeFilter = filters.find(
      f => f.column === 'type' && (f.condition === 'equals' || f.condition === 'includes') && f.value
    );
    if (typeFilter && typeFilter.value) {
      const val = typeFilter.value.trim().toLowerCase();
      if (val.includes('technology')) return 'Technology';
      if (val.includes('format')) return 'Format';
      if (val.includes('subrange')) return 'Subrange';
      if (val.includes('variant') && !val.includes('local')) return 'Variant';
      if (val.includes('local variant')) return 'Local Variant';
      if (val.includes('sku')) return 'SKU';
    }
    
    // Fallback to checking the global quick search value
    const query = globalSearch.trim().toLowerCase();
    if (query.includes('technology')) return 'Technology';
    if (query.includes('format')) return 'Format';
    if (query.includes('subrange')) return 'Subrange';
    if (query.includes('variant') && !query.includes('local')) return 'Variant';
    if (query.includes('local variant')) return 'Local Variant';
    if (query.includes('sku')) return 'SKU';
    
    return undefined;
  }, [filters, globalSearch]);

  const results = useMemo<ProductItem[]>(() => {
    if (!hasSearched && !globalSearch) return [];

    let list = [...pool];

    // Exclude Obsolete / Cancelled unless includeArchived is checked,
    // or unless there is an explicit query for it.
    const explicitlyQueryingArchived = appliedFilters.some(
      f => f.column === 'lifecycleState' &&
           f.condition !== 'is_blank' &&
           (f.value.toLowerCase() === 'obsolete' || f.value.toLowerCase() === 'cancelled')
    );

    if (!includeArchived && !explicitlyQueryingArchived) {
      list = list.filter(p => p.lifecycleState !== 'Obsolete' && p.lifecycleState !== 'Cancelled');
    }

    // Global search
    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.productId.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      );
    }

    // Applied filters
    appliedFilters.forEach(f => {
      if (f.condition === 'is_blank' || f.condition === 'is_not_blank' || f.value) {
        list = list.filter(p => matchesFilter(p, f));
      }
    });

    // Sort
    list.sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortCol] ?? '');
      const bv = String((b as Record<string, unknown>)[sortCol] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [pool, appliedFilters, globalSearch, sortCol, sortDir, hasSearched, includeArchived]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedResults = results.slice(startIndex, startIndex + PAGE_SIZE);

  // ─── Filter management ────────────────────────────────────────────────────

  const addFilter = () =>
    setFilters(f => [...f, { column: 'name', condition: 'includes', value: '' }]);

  const updateFilter = (i: number, updated: AdvancedSearchFilter) =>
    setFilters(f => f.map((x, idx) => (idx === i ? updated : x)));

  const removeFilter = (i: number) =>
    setFilters(f => f.filter((_, idx) => idx !== i));

  const applyFilters = () => {
    setAppliedFilters([...filters]);
    setHasSearched(true);
    setCurrentPage(1);
  };

  // ─── Sort ─────────────────────────────────────────────────────────────────

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

  // ─── Selection ────────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    if (selectionMode === 'single') {
      setSelected(new Set([id]));
    } else {
      setSelected(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    }
  };

  const handleClose = () => {
    const selectedProducts = pool.filter(p => selected.has(p.id));
    onClose(selectedProducts);
  };

  if (!isOpen) return null;

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 text-gray-300 ml-1" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-sky ml-1" />
      : <ChevronDown className="w-3 h-3 text-sky ml-1" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-night/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full"
        style={{ maxWidth: 900, maxHeight: '90vh' }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pebble flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-base" style={{ fontWeight: 600 }}>
                Advanced Search — {contextLabel}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectionMode === 'single' ? 'Select one product' : 'Select one or more products'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-earth rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* ── Filter Builder ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-pebble bg-earth/40 flex-shrink-0 space-y-3">
          {/* Global keyword search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { setGlobalSearch(e.target.value); setHasSearched(true); setCurrentPage(1); }}
                placeholder="Quick search by name, ID, brand..."
                className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Filter rows */}
          <div className="space-y-2">
            {filters.map((f, i) => (
              <FilterRow
                key={i}
                filter={f}
                index={i}
                onChange={updateFilter}
                onRemove={removeFilter}
              />
            ))}
          </div>

          {/* Add filter + Apply */}
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <button
              onClick={addFilter}
              className="flex items-center gap-1.5 text-sm text-sky hover:text-dark transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Filter
            </button>

            <button
              onClick={applyFilters}
              className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
            >
              Apply Filters
            </button>

            {(appliedFilters.length > 0 || globalSearch) && (
              <button
                onClick={() => {
                  setFilters([{ column: 'name', condition: 'includes', value: '' }]);
                  setAppliedFilters([]);
                  setGlobalSearch('');
                  setIncludeArchived(false);
                  setHasSearched(false);
                }}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer ml-auto select-none hover:text-night bg-white/60 px-3 py-1.5 border border-pebble/60 rounded-lg transition-colors hover:border-pebble">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={e => {
                  setIncludeArchived(e.target.checked);
                  setHasSearched(true);
                  setCurrentPage(1);
                }}
                className="w-4 h-4 rounded border-pebble text-sky focus:ring-sky cursor-pointer"
              />
              <span className="font-medium text-xs">Include Archived/Obsolete Products</span>
            </label>
          </div>
        </div>

        {/* ── Results Table ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto">
          {!hasSearched && !globalSearch ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Enter search criteria and click <strong>Apply Filters</strong></p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No products match your criteria</p>
              {onCreateProduct && (
                <button
                  onClick={() => { onCreateProduct(inferredType); handleClose(); }}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create New Product {inferredType ? `(${inferredType})` : ''}
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-earth border-b border-pebble sticky top-0 z-10">
                <tr>
                  {/* Select column */}
                  <th className="w-10 px-4 py-3 text-xs uppercase tracking-wide text-left text-gray-500">
                    {selectionMode === 'multi' ? 'Select' : ''}
                  </th>

                  {[
                    { id: 'name', label: 'Product Name' },
                    { id: 'productId', label: 'Product ID' },
                    { id: 'type', label: 'Type' },
                    { id: 'lifecycleState', label: 'Lifecycle' },
                    { id: 'brand', label: 'Brand' },
                    { id: 'businessGroup', label: 'Business Group' },
                  ].map(col => (
                    <th
                      key={col.id}
                      onClick={() => handleSort(col.id)}
                      className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500 cursor-pointer hover:text-night whitespace-nowrap select-none"
                    >
                      <div className="flex items-center">
                        {col.label}
                        <SortIcon col={col.id} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedResults.map((product, idx) => {
                  const isSelected = selected.has(product.id);
                  const lcStyle = getLifecycleBadgeStyle(product.lifecycleState);
                  const typeColor = getProductTypeColor(product.type);
                  const typeBg = getProductTypeBg(product.type);

                  return (
                    <tr
                      key={product.id}
                      onClick={() => toggleSelect(product.id)}
                      className={`border-b border-pebble cursor-pointer transition-colors ${isSelected
                          ? 'bg-pale/40 border-sky/20'
                          : idx % 2 === 0
                            ? 'bg-white hover:bg-earth/40'
                            : 'bg-earth/20 hover:bg-earth/60'
                        }`}
                    >
                      {/* Radio / Checkbox */}
                      <td className="px-4 py-3">
                        {selectionMode === 'single' ? (
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-sky bg-sky' : 'border-gray-300'
                              }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        ) : (
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-sky bg-sky' : 'border-gray-300'
                              }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <div className="text-night" style={{ fontWeight: 500 }}>
                          {product.name}
                        </div>
                        {product.brand && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {product.brand}
                          </div>
                        )}
                      </td>

                      {/* Product ID */}
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                        {product.productId}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-md text-xs"
                          style={{ background: typeBg, color: typeColor, fontWeight: 500 }}
                        >
                          {PRODUCT_TYPE_META[product.type]?.icon} {product.type}
                        </span>
                      </td>

                      {/* Lifecycle */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: lcStyle.dot }}
                          />
                          <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: lcStyle.bg, color: lcStyle.text }}
                          >
                            {product.lifecycleState}
                          </span>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {product.brand}
                      </td>

                      {/* Business Group */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {product.businessGroup}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Result count bar ────────────────────────────────────────────── */}
        {hasSearched && results.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalRecords={results.length}
            startIndex={startIndex}
            itemsPerPage={PAGE_SIZE}
            label="results"
            onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
            onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            onPageSelect={setCurrentPage}
          />
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-pebble bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            {onCreateProduct && (
              <button
                onClick={() => { onCreateProduct(inferredType); handleClose(); }}
                className="flex items-center gap-2 px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth hover:border-sky transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create {inferredType ? `(${inferredType})` : ''}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              disabled={selected.size === 0}
              className="px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Close &amp; Apply{selected.size > 0 ? ` (${selected.size})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trigger Button ───────────────────────────────────────────────────────────
// A small binoculars icon button to open the advanced search

export function AdvancedSearchTrigger({
  onClick,
  title = 'Advanced Search',
}: {
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 border border-pebble rounded-lg text-gray-500 hover:text-sky hover:border-sky hover:bg-pale transition-colors flex-shrink-0"
    >
      {/* Binoculars icon (custom SVG since lucide doesn't have one) */}
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="6" cy="14" r="4" />
        <circle cx="18" cy="14" r="4" />
        <path d="M2 14h4M18 14h4M10 14h4" />
        <path d="M6 10V6l4 4M18 10V6l-4 4" />
      </svg>
    </button>
  );
}
