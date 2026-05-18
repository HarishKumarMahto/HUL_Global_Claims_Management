import { useState, useEffect } from 'react';
import { X, Shield, Lock, CheckCircle } from 'lucide-react';
import type { Claim, RiskLevel } from '../../types';
import { ASSESSMENT_TYPES, REGIONS, REASONS_PICKLIST, CLASSIFICATION_LEVELS } from '../../types';

type AssessmentMode = 'auto' | 'manual';
type ProbabilityLevel = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
type ImpactLevel = 'Low' | 'Medium' | 'High' | 'Critical';


// const REGIONAL_GEOGRAPHIES = ['EMEA', 'North America', 'LATAM', 'APAC', 'South Asia'];

interface RiskAssessmentEntry {
  functionDept: string;
  assessedBy: string;
  riskLevel: RiskLevel;
  geography: string[]; // Updated to support multiple selections
  marketingChannels: string[];
  comments: string;
  dateTime: string;
  assessmentType: string;
  claimClassificationLevel?: string;
  reasons?: string[];
}

interface RiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  claim: Claim | null;
  onSave: (assessments: RiskAssessmentEntry[]) => void;
}

export default function RiskAssessmentModal({
  isOpen,
  onClose,
  claim,
  onSave
}: RiskAssessmentModalProps) {
  const [savedAssessments, setSavedAssessments] = useState<RiskAssessmentEntry[]>([]);
  const [mode, setMode] = useState<AssessmentMode>('auto');
  const [channelsInitialised, setChannelsInitialised] = useState(false);

  // Form state
  const [assessmentType, setAssessmentType] = useState(ASSESSMENT_TYPES[0]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [selectedGeographies, setSelectedGeographies] = useState<string[]>([]);
  const [geoDropdownOpen, setGeoDropdownOpen] = useState(false);
  const [geoSearch, setGeoSearch] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [claimClassificationLevel, setClaimClassificationLevel] = useState('');
  const [reasons, setReasons] = useState<string[]>([]);

  // UX state
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [newRowId, setNewRowId] = useState<number | null>(null);

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  // Auto Equalizer state
  const [probChallenge, setProbChallenge] = useState<ProbabilityLevel | ''>('');
  const [probLosing, setProbLosing] = useState<ProbabilityLevel | ''>('');
  const [impact, setImpact] = useState<ImpactLevel | ''>('');

  // Manual state
  const [manualRisk, setManualRisk] = useState<RiskLevel | ''>('');

  const computeAutoRisk = (): RiskLevel | null => {
    if (!probChallenge || !probLosing || !impact) return null;
    const challengeScore = ['Very Low', 'Low', 'Medium', 'High', 'Very High'].indexOf(probChallenge);
    const losingScore = ['Very Low', 'Low', 'Medium', 'High', 'Very High'].indexOf(probLosing);
    const impactScore = ['Low', 'Medium', 'High', 'Critical'].indexOf(impact);
    const totalScore = challengeScore + losingScore + impactScore;
    if (totalScore >= 9) return 'Very High';
    if (totalScore >= 7) return 'High';
    if (totalScore >= 4) return 'Medium';
    return 'Low';
  };

  const computedRisk = mode === 'auto' ? computeAutoRisk() : null;
  const finalRisk = mode === 'auto' ? computedRisk : (manualRisk || null);

  // Derive geography for the claim
  const derivedGeo = (() => {
    if (!claim) return '';
    if (claim.claimType === 'Global') return 'Global';
    if (claim.claimType === 'Local' || claim.claimType === 'Local SKU') return claim.geography || 'Local';
    return ''; // Regional — user selects
  })();

  const isLocked = claim?.lifecycleStage === 'Assessed';

  const canSave = mode === 'auto' ? !!computedRisk : !!manualRisk;

  const handleSaveAssessment = () => {
    if (!claim || !finalRisk) {
      setSaveError('Please complete all required fields before saving.');
      return;
    }
    if (selectedChannels.length === 0) {
      setSaveError('At least one Marketing Channel must be selected.');
      return;
    }
    const geo = claim.claimType === 'Regional' ? selectedGeographies : [derivedGeo];
    if (claim.claimType === 'Regional' && selectedGeographies.length === 0) {
      setSaveError('Please select at least one Geography for this Regional claim.');
      return;
    }
    setSaveError(null);

    const newAssessment: RiskAssessmentEntry = {
      assessmentType,
      functionDept: assessmentType.split(' ')[0],
      assessedBy: 'Current User',
      riskLevel: finalRisk,
      geography: geo,
      marketingChannels: selectedChannels,
      comments,
      dateTime: new Date().toISOString(),
      claimClassificationLevel,
      reasons
    };

    const ts = Date.now();
    setNewRowId(ts);
    setSavedAssessments(prev => [{ ...newAssessment }, ...prev]);

    // Reset form fields (keep channels + geo)
    setProbChallenge('');
    setProbLosing('');
    setImpact('');
    setManualRisk('');
    setComments('');
    setClaimClassificationLevel('');
    setReasons([]);

    setToastMsg('Assessment saved successfully');
    setShowToast(true);
    setTimeout(() => setNewRowId(null), 800);
  };

  const handleCommitToClaim = () => {
    onSave(savedAssessments);
    setToastMsg('Assessments added to claim!');
    setShowToast(true);
    handleClose();
  };

  const handleClose = () => {
    if (savedAssessments.length > 0) {
      setShowExitDialog(true);
      return;
    }
    doClose();
  };

  const doClose = () => {
    setSavedAssessments([]);
    setProbChallenge('');
    setProbLosing('');
    setImpact('');
    setManualRisk('');
    setComments('');
    setClaimClassificationLevel('');
    setReasons([]);
    setSelectedChannels([]);
    setSelectedGeographies([]);
    setSaveError(null);
    setChannelsInitialised(false);
    setShowExitDialog(false);
    onClose();
  };

  if (!isOpen || !claim) return null;

  // Pre-load channels and geographies from claim exactly once
  if (!channelsInitialised && claim) {
    if (claim.marketingChannels.length > 0) {
      setSelectedChannels([...claim.marketingChannels]);
    }
    if (claim.claimType === 'Regional') {
      // For regional, start empty or with existing if any
    } else {
      setSelectedGeographies([derivedGeo]);
    }
    setChannelsInitialised(true);
  }

  const riskBadgeClass = (risk: RiskLevel) => {
    switch (risk) {
      case 'Low': return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Very High': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const riskDotClass = (risk: RiskLevel) => {
    switch (risk) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-amber-500';
      case 'High': return 'bg-red-500';
      case 'Very High': return 'bg-red-700';
      default: return 'bg-gray-400';
    }
  };

  const claimStatement = claim?.versions?.[claim.currentVersion]?.globalStatement || claim?.versions?.[0]?.globalStatement || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-night/45" onClick={handleClose}></div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl shadow-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4" />
          {toastMsg}
        </div>
      )}

      {/* Unsaved Changes Dialog */}
      {showExitDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-night font-semibold text-base mb-2">Unsaved Changes</h3>
            <p className="text-sm text-gray-500 mb-5">You have saved assessments that haven't been added to the claim yet. What would you like to do?</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowExitDialog(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-night border border-pebble rounded-lg">Cancel</button>
              <button onClick={doClose} className="px-4 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100">Discard</button>
              <button onClick={() => { handleCommitToClaim(); }} className="px-4 py-2 text-sm bg-sky text-white rounded-lg hover:bg-dark">Save &amp; Exit</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="bg-night rounded-t-xl px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-white font-semibold text-lg">Add Risk Level Assessment</h2>
              <p className="text-pale text-xs mt-0.5 truncate max-w-xl">{claim.id} · {claimStatement || claim.productName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* M7 US9 — Lifecycle Lock Banner */}
        {isLocked && (
          <div className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-amber-700 text-sm">
            <Lock className="w-4 h-4 flex-shrink-0" />
            Risk assessments are locked — this claim has been Assessed.
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ─── Form ─── */}
          <div className="space-y-5">

            {/* Section: Context */}
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Context</h4>
                <span className="text-xs text-gray-400 bg-earth px-2 py-0.5 rounded-full">Derived from claim · read-only</span>
              </div>
            </div>

            {/* Assessment Type (M7 Step 2) */}
            <div className="bg-earth border border-pebble rounded-xl p-4">
              <label className="block text-xs uppercase text-gray-500 mb-2" style={{ letterSpacing: '0.05em' }}>
                Assessment Type
              </label>
              <select
                disabled={isLocked}
                value={assessmentType}
                onChange={e => setAssessmentType(e.target.value)}
                className={`w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky ${isLocked ? 'bg-earth text-gray-500 cursor-not-allowed' : 'bg-white text-night'}`}
              >
                {ASSESSMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 rounded-full bg-pale text-sky flex items-center justify-center text-xs font-bold flex-shrink-0">CU</div>
                <div className="text-sm text-night">Current User</div>
                <span className="text-xs text-gray-400">· auto-assigned</span>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase text-gray-500 mb-2" style={{ letterSpacing: '0.05em' }}>
                Geography Selection
              </label>
              <div className="relative">
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => setGeoDropdownOpen(!geoDropdownOpen)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky ${
                    isLocked 
                      ? 'bg-earth border-pebble text-gray-500 cursor-not-allowed' 
                      : 'bg-white border-pebble hover:border-sky/50 text-night shadow-sm'
                  }`}
                >
                  <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                    {selectedGeographies.length > 0 ? (
                      selectedGeographies.map(g => (
                        <span key={g} className="px-2 py-0.5 bg-pale text-sky rounded text-[11px] font-medium border border-sky/10">
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">Select regions…</span>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${geoDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {geoDropdownOpen && !isLocked && (
                  <div className="absolute z-30 mt-2 w-full bg-white border border-pebble rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                    <div className="p-2 border-b border-earth bg-earth/30">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search geographies…"
                          value={geoSearch}
                          onChange={e => setGeoSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-1 focus:ring-sky bg-white"
                          autoFocus
                        />
                        <svg className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {REGIONS
                        .filter(g => g.toLowerCase().includes(geoSearch.toLowerCase()))
                        .map(g => (
                          <label 
                            key={g} 
                            className="flex items-center gap-3 px-4 py-2 hover:bg-pale cursor-pointer transition-colors group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedGeographies.includes(g)}
                              onChange={() => {
                                setSelectedGeographies(prev =>
                                  prev.includes(g) 
                                    ? prev.filter(v => v !== g) 
                                    : [...prev, g]
                                );
                              }}
                              className="w-4 h-4 rounded border-pebble text-sky focus:ring-sky"
                            />
                            <span className="text-sm text-night group-hover:text-sky transition-colors">{g}</span>
                          </label>
                        ))}
                    </div>
                    {selectedGeographies.length > 0 && (
                      <div className="p-2 border-t border-earth bg-earth/10 flex justify-end">
                        <button 
                          onClick={() => setSelectedGeographies([])}
                          className="text-[10px] text-gray-400 hover:text-red-500 transition-colors uppercase font-bold tracking-wider"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Marketing Channels (M7 US7) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase text-gray-500" style={{ letterSpacing: '0.05em' }}>Marketing Channels</label>
                <span className="text-xs text-gray-400">From claim · deselect only</span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 border border-pebble rounded-xl bg-white">
                {claim.marketingChannels.map(channel => {
                  const isSelected = selectedChannels.includes(channel);
                  return (
                    <button
                      key={channel}
                      disabled={isLocked}
                      onClick={() => {
                        if (selectedChannels.length === 1 && isSelected) return; // last channel guard
                        setSelectedChannels(prev =>
                          isSelected ? prev.filter(c => c !== channel) : [...prev, channel]
                        );
                      }}
                      title={selectedChannels.length === 1 && isSelected ? 'At least one channel is required' : ''}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                        isSelected ? 'bg-pale text-sky border-sky' : 'bg-earth text-gray-500 border-pebble line-through opacity-60'
                      } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {channel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Assessment Details */}
            <div className="pb-1 pt-2 border-t border-pebble">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Assessment Details</h4>
            </div>

            {/* Methodology Toggle */}
            <div>
              <label className="text-xs uppercase text-gray-500 mb-2 block" style={{ letterSpacing: '0.05em' }}>Risk Methodology</label>
              <div className="flex border-2 border-sky rounded-xl overflow-hidden">
                <button
                  disabled={isLocked}
                  onClick={() => setMode('auto')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${mode === 'auto' ? 'bg-sky text-white' : 'bg-white text-sky hover:bg-pale'}`}
                >
                  <Shield className="w-4 h-4" />
                  Auto Risk Equalizer
                </button>
                <button
                  disabled={isLocked}
                  onClick={() => setMode('manual')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-sky text-white' : 'bg-white text-sky hover:bg-pale'}`}
                >
                  ✏️ Manual Entry
                </button>
              </div>
            </div>

            {/* Auto Equalizer (M7 Step 4-6) */}
            {mode === 'auto' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Prob. of Getting a Challenge *', val: probChallenge, set: setProbChallenge, opts: ['Very Low', 'Low', 'Medium', 'High', 'Very High'] as const },
                    { label: 'Prob. of Losing a Challenge *', val: probLosing, set: setProbLosing, opts: ['Very Low', 'Low', 'Medium', 'High', 'Very High'] as const },
                    { label: 'Impact to Business *', val: impact, set: setImpact, opts: ['Low', 'Medium', 'High', 'Critical'] as const },
                  ].map(({ label, val, set, opts }) => (
                    <div key={label}>
                      <label className="text-xs uppercase text-gray-500 mb-2 block" style={{ letterSpacing: '0.05em' }}>{label}</label>
                      <select
                        disabled={isLocked}
                        value={val}
                        onChange={e => (set as any)(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky ${
                          val ? 'border-sky/40 bg-white' : 'border-red-200 bg-red-50/30'
                        }`}
                      >
                        <option value="">Select…</option>
                        {opts.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                      {!val && <p className="text-[10px] text-red-400 mt-0.5">This field is required</p>}
                    </div>
                  ))}
                </div>

                {/* Risk Level result — always shown, pending state when incomplete */}
                <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  computedRisk ? riskBadgeClass(computedRisk) : 'border-dashed border-pebble bg-earth/30'
                }`}>
                  <div>
                    <span className="text-xs uppercase font-semibold tracking-widest text-gray-500">Risk Level (Risk Equalizer)</span>
                    {computedRisk ? (
                      <div className="text-xl font-bold mt-0.5">{computedRisk}</div>
                    ) : (
                      <div className="text-sm text-gray-400 mt-0.5 italic">Select all 3 inputs above to compute…</div>
                    )}
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    computedRisk ? riskDotClass(computedRisk) : 'bg-gray-200'
                  }`}>
                    {!computedRisk && <span className="text-white text-lg">?</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Manual Entry */}
            {mode === 'manual' && (
              <div>
                <label className="text-xs uppercase text-gray-500 mb-2 block" style={{ letterSpacing: '0.05em' }}>Risk Level (Risk Equalizer)</label>
                <select
                  disabled={isLocked}
                  value={manualRisk ?? ''}
                  onChange={e => setManualRisk(e.target.value as RiskLevel)}
                  className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                >
                  <option value="">Select risk level…</option>
                  {(['Low', 'Medium', 'High', 'Very High'] as const).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}

            {/* Classification & Reasons */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase text-gray-500 mb-2 block" style={{ letterSpacing: '0.05em' }}>Claim Classification Level</label>
                <select
                  disabled={isLocked}
                  value={claimClassificationLevel}
                  onChange={e => setClaimClassificationLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                >
                  <option value="">Select classification…</option>
                  {CLASSIFICATION_LEVELS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase text-gray-500 mb-2 block" style={{ letterSpacing: '0.05em' }}>Reasons</label>
                <div className="relative">
                  <select
                    disabled={isLocked}
                    onChange={(e) => {
                      if (e.target.value) {
                        setReasons(prev => prev.includes(e.target.value) ? prev : [...prev, e.target.value]);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
                  >
                    <option value="">Select a reason…</option>
                    {REASONS_PICKLIST.filter(r => !reasons.includes(r)).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {reasons.map(r => (
                        <span key={r} className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs flex items-center gap-1">
                          {r}
                          <button onClick={() => setReasons(prev => prev.filter(x => x !== r))} className="hover:text-amber-900 ml-1">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="text-xs uppercase text-gray-500 mb-2 block" style={{ letterSpacing: '0.05em' }}>Comments</label>
              <textarea
                disabled={isLocked}
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Add reasoning or notes…"
                className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                rows={3}
              />
            </div>

            {/* Validation error (M7 US10) */}
            {saveError && (
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">
                {saveError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveAssessment}
                disabled={!canSave || isLocked}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  canSave && !isLocked
                    ? 'bg-sky text-white border-sky hover:bg-dark shadow-sm hover:shadow-md'
                    : 'bg-earth text-gray-400 border-pebble cursor-not-allowed'
                }`}
              >
                {isLocked ? (
                  <><Lock className="w-4 h-4" /> Assessments locked</>
                ) : !canSave ? (
                  mode === 'auto' ? 'Select all inputs above' : 'Select a Risk Level'
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Save &amp; Add More
                  </>
                )}
              </button>
            </div>
            {!isLocked && (
              <p className="text-xs text-gray-400 text-center mt-1">
                Click <strong>Save &amp; Add More</strong> to record this entry. Use <strong>Add to Claim</strong> in the footer to finalize all.
              </p>
            )}

            {/* ── Assessment Summary Table (M7 US8) ── */}
            <div className="mt-6 pt-5 border-t border-pebble">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-night">Assessment Summary</h3>
                {savedAssessments.length > 0 && (
                  <span className="px-2 py-1 rounded-full text-xs bg-pale text-sky border border-sky/20">
                    {savedAssessments.length} {savedAssessments.length === 1 ? 'entry' : 'entries'}
                  </span>
                )}
              </div>
              {savedAssessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-pebble rounded-xl bg-earth/30">
                  <Shield className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-400">No assessments added yet</p>
                  <p className="text-xs text-gray-300 mt-1">Save an assessment above to see it here</p>
                </div>
              ) : (
                <div className="border border-pebble rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-night text-white">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Function</th>
                        <th className="px-3 py-2 text-left font-semibold">Assessed By</th>
                        <th className="px-3 py-2 text-left font-semibold">Risk Level</th>
                        <th className="px-3 py-2 text-left font-semibold">Geography</th>
                        <th className="px-3 py-2 text-left font-semibold">Channels</th>
                        <th className="px-3 py-2 text-left font-semibold">Comments</th>
                        <th className="px-3 py-2 text-left font-semibold">Date &amp; Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pebble">
                      {savedAssessments.map((assessment, idx) => (
                        <tr
                          key={idx}
                          className={`transition-all duration-500 ${
                            idx === 0 && newRowId !== null
                              ? 'bg-sky/5 border-l-4 border-sky animate-in fade-in slide-in-from-top-1'
                              : idx === 0 ? 'bg-pale/30 border-l-4 border-sky' : 'bg-white'
                          }`}
                        >
                          <td className="px-3 py-2 max-w-[120px] truncate" title={assessment.functionDept}>
                            {assessment.functionDept}
                          </td>
                          <td className="px-3 py-2 text-gray-600">{assessment.assessedBy}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${riskDotClass(assessment.riskLevel)}`}></div>
                              <span className={`px-2 py-0.5 rounded-full border text-xs font-medium ${riskBadgeClass(assessment.riskLevel)}`}>
                                {assessment.riskLevel}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-600">{assessment.geography?.join(', ') || '—'}</td>
                          <td className="px-3 py-2 text-gray-600 max-w-[100px] truncate" title={assessment.marketingChannels?.join(', ')}>
                            {assessment.marketingChannels?.join(', ') || '—'}
                          </td>
                          <td className="px-3 py-2 max-w-[120px] truncate text-gray-600" title={assessment.comments}>
                            {assessment.comments || '—'}
                          </td>
                          <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                            {new Date(assessment.dateTime).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-between flex-shrink-0 bg-earth rounded-b-xl">
          <button onClick={handleClose} className="px-4 py-2 text-sm text-gray-600 hover:text-night transition-colors">
            Cancel
          </button>
          <div className="flex items-center gap-4">
            {savedAssessments.length > 0 ? (
              <span className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                {savedAssessments.length} assessment{savedAssessments.length !== 1 ? 's' : ''} ready to add to claim
              </span>
            ) : (
              <span className="text-xs text-gray-400">Save assessments above first</span>
            )}
            <button
              onClick={handleCommitToClaim}
              disabled={savedAssessments.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                savedAssessments.length > 0
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                  : 'bg-earth text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Add to Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
