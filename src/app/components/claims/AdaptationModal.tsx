import { useState, useEffect } from 'react';
import { X, GitBranch } from 'lucide-react';
import type { Claim, ClaimType } from '../../types';

interface AdaptationModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentClaim: Claim | null;
  onCreateAdaptation: (parentClaimId: string, targetProducts: string[], targetGeographies: string[], adaptation: {
    adaptationType: 'Regional' | 'Local' | 'Local SKU';
    inheritSubstantiation: boolean;
    inheritRiskAssessments: boolean;
  }) => void;
}

export default function AdaptationModal({
  isOpen,
  onClose,
  parentClaim,
  onCreateAdaptation
}: AdaptationModalProps) {
  const [adaptationType, setAdaptationType] = useState<'Regional' | 'Local' | 'Local SKU'>('Regional');
  const [targetProducts, setTargetProducts] = useState<string[]>([]);
  const [productInput, setProductInput] = useState('');
  const [targetGeographies, setTargetGeographies] = useState<string[]>([]);
  const [geoInput, setGeoInput] = useState('');
  const [inheritSubstantiation, setInheritSubstantiation] = useState(true);
  const [inheritRiskAssessments, setInheritRiskAssessments] = useState(true);

  const getAvailableTypes = (): ('Regional' | 'Local' | 'Local SKU')[] => {
    if (!parentClaim) return ['Regional', 'Local', 'Local SKU'];
    if (parentClaim.claimType === 'Global') return ['Regional', 'Local'];
    if (parentClaim.claimType === 'Regional') return ['Local'];
    if (parentClaim.claimType === 'Local') return ['Local SKU'];
    return ['Regional', 'Local', 'Local SKU'];
  };

  const availableTypes = getAvailableTypes();

  useEffect(() => {
    if (isOpen && parentClaim) {
      const types = getAvailableTypes();
      if (!types.includes(adaptationType)) {
        setAdaptationType(types[0]);
      }
    }
  }, [isOpen, parentClaim, adaptationType]);

  const addProduct = () => {
    const val = productInput.trim();
    if (val && !targetProducts.includes(val)) setTargetProducts([...targetProducts, val]);
    setProductInput('');
  };
  const removeProduct = (p: string) => setTargetProducts(prev => prev.filter(x => x !== p));

  const addGeo = () => {
    const val = geoInput.trim();
    if (val && !targetGeographies.includes(val)) setTargetGeographies([...targetGeographies, val]);
    setGeoInput('');
  };
  const removeGeo = (g: string) => setTargetGeographies(prev => prev.filter(x => x !== g));

  const handleSubmit = () => {
    if (!parentClaim || !canSubmit) return;

    onCreateAdaptation(parentClaim.id, targetProducts, targetGeographies, {
      adaptationType,
      inheritSubstantiation,
      inheritRiskAssessments
    });
    handleClose();
  };

  const handleClose = () => {
    setAdaptationType('Regional');
    setTargetProducts([]);
    setProductInput('');
    setTargetGeographies([]);
    setGeoInput('');
    setInheritSubstantiation(true);
    setInheritRiskAssessments(true);
    onClose();
  };

  const canSubmit = targetProducts.length > 0 && targetGeographies.length > 0;

  if (!isOpen || !parentClaim) return null;

  const version = parentClaim.versions[parentClaim.currentVersion];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={handleClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" style={{ border: '1px solid #DEDED7' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pale flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-xl" style={{ fontWeight: 600 }}>Create Local/Regional Claim</h2>
              <p className="text-sm text-gray-500 mt-0.5">Adapt this claim for a specific region or market</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Parent Claim Info */}
            <div className="bg-earth rounded-lg p-4 border border-pebble">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Parent Claim</div>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-sm text-night mb-1" style={{ fontWeight: 600 }}>{parentClaim.productName}</div>
                  <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">{version.globalStatement}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-white text-gray-600 border border-pebble flex-shrink-0">
                  {parentClaim.claimType}
                </span>
              </div>
            </div>

            {/* Adaptation Type */}
            <div>
              <label className="block text-sm text-night mb-2" style={{ fontWeight: 600 }}>
                Claim Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {availableTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setAdaptationType(type)}
                    className={`px-4 py-3 rounded-lg border-2 text-sm transition-all ${
                      adaptationType === type
                        ? 'border-sky bg-pale text-sky'
                        : 'border-pebble bg-white text-gray-600 hover:border-sky/50'
                    }`}
                    style={{ fontWeight: adaptationType === type ? 600 : 400 }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Products */}
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
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addProduct(); } }}
                    placeholder="Type product name and press Enter..."
                    className="flex-1 px-4 py-2.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  />
                  <button onClick={addProduct} disabled={!productInput.trim()} className="px-4 py-2 bg-sky text-white rounded-lg text-sm disabled:opacity-50 hover:bg-dark transition-colors">Add</button>
                </div>
                {targetProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {targetProducts.map(p => (
                      <span key={p} className="flex items-center gap-1.5 px-3 py-1 bg-pale text-sky rounded-full text-sm">
                        {p} <button onClick={() => removeProduct(p)} className="hover:text-dark"><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Geographies */}
            <div>
              <label className="block text-sm text-night mb-2" style={{ fontWeight: 600 }}>
                Target Geographies <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={geoInput}
                    onChange={e => setGeoInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGeo(); } }}
                    placeholder="Type geography (e.g. EMEA, UK) and press Enter..."
                    className="flex-1 px-4 py-2.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  />
                  <button onClick={addGeo} disabled={!geoInput.trim()} className="px-4 py-2 bg-sky text-white rounded-lg text-sm disabled:opacity-50 hover:bg-dark transition-colors">Add</button>
                </div>
                {targetGeographies.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {targetGeographies.map(g => (
                      <span key={g} className="flex items-center gap-1.5 px-3 py-1 bg-pale text-sky rounded-full text-sm">
                        {g} <button onClick={() => removeGeo(g)} className="hover:text-dark"><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inheritance Options */}
            <div>
              <label className="block text-sm text-night mb-3" style={{ fontWeight: 600 }}>
                Inheritance Settings
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-lg border border-pebble hover:bg-earth cursor-pointer transition-colors">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    inheritSubstantiation ? 'bg-sky border-sky' : 'border-pebble'
                  }`}>
                    {inheritSubstantiation && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={inheritSubstantiation}
                    onChange={e => setInheritSubstantiation(e.target.checked)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-night" style={{ fontWeight: 500 }}>Inherit Substantiation</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Automatically inherit all substantiation documents from parent claim
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-lg border border-pebble hover:bg-earth cursor-pointer transition-colors">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    inheritRiskAssessments ? 'bg-sky border-sky' : 'border-pebble'
                  }`}>
                    {inheritRiskAssessments && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={inheritRiskAssessments}
                    onChange={e => setInheritRiskAssessments(e.target.checked)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-night" style={{ fontWeight: 500 }}>Inherit Risk Assessments</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Apply parent's risk assessments as baseline (local reassessment may be required)
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
                The adapted claim will maintain a link to the parent claim. Updates to parent substantiation will notify you of potential impacts to this claim.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-night transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              canSubmit
                ? 'bg-sky text-white hover:bg-dark'
                : 'bg-earth text-gray-400 cursor-not-allowed'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            Continue to Workbench
          </button>
        </div>
      </div>
    </div>
  );
}
