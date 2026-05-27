import { useState, useMemo, useEffect } from 'react';
import {
  X, ChevronDown, Check, Search,
  ArrowUpDown, ChevronUp, Binoculars
} from 'lucide-react';
import { TablePagination } from './ui/tableUtils';
import type { Project as ProjectItem } from '../types';
import { initialProjects } from '../types';
import { BUSINESS_GROUPS, CATEGORIES } from '../types';

export type SelectionMode = 'single' | 'multi';

export interface AdvancedSearchFilter {
  column: string;
  condition: string;
  value: string;
}

interface AdvancedProjectSearchProps {
  isOpen: boolean;
  onClose: (selected: ProjectItem[]) => void;
  selectionMode?: SelectionMode;
  initialProjects?: ProjectItem[];
  contextLabel?: string;
}

const SEARCH_COLUMNS = [
  { id: 'name', label: 'Project Name' },
  { id: 'projectId', label: 'Project ID' },
  { id: 'type', label: 'Type' },
  { id: 'status', label: 'Status' },
  { id: 'businessGroup', label: 'Business Group' },
  { id: 'category', label: 'Category' },
];

const CONDITIONS = [
  { id: 'equals', label: 'Equals' },
  { id: 'not_equals', label: 'Not Equals' },
  { id: 'includes', label: 'Includes' },
  { id: 'is_blank', label: 'Is Blank' },
  { id: 'is_not_blank', label: 'Is Not Blank' },
];

const ENUM_VALUES: Record<string, string[]> = {
  businessGroup: BUSINESS_GROUPS,
  category: Object.values(CATEGORIES).flat(),
};

function matchesFilter(project: ProjectItem, filter: AdvancedSearchFilter): boolean {
  if (!['is_blank', 'is_not_blank'].includes(filter.condition) && !filter.value) {
    return true;
  }

  const raw = (project as Record<string, unknown>)[filter.column];
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

export default function AdvancedProjectSearch({
  isOpen,
  onClose,
  selectionMode = 'single',
  initialProjects: poolData,
  contextLabel = 'Project',
}: AdvancedProjectSearchProps) {
  const pool = poolData ?? initialProjects;

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
  const PAGE_SIZE = 5;

  useEffect(() => {
    if (isOpen) {
      setFilters([{ column: 'name', condition: 'includes', value: '' }]);
      setAppliedFilters([]);
      setGlobalSearch('');
      setSelected(new Set());
      setHasSearched(false);
      setCurrentPage(1);
    }
  }, [isOpen]);

  const results = useMemo<ProjectItem[]>(() => {
    if (!hasSearched && !globalSearch) return [];
    let list = [...pool];

    if (globalSearch) {
      const q = globalSearch.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.projectId.toLowerCase().includes(q)
      );
    }

    appliedFilters.forEach(f => {
      if (f.condition === 'is_blank' || f.condition === 'is_not_blank' || f.value) {
        list = list.filter(p => matchesFilter(p, f));
      }
    });

    list.sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sortCol] ?? '');
      const bv = String((b as Record<string, unknown>)[sortCol] ?? '');
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [pool, appliedFilters, globalSearch, sortCol, sortDir, hasSearched]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedResults = results.slice(startIndex, startIndex + PAGE_SIZE);

  const addFilter = () => setFilters(f => [...f, { column: 'name', condition: 'includes', value: '' }]);
  const updateFilter = (i: number, updated: AdvancedSearchFilter) => setFilters(f => f.map((x, idx) => (idx === i ? updated : x)));
  const removeFilter = (i: number) => setFilters(f => f.filter((_, idx) => idx !== i));
  const applyFilters = () => { setAppliedFilters([...filters]); setHasSearched(true); setCurrentPage(1); };

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('asc'); }
  };

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
    const selectedProjects = pool.filter(p => selected.has(p.id));
    onClose(selectedProjects);
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
      <div className="fixed inset-0 bg-night/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full" style={{ maxWidth: 900, maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-pebble flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky/10 flex items-center justify-center">
              <Search className="w-4 h-4 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-base" style={{ fontWeight: 600 }}>Advanced Search — {contextLabel}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{selectionMode === 'single' ? 'Select one project' : 'Select one or more projects'}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        <div className="px-6 py-4 border-b border-pebble bg-earth/40 flex-shrink-0 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={globalSearch} onChange={e => { setGlobalSearch(e.target.value); setHasSearched(true); setCurrentPage(1); }}
                placeholder="Quick search by name or ID..."
                className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky" />
              {globalSearch && <button onClick={() => setGlobalSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
            </div>
          </div>

          <div className="space-y-2">
            {filters.map((f, i) => <FilterRow key={i} filter={f} index={i} onChange={updateFilter} onRemove={removeFilter} />)}
          </div>

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <button onClick={addFilter} className="flex items-center gap-1.5 text-sm text-sky hover:text-dark transition-colors">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-sky/10"><span className="text-sky text-lg leading-none mb-0.5">+</span></span> Add Filter
            </button>
            <button onClick={applyFilters} className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors">Apply Filters</button>
            {(appliedFilters.length > 0 || globalSearch) && (
              <button onClick={() => { setFilters([{ column: 'name', condition: 'includes', value: '' }]); setAppliedFilters([]); setGlobalSearch(''); setHasSearched(false); }} className="text-sm text-gray-500 hover:text-red-500 transition-colors">Clear All</button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {!hasSearched && !globalSearch ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Enter search criteria and click <strong>Apply Filters</strong></p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No projects match your criteria</p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-earth border-b border-pebble sticky top-0 z-10">
                <tr>
                  <th className="w-10 px-4 py-3 text-xs uppercase tracking-wide text-left text-gray-500">{selectionMode === 'multi' ? 'Select' : ''}</th>
                  {[
                    { id: 'name', label: 'Project Name' },
                    { id: 'projectId', label: 'Project ID' },
                    { id: 'type', label: 'Type' },
                    { id: 'status', label: 'Status' },
                    { id: 'businessGroup', label: 'Business Group' },
                  ].map(col => (
                    <th key={col.id} onClick={() => handleSort(col.id)} className="px-4 py-3 text-left text-xs uppercase tracking-wide text-gray-500 cursor-pointer hover:text-night whitespace-nowrap select-none">
                      <div className="flex items-center">{col.label} <SortIcon col={col.id} /></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedResults.map((project, idx) => {
                  const isSelected = selected.has(project.id);
                  return (
                    <tr key={project.id} onClick={() => toggleSelect(project.id)} className={`border-b border-pebble cursor-pointer transition-colors ${isSelected ? 'bg-pale/40 border-sky/20' : idx % 2 === 0 ? 'bg-white hover:bg-earth/40' : 'bg-earth/20 hover:bg-earth/60'}`}>
                      <td className="px-4 py-3">
                        {selectionMode === 'single' ? (
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-sky bg-sky' : 'border-gray-300'}`}>{isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div>
                        ) : (
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-sky bg-sky' : 'border-gray-300'}`}>{isSelected && <Check className="w-2.5 h-2.5 text-white" />}</div>
                        )}
                      </td>
                      <td className="px-4 py-3"><div className="text-night" style={{ fontWeight: 500 }}>{project.name}</div></td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-mono">{project.projectId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{project.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{project.status}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{project.businessGroup}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {hasSearched && results.length > 0 && (
          <TablePagination currentPage={currentPage} totalPages={totalPages} totalRecords={results.length} startIndex={startIndex} itemsPerPage={PAGE_SIZE} label="results" onPrev={() => setCurrentPage(p => Math.max(1, p - 1))} onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))} onPageSelect={setCurrentPage} />
        )}

        <div className="flex items-center justify-between px-6 py-4 border-t border-pebble bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={handleClose} className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors">Cancel</button>
            <button onClick={handleClose} disabled={selected.size === 0} className="px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Close &amp; Apply{selected.size > 0 ? ` (${selected.size})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
