import { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { ProductItem, initialProducts, getLifecycleBadgeStyle } from './productData';

interface Claim {
  id: string;
  text: string;
  lifecycle: string;
}

const SAMPLE_CLAIMS: Claim[] = [
  { id: 'CLM-001', text: 'Clinically proven to hydrate skin for 24 hours', lifecycle: 'Assessed' },
  { id: 'CLM-002', text: 'Leaves skin visibly smoother after first use', lifecycle: 'Proposed' },
  { id: 'CLM-003', text: 'Contains 1/4 moisturising milk', lifecycle: 'Assessed' },
  { id: 'CLM-004', text: 'Dermatologist tested formula', lifecycle: 'Assessed' },
  { id: 'CLM-005', text: 'pH balanced for sensitive skin', lifecycle: 'Proposed' },
];

const lc: Record<string, { bg: string; text: string }> = {
  'Assessed': { bg: '#D1FAE5', text: '#065F46' },
  'Proposed': { bg: '#DBEAFE', text: '#1D4ED8' },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sourceProduct: ProductItem;
}

export default function CopyClaimsModal({ isOpen, onClose, sourceProduct }: Props) {
  const [targetSearch, setTargetSearch] = useState('');
  const [targetProducts, setTargetProducts] = useState<ProductItem[]>([]);
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(SAMPLE_CLAIMS.map(c => c.id)));
  const [claimSearch, setClaimSearch] = useState('');
  const [copySubstantiation, setCopySubstantiation] = useState(true);
  const [copySupportStrategy, setCopySupportStrategy] = useState(true);
  const [copyRiskAssessment, setCopyRiskAssessment] = useState(true);
  const [copyRiskSummaries, setCopyRiskSummaries] = useState(true);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [success, setSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTargetDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const targetResults = initialProducts.filter(p =>
    p.id !== sourceProduct.id && p.name.toLowerCase().includes(targetSearch.toLowerCase())
  ).slice(0, 6);

  const filteredClaims = SAMPLE_CLAIMS.filter(c => c.text.toLowerCase().includes(claimSearch.toLowerCase()));

  const toggleClaim = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    if (targetProducts.length === 0 || selected.size === 0) return;
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 1800);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-night mb-2">Claims Copied!</h3>
          <p className="text-sm text-gray-500">{selected.size} claim{selected.size !== 1 ? 's' : ''} successfully copied to <span className="text-sky">{targetProducts.map(p => p.name).join(', ')}</span></p>
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
            <h2 className="text-night">Copy Claims to Another Product</h2>
            <p className="text-sm text-gray-500 mt-0.5">Selectively copy claims and optionally inherit substantiation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Source + Target */}
        <div className="grid grid-cols-2 gap-px bg-pebble flex-shrink-0">
          {/* Source */}
          <div className="bg-white px-5 py-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Source Product</div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="text-sm text-night" style={{ fontWeight: 500 }}>{sourceProduct.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{sourceProduct.productId} · {sourceProduct.type}</div>
              </div>
              <div className="px-2 py-0.5 rounded text-xs" style={{ background: getLifecycleBadgeStyle(sourceProduct.lifecycleState).bg, color: getLifecycleBadgeStyle(sourceProduct.lifecycleState).text }}>
                {sourceProduct.lifecycleState}
              </div>
            </div>
          </div>
          {/* Target */}
          <div className="bg-white px-5 py-4" ref={dropdownRef}>
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Target Product <span className="text-red-500">*</span></div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" value={targetSearch} onChange={e => { setTargetSearch(e.target.value); setShowTargetDropdown(true); }}
                onFocus={() => setShowTargetDropdown(true)}
                placeholder="Search target product..."
                className="w-full pl-8 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
              {showTargetDropdown && targetResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 bg-white border border-pebble rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {targetResults.map(p => {
                    const isSelected = targetProducts.some(tp => tp.id === p.id);
                    return (
                      <button key={p.id} onClick={() => {
                        if (isSelected) {
                          setTargetProducts(prev => prev.filter(tp => tp.id !== p.id));
                        } else {
                          setTargetProducts(prev => [...prev, p]);
                        }
                        setTargetSearch('');
                      }}
                        className="w-full px-3 py-2 text-left hover:bg-earth text-sm text-night transition-colors flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected ? 'bg-sky border-sky' : 'border-pebble bg-white'
                        }`}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="flex-1 text-left">{p.name}</span>
                        <span className="text-xs text-gray-400">{p.type}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {targetProducts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {targetProducts.map(p => (
                  <span key={p.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-pale border border-sky/30 rounded-full text-xs text-sky font-semibold">
                    {p.name}
                    <button onClick={() => setTargetProducts(prev => prev.filter(tp => tp.id !== p.id))} className="ml-1 text-sky/60 hover:text-red-500 transition-colors cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="flex items-center justify-center py-2 border-b border-pebble bg-earth flex-shrink-0">
          <ChevronRight className="w-5 h-5 text-sky" />
          <span className="text-xs text-gray-500 ml-1">{selected.size} claim{selected.size !== 1 ? 's' : ''} selected</span>
        </div>

        {/* Claims list */}
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
            </tbody>
          </table>
        </div>

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
            {targetProducts.length === 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
                Please select a target product
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex items-center justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors">
              Cancel
            </button>
            <button onClick={handleContinue}
              disabled={targetProducts.length === 0 || selected.size === 0}
              className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
