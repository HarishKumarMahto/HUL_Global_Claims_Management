import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { 
  Asset, 
  BUSINESS_GROUPS, 
  CATEGORIES, 
  REGIONS, 
  CONSUMER_BENEFIT_PLATFORMS,
  MOCK_SUBSTANTIATION_EVIDENCE,
  CURRENT_USER_ROLE,
  canCopyExtendedAssetData
} from '../../types';

// Full subtype list (alphabetical)
const ALL_SUBTYPES = [
  'Artwork Master Design',
  'B&W - EU Asset',
  'B&W - Global Asset',
  'B&W - Local Asset',
  'B&W - Local Language Translation',
  'B&W - Tailored Global Asset',
  'Briefing',
  'Concepts',
  'Demo',
  'Digital Ad',
  'Digital Product/Service',
  'Events Report',
  'External Trainings',
  'General',
  'Internal Trainings',
  'Key Visual',
  'Literature',
  'Medical Marketing',
  'Pack Artwork',
  'Pack Copy',
  'Playbook/Product Guide',
  'Press Release',
  'Social Media',
  'Social Media - Always On',
  'Social Media - Brand Content',
  'Social Media - Technology Story',
  'Social Media - User Generated Content',
  'Storyboard',
  'Trade Story',
  'TVC'
];

const SUBTYPES_WITH_BRAND_SAY = [
  'Briefing',
  'Demo',
  'Events Report',
  'External Trainings',
  'Medical Marketing',
  'Playbook/Product Guide',
  'Press Release',
  'Social Media',
  'Social Media - Always On',
  'Social Media - Brand Content',
  'Social Media - Technology Story',
  'Social Media - User Generated Content',
  'Trade Story',
];

interface CopyAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceAsset: Asset;
  onCopy: (newAsset: Asset) => void;
}

export default function CopyAssetModal({ isOpen, onClose, sourceAsset, onCopy }: CopyAssetModalProps) {
  const [assetName, setAssetName] = useState(`Copy of ${sourceAsset.name}`);
  const [subtype, setSubtype] = useState(sourceAsset.subtype || '');
  const [businessGroup, setBusinessGroup] = useState(sourceAsset.businessGroup);
  const [category, setCategory] = useState<string[]>(sourceAsset.category ? sourceAsset.category.split(', ') : []);
  const [geography, setGeography] = useState<string[]>(sourceAsset.geography || []);
  const [otherBrandSay, setOtherBrandSay] = useState<boolean | null>(sourceAsset.otherBrandSay ?? null);
  const [relatedProducts, setRelatedProducts] = useState<string[]>([]); // simplified for mock
  const [consumerBenefitPlatform, setConsumerBenefitPlatform] = useState<string[]>(sourceAsset.consumerBenefitPlatform || []);
  
  const canCopyExtended = canCopyExtendedAssetData(CURRENT_USER_ROLE);
  
  const [copyRelatedClaims, setCopyRelatedClaims] = useState(false);
  const [copySubstantiation, setCopySubstantiation] = useState(false);
  const [copySupportStrategy, setCopySupportStrategy] = useState(false);
  const [copyRiskAssessments, setCopyRiskAssessments] = useState(false);
  const [copyRiskSummaries, setCopyRiskSummaries] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);

  const isSubtypeBrandSay = SUBTYPES_WITH_BRAND_SAY.includes(subtype as any);

  // Initialize otherBrandSay toggle if subtype changes
  useEffect(() => {
    if (isSubtypeBrandSay && otherBrandSay === null) {
      setOtherBrandSay(false);
    } else if (!isSubtypeBrandSay) {
      setOtherBrandSay(null);
    }
  }, [subtype, isSubtypeBrandSay]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];
    if (!assetName.trim()) newErrors.push('Asset Name is required');
    if (!subtype) newErrors.push('Subtype is required');
    if (!businessGroup) newErrors.push('Business Group is required');
    if (category.length === 0) newErrors.push('Category is required');
    if (geography.length === 0) newErrors.push('Geography is required');
    
    if (isSubtypeBrandSay && otherBrandSay === true) {
      if (consumerBenefitPlatform.length === 0) {
        newErrors.push('Consumer Benefit Platform is required for Other Say assets');
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const newAsset: Asset = {
      ...sourceAsset,
      id: `AT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: assetName,
      subtype: subtype as any,
      businessGroup,
      category: category.join(', '),
      geography,
      otherBrandSay: otherBrandSay === true,
      consumerBenefitPlatform: consumerBenefitPlatform,
      lifecycleStage: 'Proposed',
      copiedFromAssetId: sourceAsset.id,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      linkedClaimIds: copyRelatedClaims ? sourceAsset.linkedClaimIds : [],
      substantiationEvidence: canCopyExtended && copySubstantiation ? sourceAsset.substantiationEvidence : [],
      supportStrategy: canCopyExtended && copySupportStrategy ? sourceAsset.supportStrategy : undefined,
      versions: [
        {
          ...sourceAsset.versions[0],
          id: `VER-${Math.floor(Math.random() * 10000)}`,
          riskRecords: canCopyExtended && copyRiskAssessments ? sourceAsset.versions[0].riskRecords : [],
          finalRisk: canCopyExtended && copyRiskSummaries ? sourceAsset.versions[0].finalRisk : {
            finalRiskLevel: undefined,
            marketingRiskSignoff: false,
            signoffBy: undefined,
            signoffAt: undefined
          }
        }
      ]
    };

    onCopy(newAsset);
    onClose();
  };

  const getFilteredCBPs = () => {
    if (!businessGroup || category.length === 0) return [];
    return category.flatMap(cat => CONSUMER_BENEFIT_PLATFORMS[`${businessGroup}_${cat}`] || []);
  };

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const availableCategories = businessGroup ? (CATEGORIES[businessGroup] || []) : [];

  return (
    <div className="fixed inset-0 bg-night/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-pebble bg-pale">
          <div>
            <h2 className="text-xl font-bold text-night">Copy Asset</h2>
            <p className="text-sm text-gray-500 mt-1">Source: {sourceAsset.id} - {sourceAsset.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-night hover:bg-earth rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <ul className="list-disc pl-5 text-sm space-y-1">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-night mb-1">
                Asset Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={assetName}
                onChange={e => setAssetName(e.target.value)}
                className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Subtype <span className="text-red-500">*</span></label>
                <select 
                  value={subtype} 
                  onChange={e => setSubtype(e.target.value)}
                  className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                >
                  <option value="">Select subtype...</option>
                  {ALL_SUBTYPES.map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Business Group <span className="text-red-500">*</span></label>
                <select 
                  value={businessGroup} 
                  onChange={e => {
                    setBusinessGroup(e.target.value);
                    setCategory([]);
                    setConsumerBenefitPlatform([]);
                  }}
                  className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                >
                  <option value="">Select BG...</option>
                  {BUSINESS_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-night mb-1">Category <span className="text-red-500">*</span></label>
                <div className="border border-pebble rounded-lg max-h-32 overflow-y-auto bg-white p-2 space-y-1">
                  {availableCategories.length > 0 ? availableCategories.map(c => (
                    <label key={c} className="flex items-center gap-2 text-sm hover:bg-earth p-1 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={category.includes(c)} 
                        onChange={() => {
                          toggleArrayItem(setCategory, c);
                          setConsumerBenefitPlatform([]);
                        }}
                        className="rounded border-gray-300 text-sky focus:ring-sky" 
                      />
                      {c}
                    </label>
                  )) : (
                    <span className="text-xs text-gray-400 italic">Select a Business Group first</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-night mb-1">Geography <span className="text-red-500">*</span></label>
                <div className="border border-pebble rounded-lg max-h-32 overflow-y-auto bg-white p-2 space-y-1">
                  {REGIONS.map(g => (
                    <label key={g} className="flex items-center gap-2 text-sm hover:bg-earth p-1 rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={geography.includes(g)} 
                        onChange={() => toggleArrayItem(setGeography, g)}
                        className="rounded border-gray-300 text-sky focus:ring-sky" 
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {isSubtypeBrandSay && (
              <div className="bg-pale border border-sky/30 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-night">Other Say / Brand Say</h4>
                    <p className="text-xs text-gray-500">Classification for specialized metadata governance</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="otherBrandSay" 
                        checked={otherBrandSay === true} 
                        onChange={() => setOtherBrandSay(true)} 
                        className="text-sky focus:ring-sky"
                      />
                      <span className="text-sm font-medium">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="otherBrandSay" 
                        checked={otherBrandSay === false} 
                        onChange={() => {
                          setOtherBrandSay(false);
                          setConsumerBenefitPlatform([]);
                        }} 
                        className="text-sky focus:ring-sky"
                      />
                      <span className="text-sm font-medium">No</span>
                    </label>
                  </div>
                </div>

                {otherBrandSay === true && (
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-sky/20">
                    <div>
                      <label className="block text-sm font-semibold text-night mb-1">
                        Consumer Benefit Platform <span className="text-red-500">*</span>
                      </label>
                      <div className="border border-pebble rounded-lg max-h-32 overflow-y-auto bg-white p-2 space-y-1">
                        {getFilteredCBPs().length > 0 ? getFilteredCBPs().map(cbp => (
                          <label key={cbp} className="flex items-center gap-2 text-sm hover:bg-earth p-1 rounded cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={consumerBenefitPlatform.includes(cbp)} 
                              onChange={() => toggleArrayItem(setConsumerBenefitPlatform, cbp)}
                              className="rounded border-gray-300 text-sky focus:ring-sky" 
                            />
                            {cbp}
                          </label>
                        )) : (
                          <p className="text-xs text-gray-500 p-2 italic">No CBPs available for selected Business Group and Category.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Related Data Copy Section */}
            <div className="border-t border-pebble pt-6">
              <h3 className="text-sm font-bold text-night mb-4">Select Related Data to Copy</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm hover:bg-earth p-2 rounded cursor-pointer border border-pebble bg-white transition-colors">
                  <input 
                    type="checkbox" 
                    checked={copyRelatedClaims} 
                    onChange={e => setCopyRelatedClaims(e.target.checked)}
                    className="rounded border-gray-300 text-sky focus:ring-sky" 
                  />
                  <span>Related Claims</span>
                </label>
                
                {canCopyExtended && (
                  <>
                    <label className="flex items-center gap-2 text-sm hover:bg-earth p-2 rounded cursor-pointer border border-pebble bg-white transition-colors">
                      <input 
                        type="checkbox" 
                        checked={copySubstantiation} 
                        onChange={e => setCopySubstantiation(e.target.checked)}
                        className="rounded border-gray-300 text-sky focus:ring-sky" 
                      />
                      <span>Substantiation Evidence</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm hover:bg-earth p-2 rounded cursor-pointer border border-pebble bg-white transition-colors">
                      <input 
                        type="checkbox" 
                        checked={copySupportStrategy} 
                        onChange={e => setCopySupportStrategy(e.target.checked)}
                        className="rounded border-gray-300 text-sky focus:ring-sky" 
                      />
                      <span>Support Strategy</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm hover:bg-earth p-2 rounded cursor-pointer border border-pebble bg-white transition-colors">
                      <input 
                        type="checkbox" 
                        checked={copyRiskAssessments} 
                        onChange={e => setCopyRiskAssessments(e.target.checked)}
                        className="rounded border-gray-300 text-sky focus:ring-sky" 
                      />
                      <span>Risk Assessments</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm hover:bg-earth p-2 rounded cursor-pointer border border-pebble bg-white transition-colors">
                      <input 
                        type="checkbox" 
                        checked={copyRiskSummaries} 
                        onChange={e => setCopyRiskSummaries(e.target.checked)}
                        className="rounded border-gray-300 text-sky focus:ring-sky" 
                      />
                      <span>Risk Summaries</span>
                    </label>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-pebble">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-night hover:bg-earth rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-bold text-white bg-sky hover:bg-sky/90 rounded-lg shadow-sm transition-colors"
            >
              Create Copy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
