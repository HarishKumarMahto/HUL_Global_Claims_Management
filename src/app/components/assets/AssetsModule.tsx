import { useState, useRef, useEffect } from 'react';
import { Plus, Search, X, ChevronDown, ChevronUp, Check, MoreHorizontal, Archive, Sparkles, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import type { Asset, AssetLifecycle, AssetSubtype } from '../../types';
import { CURRENT_USER } from '../../types';
import AssetsTable from './AssetsTable';
import CreateAssetModal from './CreateAssetModal';
import SavedAssetViewsModal, { type AssetSavedView } from './SavedAssetViewsModal';

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
}

export default function AssetsModule({
  assets,
  onAssetsChange,
  activeLibraryView,
  onLibraryViewChange,
  onAssetClick,
  externalSearchQuery,
}: AssetsModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (externalSearchQuery !== undefined && externalSearchQuery !== '') {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [lifecycleFilter, setLifecycleFilter] = useState<AssetLifecycle[]>([]);
  const [subtypeFilter, setSubtypeFilter] = useState<AssetSubtype[]>([]);
  const [businessGroupFilter, setBusinessGroupFilter] = useState<string[]>([]);
  const [geographyFilter, setGeographyFilter] = useState<string[]>([]);
  const [cbpFilter, setCbpFilter] = useState<string[]>([]);
  
  // Customizable quick filters
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>(['Lifecycle State', 'Subtype', 'Business Group', 'Geography']);
  const [isQuickFilterMenuOpen, setIsQuickFilterMenuOpen] = useState(false);
  const AVAILABLE_QUICK_FILTERS = ['Lifecycle State', 'Subtype', 'Business Group', 'Category', 'Geography', 'Consumer Benefit Platform', 'Brand', 'Format', 'Product', 'Language', 'File Format', 'Related Projects', 'Created By'];

  // Saved Views state
  const [savedViews, setSavedViews] = useState<AssetSavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [showSavedViews, setShowSavedViews] = useState(false);

  // Extract unique values from assets
  const uniqueBusinessGroups = Array.from(new Set(assets.map(a => a.businessGroup))).sort();
  const uniqueGeographies = Array.from(new Set(assets.flatMap(a => a.geography))).sort();

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

    return matchesSearch && matchesLifecycle && matchesSubtype && matchesBusinessGroup && matchesGeography && matchesCbp;
  });

  const activeFilterCount =
    lifecycleFilter.length + subtypeFilter.length + businessGroupFilter.length + geographyFilter.length + cbpFilter.length;

  // Reset to page 1 when filters change
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAssets = filteredAssets.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const getPageHeading = () => {
    if (activeLibraryView === 'My Assets') return 'My Assets';
    if (activeLibraryView === 'Favorites') return 'Favorite Assets';
    if (activeLibraryView === 'Recently Viewed') return 'Recent Assets';
    return 'Assets';
  };

  const clearAllFilters = () => {
    setLifecycleFilter([]);
    setSubtypeFilter([]);
    setBusinessGroupFilter([]);
    setGeographyFilter([]);
    setCbpFilter([]);
    setSearchQuery('');
    setActiveViewId(null);
  };

  const handleApplyView = (view: AssetSavedView) => {
    setLifecycleFilter(view.filters.lifecycle as AssetLifecycle[]);
    setSubtypeFilter(view.filters.subtype as AssetSubtype[]);
    setBusinessGroupFilter(view.filters.businessGroup);
    setGeographyFilter(view.filters.geography);
    if (view.filters.searchQuery) setSearchQuery(view.filters.searchQuery);
    setActiveViewId(view.id);
  };

  const handleSaveView = (view: AssetSavedView) => {
    setSavedViews(prev => [...prev, view]);
  };

  const handleDeleteView = (id: string) => {
    setSavedViews(prev => prev.filter(v => v.id !== id));
    if (activeViewId === id) setActiveViewId(null);
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
          <h1 className="text-night">{getPageHeading()}</h1>
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

          {/* Add Quick Filters Button */}
          <div className="relative">
            <button
              onClick={() => setIsQuickFilterMenuOpen(!isQuickFilterMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-sky hover:text-sky transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Customize Filters
            </button>
            {isQuickFilterMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsQuickFilterMenuOpen(false)}></div>
                <div className="absolute left-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[200px] overflow-hidden">
                  <div className="px-3 py-2 border-b border-pebble bg-pale">
                    <span className="text-xs font-semibold text-night">Visible Quick Filters</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto py-1">
                    {AVAILABLE_QUICK_FILTERS.map(filter => {
                      const isActive = activeQuickFilters.includes(filter);
                      return (
                        <button
                          key={filter}
                          onClick={() => {
                            setActiveQuickFilters(prev => 
                              isActive ? prev.filter(f => f !== filter) : [...prev, filter]
                            );
                          }}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-earth ${isActive ? 'text-night' : 'text-gray-500'}`}
                        >
                          <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${isActive ? 'bg-sky border-sky' : 'border-pebble'}`}>
                            {isActive && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          {filter}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Result count + Clear all + Saved Views */}
          <div className="flex items-center gap-2 ml-auto text-xs text-gray-500">
            {activeViewId && (
              <span className="flex items-center gap-1 text-sky bg-pale border border-sky/30 px-2.5 py-1 rounded-full text-xs font-medium">
                <Bookmark className="w-3 h-3" />
                {savedViews.find(v => v.id === activeViewId)?.name || 'Saved View'}
                <button onClick={() => setActiveViewId(null)} className="ml-1 text-sky/60 hover:text-sky">×</button>
              </span>
            )}
            <span>Filters applied across {activeLibraryView.toLowerCase()} · <strong className="text-night">{filteredAssets.length}</strong> match{filteredAssets.length !== 1 ? 'es' : ''}</span>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-red-400 hover:text-red-600 transition-colors font-medium">Clear all</button>
            )}
            <button
              onClick={() => setShowSavedViews(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-colors text-xs whitespace-nowrap ${activeViewId ? 'border-sky text-sky bg-pale' : 'border-pebble text-gray-600 hover:border-sky hover:bg-earth'}`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved Views
              {savedViews.length > 0 && (
                <span className="bg-sky text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{savedViews.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="bg-pale border-b border-sky/20 px-6 py-2 flex items-center gap-3 flex-shrink-0">
          <span className="text-sm text-sky font-medium">{selectedIds.length} of {filteredAssets.length} selected</span>
          <div className="relative">
            <button
              onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 border border-sky text-sky rounded-lg text-sm hover:bg-sky hover:text-white transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
              Bulk Actions
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {isBulkMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsBulkMenuOpen(false)}></div>
                <div className="absolute left-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-20 min-w-[220px] overflow-hidden">
                  <button onClick={() => handleBulkAction('reclassify')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                    <Check className="w-4 h-4 text-sky" />
                    Reclassify Assets
                  </button>
                  <button onClick={() => handleBulkAction('change-lifecycle')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                    <Check className="w-4 h-4 text-green-500" />
                    Change Lifecycle State
                  </button>
                  <button onClick={() => handleBulkAction('run-sparci')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                    <Sparkles className="w-4 h-4 text-sky" />
                    Run SPARCi Analysis
                  </button>
                  <div className="border-t border-pebble my-1"></div>
                  <button onClick={() => handleBulkAction('archive')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-earth transition-colors">
                    <Archive className="w-4 h-4" />
                    Mark as Not Used
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-auto text-xs text-gray-500 hover:text-night transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table Area */}
      <div className="flex-1 p-5 overflow-hidden flex flex-col gap-3">
        <AssetsTable
          assets={paginatedAssets}
          onAssetClick={onAssetClick}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onAssetsChange={onAssetsChange}
        />
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 flex-shrink-0">
            <span className="text-xs text-gray-500">
              Showing {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filteredAssets.length)} of {filteredAssets.length} assets
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-pebble hover:bg-earth disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => {
                return p === 1 || p === totalPages || Math.abs(p - safePage) <= 1;
              }).reduce<(number | '...')[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, []).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm transition-colors ${
                      safePage === p
                        ? 'bg-sky text-white font-medium'
                        : 'border border-pebble hover:bg-earth text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-pebble hover:bg-earth disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
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

      <SavedAssetViewsModal
        isOpen={showSavedViews}
        onClose={() => setShowSavedViews(false)}
        views={savedViews}
        activeViewId={activeViewId}
        currentFilters={{
          lifecycle: lifecycleFilter,
          subtype: subtypeFilter,
          businessGroup: businessGroupFilter,
          geography: geographyFilter,
          searchQuery,
        }}
        currentColumns={[]}
        currentSort={{ sortBy: null, sortDir: null }}
        onSaveView={handleSaveView}
        onDeleteView={handleDeleteView}
        onApplyView={handleApplyView}
      />
    </div>
  );
}