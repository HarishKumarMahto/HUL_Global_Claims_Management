import { useState } from 'react';
import {
  X, Sparkles, Check, AlertCircle, Loader2, Tag, RefreshCw,
  Pencil, AlertTriangle, Package, ChevronRight, CheckSquare,
  Square, Save, Plus,
} from 'lucide-react';
import type { Asset } from '../../types';
import { mockClaims } from '../../types';

interface ExtractClaimPanelProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onAcceptClaim: (statementId: string) => void;
  onAcceptProduct: (productId: string) => void;
  onAssetUpdate: (asset: Asset) => void;
}

type AIStatus = 'idle' | 'running' | 'done' | 'error';

interface CandidateClaim {
  id: string;
  statement: string;
  confidence: number;
  selected: boolean;
  editing: boolean;
  editedStatement: string;
}

interface DuplicateResult {
  id: string;
  statement: string;
  isDuplicate: boolean;
  matchedClaimId?: string;
}

const CONFIDENCE_BADGE = (score: number) => {
  if (score >= 0.8) return 'bg-green-50 text-green-700 border border-green-200';
  if (score >= 0.5) return 'bg-amber-50 text-amber-700 border border-amber-200';
  return 'bg-gray-100 text-gray-500 border border-gray-200';
};

const MOCK_EXTRACTED_CLAIMS: Omit<CandidateClaim, 'selected' | 'editing' | 'editedStatement'>[] = [
  { id: 'ai-c1', statement: 'Clinically proven to repair and strengthen damaged hair after just 1 use.', confidence: 0.91 },
  { id: 'ai-c2', statement: 'Reduces breakage by up to 90% versus untreated hair.', confidence: 0.85 },
  { id: 'ai-c3', statement: 'Dermatologist tested and approved for sensitive scalp.', confidence: 0.72 },
  { id: 'ai-c4', statement: 'Made with naturally-derived ingredients.', confidence: 0.61 },
  { id: 'ai-c5', statement: 'Suitable for all hair types including colour-treated hair.', confidence: 0.44 },
];

const MOCK_PRODUCTS_MULTI = [
  { id: 'PRD-VAR-001', name: 'Dove Intensive Repair Shampoo 400ml' },
  { id: 'PRD-VAR-002', name: 'Dove Intense Repair Conditioner 350ml' },
  { id: 'PRD-VAR-003', name: 'Dove Hair Fall Rescue Serum 100ml' },
];

const getMockProducts = (asset: Asset) =>
  asset.linkedProjectIds.length > 1
    ? MOCK_PRODUCTS_MULTI
    : [MOCK_PRODUCTS_MULTI[0]];

/** Simple word-overlap duplicate check against the live claims library */
const checkDuplicates = (
  statements: { id: string; statement: string }[]
): DuplicateResult[] => {
  const libraryEntries = mockClaims.map(c => ({
    id: c.id,
    text: (
      c.versions[c.currentVersion]?.globalStatement ||
      c.versions[c.currentVersion]?.localStatement ||
      ''
    ).toLowerCase().trim(),
  }));

  return statements.map(s => {
    const norm = s.statement.toLowerCase().trim();
    const match = libraryEntries.find(e => {
      if (e.text === norm) return true;
      const w1 = new Set(e.text.split(/\s+/));
      const w2 = norm.split(/\s+/);
      const overlap = w2.filter(w => w1.has(w)).length;
      return overlap / Math.max(w2.length, 1) > 0.72;
    });
    return { id: s.id, statement: s.statement, isDuplicate: !!match, matchedClaimId: match?.id };
  });
};

const initClaims = (): CandidateClaim[] =>
  MOCK_EXTRACTED_CLAIMS.map(c => ({
    ...c,
    selected: false,
    editing: false,
    editedStatement: c.statement,
  }));

export default function ExtractClaimPanel({
  isOpen,
  onClose,
  asset,
  onAcceptClaim,
  onAssetUpdate,
}: ExtractClaimPanelProps) {
  const [status, setStatus] = useState<AIStatus>('idle');
  const [claims, setClaims] = useState<CandidateClaim[]>(initClaims);
  const [selectAll, setSelectAll] = useState(false);

  /* ── Multi-product modal ── */
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  /* ── Duplicate check modal ── */
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [dupResults, setDupResults] = useState<DuplicateResult[]>([]);

  /* ── Success flash ── */
  const [createdCount, setCreatedCount] = useState<number | null>(null);

  const products = getMockProducts(asset);
  const hasMultipleProducts = products.length > 1;
  const selectedClaims = claims.filter(c => c.selected);
  const selectedCount = selectedClaims.length;

  /* ─ Handlers ─ */
  const handleRun = () => {
    setStatus('running');
    setClaims(initClaims());
    setSelectAll(false);
    setCreatedCount(null);
    setTimeout(() => setStatus('done'), 2300);
  };

  const handleSelectAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    setClaims(prev => prev.map(c => ({ ...c, selected: next })));
  };

  const handleToggle = (id: string) => {
    setClaims(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c);
      setSelectAll(updated.every(c => c.selected));
      return updated;
    });
  };

  const handleEditStatement = (id: string, value: string) =>
    setClaims(prev => prev.map(c => c.id === id ? { ...c, editedStatement: value } : c));

  const handleToggleEdit = (id: string) =>
    setClaims(prev => prev.map(c => c.id === id ? { ...c, editing: !c.editing } : c));

  const handleCreateClaimsClick = () => {
    if (selectedCount === 0) return;
    if (hasMultipleProducts) {
      setSelectedProductIds(new Set());
      setShowProductModal(true);
    } else {
      setSelectedProductIds(new Set([products[0].id]));
      runDuplicateCheck();
    }
  };

  const runDuplicateCheck = () => {
    const toCheck = selectedClaims.map(c => ({ id: c.id, statement: c.editedStatement }));
    const results = checkDuplicates(toCheck);
    setDupResults(results);
    setShowDuplicateModal(true);
  };

  const handleProductConfirm = () => {
    if (selectedProductIds.size === 0) return;
    setShowProductModal(false);
    runDuplicateCheck();
  };

  const handleConfirmCreate = () => {
    const nonDups = dupResults.filter(r => !r.isDuplicate);
    nonDups.forEach(c => onAcceptClaim(c.id));
    const updated: Asset = {
      ...asset,
      auditLog: [
        ...asset.auditLog,
        {
          id: `al-sparci-${Date.now()}`,
          action: `Extract Claim: ${nonDups.length} claim(s) created from OCR extraction`,
          actor: 'Current User',
          timestamp: new Date().toISOString(),
          details: 'Model: extract-claim-v2.1 | Duplicate check: passed',
        },
      ],
    };
    onAssetUpdate(updated);
    setShowDuplicateModal(false);
    setCreatedCount(nonDups.length);
    setClaims(prev => prev.map(c => ({ ...c, selected: false })));
    setSelectAll(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="w-[500px] bg-white flex flex-col shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="px-5 py-4 border-b border-pebble bg-gradient-to-r from-sky/5 to-purple-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky to-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm text-night font-semibold">Extract Claims</div>
              <div className="text-xs text-gray-500">AI-powered claim extraction from asset content</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-earth rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* ── Asset context ── */}
        <div className="px-5 py-2.5 bg-earth border-b border-pebble flex-shrink-0">
          <div className="text-xs text-gray-500 mb-0.5">Analysing asset</div>
          <div className="text-sm text-night font-medium truncate">{asset.name}</div>
          <div className="text-xs text-gray-400 font-mono">{asset.id}</div>
        </div>

        {/* ── IDLE ── */}
        {status === 'idle' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky/10 to-purple-100 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-sky" />
            </div>
            <div>
              <div className="text-sm text-night font-semibold mb-1">Ready to extract claims</div>
              <div className="text-xs text-gray-500 leading-relaxed max-w-xs">
                Extract Claim will scan the asset content using OCR to surface candidate claim statements. Each candidate shows a confidence score. Recommendations are never auto-committed.
              </div>
            </div>
            {asset.isPlaceholder && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-full">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                AI analysis requires an uploaded file. This asset is a placeholder.
              </div>
            )}
            <button
              onClick={handleRun}
              disabled={asset.isPlaceholder}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky to-purple-500 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Run Extract Claim Analysis
            </button>
            <p className="text-xs text-gray-400">AI results are logged in the Audit Trail with model version.</p>
          </div>
        )}

        {/* ── RUNNING ── */}
        {status === 'running' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
            <Loader2 className="w-10 h-10 text-sky animate-spin" />
            <div className="text-sm text-night font-medium">Scanning asset content…</div>
            <div className="text-xs text-gray-400">Extracting claim statements via OCR and NLP pipeline</div>
          </div>
        )}

        {/* ── DONE ── */}
        {status === 'done' && (
          <>
            {/* Summary bar */}
            <div className="px-5 py-2.5 bg-green-50 border-b border-green-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <Check className="w-3.5 h-3.5" />
                Analysis complete · {MOCK_EXTRACTED_CLAIMS.length} candidate claims found
              </div>
              <button
                onClick={() => setStatus('idle')}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-night transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Re-run
              </button>
            </div>

            {/* Success flash */}
            {createdCount !== null && (
              <div className="px-5 py-2.5 bg-sky/5 border-b border-sky/20 flex items-center gap-2 text-xs text-sky font-medium flex-shrink-0">
                <Check className="w-3.5 h-3.5" />
                {createdCount} claim{createdCount !== 1 ? 's' : ''} created and added to the claims library and linked claims.
              </div>
            )}

            {/* Select All bar */}
            <div className="px-5 py-3 border-b border-pebble flex items-center justify-between flex-shrink-0 bg-white">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-night font-medium hover:text-sky transition-colors"
              >
                {selectAll
                  ? <CheckSquare className="w-4 h-4 text-sky" />
                  : <Square className="w-4 h-4 text-gray-400" />
                }
                {selectAll ? 'Deselect all' : 'Select all'}
              </button>
              <span className="text-xs text-gray-500">
                {selectedCount} of {MOCK_EXTRACTED_CLAIMS.length} selected
              </span>
            </div>

            {/* Claims list */}
            <div className="flex-1 overflow-y-auto divide-y divide-pebble">
              {claims.map(claim => (
                <div
                  key={claim.id}
                  className={`px-5 py-4 transition-colors ${claim.selected ? 'bg-sky/5' : 'bg-white hover:bg-earth/50'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggle(claim.id)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {claim.selected
                        ? <CheckSquare className="w-4 h-4 text-sky" />
                        : <Square className="w-4 h-4 text-gray-300 hover:text-gray-500" />
                      }
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Confidence badge + edit button */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${CONFIDENCE_BADGE(claim.confidence)}`}>
                          <Tag className="w-2.5 h-2.5 inline mr-1" />
                          {Math.round(claim.confidence * 100)}% confidence
                        </span>
                        <button
                          onClick={() => handleToggleEdit(claim.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-sky transition-colors"
                          title={claim.editing ? 'Save edit' : 'Edit statement'}
                        >
                          {claim.editing ? <Save className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                          {claim.editing ? 'Save' : 'Edit'}
                        </button>
                      </div>

                      {/* Statement or textarea */}
                      {claim.editing ? (
                        <textarea
                          autoFocus
                          value={claim.editedStatement}
                          onChange={e => handleEditStatement(claim.id, e.target.value)}
                          rows={3}
                          className="w-full text-sm text-night border border-sky/30 rounded-lg px-2.5 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-sky/40 bg-white"
                        />
                      ) : (
                        <p className="text-sm text-night leading-relaxed">
                          {claim.editedStatement}
                          {claim.editedStatement !== claim.statement && (
                            <span className="ml-1.5 text-xs text-amber-600 font-medium">(modified)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky footer CTA */}
            <div className="flex-shrink-0 px-5 py-3 bg-white border-t border-pebble space-y-2">
              {selectedCount > 0 && (
                <button
                  onClick={handleCreateClaimsClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sky text-white rounded-xl text-sm font-semibold hover:bg-dark transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Claims ({selectedCount})
                </button>
              )}
              {selectedCount === 0 && (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-400 rounded-xl text-sm font-medium cursor-not-allowed"
                >
                  Select claims to create
                </button>
              )}
              <button
                onClick={handleSelectAll}
                className="w-full text-xs text-gray-500 hover:text-sky transition-colors py-1"
              >
                {selectAll ? 'Deselect all' : 'Add all claims'}
              </button>
            </div>
          </>
        )}

        {/* ── ERROR ── */}
        {status === 'error' && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <div className="text-sm text-night font-medium">AI unavailable</div>
            <div className="text-xs text-gray-400">Extract Claim could not complete the request. Please try again later.</div>
            <button onClick={() => setStatus('idle')} className="text-xs text-sky hover:underline">Dismiss</button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          MULTI-PRODUCT MODAL
      ═══════════════════════════════════════════════ */}
      {showProductModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-night">Multiple Products Detected</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This asset is tagged to {products.length} products. Select which product(s) these claims apply to.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 space-y-2 max-h-64 overflow-y-auto">
              {products.map(p => {
                const checked = selectedProductIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProductIds(prev => {
                        const next = new Set(prev);
                        checked ? next.delete(p.id) : next.add(p.id);
                        return next;
                      });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                      checked ? 'border-sky bg-sky/5' : 'border-pebble hover:bg-earth'
                    }`}
                  >
                    {checked
                      ? <CheckSquare className="w-4 h-4 text-sky flex-shrink-0" />
                      : <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    }
                    <span className="text-sm text-night">{p.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="px-6 py-4 border-t border-pebble flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProductConfirm}
                disabled={selectedProductIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          DUPLICATE CHECK MODAL
      ═══════════════════════════════════════════════ */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-night">Duplicate Claim Check</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Comparing {dupResults.length} selected claim{dupResults.length !== 1 ? 's' : ''} against the claims library.
                </p>
              </div>
              <button onClick={() => setShowDuplicateModal(false)} className="ml-auto p-1.5 hover:bg-earth rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-3">
              {dupResults.map(r => (
                <div
                  key={r.id}
                  className={`p-3 rounded-xl border text-sm ${
                    r.isDuplicate
                      ? 'border-red-200 bg-red-50'
                      : 'border-green-200 bg-green-50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {r.isDuplicate
                      ? <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      : <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-snug ${r.isDuplicate ? 'text-red-800' : 'text-green-900'}`}>
                        {r.statement}
                      </p>
                      {r.isDuplicate && (
                        <p className="text-xs text-red-500 mt-1">
                          Duplicate of <span className="font-mono font-semibold">{r.matchedClaimId}</span> in claims library — will be skipped.
                        </p>
                      )}
                      {!r.isDuplicate && (
                        <p className="text-xs text-green-600 mt-1">New claim — will be created.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary row */}
            <div className="px-6 py-3 bg-earth border-t border-pebble flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5 text-green-700">
                <Check className="w-3 h-3" />
                {dupResults.filter(r => !r.isDuplicate).length} will be created
              </span>
              <span className="flex items-center gap-1.5 text-red-500">
                <AlertTriangle className="w-3 h-3" />
                {dupResults.filter(r => r.isDuplicate).length} duplicate{dupResults.filter(r => r.isDuplicate).length !== 1 ? 's' : ''} skipped
              </span>
            </div>

            <div className="px-6 py-4 border-t border-pebble flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={dupResults.filter(r => !r.isDuplicate).length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm font-semibold hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Create {dupResults.filter(r => !r.isDuplicate).length} Claim{dupResults.filter(r => !r.isDuplicate).length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
