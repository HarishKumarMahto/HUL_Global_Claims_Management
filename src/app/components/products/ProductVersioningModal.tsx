import { useState } from 'react';
import { X, GitBranch, Check, Copy, AlertTriangle, ChevronRight, Search, ArrowRight } from 'lucide-react';
import { ProductItem, getLifecycleBadgeStyle, ProductVersionRef } from './productData';

// Sample claims from source product (in real app these come from state/props)
const SAMPLE_CLAIMS = [
  { id: 'CLM-001', text: 'Clinically proven to hydrate skin for 24 hours', lifecycle: 'Assessed' },
  { id: 'CLM-002', text: 'Leaves skin visibly smoother after first use', lifecycle: 'Proposed' },
  { id: 'CLM-003', text: 'Contains 1/4 moisturising milk', lifecycle: 'Assessed' },
  { id: 'CLM-004', text: 'Dermatologist tested formula', lifecycle: 'Assessed' },
  { id: 'CLM-005', text: 'pH balanced for sensitive skin', lifecycle: 'Proposed' },
];

const LC_STYLES: Record<string, { bg: string; text: string }> = {
  Assessed: { bg: '#D1FAE5', text: '#065F46' },
  Proposed: { bg: '#DBEAFE', text: '#1D4ED8' },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sourceProduct: ProductItem;
  allProducts: ProductItem[];
  onVersionCreated: (newProduct: ProductItem, updatedSource: ProductItem) => void;
}

type Step = 'confirm' | 'copy_claims' | 'success';

/** Compute next version number from existing versions list */
function nextVersion(existing: ProductVersionRef[] = []): string {
  if (existing.length === 0) return 'v2'; // source is v1, first new version is v2
  const nums = existing.map(v => parseInt(v.versionNumber.replace('v', ''), 10)).filter(n => !isNaN(n));
  return `v${Math.max(...nums, 1) + 1}`;
}

export default function ProductVersioningModal({ isOpen, onClose, sourceProduct, allProducts, onVersionCreated }: Props) {
  const [step, setStep] = useState<Step>('confirm');
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set(SAMPLE_CLAIMS.map(c => c.id)));
  const [claimSearch, setClaimSearch] = useState('');
  const [copySubstantiation, setCopySubstantiation] = useState(true);
  const [copySupportStrategy, setCopySupportStrategy] = useState(true);
  const [copyRiskLevelAssessment, setCopyRiskLevelAssessment] = useState(true);
  const [copyRiskSummaries, setCopyRiskSummaries] = useState(true);

  if (!isOpen) return null;

  // Block versioning if source is Cancelled
  const isBlocked = sourceProduct.lifecycleState === 'Cancelled';

  // Compute the new version number
  const newVersionNum = nextVersion(sourceProduct.productVersions);
  const sourceVersionNum = sourceProduct.versionNumber || 'v1';

  // Build the new product record (preview)
  const newProductId = `PROD-VER-${Date.now().toString(36).toUpperCase()}`;
  const newVersionRef: ProductVersionRef = {
    productId: newProductId,
    name: sourceProduct.name,
    versionNumber: newVersionNum,
  };

  const filteredClaims = SAMPLE_CLAIMS.filter(c =>
    c.text.toLowerCase().includes(claimSearch.toLowerCase())
  );

  const toggleClaim = (id: string) => {
    setSelectedClaims(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirmVersion = () => {
    setStep('copy_claims');
  };

  const handleCopyAndFinish = () => {
    // Build the new product record
    const today = new Date().toISOString().split('T')[0];
    const newProduct: ProductItem = {
      ...sourceProduct,
      id: newProductId,
      productId: newProductId,
      lifecycleState: 'Created',
      versionNumber: newVersionNum,
      versionedFrom: {
        productId: sourceProduct.id,
        name: sourceProduct.name,
        versionNumber: sourceVersionNum,
      },
      productVersions: [],
      claimsCount: selectedClaims.size,
      createdDate: today,
      lastModified: today,
      isFavorite: false,
    };

    // Update source to append this new version to its list
    const updatedSource: ProductItem = {
      ...sourceProduct,
      versionNumber: sourceVersionNum,
      productVersions: [...(sourceProduct.productVersions || []), newVersionRef],
    };

    onVersionCreated(newProduct, updatedSource);
    setStep('success');
  };

  // ── SUCCESS SCREEN ────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full z-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-night mb-2">Version Created!</h3>
          <p className="text-sm text-gray-500 mb-1">
            <span className="text-sky font-medium">{sourceProduct.name}</span>
          </p>
          <p className="text-sm text-gray-500 mb-5">
            <span className="font-mono bg-earth px-2 py-0.5 rounded text-xs text-night">{newVersionNum}</span>
            {' '}created with {selectedClaims.size} claim{selectedClaims.size !== 1 ? 's' : ''} in{' '}
            <span className="text-sky font-medium">Proposed</span> state.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const lcStyle = getLifecycleBadgeStyle(sourceProduct.lifecycleState);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: step === 'copy_claims' ? '760px' : '560px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pebble flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky/10 rounded-xl">
              <GitBranch className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-base font-bold">
                {step === 'confirm' ? 'Create New Version' : 'Copy Claims to New Version'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {step === 'confirm'
                  ? `Source: ${sourceProduct.name} · ${sourceVersionNum}`
                  : `Copying to ${sourceProduct.name} · ${newVersionNum}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Blocked state */}
        {isBlocked && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-night font-bold mb-2">Versioning Blocked</h3>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              Cannot create a new version of a <span className="font-medium text-red-600">Cancelled</span> product.
              Restore or create a new product instead.
            </p>
            <button onClick={onClose} className="mt-6 px-5 py-2 border border-pebble rounded-lg text-sm text-night hover:bg-earth">
              Close
            </button>
          </div>
        )}

        {/* ── STEP 1: CONFIRM ────────────────────────────────────────────── */}
        {!isBlocked && step === 'confirm' && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Source product card */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Source Product</div>
                <div className="border border-pebble rounded-xl p-4 bg-earth/30 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-night font-semibold truncate">{sourceProduct.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{sourceProduct.productId}</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: lcStyle.bg, color: lcStyle.text }}
                      >
                        {sourceProduct.lifecycleState}
                      </span>
                      <span className="text-xs bg-sky/10 text-sky px-2 py-0.5 rounded-full font-mono">
                        {sourceVersionNum}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{sourceProduct.type} · {sourceProduct.category}</div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex-1 h-px bg-pebble" />
                <div className="flex items-center gap-1.5 text-xs text-sky font-medium bg-sky/5 border border-sky/20 px-3 py-1.5 rounded-full">
                  <Copy className="w-3 h-3" />
                  Creates new version
                  <ChevronRight className="w-3 h-3" />
                </div>
                <div className="flex-1 h-px bg-pebble" />
              </div>

              {/* New version preview card */}
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">New Version</div>
                <div className="border-2 border-sky/30 rounded-xl p-4 bg-sky/5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-night font-semibold truncate">{sourceProduct.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{newProductId}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
                        Created
                      </span>
                      <span className="text-xs bg-sky text-white px-2 py-0.5 rounded-full font-mono font-bold">
                        {newVersionNum} ✦ New
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-sky flex-shrink-0" />
                      Versioned from: <span className="text-sky font-medium ml-1">{sourceProduct.name} ({sourceVersionNum})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules summary */}
              <div className="bg-earth rounded-xl p-4 space-y-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What happens next</div>
                {[
                  'New product record created with lifecycle state: Created',
                  'Version number is system-generated and cannot be edited',
                  'Source product remains unchanged and continues to be usable',
                  'Source product is NOT automatically marked Obsolete',
                  'You will be prompted to copy claims to the new version',
                  'Copied claims will be in Proposed lifecycle state',
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <Check className="w-3.5 h-3.5 text-sky mt-0.5 flex-shrink-0" />
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-pebble px-6 py-4 flex items-center justify-end gap-3 flex-shrink-0">
              <button onClick={onClose} className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirmVersion}
                className="flex items-center gap-2 px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors shadow-sm"
              >
                <GitBranch className="w-4 h-4" />
                Create Version & Copy Claims
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: COPY CLAIMS ────────────────────────────────────────── */}
        {!isBlocked && step === 'copy_claims' && (
          <>
            {/* Source → Target locked bar */}
            <div className="grid grid-cols-2 gap-px bg-pebble flex-shrink-0">
              <div className="bg-white px-5 py-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 font-semibold">Source Product</div>
                <div className="text-sm text-night font-medium">{sourceProduct.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-gray-400">{sourceProduct.productId}</span>
                  <span className="text-xs bg-sky/10 text-sky px-1.5 py-0.5 rounded-full font-mono">{sourceVersionNum}</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                  Read-only — preselected
                </div>
              </div>
              <div className="bg-sky/5 px-5 py-4 border-l-2 border-sky/30">
                <div className="text-xs text-sky uppercase tracking-wide mb-1.5 font-semibold">Target Product (New Version)</div>
                <div className="text-sm text-night font-medium">{sourceProduct.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-gray-400">{newProductId}</span>
                  <span className="text-xs bg-sky text-white px-1.5 py-0.5 rounded-full font-mono font-bold">{newVersionNum}</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky inline-block" />
                  Read-only — auto-selected new version
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center py-2 border-b border-pebble bg-earth flex-shrink-0">
              <ChevronRight className="w-5 h-5 text-sky" />
              <span className="text-xs text-gray-500 ml-1">{selectedClaims.size} claim{selectedClaims.size !== 1 ? 's' : ''} selected — will be created in Proposed state</span>
            </div>

            {/* Search + select-all */}
            <div className="px-6 pt-4 pb-2 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={claimSearch}
                    onChange={e => setClaimSearch(e.target.value)}
                    placeholder="Search claims..."
                    className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                  />
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setSelectedClaims(new Set(filteredClaims.map(c => c.id)))} className="text-sky hover:underline">Select All</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setSelectedClaims(new Set())} className="text-sky hover:underline">Deselect All</button>
                </div>
              </div>
            </div>

            {/* Claims table */}
            <div className="flex-1 overflow-y-auto px-6 pb-2">
              <table className="w-full text-sm">
                <thead className="bg-earth sticky top-0">
                  <tr>
                    <th className="w-10 px-2 py-2" />
                    <th className="px-2 py-2 text-left text-xs text-gray-500 uppercase tracking-wide">Claim</th>
                    <th className="px-2 py-2 text-left text-xs text-gray-500 uppercase tracking-wide">Current Lifecycle</th>
                    <th className="px-2 py-2 text-left text-xs text-gray-500 uppercase tracking-wide whitespace-nowrap">New Version State</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map(claim => {
                    const isSel = selectedClaims.has(claim.id);
                    const ls = LC_STYLES[claim.lifecycle] || { bg: '#F3F4F6', text: '#6B7280' };
                    return (
                      <tr
                        key={claim.id}
                        onClick={() => toggleClaim(claim.id)}
                        className={`border-b border-pebble cursor-pointer transition-colors ${isSel ? 'bg-pale/20' : 'hover:bg-earth'}`}
                      >
                        <td className="px-2 py-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSel ? 'bg-sky border-sky' : 'border-gray-300'}`}>
                            {isSel && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-night leading-relaxed">
                          <div>{claim.text}</div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">{claim.id}</div>
                        </td>
                        <td className="px-2 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: ls.bg, color: ls.text }}>
                            {claim.lifecycle}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {isSel
                            ? <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>Proposed</span>
                            : <span className="text-xs text-gray-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Copy options + footer */}
            <div className="border-t border-pebble flex-shrink-0">
              <div className="px-6 py-3 bg-earth flex flex-wrap gap-x-6 gap-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-night">
                  <input
                    type="checkbox"
                    checked={copySubstantiation}
                    onChange={e => setCopySubstantiation(e.target.checked)}
                    className="w-4 h-4 accent-sky"
                  />
                  Substantiation
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-night">
                  <input
                    type="checkbox"
                    checked={copySupportStrategy}
                    onChange={e => setCopySupportStrategy(e.target.checked)}
                    className="w-4 h-4 accent-sky"
                  />
                  Support Strategy
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-night">
                  <input
                    type="checkbox"
                    checked={copyRiskLevelAssessment}
                    onChange={e => setCopyRiskLevelAssessment(e.target.checked)}
                    className="w-4 h-4 accent-sky"
                  />
                  Risk Level Assessment
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-night">
                  <input
                    type="checkbox"
                    checked={copyRiskSummaries}
                    onChange={e => setCopyRiskSummaries(e.target.checked)}
                    className="w-4 h-4 accent-sky"
                  />
                  Risk Summaries
                </label>
              </div>
              <div className="px-6 py-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep('confirm')}
                  className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={onClose} className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors">
                    Skip Claims
                  </button>
                  <button
                    onClick={handleCopyAndFinish}
                    disabled={selectedClaims.size === 0}
                    className="flex items-center gap-2 px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    Copy {selectedClaims.size} Claim{selectedClaims.size !== 1 ? 's' : ''} & Finish
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
