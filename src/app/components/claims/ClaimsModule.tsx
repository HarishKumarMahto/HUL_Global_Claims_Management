import { useState, useRef, useEffect } from 'react';
import { Plus, Search, Filter, X, ChevronDown, MoreHorizontal, AlertCircle, Check, XCircle, Archive, FileText, Sparkles, ChevronUp } from 'lucide-react';
import type { Claim, ClaimBaseView, ClaimWorkView, ClaimLifecycle, RiskLevel, ClaimType } from '../../types';
import { initialProjects, MARKETING_CHANNELS, CLAIM_CATEGORIES, REGIONS } from '../../types';
import ClaimsTable from './ClaimsTable';
import ClaimCreationModal from './ClaimCreationModal';

const LIFECYCLE_OPTIONS: ClaimLifecycle[] = ['Proposed', 'Assessed', 'Locally Assessed', 'Assessed via Inheritance', 'Rejected', 'Challenged', 'Withdrawn', 'Not Pursued', 'Cancelled', 'Obsolete', 'Expired'];
const RISK_OPTIONS: RiskLevel[] = ['Low', 'Medium', 'High', 'Very High'];

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

interface ClaimsModuleProps {
  claims: Claim[];
  onClaimsChange: (claims: Claim[]) => void;
  activeBaseView: ClaimBaseView;
  onBaseViewChange: (view: ClaimBaseView) => void;
  activeWorkView: ClaimWorkView | null;
  onClaimClick: (claim: Claim) => void;
  onAssessedBlocked?: (claimId: string, claimLabel: string) => void;
  externalSearchQuery?: string;
  isChainedFlow?: boolean;
  pendingProducts?: any[] | null;
  activeSubView?: 'all' | 'myProject' | 'favorites';
}

export default function ClaimsModule({
  claims,
  onClaimsChange,
  activeBaseView,
  onBaseViewChange,
  activeWorkView,
  onClaimClick,
  onAssessedBlocked,
  externalSearchQuery,
  isChainedFlow = false,
  pendingProducts = null,
  activeSubView = 'all',
}: ClaimsModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (externalSearchQuery !== undefined && externalSearchQuery !== '') {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    const handler = () => setCreationConfig({ open: true });
    window.addEventListener('internalOpenClaimCreation', handler);
    return () => window.removeEventListener('internalOpenClaimCreation', handler);
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [creationConfig, setCreationConfig] = useState<{ open: boolean; type?: ClaimType; initialTabs?: any[]; initialStep?: 1 | 2 }>({ open: false });
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  
  // Quick Filter State (US-M4-030)
  const [activeFiltersConfig, setActiveFiltersConfig] = useState<string[]>(() => {
    const saved = localStorage.getItem('claimsQuickFilters');
    return saved ? JSON.parse(saved) : ['Lifecycle', 'Risk Level', 'Channels', 'Geography'];
  });
  const [isFilterConfigOpen, setIsFilterConfigOpen] = useState(false);

  const [lifecycleFilter, setLifecycleFilter] = useState<ClaimLifecycle[]>([]);
  const [riskLevelFilter, setRiskLevelFilter] = useState<RiskLevel[]>([]);
  const [channelsFilter, setChannelsFilter] = useState<string[]>([]);
  const [geographyFilter, setGeographyFilter] = useState<string[]>([]);

  const toggleFilterConfig = (filterName: string) => {
    const next = activeFiltersConfig.includes(filterName) 
      ? activeFiltersConfig.filter(f => f !== filterName)
      : [...activeFiltersConfig, filterName];
    setActiveFiltersConfig(next);
    localStorage.setItem('claimsQuickFilters', JSON.stringify(next));
    
    // Clear filter values if hidden
    if (activeFiltersConfig.includes(filterName)) {
      if (filterName === 'Lifecycle') setLifecycleFilter([]);
      if (filterName === 'Risk Level') setRiskLevelFilter([]);
      if (filterName === 'Channels') setChannelsFilter([]);
      if (filterName === 'Geography') setGeographyFilter([]);
    }
  };
  // Bulk action modals
  const [bulkLifecycleModal, setBulkLifecycleModal] = useState<{ open: boolean; target: ClaimLifecycle | ''; reason: string; errors: string[] }>({ open: false, target: '', reason: '', errors: [] });
  const [bulkSubstantiateOpen, setBulkSubstantiateOpen] = useState(false);
  const [bulkSubstFiles, setBulkSubstFiles] = useState<string>('');
  
  // M6 US-M4-116: Bulk iRA Results state
  const [bulkIRAResults, setBulkIRAResults] = useState<{ claim: Claim; finalRiskLevel: RiskLevel; finalRiskConfidence: number; claimClassificationLevel: string; claimClassificationConfidence: number; reasons: Array<{ reason: string; confidence: number }> }[] | null>(null);

  // Filter claims by activeBaseView
  const baseFilteredClaims = claims.filter(claim => {
    if (activeBaseView === 'Global Claims') return claim.claimType === 'Global';
    if (activeBaseView === 'Regional Claims') return claim.claimType === 'Regional';
    if (activeBaseView === 'Local Claims') return claim.claimType === 'Local';
    if (activeBaseView === 'Local Claims SKU') return claim.claimType === 'Local SKU';
    return true;
  });

  // Apply additional filters
  const filteredClaims = baseFilteredClaims.filter(claim => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      claim.versions[claim.currentVersion].globalStatement.toLowerCase().includes(searchLower) ||
      claim.versions[claim.currentVersion].localStatement.toLowerCase().includes(searchLower) ||
      claim.id.toLowerCase().includes(searchLower) ||
      claim.productName.toLowerCase().includes(searchLower);

    // Lifecycle filter
    const matchesLifecycle = lifecycleFilter.length === 0 || lifecycleFilter.includes(claim.lifecycleStage);

    // Risk level filter
    const matchesRisk = riskLevelFilter.length === 0 || riskLevelFilter.includes(claim.finalRiskLevel);

    // Marketing channels filter
    const matchesChannels = channelsFilter.length === 0 ||
      channelsFilter.some(ch => claim.marketingChannels.includes(ch));

    // Claim geography filter
    const matchesGeography = geographyFilter.length === 0 ||
      (claim.geography && geographyFilter.includes(claim.geography));

    // Sub-view filter
    const matchesSubView = activeSubView === 'myProject' 
      ? claim.relatedProjectIds && claim.relatedProjectIds.length > 0
      : activeSubView === 'favorites' 
        ? claim.isFavorite
        : true;

    return matchesSearch && matchesLifecycle && matchesRisk && matchesChannels && matchesGeography && matchesSubView;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredClaims.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredClaims.map(c => c.id));
    }
  };

  const activeFilterCount =
    lifecycleFilter.length + riskLevelFilter.length + channelsFilter.length + geographyFilter.length;

  const clearAllFilters = () => {
    setLifecycleFilter([]);
    setRiskLevelFilter([]);
    setChannelsFilter([]);
    setGeographyFilter([]);
    setSearchQuery('');
  };

  // US-M4-034 to US-M4-047: Handle array of partial claims from tabbed workbench
  const handleCreateClaims = (partials: Partial<Claim>[]) => {
    const now = new Date().toISOString();
    const newClaims = partials.map((partial, idx) => {
      const ct = (partial.claimType || 'Global') as ClaimType;
      const geo = (partial as any).geography as string | undefined;
      const num = String(claims.length + idx + 1).padStart(3, '0');
      const geoCode = geo ? geo.replace(/\s+/g, '').slice(0, 4).toUpperCase() : '';
      const id = ct === 'Global' ? `CLM-${num}` : ct === 'Local SKU' ? `CLM-${num}-${geoCode}-SKU` : `CLM-${num}-${geoCode}`;
      const parent = ct !== 'Global' ? claims.find(c => c.claimType === 'Global' && c.productName === partial.productName)?.id : undefined;
      return {
        id,
        claimType: ct,
        parentClaimId: parent,
        productName: partial.productName || '',
        productId: `PRD-${id}`,
        versions: (partial.versions && partial.versions.length > 0) ? partial.versions : [{ versionNumber: 1, isLatest: true, globalStatement: '', localStatement: '', createdAt: now, createdBy: 'Current User' }],
        currentVersion: 0,
        lifecycleStage: 'Proposed' as ClaimLifecycle,
        marketingChannels: partial.marketingChannels || [],
        finalRiskLevel: null,
        finalRiskSummary: { marketingRiskSignoff: false, inheritanceTrace: parent ? `Inherited from ${parent}` : null } as any,
        substantiationDocs: [],
        riskAssessments: [],
        supportStrategy: '',
        restrictedUse: false,
        order: null as any,
        claimIdentifier: null as any,
        claimCategory: null as any,
        geography: geo || null as any,
        qualifier: (partial as any).qualifier,
        relatedProjectIds: [],
        challenged: false,
        expiryDate: null as any,
        isFavorite: false,
        linkedAssets: [],
        createdAt: now,
        updatedAt: now,
        cucCode: null as any,
      } as Claim;
    });
    onClaimsChange([...claims, ...newClaims]);
  };

  // US-M4-113–115: Bulk lifecycle with validation
  const handleBulkLifecycleConfirm = () => {
    const target = bulkLifecycleModal.target as ClaimLifecycle;
    const selected = claims.filter(c => selectedIds.includes(c.id));
    const reasonNeeded = ['Rejected', 'Challenged', 'Withdrawn', 'Not Pursued', 'Obsolete'].includes(target);
    if (reasonNeeded && !bulkLifecycleModal.reason.trim()) return;
    const errors: string[] = [];
    if (target === 'Assessed') {
      selected.forEach(c => {
        if (!c.supportStrategy?.trim()) errors.push(`${c.id}: Support Strategy is required before assessment.`);
        if (!c.finalRiskLevel) errors.push(`${c.id}: Risk Level missing`);
        if (!c.marketingChannels.length) errors.push(`${c.id}: No channels selected`);
      });
    }
    if (errors.length) { setBulkLifecycleModal(p => ({ ...p, errors })); return; }
    const now = new Date().toISOString();
    onClaimsChange(claims.map(c => {
      if (!selectedIds.includes(c.id)) return c;
      const entry: AuditEntry = {
        id: `audit-${Date.now()}-${Math.random()}`,
        timestamp: now,
        actor: 'Current User',
        actorRole: 'Project Creator',
        action: `Bulk Lifecycle Change to ${target}`,
        fromStage: c.lifecycleStage,
        toStage: target,
        details: bulkLifecycleModal.reason || undefined
      };
      return {
        ...c,
        lifecycleStage: target,
        challenged: target === 'Challenged' ? true : c.challenged,
        updatedAt: now,
        auditLog: [...(c.auditLog || []), entry]
      };
    }));
    setBulkLifecycleModal({ open: false, target: '', reason: '', errors: [] });
    setSelectedIds([]);
    setIsBulkMenuOpen(false);
  };

  const handleBulkAction = (action: string) => {
    if (action === 'change-lifecycle') { setBulkLifecycleModal({ open: true, target: '', reason: '', errors: [] }); setIsBulkMenuOpen(false); return; }
    if (action === 'substantiate') { setBulkSubstantiateOpen(true); setIsBulkMenuOpen(false); return; }
    const selectedClaims = claims.filter(c => selectedIds.includes(c.id));
    const createAuditEntry = (c: Claim, target: ClaimLifecycle): AuditEntry => ({
      id: `audit-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      actor: 'Current User',
      actorRole: 'Project Creator',
      action: `Quick Action to ${target}`,
      fromStage: c.lifecycleStage,
      toStage: target
    });

    switch (action) {
      case 'mark-assessed': {
        // F03 — validate Support Strategy before transitioning to Assessed
        const blocked = selectedClaims.filter(c => !c.supportStrategy?.trim());
        if (blocked.length > 0) {
          const first = blocked[0];
          const label = first.versions[first.currentVersion]?.globalStatement?.slice(0, 40) || first.id;
          onAssessedBlocked?.(first.id, label);
          return;
        }
        onClaimsChange(claims.map(c =>
          selectedIds.includes(c.id) ? { ...c, lifecycleStage: 'Assessed' as ClaimLifecycle, updatedAt: new Date().toISOString(), auditLog: [...(c.auditLog || []), createAuditEntry(c, 'Assessed')] } : c
        ));
        break;
      }
      case 'reject':
        onClaimsChange(claims.map(c =>
          selectedIds.includes(c.id) ? { ...c, lifecycleStage: 'Rejected' as ClaimLifecycle, updatedAt: new Date().toISOString(), auditLog: [...(c.auditLog || []), createAuditEntry(c, 'Rejected')] } : c
        ));
        break;
      case 'archive':
        onClaimsChange(claims.map(c =>
          selectedIds.includes(c.id) ? { ...c, lifecycleStage: 'Cancelled' as ClaimLifecycle, updatedAt: new Date().toISOString(), auditLog: [...(c.auditLog || []), createAuditEntry(c, 'Cancelled')] } : c
        ));
        break;
      case 'run-ira': {
        const results: typeof bulkIRAResults = [];
        
        claims.forEach(c => {
          if (!selectedIds.includes(c.id)) return;
          
          const isHomeCare = (() => {
            if ((c as any).businessGroup === 'Home Care') return true;
            return c.relatedProjectIds.some(pid => {
              const proj = initialProjects.find(p => p.id === pid);
              return proj?.businessGroup === 'Home Care';
            });
          })();
          
          if (!isHomeCare || c.lifecycleStage === 'Assessed') return;
          
          results.push({
            claim: c,
            finalRiskLevel: 'Low',
            finalRiskConfidence: 95,
            claimClassificationLevel: 'Level 1 (GO)',
            claimClassificationConfidence: 92,
            reasons: [{ reason: 'Clear scientific backing', confidence: 88 }]
          });
        });
        
        if (results.length > 0) {
          setBulkIRAResults(results);
        } else {
          alert('No eligible claims selected for iRA (must be Home Care and not Assessed).');
        }
        break;
      }
      case 'export':
        console.log('Exporting claims:', selectedClaims);
        alert(`Exporting ${selectedClaims.length} claim(s)...`);
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
          <h1 className="text-night">
            Claims
            <span className="text-gray-400 font-normal mx-2">/</span>
            <span className="text-gray-600 font-medium">{activeBaseView}</span>
            {activeWorkView && (
              <>
                <span className="text-gray-400 font-normal mx-2">/</span>
                <span className="text-sky font-semibold">{activeWorkView}</span>
              </>
            )}
          </h1>
          <button
            onClick={() => setCreationConfig({ open: true })}
            className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Claim
          </button>
        </div>

        {/* Row 2: Search + Quick Filters toolbar (US-M4-027 to US-M4-032) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search claims..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          {activeFiltersConfig.includes('Lifecycle') && (
            <QuickFilterDropdown<ClaimLifecycle>
              label="Lifecycle"
              options={LIFECYCLE_OPTIONS}
              selected={lifecycleFilter}
              onToggle={v => setLifecycleFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setLifecycleFilter([])}
            />
          )}
          {activeFiltersConfig.includes('Risk Level') && (
            <QuickFilterDropdown<RiskLevel>
              label="Risk Level"
              options={RISK_OPTIONS}
              selected={riskLevelFilter}
              onToggle={v => setRiskLevelFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setRiskLevelFilter([])}
            />
          )}
          {activeFiltersConfig.includes('Channels') && (
            <QuickFilterDropdown<string>
              label="Channels"
              options={MARKETING_CHANNELS}
              selected={channelsFilter}
              onToggle={v => setChannelsFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setChannelsFilter([])}
            />
          )}
          {activeFiltersConfig.includes('Geography') && (
            <QuickFilterDropdown<string>
              label="Geography"
              options={REGIONS}
              selected={geographyFilter}
              onToggle={v => setGeographyFilter(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
              onClear={() => setGeographyFilter([])}
            />
          )}

          {/* Add Filter Menu */}
          <div className="relative ml-2">
            <button 
              onClick={() => setIsFilterConfigOpen(!isFilterConfigOpen)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-sky hover:text-sky transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Filter
            </button>
            {isFilterConfigOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterConfigOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-pebble rounded-xl shadow-xl z-20 py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-pebble mb-1">
                    Toggle Quick Filters
                  </div>
                  {['Lifecycle', 'Risk Level', 'Channels', 'Geography'].map(f => (
                    <label key={f} className="flex items-center gap-2 px-3 py-2 hover:bg-earth cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={activeFiltersConfig.includes(f)}
                        onChange={() => toggleFilterConfig(f)}
                        className="rounded border-gray-300 text-sky focus:ring-sky"
                      />
                      <span className="text-sm text-night">{f}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Result count + Clear all (US-M4-033) */}
          <div className="flex items-center gap-2 ml-auto text-xs text-gray-500">
            <span>Filters applied across all claims · <strong className="text-night">{filteredClaims.length}</strong> match{filteredClaims.length !== 1 ? 'es' : ''}</span>
            {activeFilterCount > 0 && (
              <button onClick={clearAllFilters} className="text-red-400 hover:text-red-600 transition-colors font-medium">Clear all</button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <div className="bg-pale border-b border-sky/20 px-6 py-2 flex items-center gap-3 flex-shrink-0">
          <span className="text-sm text-sky font-medium">{selectedIds.length} selected</span>
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
                  <button onClick={() => handleBulkAction('change-lifecycle')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                    <Check className="w-4 h-4 text-green-500" />
                    Change Lifecycle State
                  </button>
                  <button onClick={() => handleBulkAction('substantiate')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                    <FileText className="w-4 h-4 text-sky" />
                    Substantiate Claims
                  </button>
                  <button onClick={() => handleBulkAction('run-ira')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                    <Sparkles className="w-4 h-4 text-sky" />
                    Run iRA
                  </button>
                  <div className="border-t border-pebble my-1"></div>
                  <button onClick={() => handleBulkAction('archive')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-earth transition-colors">
                    <Archive className="w-4 h-4" />
                    Cancel Selected
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
      <div className="flex-1 p-5 overflow-hidden">
        <ClaimsTable
          claims={filteredClaims}
          activeWorkView={activeWorkView}
          selectedIds={selectedIds}
          onSelectId={toggleSelect}
          onSelectAll={toggleSelectAll}
          onClaimClick={onClaimClick}
          activeBaseView={activeBaseView}
          onClaimsChange={(updated) => {
            // Merge the updated claim(s) back into the full claims list
            onClaimsChange(claims.map(c => {
              const u = updated.find(uc => uc.id === c.id);
              return u ? { ...c, ...u } : c;
            }));
          }}
        />
      </div>

      {creationConfig.open && (
        <ClaimCreationModal
          isOpen={true}
          onClose={() => {
            setCreationConfig({ open: false });
            window.dispatchEvent(new CustomEvent('cancelChainedCreation'));
          }}
          onCreate={handleCreateClaims}
          onBack={(isChainedFlow || pendingProducts) ? () => { window.dispatchEvent(new CustomEvent('backToProductCreation')); setCreationConfig({ open: false }); } : undefined}
          isChainedFlow={isChainedFlow}
          pendingProducts={pendingProducts}
        />
      )}

      {/* Bulk Lifecycle Modal — US-M4-113 */}
      {bulkLifecycleModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setBulkLifecycleModal({ open: false, target: '', reason: '', errors: [] })} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10">
            <h3 className="text-night font-semibold mb-1">Bulk Change Lifecycle</h3>
            <p className="text-xs text-gray-400 mb-4">{selectedIds.length} claim(s) selected — all-or-nothing execution</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(['Proposed', 'Assessed', 'Rejected', 'Challenged', 'Withdrawn', 'Not Pursued', 'Obsolete', 'Cancelled'] as ClaimLifecycle[]).map(s => (
                <button key={s} onClick={() => setBulkLifecycleModal(p => ({ ...p, target: s, errors: [] }))}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${bulkLifecycleModal.target === s ? 'border-sky bg-pale text-sky font-semibold' : 'border-pebble text-gray-600 hover:border-sky/50'}`}
                >{s}</button>
              ))}
            </div>
            {['Rejected', 'Challenged', 'Withdrawn', 'Not Pursued', 'Obsolete'].includes(bulkLifecycleModal.target) && (
              <textarea
                value={bulkLifecycleModal.reason}
                onChange={e => setBulkLifecycleModal(p => ({ ...p, reason: e.target.value }))}
                placeholder="Reason (required)…"
                rows={3}
                className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none mb-3"
              />
            )}
            {bulkLifecycleModal.errors.length > 0 && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-semibold text-red-600 mb-1">Validation failed — bulk action blocked:</p>
                {bulkLifecycleModal.errors.map((e, i) => <p key={i} className="text-xs text-red-500">{e}</p>)}
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBulkLifecycleModal({ open: false, target: '', reason: '', errors: [] })} className="px-4 py-2 text-sm text-gray-600 hover:text-night">Cancel</button>
              <button
                onClick={handleBulkLifecycleConfirm}
                disabled={!bulkLifecycleModal.target}
                className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-50 transition-colors"
              >Apply to All</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Substantiate Modal — US-M4-112 */}
      {bulkSubstantiateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setBulkSubstantiateOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10">
            <h3 className="text-night font-semibold mb-1">Bulk Substantiate Claims</h3>
            <p className="text-xs text-gray-400 mb-4">{selectedIds.length} claim(s) selected — document will be appended to all</p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-night mb-2">Document Name / Reference</label>
              <input value={bulkSubstFiles} onChange={e => setBulkSubstFiles(e.target.value)} placeholder="e.g. Clinical_Study_2026.pdf" className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
            </div>
            <p className="text-xs text-amber-600 mb-4">⚠ Classification of each document is required before assessment. Each claim will show an unclassified doc until classified individually.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setBulkSubstantiateOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-night">Cancel</button>
              <button
                onClick={() => {
                  if (!bulkSubstFiles.trim()) return;
                  const doc = { id: `DOC-BULK-${Date.now()}`, fileName: bulkSubstFiles.trim(), classification: '', uploadedAt: new Date().toISOString(), uploadedBy: 'Current User' };
                  onClaimsChange(claims.map(c => selectedIds.includes(c.id) ? { ...c, substantiationDocs: [...c.substantiationDocs, doc] } : c));
                  setBulkSubstantiateOpen(false);
                  setBulkSubstFiles('');
                  setSelectedIds([]);
                }}
                disabled={!bulkSubstFiles.trim()}
                className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-50 transition-colors"
              >Apply to All</button>
            </div>
          </div>
        </div>
      )}

      {/* M6 US-M4-116: Bulk iRA Results Modal */}
      {bulkIRAResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-night/45" onClick={() => setBulkIRAResults(null)}></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble bg-earth flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <span className="text-xl">✨</span>
                </div>
                <div>
                  <h2 className="text-night font-semibold">Bulk iRA Results</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{bulkIRAResults.length} eligible claims analyzed</p>
                </div>
              </div>
              <button onClick={() => setBulkIRAResults(null)} className="p-2 hover:bg-earth rounded-lg transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="border border-pebble rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-earth border-b border-pebble text-xs uppercase tracking-wide text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Claim</th>
                      <th className="px-4 py-3">Calculated Level</th>
                      <th className="px-4 py-3">Classification</th>
                      <th className="px-4 py-3">Reasoning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pebble">
                    {bulkIRAResults.map((res) => {
                      const version = res.claim.versions[res.claim.currentVersion];
                      const statement = res.claim.claimType === 'Global' ? version.globalStatement : version.localStatement;
                      return (
                        <tr key={res.claim.id} className="hover:bg-earth/50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-night line-clamp-1" title={statement}>{statement}</div>
                            <div className="text-xs text-gray-500">{res.claim.id}</div>
                          </td>
                          <td className="px-4 py-3 text-night">
                            {res.finalRiskLevel} <span className="text-xs text-gray-400">({res.finalRiskConfidence}%)</span>
                          </td>
                          <td className="px-4 py-3 text-night">
                            {res.claimClassificationLevel} <span className="text-xs text-gray-400">({res.claimClassificationConfidence}%)</span>
                          </td>
                          <td className="px-4 py-3 text-night">
                            <div className="line-clamp-2" title={res.reasons.map(r => `${r.reason} (${r.confidence}%)`).join('; ')}>
                              {res.reasons.map(r => `${r.reason} (${r.confidence}%)`).join('; ')}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-xs text-gray-500 bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-200">
                <span className="font-semibold">Note:</span> Saving will update the (iRA) fields for these claims. Manual Final Risk inputs will not be overridden.
              </p>
            </div>

            <div className="px-6 py-4 border-t border-pebble bg-earth flex justify-end gap-3">
              <button onClick={() => setBulkIRAResults(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-night font-medium">
                Cancel
              </button>
              <button
                onClick={() => {
                  const mappedMap = new Map(bulkIRAResults.map(r => [r.claim.id, r]));
                  onClaimsChange(claims.map(c => {
                    const res = mappedMap.get(c.id);
                    if (!res) return c;
                    return {
                      ...c,
                      finalRiskLevelIRA: `${res.finalRiskLevel} (${res.finalRiskConfidence}%)`,
                      finalRiskSummary: {
                        ...c.finalRiskSummary,
                        claimClassificationLevelIRA: `${res.claimClassificationLevel} (${res.claimClassificationConfidence}%)`,
                        reasonIRA: res.reasons.map(r => `${r.reason} (${r.confidence}%)`).join('; '),
                        iRAOutput: 'Completed',
                        iRAClassificationConfidence: res.claimClassificationConfidence,
                        iRARiskConfidence: res.finalRiskConfidence,
                        iRAReasons: res.reasons,
                      },
                      updatedAt: new Date().toISOString()
                    };
                  }));
                  setBulkIRAResults(null);
                  setSelectedIds([]);
                }}
                className="px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors font-medium flex items-center gap-2"
              >
                Save All to Claims
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}