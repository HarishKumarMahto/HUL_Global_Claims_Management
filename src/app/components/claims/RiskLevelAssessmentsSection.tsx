import React, { useState } from 'react';
import {
  Plus,
  X,
  Shield,
  MapPin,
  Building2,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Edit2
} from 'lucide-react';
import type { Claim, RiskAssessmentRecord, RiskLevel } from '../../types';
import { ASSESSMENT_TYPES, REGIONS, CURRENT_USER } from '../../types';

interface RiskLevelAssessmentsSectionProps {
  claim: Claim;
  onClaimSave: (claim: Claim) => void;
}

export default function RiskLevelAssessmentsSection({
  claim,
  onClaimSave,
}: RiskLevelAssessmentsSectionProps) {
  const [showAddAssessment, setShowAddAssessment] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assessmentForm, setAssessmentForm] = useState<Partial<RiskAssessmentRecord>>({});
  const [inlineGeoOpen, setInlineGeoOpen] = useState(false);
  const [inlineGeoSearch, setInlineGeoSearch] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const isLocked = claim.lifecycleStage === 'Assessed';

  const riskBadgeClass = (risk: RiskLevel) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'High':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Very High':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const riskDotClass = (risk: RiskLevel) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-500';
      case 'Medium':
        return 'bg-amber-500';
      case 'High':
        return 'bg-red-500';
      case 'Very High':
        return 'bg-red-700';
      default:
        return 'bg-gray-400';
    }
  };

  const handleOpenInlineForm = () => {
    if (isLocked) return;
    setEditingId(null);
    setAssessmentForm({
      functionDept: ASSESSMENT_TYPES[0].split(' ')[0],
      assessmentType: ASSESSMENT_TYPES[0],
      riskLevel: null,
      comments: '',
      geography: claim.geography ? [claim.geography] : [],
      marketingChannels: claim.marketingChannels || [],
    });
    setValidationError(null);
    setShowAddAssessment(true);
  };

  const handleEdit = (entry: RiskAssessmentRecord) => {
    if (isLocked) return;
    setEditingId(entry.id);
    setAssessmentForm({
      functionDept: entry.functionDept,
      assessmentType: entry.assessmentType,
      riskLevel: entry.riskLevel,
      comments: entry.comments,
      geography: entry.geography ? (Array.isArray(entry.geography) ? entry.geography : [entry.geography]) : [],
      marketingChannels: entry.marketingChannels || [],
    });
    setValidationError(null);
    setShowAddAssessment(true);
  };

  const handleSaveInline = () => {
    if (!assessmentForm.functionDept || !assessmentForm.riskLevel || !assessmentForm.comments?.trim()) {
      setValidationError('Function, Risk Level, and Comments are required.');
      return;
    }
    setValidationError(null);

    const updatedEntry: RiskAssessmentRecord = {
      id: editingId || `RA-${Date.now()}`,
      functionDept: assessmentForm.functionDept,
      assessmentType: assessmentForm.assessmentType || assessmentForm.functionDept,
      assessedBy: CURRENT_USER,
      riskLevel: assessmentForm.riskLevel as RiskLevel,
      comments: assessmentForm.comments.trim(),
      geography: assessmentForm.geography,
      marketingChannels: assessmentForm.marketingChannels,
      dateTime: editingId 
        ? (claim.riskAssessments?.find(r => r.id === editingId)?.dateTime || new Date().toISOString()) 
        : new Date().toISOString(),
    };

    let newAssessments;
    if (editingId) {
      newAssessments = claim.riskAssessments?.map(r => r.id === editingId ? updatedEntry : r) || [];
    } else {
      newAssessments = [...(claim.riskAssessments || []), updatedEntry];
    }

    onClaimSave({
      ...claim,
      riskAssessments: newAssessments,
      updatedAt: new Date().toISOString(),
    });

    setShowAddAssessment(false);
    setAssessmentForm({});
    setEditingId(null);
  };

  const assessments = [...(claim.riskAssessments || [])].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
  );

  return (
    <div className="bg-white border border-pebble rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-earth/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky/10 flex items-center justify-center text-sky">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-night font-semibold text-lg">Risk Level Assessments</h2>
            <p className="text-sm text-gray-500 mt-0.5">Historical audit trail of risk entries</p>
          </div>
        </div>
        {!isLocked && (
          <button
            onClick={handleOpenInlineForm}
            disabled={showAddAssessment}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Add Entry
          </button>
        )}
      </div>

      {isLocked && (
        <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-amber-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          This claim has been Assessed. New risk entries cannot be added.
        </div>
      )}

      {showAddAssessment && (
        <div className="p-6 border-b border-sky/20 bg-sky/5 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-night flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky" /> New Risk Entry
            </h3>
            <button
              onClick={() => {
                setShowAddAssessment(false);
                setEditingId(null);
              }}
              className="p-1 hover:bg-earth rounded-lg transition-colors text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1.5 font-semibold tracking-wide">
                Function / Dept *
              </label>
              <select
                value={assessmentForm.assessmentType || ''}
                onChange={(e) =>
                  setAssessmentForm({
                    ...assessmentForm,
                    assessmentType: e.target.value,
                    functionDept: e.target.value.split(' ')[0],
                  })
                }
                className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
              >
                {ASSESSMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1.5 font-semibold tracking-wide">
                Risk Level *
              </label>
              <select
                value={assessmentForm.riskLevel || ''}
                onChange={(e) =>
                  setAssessmentForm({ ...assessmentForm, riskLevel: e.target.value as RiskLevel })
                }
                className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
              >
                <option value="">Select Risk Level…</option>
                {(['Low', 'Medium', 'High', 'Very High'] as const).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1.5 font-semibold tracking-wide">
                Geography (Optional)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setInlineGeoOpen(!inlineGeoOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white min-h-[38px]"
                >
                  <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                    {Array.isArray(assessmentForm.geography) && assessmentForm.geography.length > 0 ? (
                      assessmentForm.geography.map((g) => (
                        <span
                          key={g}
                          className="px-2 py-0.5 bg-pale text-sky rounded text-[11px] font-medium border border-sky/10 whitespace-nowrap"
                        >
                          {g}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">Select regions…</span>
                    )}
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${inlineGeoOpen ? 'rotate-180' : ''} flex-shrink-0 ml-1`} />
                </button>
                {inlineGeoOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-pebble rounded-xl shadow-xl overflow-hidden">
                    <div className="p-2 border-b border-earth bg-earth/30">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search geographies…"
                          value={inlineGeoSearch}
                          onChange={(e) => setInlineGeoSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-1 focus:ring-sky bg-white"
                          autoFocus
                        />
                        <SearchIcon className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto py-1">
                      {REGIONS.filter((g) => g.toLowerCase().includes(inlineGeoSearch.toLowerCase())).map((g) => {
                        const isSelected = Array.isArray(assessmentForm.geography) && assessmentForm.geography.includes(g);
                        return (
                          <label
                            key={g}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-pale cursor-pointer transition-colors group"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                const curr = Array.isArray(assessmentForm.geography) ? assessmentForm.geography : [];
                                setAssessmentForm({
                                  ...assessmentForm,
                                  geography: isSelected ? curr.filter((v) => v !== g) : [...curr, g],
                                });
                              }}
                              className="w-4 h-4 rounded border-pebble text-sky focus:ring-sky"
                            />
                            <span className="text-sm text-night group-hover:text-sky transition-colors">{g}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs uppercase text-gray-500 mb-1.5 font-semibold tracking-wide">
              Comments *
            </label>
            <textarea
              value={assessmentForm.comments || ''}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, comments: e.target.value })}
              placeholder="Provide reasoning for this risk assessment…"
              rows={3}
              className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white resize-none"
            />
          </div>

          {validationError && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {validationError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-sky/10">
            <button
              onClick={() => {
                setShowAddAssessment(false);
                setEditingId(null);
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-night hover:bg-white rounded-lg transition-colors border border-transparent hover:border-pebble"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveInline}
              className="flex items-center gap-1.5 px-4 py-2 bg-sky text-white rounded-lg text-sm font-semibold hover:bg-dark transition-colors shadow-sm"
            >
              <CheckCircle className="w-4 h-4" /> Save Entry
            </button>
          </div>
        </div>
      )}

      <div className="p-6 flex-1 overflow-auto bg-gray-50/30">
        {assessments.length === 0 ? (
          <div className="text-center py-10">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-night">No risk assessments</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Risk assessments added to this claim will appear here as a chronological audit trail.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((entry, idx) => (
              <div
                key={entry.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-all relative overflow-hidden ${
                  idx === 0 ? 'border-sky ring-1 ring-sky/20' : 'border-pebble hover:border-gray-300'
                }`}
              >
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-sky text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                    Latest
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border ${riskBadgeClass(
                        entry.riskLevel
                      )}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${riskDotClass(entry.riskLevel)}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-night text-sm">{entry.functionDept}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${riskBadgeClass(
                            entry.riskLevel
                          )}`}
                        >
                          {entry.riskLevel} Risk
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> {entry.assessedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date(entry.dateTime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!isLocked && entry.assessedBy === CURRENT_USER && (
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 text-gray-400 hover:text-sky hover:bg-sky/5 rounded-lg transition-colors"
                      title="Edit your entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="bg-earth/50 rounded-lg p-3 text-sm text-gray-700 mb-3 flex items-start gap-2.5">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="leading-relaxed">{entry.comments}</p>
                </div>

                {entry.geography && entry.geography.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>
                      {Array.isArray(entry.geography) ? entry.geography.join(', ') : entry.geography}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Icon helpers
function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
