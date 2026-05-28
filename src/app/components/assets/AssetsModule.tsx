import { useState, useRef, useEffect } from 'react';
import { Plus, Search, X, ChevronDown, ChevronUp, Check, MoreHorizontal, Archive, Sparkles, ChevronLeft, ChevronRight, Bookmark, Lock, Globe, Trash2, Edit2, Save, RotateCcw, Filter } from 'lucide-react';
import FilterListIcon from "@mui/icons-material/FilterList";
import type { Asset, AssetLifecycle, AssetSubtype } from '../../types';
import { CURRENT_USER } from '../../types';
import AssetsTable from './AssetsTable';
import CreateAssetModal from './CreateAssetModal';
export interface AssetSavedView {
  id: string;
  name: string;
  owner: string;
  isShared: boolean;
  filters: {
    lifecycle: string[];
    subtype: string[];
    businessGroup: string[];
    geography: string[];
    searchQuery: string;
  };
  columns: string[];
  sortBy: string | null;
  sortDir: 'asc' | 'desc' | null;
  createdAt: string;
}

const LIFECYCLE_OPTIONS: AssetLifecycle[] = ['Proposed', 'Assessed', 'Not Used'];
const SUBTYPE_OPTIONS: AssetSubtype[] = [
  'TV Commercial', 'Digital Banner', 'Print Ad', 'Packaging Artwork',
  'Product Video', 'Social Media Kit', 'Audio Ad', 'In-Store Display',
  'Email Template', 'Brochure'
];

function QuickFilterDropdown<T extends string>({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: T[];
  selected: T[];
  onToggle: (v: T) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors whitespace-nowrap ${
          selected.length > 0
            ? 'border-sky bg-pale text-sky font-medium'
            : 'border-pebble text-gray-600 hover:border-sky hover:bg-earth'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="bg-sky text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{selected.length}</span>
        )}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 min-w-[180px] overflow-hidden">
          <div className="px-3 py-2 border-b border-pebble flex items-center justify-between">
            <span className="text-xs font-semibold text-night">{label}</span>
            {selected.length > 0 && (
              <button onClick={() => { onClear(); }} className="text-xs text-sky hover:underline">Clear</button>
            )}
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {options.map(opt => (
              <button
                key={opt ?? 'null'}
                onClick={() => onToggle(opt)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  selected.includes(opt) ? 'bg-pale text-sky' : 'text-gray-700 hover:bg-earth'
                }`}
              >
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  selected.includes(opt) ? 'bg-sky border-sky' : 'border-pebble'
                }`}>
                  {selected.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                {opt ?? '—'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AssetsModuleProps {
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
  activeLibraryView: string;
  onLibraryViewChange: (view: string) => void;
  onAssetClick: (asset: Asset) => void;
  externalSearchQuery?: string;
  savedViews: AssetSavedView[];
  onSavedViewsChange: (views: AssetSavedView[]) => void;
}

export default function AssetsModule({
  assets,
  onAssetsChange,
  activeLibraryView,
  onLibraryViewChange,
  onAssetClick,
  externalSearchQuery,
  savedViews,
  onSavedViewsChange,
}: AssetsModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [lifecycleFilter, setLifecycleFilter] = useState<AssetLifecycle[]>([]);
  const [subtypeFilter, setSubtypeFilter] = useState<AssetSubtype[]>([]);
  const [businessGroupFilter, setBusinessGroupFilter] = useState<string[]>([]);
  const [geographyFilter, setGeographyFilter] = useState<string[]>([]);
  const [cbpFilter, setCbpFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [createdByFilter, setCreatedByFilter] = useState<string[]>([]);
  
  // Customizable quick filters
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>(['Lifecycle State', 'Subtype', 'Business Group', 'Geography']);
  const [isQuickFilterMenuOpen, setIsQuickFilterMenuOpen] = useState(false);
  const [localQuickFilters, setLocalQuickFilters] = useState<string[]>([]);
  const AVAILABLE_QUICK_FILTERS = ['Lifecycle State', 'Subtype', 'Business Group', 'Category', 'Geography', 'Consumer Benefit Platform', 'Created By'];

  // Saved Views state
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [showSavedViews, setShowSavedViews] = useState(false);
  const [dropdownMode, setDropdownMode] = useState<'list' | 'create' | 'rename' | 'delete-confirm'>('list');
  const [newName, setNewName] = useState('');
  const [newShared, setNewShared] = useState(false);
  const [nameError, setNameError] = useState('');
  const savedViewsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (savedViewsDropdownRef.current && !savedViewsDropdownRef.current.contains(e.target as Node)) {
        setShowSavedViews(false);
        setDropdownMode('list');
        setNewName('');
        setNameError('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Synchronize view selection and filters (resetting when appropriate)
  useEffect(() => {
    if (activeLibraryView.startsWith('Saved View: ')) {
      const viewName = activeLibraryView.replace('Saved View: ', '');
      const found = savedViews.find(v => v.name === viewName);
      if (found) {
        if (activeViewId !== found.id) {
          setLifecycleFilter(found.filters.lifecycle as AssetLifecycle[] || []);
          setSubtypeFilter(found.filters.subtype as AssetSubtype[] || []);
          setBusinessGroupFilter(found.filters.businessGroup || []);
          setGeographyFilter(found.filters.geography || []);
          setCategoryFilter(found.filters.category || []);
          setCreatedByFilter(found.filters.createdBy || []);
          if (found.filters.searchQuery !== undefined) setSearchQuery(found.filters.searchQuery);
          setActiveViewId(found.id);
        }
      }
    } else {
      setActiveViewId(null);
      setLifecycleFilter([]);
      setSubtypeFilter([]);
      setBusinessGroupFilter([]);
      setGeographyFilter([]);
      setCategoryFilter([]);
      setCreatedByFilter([]);
      setSearchQuery('');
    }
  }, [activeLibraryView, savedViews]);

  // Extract unique values from assets
  const uniqueBusinessGroups = Array.from(new Set(assets.map(a => a.businessGroup))).sort();
  const uniqueGeographies = Array.from(new Set(assets.flatMap(a => a.geography))).sort();
  const uniqueCategories = Array.from(new Set(assets.map(a => a.category))).filter(Boolean).sort();
  const uniqueCreatedBy = Array.from(new Set(assets.map(a => a.createdBy))).filter(Boolean).sort();

  // Filter by active library view
  const viewFilteredAssets = assets.filter(asset => {
    if (activeLibraryView === 'My Assets') {
      const creator = (asset.createdBy || '').toLowerCase();
      const isCreator = creator === 'current user' || 
                        creator === CURRENT_USER.toLowerCase() ||
                        creator.includes('sarah');
      
      const isApprover = asset.approvalWorkflow?.approvers.some(
        a => {
          const name = (a.name || '').toLowerCase();
          return name === 'current user' || 
                 name === CURRENT_USER.toLowerCase() ||
                 name.includes('sarah');
        }
      ) ?? false;

      const isUploader = asset.versions.some(
        v => {
          const uploader = (v.uploadedBy || '').toLowerCase();
          return uploader === 'current user' || 
                 uploader === CURRENT_USER.toLowerCase() ||
                 uploader.includes('sarah');
        }
      );

      const isCommenter = asset.assetLevelComments.some(
        c => {
          const author = (c.author || '').toLowerCase();
          return author === 'current user' || 
                 author === CURRENT_USER.toLowerCase() ||
                 author.includes('sarah');
        }
      );

      return isCreator || isApprover || isUploader || isCommenter;
    }
    if (activeLibraryView === 'Favorites') {
      return asset.isFavorite;
    }
    if (activeLibraryView === 'Recently Viewed') {
      // Show assets modified in last 30 days OR marked as recently accessed
      const date = new Date(asset.modifiedAt);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    if (activeLibraryView === 'Other Say / Brand Say B&W') {
      return asset.otherBrandSay === true;
    }
    return true; // All Assets
  });

  // Apply additional filters
  const filteredAssets = viewFilteredAssets.filter(asset => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      asset.name.toLowerCase().includes(searchLower) ||
      asset.id.toLowerCase().includes(searchLower) ||
      asset.businessGroup.toLowerCase().includes(searchLower) ||
      (asset.subtype && asset.subtype.toLowerCase().includes(searchLower));

    // Lifecycle filter
    const matchesLifecycle = lifecycleFilter.length === 0 || lifecycleFilter.includes(asset.lifecycleStage);

    // Subtype filter
    const matchesSubtype = subtypeFilter.length === 0 || (asset.subtype && subtypeFilter.includes(asset.subtype));

    // Business Group filter
    const matchesBusinessGroup = businessGroupFilter.length === 0 || businessGroupFilter.includes(asset.businessGroup);

    // Geography filter
    const matchesGeography = geographyFilter.length === 0 ||
      geographyFilter.some(geo => asset.geography.includes(geo));

    // CBP filter
    const matchesCbp = cbpFilter.length === 0 || 
      (asset.consumerBenefitPlatform && cbpFilter.some(cbp => asset.consumerBenefitPlatform?.includes(cbp)));

    // Category filter
    const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(asset.category);

    // Created By filter
    const matchesCreatedBy = createdByFilter.length === 0 || createdByFilter.includes(asset.createdBy);

    return matchesSearch && matchesLifecycle && matchesSubtype && matchesBusinessGroup && matchesGeography && matchesCbp && matchesCategory && matchesCreatedBy;
  });

  const getPageHeading = () => {
    if (activeLibraryView === 'My Assets') return 'My Assets';
    if (activeLibraryView === 'Favorites') return 'Favorite Assets';
    if (activeLibraryView === 'Recently Viewed') return 'Recent Assets';
    return 'Assets';
  };

  const handleRemoveFilter = (category: string, value: string) => {
    if (category === 'lifecycle') setLifecycleFilter(prev => prev.filter(x => x !== value));
    if (category === 'subtype') setSubtypeFilter(prev => prev.filter(x => x !== value));
    if (category === 'businessGroup') setBusinessGroupFilter(prev => prev.filter(x => x !== value));
    if (category === 'geography') setGeographyFilter(prev => prev.filter(x => x !== value));
    if (category === 'cbp') setCbpFilter(prev => prev.filter(x => x !== value));
    if (category === 'category') setCategoryFilter(prev => prev.filter(x => x !== value));
    if (category === 'createdBy') setCreatedByFilter(prev => prev.filter(x => x !== value));
  };

  const clearAllFilters = () => {
    setLifecycleFilter([]);
    setSubtypeFilter([]);
    setBusinessGroupFilter([]);
    setGeographyFilter([]);
    setCbpFilter([]);
    setCategoryFilter([]);
    setCreatedByFilter([]);
    setSearchQuery('');
    setActiveViewId(null);
    onLibraryViewChange('All Assets');
  };

  const handleApplyView = (view: AssetSavedView) => {
    setLifecycleFilter(view.filters.lifecycle as AssetLifecycle[] || []);
    setSubtypeFilter(view.filters.subtype as AssetSubtype[] || []);
    setBusinessGroupFilter(view.filters.businessGroup || []);
    setGeographyFilter(view.filters.geography || []);
    setCategoryFilter(view.filters.category || []);
    setCreatedByFilter(view.filters.createdBy || []);
    if (view.filters.searchQuery !== undefined) setSearchQuery(view.filters.searchQuery);
    setActiveViewId(view.id);
    onLibraryViewChange('Saved View: ' + view.name);
  };

  const handleSaveView = (view: AssetSavedView) => {
    onSavedViewsChange([...savedViews, view]);
  };

  const handleDeleteView = (id: string) => {
    onSavedViewsChange(savedViews.filter(v => v.id !== id));
    if (activeViewId === id) {
      setActiveViewId(null);
      onLibraryViewChange('All Assets');
    }
  };

  const handleBulkAction = (action: string) => {
    const selectedAssets = assets.filter(a => selectedIds.includes(a.id));

    switch (action) {
      case 'reclassify':
        console.log('Reclassify assets:', selectedAssets);
        alert(`Reclassify ${selectedAssets.length} asset(s)...`);
        break;
      case 'change-lifecycle':
        console.log('Change lifecycle:', selectedAssets);
        alert(`Change lifecycle for ${selectedAssets.length} asset(s)...`);
        break;
      case 'run-sparci':
        console.log('Run SPARCi:', selectedAssets);
        alert(`Run SPARCi on ${selectedAssets.length} asset(s)...`);
        break;
      case 'archive':
        onAssetsChange(assets.map(a =>
          selectedIds.includes(a.id) ? { ...a, lifecycleStage: 'Not Used' as AssetLifecycle, updatedAt: new Date().toISOString() } : a
        ));
        break;
      case 'export':
        console.log('Export assets:', selectedAssets);
        alert(`Exporting ${selectedAssets.length} asset(s)...`);
        break;
    }

    setSelectedIds([]);
    setIsBulkMenuOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        {/* Row 1: Title + Create button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 relative">
            <h1 className="text-night flex items-center gap-2">
              {activeViewId
                ? savedViews.find(v => v.id === activeViewId)?.name || 'Saved View'
                : getPageHeading()}
            </h1>

            {activeViewId && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  savedViews.find(v => v.id === activeViewId)?.owner === 'Current User'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                {savedViews.find(v => v.id === activeViewId)?.owner === 'Current User'
                  ? 'My View'
                  : 'Shared View'}
              </span>
            )}

            <div className="relative" ref={savedViewsDropdownRef}>
              <button
                onClick={() => {
                  setShowSavedViews(prev => !prev);
                  setDropdownMode('list');
                }}
                className={`p-1.5 border rounded-lg transition-colors hover:bg-earth hover:border-sky flex items-center justify-center ${showSavedViews || activeViewId ? 'border-sky text-sky bg-pale' : 'border-pebble text-gray-500 hover:text-night'}`}
                title="Saved Views"
              >
                <ChevronDown className="w-4 h-4" />
              </button>

              {showSavedViews && (
                <div className="absolute left-0 mt-1.5 w-72 bg-white border border-pebble rounded-xl shadow-xl z-40 py-1.5 overflow-hidden">
                  {dropdownMode === 'list' && (
                    <div className="py-1">
                      {/* Active View options */}
                      {activeViewId && (
                        <>
                          <button
                            onClick={() => {
                              const activeView = savedViews.find(v => v.id === activeViewId);
                              if (activeView && activeView.owner === 'Current User') {
                                onSavedViewsChange(savedViews.map(v => v.id === activeViewId ? {
                                  ...v,
                                  filters: {
                                    lifecycle: lifecycleFilter,
                                    subtype: subtypeFilter,
                                    businessGroup: businessGroupFilter,
                                    geography: geographyFilter,
                                    category: categoryFilter,
                                    createdBy: createdByFilter,
                                    searchQuery
                                  }
                                } : v));
                                alert('View updated with current filters');
                              } else {
                                alert('Cannot overwrite shared view. Use Save as New View.');
                              }
                              setShowSavedViews(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                          >
                            <Save className="w-4 h-4 text-gray-400" />
                            Save Current View
                          </button>
                          
                          {savedViews.find(v => v.id === activeViewId)?.owner === 'Current User' && (
                            <>
                              <button
                                onClick={() => {
                                  const activeView = savedViews.find(v => v.id === activeViewId);
                                  setNewName(activeView?.name || '');
                                  setNewShared(activeView?.isShared || false);
                                  setDropdownMode('rename');
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                              >
                               <Edit2 className="w-4 h-4 text-gray-400" />
                               Rename View
                              </button>

                              <button
                                onClick={() => {
                                  setDropdownMode('delete-confirm');
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete View
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => {
                              setActiveViewId(null);
                              clearAllFilters();
                              setShowSavedViews(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-600 hover:bg-earth transition-colors text-left border-t border-pebble"
                          >
                            <X className="w-4 h-4" />
                            Clear Active View
                          </button>

                          <div className="border-t border-pebble my-1" />
                        </>
                      )}

                      {/* Save Current View (when not active) */}
                      {!activeViewId && (
                        <button
                          onClick={() => {
                            setNewName('');
                            setNewShared(false);
                            setDropdownMode('create');
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-night hover:bg-earth transition-colors text-left"
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                          Save Current View
                        </button>
                      )}

                      {/* Saved Views List */}
                      <div className="px-3.5 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        My Saved Views
                      </div>
                      <div className="max-h-48 overflow-y-auto px-1 space-y-0.5">
                        {savedViews.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-2 bg-earth rounded-lg my-1">
                            No saved views
                          </div>
                        ) : (
                          savedViews.map(view => {
                            const isMyView = view.owner === 'Current User';
                            return (
                              <button
                                key={view.id}
                                onClick={() => {
                                  handleApplyView(view);
                                  setShowSavedViews(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${activeViewId === view.id ? 'bg-pale text-sky font-medium' : 'text-gray-600 hover:bg-earth'}`}
                              >
                                <span className="truncate flex-1 text-left">{view.name}</span>
                                <span className="flex items-center gap-1">
                                  {isMyView ? (
                                    view.isShared ? <Globe className="w-3 h-3 text-gray-400" /> : <Lock className="w-3 h-3 text-gray-300" />
                                  ) : (
                                    <span className="text-[9px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded">Shared</span>
                                  )}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {dropdownMode === 'create' && (
                    <div className="px-3.5 py-3 space-y-3">
                      <div className="text-xs font-semibold text-night">Save Current View</div>
                      <div>
                        <input
                          type="text"
                          value={newName}
                          onChange={e => { setNewName(e.target.value); setNameError(''); }}
                          placeholder="View name..."
                          className="w-full px-2.5 py-1.5 border border-pebble rounded-lg text-xs text-night focus:outline-none focus:ring-1 focus:ring-sky bg-white"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = newName.trim();
                              if (!trimmed) { setNameError('Required'); return; }
                              const duplicate = savedViews.some(v => v.name.toLowerCase() === trimmed.toLowerCase() && v.owner === 'Current User');
                              if (duplicate) { setNameError('Exists'); return; }
                              const newView: AssetSavedView = {
                                id: `asv-${Date.now()}`,
                                name: trimmed,
                                owner: 'Current User',
                                isShared: newShared,
                                filters: {
                                  lifecycle: lifecycleFilter,
                                  subtype: subtypeFilter,
                                  businessGroup: businessGroupFilter,
                                  geography: geographyFilter,
                                  category: categoryFilter,
                                  createdBy: createdByFilter,
                                  searchQuery: searchQuery
                                },
                                columns: [],
                                sortBy: null,
                                sortDir: null,
                                createdAt: new Date().toISOString()
                              };
                              handleSaveView(newView);
                              handleApplyView(newView);
                              setDropdownMode('list');
                              setNewName('');
                              setNameError('');
                              setShowSavedViews(false);
                            }
                          }}
                        />
                        {nameError && <p className="text-[10px] text-red-500 mt-1">{nameError}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNewShared(false)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border text-[10px] transition-colors ${!newShared ? 'border-sky bg-pale text-sky font-medium' : 'border-pebble text-gray-500 hover:bg-earth'}`}
                        >
                          <Lock className="w-3 h-3" /> Private
                        </button>
                        <button
                          onClick={() => setNewShared(true)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border text-[10px] transition-colors ${newShared ? 'border-sky bg-pale text-sky font-medium' : 'border-pebble text-gray-500 hover:bg-earth'}`}
                        >
                          <Globe className="w-3 h-3" /> Shared
                        </button>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble">
                        <button
                          onClick={() => { setDropdownMode('list'); setNewName(''); setNameError(''); }}
                          className="px-2.5 py-1 text-[11px] text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const trimmed = newName.trim();
                            if (!trimmed) { setNameError('Required'); return; }
                            const duplicate = savedViews.some(v => v.name.toLowerCase() === trimmed.toLowerCase() && v.owner === 'Current User');
                            if (duplicate) { setNameError('Exists'); return; }
                            const newView: AssetSavedView = {
                              id: `asv-${Date.now()}`,
                              name: trimmed,
                              owner: 'Current User',
                              isShared: newShared,
                              filters: {
                                lifecycle: lifecycleFilter,
                                subtype: subtypeFilter,
                                businessGroup: businessGroupFilter,
                                geography: geographyFilter,
                                searchQuery: searchQuery
                              },
                              columns: [],
                              sortBy: null,
                              sortDir: null,
                              createdAt: new Date().toISOString()
                            };
                            handleSaveView(newView);
                            handleApplyView(newView);
                            setDropdownMode('list');
                            setNewName('');
                            setNameError('');
                            setShowSavedViews(false);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-sky text-white rounded-lg hover:bg-dark transition-colors font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {dropdownMode === 'rename' && (
                    <div className="px-3.5 py-3 space-y-3">
                      <div className="text-xs font-semibold text-night">Rename View</div>
                      <div>
                        <input
                          type="text"
                          value={newName}
                          onChange={e => { setNewName(e.target.value); setNameError(''); }}
                          placeholder="View name..."
                          className="w-full px-2.5 py-1.5 border border-pebble rounded-lg text-xs text-night focus:outline-none focus:ring-1 focus:ring-sky bg-white"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = newName.trim();
                              if (!trimmed) { setNameError('Required'); return; }
                              onSavedViewsChange(savedViews.map(v => v.id === activeViewId ? { ...v, name: trimmed, isShared: newShared } : v));
                              setDropdownMode('list');
                              setNewName('');
                              setNameError('');
                              setShowSavedViews(false);
                            }
                          }}
                        />
                        {nameError && <p className="text-[10px] text-red-500 mt-1">{nameError}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setNewShared(false)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border text-[10px] transition-colors ${!newShared ? 'border-sky bg-pale text-sky font-medium' : 'border-pebble text-gray-500 hover:bg-earth'}`}
                        >
                          <Lock className="w-3 h-3" /> Private
                        </button>
                        <button
                          onClick={() => setNewShared(true)}
                          className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg border text-[10px] transition-colors ${newShared ? 'border-sky bg-pale text-sky font-medium' : 'border-pebble text-gray-500 hover:bg-earth'}`}
                        >
                          <Globe className="w-3 h-3" /> Shared
                        </button>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-pebble">
                        <button
                          onClick={() => { setDropdownMode('list'); setNewName(''); setNameError(''); }}
                          className="px-2.5 py-1 text-[11px] text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const trimmed = newName.trim();
                            if (!trimmed) { setNameError('Required'); return; }
                            onSavedViewsChange(savedViews.map(v => v.id === activeViewId ? { ...v, name: trimmed, isShared: newShared } : v));
                            setDropdownMode('list');
                            setNewName('');
                            setNameError('');
                            setShowSavedViews(false);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-sky text-white rounded-lg hover:bg-dark transition-colors font-medium"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  {dropdownMode === 'delete-confirm' && (
                    <div className="px-3.5 py-3 space-y-3">
                      <div className="text-xs font-semibold text-night">Delete View</div>
                      <p className="text-xs text-gray-500">Are you sure you want to delete this view? This action cannot be undone.</p>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => setDropdownMode('list')}
                          className="px-2.5 py-1 text-[11px] text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            if (activeViewId) {
                              handleDeleteView(activeViewId);
                            }
                            setDropdownMode('list');
                            setShowSavedViews(false);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Asset
          </button>
        </div>

        {/* Row 2: Search + Quick Filters toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Dedicated Filter Button - Triggers Popup identical to Projects page */}
          <div>
            <button
              onClick={() => {
                setLocalQuickFilters(activeQuickFilters);
                setIsQuickFilterMenuOpen(true);
              }}
              className="flex items-center gap-2 px-3 py-2 border border-pebble text-sm text-gray-600 rounded-lg hover:bg-earth hover:border-sky transition-colors"
            >
              <FilterListIcon sx={{ fontSize: 16 }} />
              <span className="hidden sm:inline">Add Quick Filters</span>
            </button>
          </div>

          {/* Quick Filters */}
          {activeQuickFilters.includes('Lifecycle State') && (
            <QuickFilterDropdown<AssetLifecycle>
              label="Lifecycle State"
              options={LIFECYCLE_OPTIONS}
              selected={lifecycleFilter}
              onToggle={v => setLifecycleFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setLifecycleFilter([])}
            />
          )}
          {activeQuickFilters.includes('Subtype') && (
            <QuickFilterDropdown<AssetSubtype>
              label="Subtype"
              options={SUBTYPE_OPTIONS}
              selected={subtypeFilter}
              onToggle={v => setSubtypeFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setSubtypeFilter([])}
            />
          )}
          {activeQuickFilters.includes('Business Group') && uniqueBusinessGroups.length > 0 && (
            <QuickFilterDropdown<string>
              label="Business Group"
              options={uniqueBusinessGroups}
              selected={businessGroupFilter}
              onToggle={v => setBusinessGroupFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setBusinessGroupFilter([])}
            />
          )}
          {activeQuickFilters.includes('Geography') && uniqueGeographies.length > 0 && (
            <QuickFilterDropdown<string>
              label="Geography"
              options={uniqueGeographies}
              selected={geographyFilter}
              onToggle={v => setGeographyFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setGeographyFilter([])}
            />
          )}
          {activeQuickFilters.includes('Consumer Benefit Platform') && (
            <QuickFilterDropdown<string>
              label="CBP"
              options={['Healthy Hair', 'Skin Brightening', 'Deep Clean', '48h Protection', 'Stain Removal']}
              selected={cbpFilter}
              onToggle={v => setCbpFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setCbpFilter([])}
            />
          )}
          {activeQuickFilters.includes('Category') && uniqueCategories.length > 0 && (
            <QuickFilterDropdown<string>
              label="Category"
              options={uniqueCategories}
              selected={categoryFilter}
              onToggle={v => setCategoryFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setCategoryFilter([])}
            />
          )}
          {activeQuickFilters.includes('Created By') && uniqueCreatedBy.length > 0 && (
            <QuickFilterDropdown<string>
              label="Created By"
              options={uniqueCreatedBy}
              selected={createdByFilter}
              onToggle={v => setCreatedByFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setCreatedByFilter([])}
            />
          )}
        </div>
      </div>

      <div className="flex-1 p-5 overflow-hidden flex flex-col gap-3">
        <AssetsTable
          assets={filteredAssets}
          onAssetClick={onAssetClick}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onAssetsChange={onAssetsChange}
          onBulkAction={handleBulkAction}
          appliedFilters={{
            lifecycle: lifecycleFilter,
            subtype: subtypeFilter,
            businessGroup: businessGroupFilter,
            geography: geographyFilter,
            cbp: cbpFilter,
            category: categoryFilter,
            createdBy: createdByFilter,
          }}
          onRemoveFilter={handleRemoveFilter}
          onClearFilters={clearAllFilters}
          activeLibraryView={activeViewId ? (savedViews.find(v => v.id === activeViewId)?.name || 'Saved View') : activeLibraryView}
        />
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateAssetModal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={(partial) => {
            const now = new Date().toISOString();
            const num = String(assets.length + 1).padStart(3, '0');
            const newAsset: Asset = {
              id: `AT-${num}`,
              name: partial.name || '',
              subtype: partial.subtype || null,
              businessGroup: partial.businessGroup || '',
              category: partial.category || '',
              currentVersionNumber: '1.0',
              versions: [{
                versionNumber: '1.0',
                fileType: partial.isPlaceholder ? 'placeholder' : 'image',
                fileSizeMB: 0,
                uploadedAt: now,
                uploadedBy: 'Current User',
                riskRecords: [],
                finalRisk: { finalRiskLevel: null, marketingRiskSignoff: false },
              }],
              lifecycleStage: partial.lifecycleStage || 'Proposed',
              isPlaceholder: partial.isPlaceholder || false,
              geography: partial.geography || [],
              linkedClaimIds: partial.linkedClaimIds || [],
              linkedProjectIds: partial.linkedProjectIds || [],
              relatedAssetIds: partial.relatedAssetIds || [],
              anchors: partial.anchors || [],
              assetLevelComments: partial.assetLevelComments || [],
              approvalWorkflow: partial.approvalWorkflow || null,
              auditLog: partial.auditLog || [],
              createdAt: partial.createdAt || now,
              modifiedAt: partial.modifiedAt || now,
              createdBy: partial.createdBy || 'Current User',
              isFavorite: partial.isFavorite || false,
            };
            onAssetsChange([...assets, newAsset]);
            setIsCreateModalOpen(false);
          }}
        />
      )}

      {/* Quick Filter Modal Popup - Styled identically to Projects FilterPanel */}
      {isQuickFilterMenuOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pale rounded-lg">
                  <Filter className="w-4 h-4 text-sky" />
                </div>
                <div>
                  <h2 className="text-night">Add Quick Filters</h2>
                  {localQuickFilters.length > 0 && (
                    <p className="text-xs text-sky mt-0.5">
                      {`${localQuickFilters.length} quick filter${localQuickFilters.length !== 1 ? 's' : ''} active`}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setIsQuickFilterMenuOpen(false)}
                className="p-2 hover:bg-earth rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-4 gap-6">
                {AVAILABLE_QUICK_FILTERS.map(filter => {
                  const isActive = localQuickFilters.includes(filter);
                  return (
                    <div
                      key={filter}
                      className="bg-white p-4 rounded-xl border border-pebble shadow-sm flex items-center justify-between"
                    >
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => {
                              setLocalQuickFilters(prev =>
                                prev.includes(filter)
                                  ? prev.filter(f => f !== filter)
                                  : [...prev, filter]
                              );
                            }}
                            className="w-4 h-4 text-sky rounded border-pebble focus:ring-sky cursor-pointer"
                          />
                          <h3 className="text-sm text-night font-bold">
                            {filter}
                          </h3>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-pebble flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => setLocalQuickFilters([])}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-night hover:bg-earth rounded-lg text-sm font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              </div>
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => setIsQuickFilterMenuOpen(false)}
                  className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuickFilters(localQuickFilters);
                    setIsQuickFilterMenuOpen(false);
                  }}
                  className="px-6 py-2 bg-sky text-white rounded-lg text-sm font-bold hover:bg-dark shadow-md active:scale-95 transition-all"
                >
                  Add Quick Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}