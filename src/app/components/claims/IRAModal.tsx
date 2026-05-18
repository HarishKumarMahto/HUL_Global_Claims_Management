import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Info, Check, X as XIcon, ChevronDown } from 'lucide-react';
import type { Claim, RiskLevel } from '../../types';

interface IRAResult {
  claimClassificationLevel: string;
  claimClassificationConfidence: number;
  finalRiskLevel: string;
  finalRiskConfidence: number;
  reasons: Array<{ reason: string; confidence: number }>;
}

interface IRAModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim?: Claim | null;
  claims?: Claim[];
  onSave: (results: any) => void;
}

const CLASSIFICATION_LEVELS = ['Level 1 (GO)', 'Level 2 (ASK)', 'Level 3 (NO GO)'];

const RISK_LEVELS = [
  { level: 'Low', color: 'bg-green-500' },
  { level: 'Medium', color: 'bg-amber-500' },
  { level: 'High', color: 'bg-orange-500' },
  { level: 'Not Allowed', color: 'bg-red-500', isCross: true },
  { level: 'Varied / Channel Dependent', color: 'bg-blue-500' }
];

const REASONS_LIST = [
  "Award Claim", "Absolute Claim", "Brand Social Cause", "Comparative / Superiority Claim", 
  "Data Based Claim", "Endorsement - Institute / Celebrity / Partnership / Professional / Others", 
  "Environment / Greenwashing / Sustainable", "Free From Claim", "Free Items", "Hygiene Claim", 
  "Impact of external Regulation", "Ingredient Claim", "Insight / Fact", "Marketing Text", 
  "Medical / Borderline Claim", "Natural Claim", "New / Improved - Product / Pack / Formulation", 
  "Not a claim - Marketing Campaign / Communication / Promotional", "Offers / Others", 
  "Not a claim - Price / Address / Company / Product / Usage / Store / Website / Terms", 
  "Not allowed in Unilever", "Numerical Claim", "Over Promise / Misleading / Ambiguous Claims", 
  "Performance Claim", "Political / Cultural Sensitivity", "Potentially Provocative Claim", 
  "Sensitive Skin / Safe for Skin", "Top Parity Claim", "Trade Mark", "Unique RTB", "Others"
];

// MultiSelect Dropdown Component
const MultiSelectDropdown = ({ options, selected, onChange, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative mb-3">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full p-2 border border-pebble rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center"
      >
        <span className="truncate font-semibold text-night">
          {selected.length > 0 ? `${selected.length} reason(s) selected` : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-pebble rounded-lg shadow-xl z-20 py-1">
            {options.map((opt: string) => (
              <label key={opt} className="flex items-start gap-2 px-3 py-2 hover:bg-pale cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-0.5 shrink-0"
                  checked={selected.includes(opt)} 
                  onChange={(e) => {
                    if (e.target.checked) onChange([...selected, opt]);
                    else onChange(selected.filter((x: string) => x !== opt));
                  }} 
                />
                <span className="text-sm text-night leading-snug">{opt}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function IRAModal({ isOpen, onClose, claim, claims = [], onSave }: IRAModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultsMap, setResultsMap] = useState<Record<string, IRAResult>>({});

  const activeClaims = claims.length > 0 ? claims : (claim ? [claim] : []);

  useEffect(() => {
    if (!isOpen) {
      setResultsMap({});
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleRunIRA = async () => {
    setIsProcessing(true);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock results for each claim
    const newResults: Record<string, IRAResult> = {};
    activeClaims.forEach(c => {
      const randomClass = CLASSIFICATION_LEVELS[Math.floor(Math.random() * CLASSIFICATION_LEVELS.length)];
      const randomRisk = RISK_LEVELS[Math.floor(Math.random() * RISK_LEVELS.length)].level;
      
      const numReasons = Math.floor(Math.random() * 3) + 1;
      const shuffledReasons = [...REASONS_LIST].sort(() => 0.5 - Math.random());
      const selectedReasons = shuffledReasons.slice(0, numReasons).map(r => ({
        reason: r,
        confidence: Math.floor(Math.random() * 30) + 70 // 70-99
      }));

      newResults[c.id] = {
        claimClassificationLevel: randomClass,
        claimClassificationConfidence: Math.floor(Math.random() * 20) + 80,
        finalRiskLevel: randomRisk,
        finalRiskConfidence: Math.floor(Math.random() * 20) + 80,
        reasons: selectedReasons
      };
    });

    setResultsMap(newResults);
    setIsProcessing(false);
  };

  const handleSave = () => {
    if (Object.keys(resultsMap).length > 0) {
      // If we only passed a single claim prop, return the single result to maintain compatibility
      if (claim && claims.length === 0) {
        onSave(resultsMap[claim.id]);
      } else {
        onSave(resultsMap);
      }
      onClose();
    }
  };

  const handleReasonChange = (claimId: string, newReasonsList: string[]) => {
    setResultsMap(prev => {
      const existing = prev[claimId];
      if (!existing) return prev;
      
      // Preserve existing confidence, set new to 100
      const updatedReasons = newReasonsList.map(r => {
        const found = existing.reasons.find(ex => ex.reason === r);
        return found ? found : { reason: r, confidence: 100 };
      });
      
      return {
        ...prev,
        [claimId]: { ...existing, reasons: updatedReasons }
      };
    });
  };

  if (!isOpen || activeClaims.length === 0) return null;

  const hasResults = Object.keys(resultsMap).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-night/45" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="bg-night rounded-t-xl px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-white text-lg font-semibold">
                iRA — Intelligent Risk Assessment
              </h2>
              {activeClaims.length === 1 && (
                <p className="text-pale text-xs mt-0.5">{activeClaims[0].id}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {/* Info Note Shifted Above */}
          <div className="bg-pale/30 border border-sky/20 rounded-lg p-3 flex gap-3 mb-6 shrink-0">
            <div className="text-sky flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-sm text-sky/90 font-medium">
              Results are shown for review only — not auto-applied until you save. You can manually edit the fields using the dropdowns below.
            </div>
          </div>

          {!isProcessing && !hasResults && (
            <div className="flex flex-col items-center justify-center py-16 flex-1">
              <div className="w-20 h-20 rounded-full bg-pale flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-sky" />
              </div>
              <p className="text-sm text-gray-600 mb-6 text-center max-w-sm">
                Ready to analyze {activeClaims.length > 1 ? `${activeClaims.length} claims` : 'this claim'} with AI-powered risk assessment
              </p>
              <button
                onClick={handleRunIRA}
                className="px-6 py-2.5 bg-sky text-white rounded-lg hover:bg-dark transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Run iRA Analysis
              </button>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-20 flex-1">
              <Loader2 className="w-8 h-8 text-sky animate-spin mb-4" />
              <p className="text-sm text-sky mb-2 font-medium">Running iRA analysis…</p>
              <p className="text-xs text-gray-500">Evaluating claim classification, risk level and reasoning…</p>
            </div>
          )}

          {hasResults && (
            <div className="flex flex-col gap-8">
              {activeClaims.map((c, index) => {
                const res = resultsMap[c.id];
                if (!res) return null;
                
                const version = c.versions[c.currentVersion];
                const statement = c.claimType === 'Global' ? version.globalStatement : version.localStatement;

                return (
                  <div key={c.id} className="flex flex-col gap-4">
                    {/* Claim Context */}
                    <div className="bg-gray-50 border border-pebble rounded-lg p-4">
                      <div className="text-xs uppercase text-gray-500 mb-2 tracking-wider">
                        Claim Statement ({c.id})
                      </div>
                      <div className="text-sm text-night font-semibold mb-2">
                        {statement}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-sky/10 text-sky border border-sky/20">
                          {c.claimType}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          {c.lifecycleStage}
                        </span>
                      </div>
                    </div>

                    {/* Results Columns - Vertical Scrollable Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[280px] md:h-[350px]">
                      {/* Classification Column */}
                      <div className="bg-white border border-pebble rounded-lg flex flex-col overflow-hidden">
                        <div className="bg-earth px-4 py-3 border-b border-pebble shrink-0">
                          <h3 className="text-xs uppercase text-gray-500 tracking-wider font-semibold">
                            Claim Classification Level
                          </h3>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 bg-white">
                          <select
                            value={res.claimClassificationLevel}
                            onChange={(e) => {
                              setResultsMap(prev => ({
                                ...prev,
                                [c.id]: { ...prev[c.id], claimClassificationLevel: e.target.value }
                              }));
                            }}
                            className="w-full p-2 mb-3 border border-pebble rounded-lg text-sm font-semibold text-night bg-white cursor-pointer focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky"
                          >
                            {CLASSIFICATION_LEVELS.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>

                          <div className="p-3 border border-sky/20 bg-pale/20 rounded-lg">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Confidence (AI output)</span>
                              <span>{res.claimClassificationConfidence}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-pebble rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky rounded-full"
                                style={{ width: `${res.claimClassificationConfidence}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Final Risk Column */}
                      <div className="bg-white border border-pebble rounded-lg flex flex-col overflow-hidden">
                        <div className="bg-earth px-4 py-3 border-b border-pebble shrink-0">
                          <h3 className="text-xs uppercase text-gray-500 tracking-wider font-semibold">
                            Final Risk Level
                          </h3>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 bg-white">
                          <select
                            value={res.finalRiskLevel}
                            onChange={(e) => {
                              setResultsMap(prev => ({
                                ...prev,
                                [c.id]: { ...prev[c.id], finalRiskLevel: e.target.value }
                              }));
                            }}
                            className="w-full p-2 mb-3 border border-pebble rounded-lg text-sm font-semibold text-night bg-white cursor-pointer focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky"
                          >
                            {RISK_LEVELS.map(r => (
                              <option key={r.level} value={r.level}>{r.level}</option>
                            ))}
                          </select>

                          <div className="p-3 border border-pebble rounded-lg">
                            <div className="flex items-center gap-3 mb-2">
                              {(() => {
                                const rInfo = RISK_LEVELS.find(r => r.level === res.finalRiskLevel) || RISK_LEVELS[0];
                                return (
                                  <>
                                    {rInfo.isCross ? (
                                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                        <XIcon className="w-3.5 h-3.5 text-red-600" />
                                      </div>
                                    ) : (
                                      <div className={`w-3.5 h-3.5 rounded-full ${rInfo.color} shrink-0`}></div>
                                    )}
                                    <span className="text-sm text-night font-bold truncate">
                                      {res.finalRiskLevel}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Confidence (AI output)</span>
                              <span>{res.finalRiskConfidence}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-pebble rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${res.finalRiskConfidence}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reasons Column */}
                      <div className="bg-white border border-pebble rounded-lg flex flex-col overflow-hidden">
                        <div className="bg-earth px-4 py-3 border-b border-pebble shrink-0">
                          <h3 className="text-xs uppercase text-gray-500 tracking-wider font-semibold">
                            Reasons
                          </h3>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 bg-white">
                          <MultiSelectDropdown 
                            options={REASONS_LIST}
                            selected={res.reasons.map(r => r.reason)}
                            onChange={(newReasons: string[]) => handleReasonChange(c.id, newReasons)}
                            placeholder="Select reasons..."
                          />

                          <div className="space-y-3">
                            {res.reasons.length === 0 && (
                              <div className="text-xs text-gray-400 italic">No reasons selected.</div>
                            )}
                            {res.reasons.map((item, idx) => (
                              <div key={idx} className="p-3 border border-pebble rounded-lg">
                                <div className="text-sm text-night mb-2 leading-snug">{item.reason}</div>
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-pebble rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        item.confidence >= 80 ? 'bg-green-500' : 'bg-amber-500'
                                      }`}
                                      style={{ width: `${item.confidence}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 w-8 text-right font-medium">{item.confidence}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Optional Divider if multiple claims */}
                    {index < activeClaims.length - 1 && (
                      <hr className="my-6 border-pebble" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3 shrink-0 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-night hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasResults}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              hasResults
                ? 'bg-sky text-white hover:bg-dark shadow-sm'
                : 'bg-earth text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            Save to Claim{activeClaims.length > 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
