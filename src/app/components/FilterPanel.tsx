import { useState, useEffect } from 'react';
import { X, Filter, RotateCcw, Search } from 'lucide-react';
import {
  BUSINESS_GROUPS,
  CATEGORIES,
  PROJECT_SCOPES,
  PROJECT_TYPES,
  // REGIONS,
  STATUS_OPTIONS,
  LIFECYCLE_STAGES
} from '../types';

interface FilterPanelProps {
  isOpen: boolean;
  selectedCategory?: keyof FilterState | null;
  onShowAllFilters?: () => void;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;

  // 🔥 Optional dynamic quick filters
  quickFilters?: (keyof FilterState)[];
  onApplyQuickFilters?: (categories: (keyof FilterState)[]) => void;

  // Show Cancelled & Archived Projects toggle
  showArchived?: boolean;
  onToggleShowArchived?: (val: boolean) => void;
}

export interface FilterState {
  status: string[];
  lifecycleStage: string[];
  businessGroup: string[];
  projectType: string[];
  category: string[];
  scope: string[];
  projectLead: string[];
  claimsLead: string[];
}

// 🔥 Default Quick Filters (fallback)
const DEFAULT_QUICK_FILTERS: (keyof FilterState)[] = [
  'businessGroup',
  'category',
  'scope',
  'status'
];

const FILTER_OPTIONS: Record<keyof FilterState, string[]> = {
  status: STATUS_OPTIONS,
  lifecycleStage: LIFECYCLE_STAGES,
  businessGroup: BUSINESS_GROUPS,
  projectType: PROJECT_TYPES,
  category: Array.from(new Set(Object.values(CATEGORIES).flat())),
  scope: PROJECT_SCOPES,
  projectLead: [
    'Sarah Johnson', 'David Smith', 'Lisa Anderson', 'Robert Taylor',
    'Amanda Wilson', 'Christopher Lee', 'Daniel Garcia',
    'Matthew Jackson', 'Emma Williams', 'Jennifer Davis'
  ],
  claimsLead: [
    'Michael Chen', 'Emma Williams', 'James Brown', 'Jennifer Davis',
    'Thomas Moore', 'Patricia Martinez', 'Nancy Rodriguez', 'Karen White'
  ]
};

const SECTION_LABELS: Record<keyof FilterState, string> = {
  status: 'Status',
  lifecycleStage: 'Stage',
  businessGroup: 'Business Group',
  projectType: 'Project Type',
  category: 'Category',
  scope: 'Project Scope',
  projectLead: 'Project Creator',
  claimsLead: 'Claims Lead'
};

export default function FilterPanel({
  isOpen,
  selectedCategory,
  onShowAllFilters,
  onClose,
  onApplyFilters,
  currentFilters,
  quickFilters,
  onApplyQuickFilters,
  showArchived,
  onToggleShowArchived
}: FilterPanelProps) {

  const [filters, setFilters] = useState<FilterState>(() => ({
    status: [],
    lifecycleStage: [],
    businessGroup: [],
    projectType: [],
    category: [],
    scope: [],
    projectLead: [],
    claimsLead: [],
    ...currentFilters
  }));

  const [searchQueries, setSearchQueries] = useState<Record<keyof FilterState, string>>({
    status: '',
    lifecycleStage: '',
    businessGroup: '',
    projectType: '',
    category: '',
    scope: '',
    projectLead: '',
    claimsLead: ''
  });

  const [localQuickFilters, setLocalQuickFilters] = useState<(keyof FilterState)[]>(() => 
    quickFilters || DEFAULT_QUICK_FILTERS
  );

  useEffect(() => {
    if (isOpen && quickFilters) {
      setLocalQuickFilters(quickFilters);
    }
  }, [isOpen, quickFilters]);

  useEffect(() => {
    if (currentFilters) {
      setFilters(prev => ({
        status: [],
        lifecycleStage: [],
        businessGroup: [],
        projectType: [],
        category: [],
        scope: [],
        projectLead: [],
        claimsLead: [],
        ...currentFilters
      }));
    }
  }, [currentFilters]);

  if (!isOpen) return null;

  // 🔥 Use passed quick filters OR fallback
  const activeQuickFilters = quickFilters || DEFAULT_QUICK_FILTERS;

  const handleToggle = (category: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev?.[category] || [];
      const isRemoving = current.includes(value);
      const nextList = isRemoving
        ? current.filter(v => v !== value)
        : [...current, value];

      // US-M4-F04: Automatically add category to quick filters if it has active selections
      if (!isRemoving && !localQuickFilters.includes(category)) {
        setLocalQuickFilters(prevQuick => [...prevQuick, category]);
      }

      return {
        ...prev,
        [category]: nextList
      };
    });
  };

  const handleApply = () => {
    try {
      onApplyFilters(filters);
      if (onApplyQuickFilters) {
        onApplyQuickFilters(localQuickFilters);
      }
    } catch (e) {
      console.error('Error applying filters:', e);
    }
    onClose();
  };

  const handleClear = () => {
    setFilters({
      status: [],
      lifecycleStage: [],
      businessGroup: [],
      projectType: [],
      category: [],
      scope: [],
      projectLead: [],
      claimsLead: []
    });
    setLocalQuickFilters([]);
  };

  const totalActive = Object.values(filters || {}).reduce((s, arr) => s + (arr?.length || 0), 0);

  // 🔥 Render all categories in full filter popup so users can toggle quick filters
  const categoriesToRender = selectedCategory
    ? [selectedCategory]
    : (Object.keys(FILTER_OPTIONS) as (keyof FilterState)[]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${selectedCategory ? 'max-w-lg' : 'max-w-7xl'} max-h-[85vh] flex flex-col`}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pale rounded-lg">
              <Filter className="w-4 h-4 text-sky" />
            </div>
            <div>
              <h2 className="text-night">
                {selectedCategory ? SECTION_LABELS[selectedCategory] : 'Add Quick Filters'}
              </h2>
              {(selectedCategory ? totalActive > 0 : localQuickFilters.length > 0) && (
                <p className="text-xs text-sky mt-0.5">
                  {selectedCategory ? (
                    `${totalActive} filter${totalActive !== 1 ? 's' : ''} selected`
                  ) : (
                    `${localQuickFilters.length} quick filter${localQuickFilters.length !== 1 ? 's' : ''} active`
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedCategory && onShowAllFilters && (
              <button
                onClick={onShowAllFilters}
                className="text-xs text-sky hover:underline"
              >
                Show all filters
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          <div className={`${selectedCategory ? 'space-y-6' : 'grid grid-cols-4 gap-6'}`}>
            {categoriesToRender.map(category => {
              const options = FILTER_OPTIONS[category];
              const searchQuery = searchQueries[category];

              const filteredOptions = options.filter(option =>
                option.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return (
                <div key={category} className={`bg-white p-4 rounded-xl border border-pebble shadow-sm ${!selectedCategory ? 'flex items-center justify-between' : ''}`}>
                  <div className={`flex items-center gap-2 ${selectedCategory ? 'mb-3 border-b border-pebble pb-2 w-full justify-between' : 'w-full'}`}>
                    <div className="flex items-center gap-2">
                      {!selectedCategory && (
                        <input
                          type="checkbox"
                          checked={localQuickFilters.includes(category)}
                          onChange={() => {
                            setLocalQuickFilters(prev => 
                              prev.includes(category)
                                ? prev.filter(c => c !== category)
                                : [...prev, category]
                            );
                          }}
                          className="w-4 h-4 text-sky rounded border-pebble focus:ring-sky cursor-pointer"
                        />
                      )}
                      <h3 className="text-sm text-night font-bold">
                        {SECTION_LABELS[category]}
                      </h3>
                    </div>

                    {selectedCategory && (filters?.[category]?.length || 0) > 0 && (
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, [category]: [] }))}
                        className="text-xs text-sky font-semibold hover:underline"
                      >
                        Clear ({filters?.[category]?.length || 0})
                      </button>
                    )}
                  </div>

                  {selectedCategory && (
                    <>
                      {/* Search */}
                      {options.length > 5 && (
                        <div className="mb-3 relative">
                          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={e =>
                              setSearchQueries(prev => ({
                                ...prev,
                                [category]: e.target.value
                              }))
                            }
                            className="w-full pl-8 pr-3 py-2 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-2 focus:ring-sky focus:border-sky"
                          />
                        </div>
                      )}

                      {/* Options */}
                      <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                        {filteredOptions.length > 0 ? (
                          filteredOptions.map(option => {
                            const isChecked = (filters?.[category] || []).includes(option);

                            return (
                              <label
                                key={option}
                                className={`flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition-colors ${
                                  isChecked ? 'bg-pale' : 'hover:bg-earth'
                                }`}
                              >
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  isChecked ? 'bg-sky border-sky' : 'border-pebble'
                                }`}>
                                  {isChecked && <div className="w-2 h-2 bg-white rounded-sm" />}
                                </div>

                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggle(category, option)}
                                  className="sr-only"
                                />

                                <span className={`text-sm ${isChecked ? 'text-sky' : 'text-gray-700'}`}>
                                  {option}
                                </span>
                              </label>
                            );
                          })
                        ) : (
                          <div className="text-xs text-gray-400 px-3 py-4 text-center">
                            No results found
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-night hover:bg-earth rounded-lg text-sm font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear All Filters
            </button>

            {onToggleShowArchived && (
              <label className="flex items-center gap-2 cursor-pointer bg-earth px-3 py-2 border border-pebble rounded-lg text-xs font-bold text-gray-700 shadow-sm hover:border-gray-400 transition-colors">
                <input
                  type="checkbox"
                  checked={!!showArchived}
                  onChange={e => onToggleShowArchived(e.target.checked)}
                  className="w-4 h-4 text-sky rounded border-pebble focus:ring-sky cursor-pointer"
                />
                <span>Show Archived Projects</span>
              </label>
            )}
          </div>

          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth font-semibold"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 bg-sky text-white rounded-lg text-sm font-bold hover:bg-dark shadow-md active:scale-95 transition-all"
            >
              Add Quick Filters {selectedCategory && totalActive > 0 ? `(${totalActive})` : ''}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}