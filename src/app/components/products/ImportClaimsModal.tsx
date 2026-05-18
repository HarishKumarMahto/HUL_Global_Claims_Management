import { useState } from 'react';
import { X, Search, ChevronRight, Check, AlertCircle, Package, FileText } from 'lucide-react';
import { ProductItem, initialProducts, getLifecycleBadgeStyle } from './productData';

// Mock claims data structure
type ClaimLifecycle = 'Proposed' | 'Assessed' | 'In Review' | 'Approved';
type ClaimRisk = 'low' | 'medium' | 'high';

interface ClaimItem {
  id: string;
  text: string;
  lifecycle: ClaimLifecycle;
  risk: ClaimRisk;
  channel: string;
  strategy: string;
  version: string;
}

// Mock claims for demonstration
const MOCK_CLAIMS: Record<string, ClaimItem[]> = {
  'var-1': [
    { id: 'CLM-001', text: 'Clinically proven to hydrate skin for 24 hours', lifecycle: 'Assessed', risk: 'low', channel: 'All Channels', strategy: 'Clinical Study', version: 'v2.1' },
    { id: 'CLM-002', text: 'Leaves skin visibly smoother after first use', lifecycle: 'Proposed', risk: 'medium', channel: 'Digital', strategy: 'Consumer Research', version: 'v1.3' },
    { id: 'CLM-003', text: 'Contains 1/4 moisturising milk', lifecycle: 'Assessed', risk: 'low', channel: 'All Channels', strategy: 'Formulation Data', version: 'v3.0' },
    { id: 'CLM-004', text: 'Dermatologist tested formula', lifecycle: 'Assessed', risk: 'low', channel: 'All Channels', strategy: 'Expert Endorsement', version: 'v1.2' },
  ],
  'var-2': [
    { id: 'CLM-S01', text: 'Gentle formula suitable for sensitive skin', lifecycle: 'Proposed', risk: 'low', channel: 'All Channels', strategy: 'Dermatological Testing', version: 'v1.0' },
    { id: 'CLM-S02', text: 'Hypoallergenic and fragrance-free', lifecycle: 'In Review', risk: 'medium', channel: 'All Channels', strategy: 'Clinical Data', version: 'v1.1' },
    { id: 'CLM-S03', text: 'pH balanced for optimal skin health', lifecycle: 'Assessed', risk: 'low', channel: 'Digital, Print', strategy: 'Laboratory Testing', version: 'v2.0' },
  ],
  'var-3': [
    { id: 'CLM-D01', text: 'Deep moisture for up to 48 hours', lifecycle: 'Assessed', risk: 'low', channel: 'All Channels', strategy: 'Clinical Study', version: 'v3.2' },
    { id: 'CLM-D02', text: 'Nourishes skin from within', lifecycle: 'Proposed', risk: 'medium', channel: 'TV, Digital', strategy: 'Consumer Perception Study', version: 'v1.0' },
    { id: 'CLM-D03', text: 'Suitable for daily use', lifecycle: 'Assessed', risk: 'low', channel: 'All Channels', strategy: 'Usage Testing', version: 'v1.5' },
    { id: 'CLM-D04', text: 'Enriched with natural oils', lifecycle: 'Assessed', risk: 'low', channel: 'All Channels', strategy: 'Ingredient Declaration', version: 'v2.0' },
    { id: 'CLM-D05', text: 'Visible results in 7 days', lifecycle: 'In Review', risk: 'high', channel: 'Digital', strategy: 'Consumer Use Study', version: 'v1.0' },
  ],
};

const lc: Record<string, { bg: string; text: string }> = {
  'Assessed': { bg: '#D1FAE5', text: '#065F46' },
  'Proposed': { bg: '#DBEAFE', text: '#1D4ED8' },
  'In Review': { bg: '#FEF3C7', text: '#92400E' },
  'Approved': { bg: '#D1FAE5', text: '#065F46' },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetProduct: ProductItem;
  allProducts: ProductItem[];
  onImport?: (sourceProductId: string, claimIds: string[], copySubstantiations: boolean) => void;
}

export default function ImportClaimsModal({ isOpen, onClose, targetProduct, allProducts, onImport }: Props) {
  const [sourceProduct, setSourceProduct] = useState<ProductItem | null>(null);
  const [sourceSearch, setSourceSearch] = useState('');
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [claimSearch, setClaimSearch] = useState('');
  const [copySubstantiation, setCopySubstantiation] = useState(true);
  const [copySupportStrategy, setCopySupportStrategy] = useState(true);
  const [copyRiskAssessment, setCopyRiskAssessment] = useState(true);
  const [copyRiskSummaries, setCopyRiskSummaries] = useState(true);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter products accessible to the user (excluding target product)
  const sourceResults = allProducts.filter(p =>
    p.id !== targetProduct.id &&
    p.claimsCount > 0 &&
    p.name.toLowerCase().includes(sourceSearch.toLowerCase())
  ).slice(0, 6);

  // Get claims for selected source product
  const sourceClaims = sourceProduct ? (MOCK_CLAIMS[sourceProduct.id] || []) : [];

  // Pre-select all claims when source product changes
  if (sourceProduct && selected.size === 0 && sourceClaims.length > 0) {
    setSelected(new Set(sourceClaims.map(c => c.id)));
  }

  const filteredClaims = sourceClaims.filter(c => c.text.toLowerCase().includes(claimSearch.toLowerCase()));

  const toggleClaim = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    if (!sourceProduct || selected.size === 0) return;
    onImport?.(sourceProduct.id, Array.from(selected), copySubstantiation);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSourceProduct(null);
      setSourceSearch('');
      setSelected(new Set());
      setClaimSearch('');
      onClose();
    }, 1800);
  };

  const handleSelectSource = (p: ProductItem) => {
    setSourceProduct(p);
    setShowSourceDropdown(false);
    setSourceSearch(p.name);
    // Pre-select all claims from this product
    const allClaimIds = (MOCK_CLAIMS[p.id] || []).map(c => c.id);
    setSelected(new Set(allClaimIds));
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-night mb-2">Claims Imported!</h3>
          <p className="text-sm text-gray-500">{selected.size} claim{selected.size !== 1 ? 's' : ''} successfully imported to <span className="text-sky">{targetProduct.name}</span> in <span className="text-sky">Proposed</span> state</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden" style={{ maxHeight: '88vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-pebble flex-shrink-0">
          <div>
            <h2 className="text-night">Import Claims from Another Product</h2>
            <p className="text-sm text-gray-500 mt-0.5">Selectively import claims and optionally inherit substantiation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Source + Target */}
        <div className="grid grid-cols-2 gap-px bg-pebble flex-shrink-0">
          {/* Source */}
          <div className="bg-white px-5 py-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Source Product <span className="text-red-500">*</span></div>
            {sourceProduct ? (
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="text-sm text-night" style={{ fontWeight: 500 }}>{sourceProduct.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sourceProduct.productId} · {sourceProduct.type}</div>
                </div>
                <button onClick={() => { setSourceProduct(null); setSourceSearch(''); setSelected(new Set()); }} className="text-xs text-sky hover:underline">Change</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={sourceSearch} onChange={e => { setSourceSearch(e.target.value); setShowSourceDropdown(true); }}
                  onFocus={() => setShowSourceDropdown(true)}
                  placeholder="Search source product..."
                  className="w-full pl-8 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
                {showSourceDropdown && sourceResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 bg-white border border-pebble rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {sourceResults.map(p => (
                      <button key={p.id} onClick={() => handleSelectSource(p)}
                        className="w-full px-3 py-2 text-left hover:bg-earth text-sm text-night transition-colors flex items-center gap-2">
                        <span className="flex-1">{p.name}</span>
                        <span className="text-xs text-gray-400">{p.claimsCount} claims</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Target */}
          <div className="bg-white px-5 py-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Target Product</div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm text-night" style={{ fontWeight: 500 }}>{targetProduct.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{targetProduct.productId}</div>
              </div>
              <div className="px-2 py-0.5 rounded text-xs" style={{ background: getLifecycleBadgeStyle(targetProduct.lifecycleState).bg, color: getLifecycleBadgeStyle(targetProduct.lifecycleState).text }}>
                {targetProduct.lifecycleState}
              </div>
            </div>
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center py-2 border-b border-pebble bg-earth flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-sky" />
          <span className="text-xs text-gray-500 ml-1">{selected.size} claim{selected.size !== 1 ? 's' : ''} selected</span>
        </div>

        {/* Claims list */}
        {sourceProduct ? (
          <>
            <div className="flex-shrink-0 px-6 pt-4 pb-2">
              <div className="flex items-center gap-4 mb-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="text" value={claimSearch} onChange={e => setClaimSearch(e.target.value)}
                    placeholder="Search claims..." className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set(filteredClaims.map(c => c.id)))} className="text-xs text-sky hover:underline">Select All</button>
                  <span className="text-gray-300">|</span>
                  <button onClick={() => setSelected(new Set())} className="text-xs text-sky hover:underline">Deselect All</button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-2">
              <table className="w-full text-sm">
                <thead className="bg-earth sticky top-0">
                  <tr>
                    <th className="w-10 px-2 py-2 text-left"></th>
                    <th className="px-2 py-2 text-left text-xs text-gray-500 uppercase tracking-wide">Claim</th>
                    <th className="px-2 py-2 text-left text-xs text-gray-500 uppercase tracking-wide">Lifecycle</th>
                    <th className="w-10 px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims.map((claim) => {
                    const isSelected = selected.has(claim.id);
                    const ls = lc[claim.lifecycle] || { bg: '#F3F4F6', text: '#6B7280' };
                    return (
                      <tr key={claim.id} onClick={() => toggleClaim(claim.id)}
                        className={`border-b border-pebble cursor-pointer transition-colors ${isSelected ? 'bg-pale/20' : 'hover:bg-earth'}`}>
                        <td className="px-2 py-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-sky border-sky' : 'border-gray-300'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </td>
                        <td className="px-2 py-3 text-night leading-relaxed">{claim.text}</td>
                        <td className="px-2 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: ls.bg, color: ls.text }}>{claim.lifecycle}</span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="text-xs text-gray-400">{claim.id}</span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredClaims.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                        No claims found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-earth rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <div className="text-sm text-gray-500">Select a source product to view its claims</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-pebble flex-shrink-0">
            <div className="px-6 py-3 bg-earth flex flex-col gap-3">
            <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={copySubstantiation} onChange={e => setCopySubstantiation(e.target.checked)} className="w-4 h-4 accent-sky" />
              <span className="text-sm text-night">Substantiation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={copySupportStrategy} onChange={e => setCopySupportStrategy(e.target.checked)} className="w-4 h-4 accent-sky" />
                <span className="text-sm text-night">Support Strategy</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={copyRiskAssessment} onChange={e => setCopyRiskAssessment(e.target.checked)} className="w-4 h-4 accent-sky" />
                <span className="text-sm text-night">Risk Level Assessments</span>
            </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={copyRiskSummaries} onChange={e => setCopyRiskSummaries(e.target.checked)} className="w-4 h-4 accent-sky" />
                <span className="text-sm text-night">Risk Summaries</span>
            </label>
              </div>
            {!sourceProduct && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
                Please select a source product
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors">
              Cancel
            </button>
            <button onClick={handleContinue}
              disabled={!sourceProduct || selected.size === 0}
              className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
