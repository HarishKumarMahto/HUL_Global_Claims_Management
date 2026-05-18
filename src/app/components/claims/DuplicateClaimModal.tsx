import { useState } from 'react';
import { X, Copy } from 'lucide-react';
import type { Claim } from '../../types';

interface DuplicateClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim | null;
  onDuplicate: (claimId: string, targetProducts: string[], copySettings: {
    copySubstantiation: boolean;
    copySupportStrategy: boolean;
    copyRiskAssessments: boolean;
    copyRiskSummaries: boolean;
  }) => void;
}

export default function DuplicateClaimModal({
  isOpen,
  onClose,
  claim,
  onDuplicate
}: DuplicateClaimModalProps) {
  const [targetProducts, setTargetProducts] = useState<string[]>([]);
  const [productInput, setProductInput] = useState('');
  const [copySubstantiation, setCopySubstantiation] = useState(true);
  const [copySupportStrategy, setCopySupportStrategy] = useState(true);
  const [copyRiskAssessments, setCopyRiskAssessments] = useState(false);
  const [copyRiskSummaries, setCopyRiskSummaries] = useState(false);

  const addProduct = () => {
    const val = productInput.trim();
    if (val && !targetProducts.includes(val)) {
      setTargetProducts([...targetProducts, val]);
    }
    setProductInput('');
  };

  const removeProduct = (p: string) => {
    setTargetProducts(prev => prev.filter(x => x !== p));
  };

  const handleSubmit = () => {
    if (!claim || targetProducts.length === 0) return;

    onDuplicate(claim.id, targetProducts, {
      copySubstantiation,
      copySupportStrategy,
      copyRiskAssessments,
      copyRiskSummaries
    });
    handleClose();
  };

  const handleClose = () => {
    setTargetProducts([]);
    setProductInput('');
    setCopySubstantiation(true);
    setCopySupportStrategy(true);
    setCopyRiskAssessments(false);
    setCopyRiskSummaries(false);
    onClose();
  };

  if (!isOpen || !claim) return null;

  const version = claim.versions[claim.currentVersion];
  const statement = claim.claimType === 'Global' ? version.globalStatement : version.localStatement;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={handleClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl" style={{ border: '1px solid #DEDED7' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pale flex items-center justify-center">
              <Copy className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-xl" style={{ fontWeight: 600 }}>Duplicate Claim</h2>
              <p className="text-sm text-gray-500 mt-0.5">Create a copy for a different product</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Source Claim Info */}
          <div className="bg-earth rounded-lg p-4 border border-pebble">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Source Claim</div>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="text-sm text-night mb-1" style={{ fontWeight: 600 }}>{claim.productName}</div>
                <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">{statement}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-white text-gray-600 border border-pebble flex-shrink-0">
                {claim.claimType}
              </span>
            </div>
          </div>

          {/* New Product Names */}
          <div>
            <label className="block text-sm text-night mb-2" style={{ fontWeight: 600 }}>
              Target Products <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productInput}
                  onChange={e => setProductInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addProduct();
                    }
                  }}
                  placeholder="Type product name and press Enter..."
                  className="flex-1 px-4 py-2.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  autoFocus
                />
                <button
                  onClick={addProduct}
                  disabled={!productInput.trim()}
                  className="px-4 py-2 bg-sky text-white rounded-lg text-sm disabled:opacity-50 hover:bg-dark transition-colors"
                >
                  Add
                </button>
              </div>
              {targetProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {targetProducts.map(p => (
                    <span key={p} className="flex items-center gap-1.5 px-3 py-1 bg-pale text-sky rounded-full text-sm">
                      {p}
                      <button onClick={() => removeProduct(p)} className="hover:text-dark transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Copy Options */}
          <div>
            {/* Automatic Copy Info Box */}
            <div className="bg-pale/20 border border-sky/10 rounded-xl p-3.5 mb-4 text-xs text-sky flex items-start gap-2.5">
              <svg className="w-4 h-4 text-sky mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-semibold block mb-0.5 text-[13px] text-sky-800">Automatically Copied:</span>
                <span className="text-gray-600 font-normal text-xs leading-normal">
                  Statement, Qualifier, and Marketing Channel
                </span>
              </div>
            </div>

            <label className="block text-sm text-night mb-3" style={{ fontWeight: 600 }}>
              Optional to Copy
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 1. Substantiation */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-pebble hover:bg-earth cursor-pointer transition-colors">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${copySubstantiation ? 'bg-sky border-sky' : 'border-pebble'
                  }`}>
                  {copySubstantiation && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={copySubstantiation}
                  onChange={e => setCopySubstantiation(e.target.checked)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-sm text-night font-medium">Substantiation</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Copy {claim.substantiationDocs.length} substantiation document{claim.substantiationDocs.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </label>

              {/* 2. Support Strategy */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-pebble hover:bg-earth cursor-pointer transition-colors">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${copySupportStrategy ? 'bg-sky border-sky' : 'border-pebble'
                  }`}>
                  {copySupportStrategy && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={copySupportStrategy}
                  onChange={e => setCopySupportStrategy(e.target.checked)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-sm text-night font-medium">Support Strategy</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Copy support strategy parameters and details
                  </div>
                </div>
              </label>

              {/* 3. Risk Assessment */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-pebble hover:bg-earth cursor-pointer transition-colors">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${copyRiskAssessments ? 'bg-sky border-sky' : 'border-pebble'
                  }`}>
                  {copyRiskAssessments && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={copyRiskAssessments}
                  onChange={e => setCopyRiskAssessments(e.target.checked)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-sm text-night font-medium">Risk Assessment</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Copy {claim.riskAssessments.length} risk assessment record{claim.riskAssessments.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </label>

              {/* 4. Risk summaries */}
              <label className="flex items-start gap-3 p-3 rounded-xl border border-pebble hover:bg-earth cursor-pointer transition-colors">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${copyRiskSummaries ? 'bg-sky border-sky' : 'border-pebble'
                  }`}>
                  {copyRiskSummaries && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={copyRiskSummaries}
                  onChange={e => setCopyRiskSummaries(e.target.checked)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="text-sm text-night font-medium">Risk summaries</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    Copy final risk summaries and overrides
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-pale/30 border border-sky/20 rounded-lg p-3 flex gap-3">
            <div className="text-sky flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-xs text-sky/90">
              The duplicated claim will be created with lifecycle stage "Proposed" and will require reassessment for the new product context.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-night transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={targetProducts.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${targetProducts.length > 0
                ? 'bg-sky text-white hover:bg-dark'
                : 'bg-earth text-gray-400 cursor-not-allowed'
              }`}
          >
            <Copy className="w-4 h-4" />
            Continue to Workbench
          </button>
        </div>
      </div>
    </div>
  );
}
