import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Check, Flag, AlertCircle, FileText, Shield, Scale, Plus, Upload, X, Search, Lock, Save, Bold, Italic, List, Link, MoreHorizontal, Eye, EyeOff, ArrowUpDown, GripVertical, MessageSquare, Star, Send } from 'lucide-react';
import type { Claim, ClaimBaseView, ClaimWorkView, RiskLevel, AuditEntry } from '../../types';
import { formatDate, RISK_LEVEL_OPTIONS } from '../ui/tableUtils';
import { CURRENT_USER, CURRENT_USER_ROLE, canEditSupportStrategy, CLAIM_LIFECYCLE_COLORS } from '../../types';
import EmptyState from '../ui/EmptyState';

const RISK_FUNCTIONS = ['R&D', 'RA', 'Legal', 'Marketing'] as const;
type RiskFunction = typeof RISK_FUNCTIONS[number];

// ─── F01/F02/F06 Inline Support Strategy Editor ──────────────────────────────
interface InlineSupportStrategyEditorProps {
  claim: Claim;
  onClaimsChange?: (claims: Claim[]) => void;
  fileRef: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
}

function InlineSupportStrategyEditor({ claim, onClaimsChange, fileRef }: InlineSupportStrategyEditorProps) {
  const isLifecycleLocked = claim.lifecycleStage === 'Assessed';
  const hasEditRole = canEditSupportStrategy(CURRENT_USER_ROLE);
  const canEdit = hasEditRole && !isLifecycleLocked;

  // F01 — click-to-edit state (matches ClaimWorkspace pattern)
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(claim.supportStrategy);
  const [savedToast, setSavedToast] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep draft in sync if claim changes externally
  React.useEffect(() => {
    if (!isEditing) setDraft(claim.supportStrategy);
  }, [claim.supportStrategy, isEditing]);

  const allClaims: Claim[] = (claim as any)._allClaims ?? [claim];

  const buildAuditEntry = (beforeVal: string, afterVal: string): AuditEntry => ({
    id: `AUD-SS-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: CURRENT_USER,
    actorRole: CURRENT_USER_ROLE,
    action: 'SUPPORT_STRATEGY_UPDATED',
    field: 'supportStrategy',
    beforeValue: beforeVal,
    afterValue: afterVal,
    surface: 'inline',
  });

  const commitSave = () => {
    // F02 — server-side rejection simulation (guards against stale UI)
    if (!hasEditRole) {
      console.error('[403 PERMISSION_DENIED] Insufficient role to edit Support Strategy.');
      setIsEditing(false);
      return;
    }
    if (isLifecycleLocked) {
      console.error('[423 LOCKED] Support Strategy is locked — claim is in Assessed state.');
      setIsEditing(false);
      return;
    }
    const trimmedNew = draft.trim();
    const trimmedOld = (claim.supportStrategy || '').trim();
    // F06 — no-op save is not audited or notified
    if (trimmedNew === trimmedOld) { setIsEditing(false); return; }
    const now = new Date().toISOString();
    const auditEntry = buildAuditEntry(claim.supportStrategy, draft);
    const updated: Claim = {
      ...claim,
      supportStrategy: draft,
      supportStrategyLastModifiedBy: CURRENT_USER,
      supportStrategyLastModifiedAt: now,
      updatedAt: now,
      auditLog: [...(claim.auditLog || []), auditEntry],
    };
    onClaimsChange?.(allClaims.map(c => c.id === claim.id ? updated : c));
    // F05 — notify
    window.dispatchEvent(new CustomEvent('supportStrategyChanged', {
      detail: { claimId: claim.id, modifiedBy: CURRENT_USER, timestamp: now, strategy: draft }
    }));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    setDraft(claim.supportStrategy);
    setIsEditing(false);
  };

  const applyFormat = (fmt: 'bold' | 'italic' | 'bullet' | 'link') => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = draft.substring(start, end);
    let replacement = '';
    if (fmt === 'bold') replacement = `**${selected || 'bold text'}**`;
    if (fmt === 'italic') replacement = `_${selected || 'italic text'}_`;
    if (fmt === 'bullet') replacement = `\n• ${selected || 'item'}`;
    if (fmt === 'link') replacement = `[${selected || 'link text'}](https://)`;
    const newVal = draft.substring(0, start) + replacement + draft.substring(end);
    setDraft(newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + replacement.length, start + replacement.length); }, 0);
  };

  return (
    <div className="flex gap-4 items-start">
      {/* 70% — Strategy editor */}
      <div className="flex-[7] min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <label className="block text-xs text-sky/70 uppercase tracking-wide font-semibold">Support Strategy</label>
            {/* F02 — role badge */}
            <span className="text-[10px] bg-sky/10 text-sky px-2 py-0.5 rounded-full border border-sky/20 cursor-help" title="Editable by: Claims Lead, R&D TPL, Nutritionist, Substantiator">
              Claims Lead · TPL · Nutritionist · Substantiator
            </span>
          </div>
          <div className="flex items-center gap-2">
            {savedToast && (
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 animate-pulse">✓ Saved</span>
            )}
            {/* F02 — lifecycle lock badge */}
            {isLifecycleLocked && (
              <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <Lock className="w-2.5 h-2.5" /> Locked after assessment
              </span>
            )}
            {/* F01 — Edit button for edit-permitted users when not editing */}
            {canEdit && !isEditing && (
              <button
                onClick={() => { setIsEditing(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                className="text-xs text-sky hover:text-sky/80 border border-sky/30 px-2.5 py-0.5 rounded-lg hover:bg-sky/5 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </div>

        {/* F02 — view-only static render (or read-mode that activates on click) */}
        {!canEdit || !isEditing ? (
          <div
            onClick={() => { if (canEdit) { setIsEditing(true); } }}
            className={`min-h-[72px] px-3 py-2.5 rounded-lg border text-sm leading-relaxed transition-all rich-text-content
              ${isLifecycleLocked
                ? 'bg-gray-50 border-pebble text-gray-500 cursor-default'
                : !hasEditRole
                  ? 'bg-gray-50 border-pebble text-gray-600 cursor-default'
                  : 'bg-earth/30 border-pebble text-night cursor-text hover:border-sky/40 hover:bg-earth/50'
              }`}
          >
            {claim.supportStrategy
              ? <div dangerouslySetInnerHTML={{ __html: claim.supportStrategy }} />
              : <span className="text-gray-400 italic">
                  {isLifecycleLocked || !hasEditRole ? 'No support strategy recorded.' : 'Click to add support strategy…'}
                </span>
            }
          </div>
        ) : (
          /* F01 — Rich-text editor (toolbar + contentEditable) when editing */
          <div className="border border-sky/30 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky/30">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                // F01 — auto-save on blur
                if (isEditing) {
                  const timer = setTimeout(() => {
                    commitSave();
                  }, 300);
                  setAutoSaveTimer(timer);
                }
              }}
              placeholder="Describe the support strategy and justification for this claim…"
              className="w-full px-4 py-3 text-sm text-night focus:outline-none resize-none bg-white"
              rows={6}
            />
          </div>
        )}

        {/* F01 — Save / Cancel controls when editing */}
        {isEditing && canEdit && (
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={() => {
                if (autoSaveTimer) clearTimeout(autoSaveTimer);
                commitSave();
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors"
            >
              <Save className="w-3 h-3" /> Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 border border-pebble text-gray-500 rounded-lg text-xs hover:bg-earth transition-colors"
            >
              Cancel
            </button>
            <span className="text-[10px] text-gray-400 ml-1">Auto-saves on blur</span>
          </div>
        )}

        {!hasEditRole && (
          <p className="mt-1 text-[10px] text-gray-400">View-only. Edit access requires Claims Lead, TPL, Nutritionist, or Substantiator role.</p>
        )}
        {claim.supportStrategyLastModifiedBy && (
          <p className="mt-1 text-[10px] text-gray-400">
            Last modified by <span className="font-medium">{claim.supportStrategyLastModifiedBy}</span>
            {claim.supportStrategyLastModifiedAt && <> on {new Date(claim.supportStrategyLastModifiedAt).toLocaleString()}</>}
          </p>
        )}
      </div>

      {/* 30% — Docs */}
      <div className="flex-[3] min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs text-sky/70 uppercase tracking-wide font-semibold">Documents ({claim.substantiationDocs.length})</label>
          {canEdit && (
            <button onClick={() => fileRef.current[claim.id]?.click()} className="flex items-center gap-1 text-xs text-sky hover:underline">
              <Upload className="w-3 h-3" /> Upload
            </button>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          ref={el => { fileRef.current[claim.id] = el; }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file && onClaimsChange) {
              const doc = { id: `DOC-${Date.now()}`, fileName: file.name, classification: '', uploadedAt: new Date().toISOString(), uploadedBy: CURRENT_USER };
              onClaimsChange(allClaims.map(c => c.id === claim.id ? { ...c, substantiationDocs: [...c.substantiationDocs, doc] } : c));
            }
          }}
        />
        {claim.substantiationDocs.length === 0 ? (
          <div className="text-xs text-gray-400 italic">No documents uploaded</div>
        ) : (
          <div className="space-y-1">
            {claim.substantiationDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-white/70 rounded-lg border border-sky/10">
                <FileText className="w-3 h-3 text-sky/50 flex-shrink-0" />
                <span className="text-xs text-night truncate flex-1">{doc.fileName}</span>
                {/* F04 — editable classification (US-M5.1-F04) */}
                {canEdit ? (
                  <select
                    value={doc.classification || ''}
                    onChange={e => {
                      if (!onClaimsChange) return;
                      onClaimsChange(allClaims.map(c => c.id === claim.id
                        ? { ...c, substantiationDocs: c.substantiationDocs.map(d => d.id === doc.id ? { ...d, classification: e.target.value } : d) }
                        : c
                      ));
                    }}
                    className="text-xs border border-pebble rounded px-1 py-0.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-sky flex-shrink-0"
                  >
                    <option value="">⚠ Classify…</option>
                    {['Level 1 (GO)', 'Level 2 (ASK)', 'Level 3 (NO GO)', 'Internal Reference', 'Published Study', 'Consumer Panel', 'Regulatory Filing'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                ) : (
                  doc.classification
                    ? <span className="text-xs text-gray-400 flex-shrink-0">{doc.classification}</span>
                    : <span className="text-xs text-amber-500 flex-shrink-0">⚠ Unclassified</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plain-text summary chip (no background color badges) ──────────────────────
function SummaryChip({ label }: { label: string; variant?: string }) {
  return (
    <span className="text-xs text-gray-600">{label}</span>
  );
}

interface ClaimsTableProps {
  claims: Claim[];
  activeWorkView: ClaimWorkView | null;
  selectedIds: string[];
  onSelectId: (id: string) => void;
  onSelectAll: () => void;
  onClaimClick: (claim: Claim) => void;
  activeBaseView: ClaimBaseView;
  onClaimsChange?: (claims: Claim[]) => void;
}

export default function ClaimsTable({
  claims,
  activeWorkView,
  selectedIds,
  onSelectId,
  onSelectAll,
  onClaimClick,
  activeBaseView,
  onClaimsChange,
}: ClaimsTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<string, 'support' | 'final' | 'risk' | 'comments' | null>>({});
  const [expandedVersionIds, setExpandedVersionIds] = useState<Set<string>>(new Set());

  interface CommentEntry {
    id: string;
    author: string;
    initials: string;
    text: string;
    timestamp: string;
  }

  const [claimComments, setClaimComments] = useState<Record<string, CommentEntry[]>>({
    'CLM-001': [
      {
        id: 'c1',
        author: 'Sarah Johnson',
        initials: 'SJ',
        text: 'Claim substantiation looks good — please ensure the doc classification is updated.',
        timestamp: '2026-04-28T10:30:00Z',
      },
      {
        id: 'c2',
        author: 'Michael Chen',
        initials: 'MC',
        text: '@Sarah Johnson Done — all docs are now classified as Level 1.',
        timestamp: '2026-04-28T11:05:00Z',
      },
    ],
    'CLM-002': [
      {
        id: 'c3',
        author: 'David Smith',
        initials: 'DS',
        text: 'Need to upload supply chain certificate for cage-free eggs.',
        timestamp: '2026-05-10T14:22:00Z',
      }
    ],
    'CLM-003': [
      {
        id: 'c4',
        author: 'Patricia Martinez',
        initials: 'PM',
        text: 'Competitor challenge seems to focus on the term 99%. We must provide specific stain list.',
        timestamp: '2026-05-15T09:40:00Z',
      }
    ]
  });

  // US-M4-015 to 030: Auto-expand rows and sync section when a Work View is selected from Sidebar
  useEffect(() => {
    if (activeWorkView) {
      const section: 'support' | 'final' | 'risk' = 
        activeWorkView === 'Support Strategy & Substantiation' ? 'support' :
        activeWorkView === 'Final Risk Summary' ? 'final' : 'risk';
      
      // Auto-expand all currently visible claims
      setExpandedIds(new Set(claims.map(c => c.id)));
      
      // Force all expanded claims to show the relevant section tab
      setExpandedSections(prev => {
        const next = { ...prev };
        claims.forEach(c => {
          next[c.id] = section;
        });
        return next;
      });
    } else {
      // If returning to "Base View" (activeWorkView is null), we collapse all to keep it clean
      setExpandedIds(new Set());
      setExpandedSections({});
    }
  }, [activeWorkView, claims]);

  // US-M4-011: file upload per claim
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  // US-M4-012: inline risk assessment form state per claim
  const [riskForms, setRiskForms] = useState<Record<string, { fn: string; risk: string; comments: string; geo: string }>>({});
  const emptyRiskForm = { fn: 'R&D', risk: 'Low', comments: '', geo: '' };

  // Search, Sorting & Table Settings
  const [colSearch, setColSearch] = useState<Record<string, string>>({});
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [activeHeaderDropdown, setActiveHeaderDropdown] = useState<string | null>(null);

  const toggleFavorite = (claim: Claim) => {
    if (!onClaimsChange) return;
    const updated = { ...claim, isFavorite: !claim.isFavorite };
    onClaimsChange(claims.map(c => c.id === claim.id ? updated : c));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Auto-set section based on activeWorkView
        const autoSection: 'support' | 'final' | 'risk' | null =
          activeWorkView === 'Support Strategy & Substantiation' ? 'support' :
          activeWorkView === 'Final Risk Summary' ? 'final' :
          activeWorkView === 'Risk Level Assessments' ? 'risk' : null;
        setExpandedSections(ps => ({ ...ps, [id]: autoSection }));
        next.add(id);
      }
      return next;
    });
  };

  const toggleSection = (id: string, section: 'support' | 'final' | 'risk' | 'comments') => {
    setExpandedSections(prev => ({ ...prev, [id]: prev[id] === section ? null : section }));
  };

  const hideGeography = activeBaseView === 'Global Claims';

  // ─── Column reorder ────────────────────────────────────────────────────────
  const BASE_COLUMNS = [
    { id: 'claimStatement', label: 'Claim Statement', width: 300 },
    { id: 'version',        label: 'Version',          width: 100 },
    { id: 'order',          label: 'Order',             width: 80  },
    { id: 'lifecycle',      label: 'Lifecycle',         width: 150 },
    { id: 'channels',       label: 'Marketing Channels',width: 180 },
    { id: 'finalRisk',      label: 'Final Risk',        width: 140 },
    { id: 'product',        label: 'Product',           width: 180 },
    { id: 'restricted',     label: 'Restricted',        width: 110 },
    { id: 'identifier',     label: 'Identifier',        width: 130 },
    { id: 'category',       label: 'Category',          width: 140 },
    ...(!hideGeography ? [{ id: 'geography', label: 'Geography', width: 140 }] : []),
    { id: 'relatedProjects',label: 'Related Projects',  width: 160 },
  ];

  const [columnOrder, setColumnOrder] = useState(BASE_COLUMNS);
  const [draggedCol, setDraggedCol] = useState<number | null>(null);

  const filteredAndSortedClaims = React.useMemo(() => {
    return claims
      .filter(claim => {
        return Object.entries(colSearch).every(([colId, query]) => {
          if (!query) return true;
          const q = query.toLowerCase();
          const version = claim.versions[claim.currentVersion];
          const primaryStatement = claim.claimType === 'Global' ? version.globalStatement : version.localStatement;
          
          switch (colId) {
            case 'claimStatement': return primaryStatement?.toLowerCase().includes(q) || claim.id.toLowerCase().includes(q);
            case 'lifecycle': return claim.lifecycleStage.toLowerCase().includes(q);
            case 'type': return claim.claimType.toLowerCase().includes(q);
            case 'channels': return claim.marketingChannels.some(ch => ch.toLowerCase().includes(q));
            case 'finalRisk': return (claim.finalRiskLevel || '').toLowerCase().includes(q);
            case 'product': return claim.productName.toLowerCase().includes(q);
            case 'identifier': return (claim.claimIdentifier || '').toLowerCase().includes(q);
            case 'category': return (claim.claimCategory || '').toLowerCase().includes(q);
            case 'geography': return (claim.geography || '').toLowerCase().includes(q);
            default: return true;
          }
        });
      })
      .sort((a, b) => {
        if (!sortCol || !sortDir) return 0;
        const aVer = a.versions[a.currentVersion];
        const bVer = b.versions[b.currentVersion];
        
        let aVal = '';
        let bVal = '';
        
        if (sortCol === 'claimStatement') {
          aVal = a.claimType === 'Global' ? aVer.globalStatement : aVer.localStatement;
          bVal = b.claimType === 'Global' ? bVer.globalStatement : bVer.localStatement;
        } else if (sortCol === 'version') {
          aVal = aVer.versionNumber;
          bVal = bVer.versionNumber;
        } else if (sortCol === 'finalRisk') {
          aVal = a.finalRiskLevel || '';
          bVal = b.finalRiskLevel || '';
        } else if (sortCol === 'product') {
          aVal = a.productName;
          bVal = b.productName;
        } else if (sortCol === 'identifier') {
          aVal = a.claimIdentifier || '';
          bVal = b.claimIdentifier || '';
        } else if (sortCol === 'category') {
          aVal = a.claimCategory || '';
          bVal = b.claimCategory || '';
        } else if (sortCol === 'geography') {
          aVal = a.geography || '';
          bVal = b.geography || '';
        } else {
          aVal = (a as any)[sortCol] || '';
          bVal = (b as any)[sortCol] || '';
        }
        
        return sortDir === 'asc'
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
  }, [claims, colSearch, sortCol, sortDir]);

  const allSelected = filteredAndSortedClaims.length > 0 && selectedIds.length === filteredAndSortedClaims.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredAndSortedClaims.length;

  const handleSort = (colId: string) => {
    if (sortCol === colId) {
      setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
      if (sortDir === 'desc') setSortCol(null);
    } else {
      setSortCol(colId);
      setSortDir('asc');
    }
  };

  const renderSortIcon = (colId: string) => {
    if (sortCol !== colId) return <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0" />;
    return sortDir === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-sky stroke-[2.5] flex-shrink-0" />
      : <ChevronDown className="w-3.5 h-3.5 text-sky stroke-[2.5] flex-shrink-0" />;
  };

  const handleColDragStart = (i: number) => setDraggedCol(i);
  const handleColDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (draggedCol === null || draggedCol === i) return;
    const next = [...columnOrder];
    const [item] = next.splice(draggedCol, 1);
    next.splice(i, 0, item);
    setColumnOrder(next);
    setDraggedCol(i);
  };
  const handleColDragEnd = () => setDraggedCol(null);

  const renderClaimCell = (claim: Claim, colId: string, primaryStatement: string, isLatest: boolean, isSelected: boolean, bgOverride?: string) => {
    const col = columnOrder.find(c => c.id === colId);
    const colWidth = col ? col.width : 100;
    const cellStyle = {
      width: colWidth,
      minWidth: colWidth,
    };

    switch (colId) {
      case 'claimStatement':
        return (
          <td 
            key={colId} 
            className={`px-3 py-2 ${isFrozen ? "sticky left-[120px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
            style={{
              ...cellStyle,
              ...(isFrozen ? { backgroundColor: bgOverride || (isSelected ? "#F3F7FC" : "#ffffff") } : {})
            }}
          >
            <div className="flex flex-col gap-1 overflow-hidden">
              <button onClick={() => onClaimClick(claim)} className="text-left text-night leading-relaxed hover:text-sky transition-colors line-clamp-2 truncate font-medium">
                {primaryStatement}
              </button>
              <div className="flex items-center gap-1.5 mt-1">
                {claim.challenged && (
                  <span className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                    <Flag className="w-3 h-3" /> Challenged
                  </span>
                )}
                {claim.lifecycleStage === 'Expired' && (
                  <span className="flex items-center gap-1 text-xs text-orange-600 font-medium ml-2">
                    <AlertCircle className="w-3 h-3" /> Expired
                  </span>
                )}
              </div>
            </div>
          </td>
        );
      case 'version':
        return (
          <td key={colId} className="px-3 py-2" style={cellStyle}>
            <div className="flex flex-col gap-1 overflow-hidden items-start">
              {claim.versions.length > 1 ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedVersionIds(prev => {
                      const next = new Set(prev);
                      if (next.has(claim.id)) next.delete(claim.id);
                      else next.add(claim.id);
                      return next;
                    });
                  }}
                  className="text-sky hover:underline flex items-center gap-1 font-medium text-left"
                >
                  v{claim.versions[claim.currentVersion].versionNumber}
                  {expandedVersionIds.has(claim.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              ) : (
                <span className="text-night block truncate font-medium">v{claim.versions[claim.currentVersion].versionNumber}</span>
              )}
              {isLatest && <span className="text-xs text-green-700 font-medium block truncate">Latest</span>}
            </div>
          </td>
        );
      case 'order':
        return <td key={colId} className="px-3 py-2 text-gray-600 truncate" style={cellStyle}>{claim.order || '—'}</td>;
      case 'lifecycle':
        return <td key={colId} className="px-3 py-2 text-night truncate" style={cellStyle}>{claim.lifecycleStage}</td>;
      case 'channels':
        return (
          <td key={colId} className="px-3 py-2" style={cellStyle}>
            <div className="flex flex-wrap gap-1 overflow-hidden">
              {claim.marketingChannels.slice(0, 2).map((ch, i) => (
                <span key={ch} className="text-xs text-gray-600 block truncate">
                  {ch}{i === 0 && claim.marketingChannels.length > 1 ? ', ' : ''}
                </span>
              ))}
              {claim.marketingChannels.length > 2 && (
                <span className="text-xs text-gray-500 ml-1">+{claim.marketingChannels.length - 2}</span>
              )}
            </div>
          </td>
        );
      case 'finalRisk':
        return (
          <td key={colId} className="px-3 py-2" style={cellStyle}>
            {claim.finalRiskLevel ? (
              <span className="text-xs font-semibold text-night block truncate">{claim.finalRiskLevel}</span>
            ) : (
              <span className="text-gray-400 text-xs block truncate">—</span>
            )}
          </td>
        );
      case 'product':
        return (
          <td key={colId} className="px-3 py-2" style={cellStyle}>
            <span className="text-xs text-gray-700 font-medium block truncate" title={claim.productName}>{claim.productName}</span>
          </td>
        );
      case 'restricted':
        return (
          <td key={colId} className="px-3 py-2 text-center" style={cellStyle}>
            {claim.restrictedUse ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 text-red-700 border border-red-200 uppercase font-bold block truncate">Yes</span>
            ) : (
              <span className="text-gray-400 text-xs block truncate">—</span>
            )}
          </td>
        );
      case 'identifier':
        return (
          <td key={colId} className="px-3 py-2" style={cellStyle}>
            {claim.claimIdentifier ? (
              <span className="text-xs text-gray-700 font-mono block truncate">{claim.claimIdentifier}</span>
            ) : (
              <span className="text-gray-400 text-xs block truncate">—</span>
            )}
          </td>
        );
      case 'category':
        return (
          <td key={colId} className="px-3 py-2" style={cellStyle}>
            {claim.claimCategory ? (
              <span className="text-xs text-gray-700 block truncate">{claim.claimCategory}</span>
            ) : (
              <span className="text-gray-400 text-xs block truncate">—</span>
            )}
          </td>
        );
      case 'geography':
        return (
          <td key={colId} className="px-3 py-2" style={cellStyle}>
            {claim.geography ? (
              <span className="text-xs text-gray-700 block truncate">{claim.geography}</span>
            ) : (
              <span className="text-gray-400 text-xs block truncate">—</span>
            )}
          </td>
        );
      case 'relatedProjects':
        return (
          <td key={colId} className="px-3 py-2" style={cellStyle}>
            {claim.relatedProjectIds.length > 0 ? (
              <span className="text-xs text-gray-700 block truncate">{claim.relatedProjectIds.length}</span>
            ) : (
              <span className="text-gray-400 text-xs block truncate">—</span>
            )}
          </td>
        );
      default:
        return <td key={colId} className="px-3 py-2" style={cellStyle}>—</td>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
      <div className="flex-1 overflow-auto no-scrollbar">
        <table className="w-full border-collapse text-sm" style={{ minWidth: "1200px" }}>
          <thead className="bg-earth sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              {/* Checkbox */}
              <th
                className={`px-3 py-3 ${isFrozen ? "sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                style={{
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                }}
              >
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border border-gray-400 text-sky focus:ring-2 focus:ring-sky cursor-pointer transition-colors"
                />
              </th>

              {/* Favorite */}
              <th
                className={`px-3 py-3 ${isFrozen ? "sticky left-[40px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                style={{
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                }}
              ></th>

              {/* Expand */}
              <th
                className={`px-3 py-3 ${isFrozen ? "sticky left-[80px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                style={{
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  ...(isFrozen ? { backgroundColor: "#F6F7F0" } : {})
                }}
              ></th>

              {/* Draggable columns */}
              {columnOrder.map((col, index) => {
                const isSticky = isFrozen && col.id === "claimStatement";
                const leftOffset = 120;
                return (
                  <th
                    key={col.id}
                    draggable
                    onDragStart={() => handleColDragStart(index)}
                    onDragOver={(e) => handleColDragOver(e, index)}
                    onDragEnd={handleColDragEnd}
                    style={{
                      width: col.width,
                      minWidth: col.width,
                      ...(isSticky ? { position: "sticky", left: leftOffset, zIndex: 20, backgroundColor: "#F6F7F0", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {})
                    }}
                    className={`px-4 py-3 text-left relative ${col.id !== "actions" ? "cursor-move" : ""} ${draggedCol === index ? "opacity-50 bg-pale" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-1.5 w-full">
                      <button
                        onClick={() => handleSort(col.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-night transition-colors uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-sky rounded text-left truncate flex-1"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-gray-300 cursor-move flex-shrink-0" />
                        <span className="truncate">{col.label}</span>
                        {renderSortIcon(col.id)}
                      </button>

                      <div className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHeaderDropdown(activeHeaderDropdown === col.id ? null : col.id);
                          }}
                          className={`p-1 rounded hover:bg-pebble/60 transition-colors text-gray-500 hover:text-sky flex items-center justify-center ${activeHeaderDropdown === col.id ? "text-sky bg-pebble/30" : ""} ${colSearch[col.id] ? "text-sky font-semibold" : ""}`}
                        >
                          <Search className="w-3 h-3" />
                        </button>

                        {activeHeaderDropdown === col.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setActiveHeaderDropdown(null); }} />
                            <div className="absolute right-0 top-full mt-2 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[240px] p-3 text-left font-normal normal-case tracking-normal" onClick={(e) => e.stopPropagation()}>
                              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Filter {col.label}</div>
                              <div className="relative">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={colSearch[col.id] || ""}
                                  onChange={(e) =>
                                    setColSearch((p) => ({
                                      ...p,
                                      [col.id]: e.target.value,
                                    }))
                                  }
                                  placeholder={`Search...`}
                                  className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-1 focus:ring-sky text-night bg-white font-normal"
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}

              {/* Table Level Actions Dropdown Header */}
              <th className="w-10 px-3 py-3">
                <div className="relative">
                  <button
                    onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
                    className="p-1 rounded hover:bg-pebble/60 transition-colors text-gray-500 flex items-center justify-center focus:outline-none"
                    title="Table Settings"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {isTableMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsTableMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[200px] py-1.5 overflow-hidden text-left font-normal normal-case tracking-normal">
                        <button
                          onClick={() => {
                            setIsTableMenuOpen(false);
                            setIsFrozen(!isFrozen);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-night hover:bg-earth transition-colors"
                        >
                          {isFrozen ? <EyeOff className="w-4 h-4 text-sky" /> : <Eye className="w-4 h-4 text-sky" />}
                          {isFrozen ? "Unfreeze Columns" : "Freeze Columns"}
                        </button>
                        <button
                          onClick={() => {
                            setIsTableMenuOpen(false);
                            setColumnOrder(BASE_COLUMNS);
                            setSortCol(null);
                            setSortDir(null);
                            setColSearch({});
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-night hover:bg-earth transition-colors"
                        >
                          <span className="text-gray-400">↺</span> Reset Table State
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {filteredAndSortedClaims.map(claim => {
              const isSelected = selectedIds.includes(claim.id);
              const isExpanded = expandedIds.has(claim.id);
              const expandedSection = expandedSections[claim.id];
              const version = claim.versions[claim.currentVersion];
              const primaryStatement = claim.claimType === 'Global' ? version.globalStatement : version.localStatement;
              const isLatest = version.isLatest;

              return (
                <React.Fragment key={claim.id}>
                  <tr
                    className={`border-b border-gray-300 transition-colors ${
                      isSelected ? 'bg-pale/30 font-medium' : 'hover:bg-earth/50'
                    }`}
                    style={{ height: 48 }}
                  >
                    {/* Checkbox */}
                    <td
                      className={`px-3 py-3 ${isFrozen ? "sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                      style={{
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        ...(isFrozen ? { backgroundColor: "#ffffff" } : {})
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectId(claim.id)}
                        className="w-4 h-4 rounded border border-gray-400 text-sky focus:ring-2 focus:ring-sky cursor-pointer transition-colors"
                      />
                    </td>

                    {/* Favorite */}
                    <td
                      className={`px-3 py-3 ${isFrozen ? "sticky left-[40px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                      style={{
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        ...(isFrozen ? { backgroundColor: "#ffffff" } : {})
                      }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(claim); }}
                        className="focus:outline-none transition-transform duration-200 transform hover:scale-110 mt-0.5"
                      >
                        <Star
                          className={`w-4 h-4 transition-all ${
                            claim.isFavorite
                              ? 'fill-yellow-400 text-yellow-500'
                              : 'text-gray-300 hover:text-yellow-400 hover:fill-yellow-100'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Expand chevron */}
                    <td
                      className={`px-3 py-3 ${isFrozen ? "sticky left-[80px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
                      style={{
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        ...(isFrozen ? { backgroundColor: "#ffffff" } : {})
                      }}
                    >
                      <button
                        onClick={() => toggleExpand(claim.id)}
                        className="text-gray-400 hover:text-sky transition-colors focus:outline-none"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Draggable data cells */}
                    {columnOrder.map((col) => renderClaimCell(claim, col.id, primaryStatement, isLatest, isSelected))}

                    {/* Actions column cell */}
                    <td className="px-3 py-3 w-10"></td>
                  </tr>

                  {/* Version History Expansion */}
                  {expandedVersionIds.has(claim.id) && claim.versions.map((ver, idx) => {
                    if (idx === claim.currentVersion) return null; // Skip current version
                    const verStatement = claim.claimType === 'Global' ? ver.globalStatement : ver.localStatement;
                    const oldClaim = { ...claim, currentVersion: idx };
                    return (
                      <tr
                        key={`${claim.id}-v${ver.versionNumber}`}
                        className="border-b border-gray-200 bg-gray-50 opacity-80 hover:opacity-100 transition-opacity"
                        style={{ height: 48 }}
                      >
                        {/* Checkbox */}
                        <td className={`px-3 py-3 ${isFrozen ? "sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`} style={{ width: "40px", minWidth: "40px", maxWidth: "40px", ...(isFrozen ? { backgroundColor: "#f9fafb" } : {}) }}></td>
                        
                        {/* Favorite */}
                        <td className={`px-3 py-3 ${isFrozen ? "sticky left-[40px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`} style={{ width: "40px", minWidth: "40px", maxWidth: "40px", ...(isFrozen ? { backgroundColor: "#f9fafb" } : {}) }}></td>
                        
                        {/* Expand chevron */}
                        <td className={`px-3 py-3 ${isFrozen ? "sticky left-[80px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`} style={{ width: "40px", minWidth: "40px", maxWidth: "40px", ...(isFrozen ? { backgroundColor: "#f9fafb" } : {}) }}>
                          <span className="text-gray-400 flex justify-center text-lg">↳</span>
                        </td>

                        {/* Draggable data cells */}
                        {columnOrder.map((col) => {
                          return renderClaimCell(oldClaim, col.id, verStatement, ver.isLatest, false, "#f9fafb");
                        })}

                        {/* Actions column cell */}
                        <td className="px-3 py-3 w-10"></td>
                      </tr>
                    );
                  })}

                  {/* Inline Expanded Workbench */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={columnOrder.length + 3} className="p-0">
                        <div className="border-b-2 border-sky/20" style={{ background: '#EEF4FB' }}>
                          <div className="p-4 space-y-2">
                          {/* Collapsible Accordion Sections (Substantiations, Final Risk) */}
                          {/* Section 1: Substantiations */}
                          <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => toggleSection(claim.id, 'support')}
                              className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-night font-medium">Substantiations</span>
                              </div>
                                  {expandedSection === 'support' ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                                {expandedSection === 'support' && (
                                  <div className="px-6 py-5 border-t border-pebble bg-pale/5">
                                    <InlineSupportStrategyEditor
                                      claim={claim}
                                      onClaimsChange={onClaimsChange}
                                      fileRef={fileRefs}
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Section 2: Risk Level Assessments */}
                              <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => toggleSection(claim.id, 'risk')}
                                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-night font-medium">Risk Level Assessments</span>
                                    {claim.finalRiskLevel && (
                                      <span className="text-[10px] font-semibold text-night bg-white px-2 py-0.5 rounded-full border border-pebble">
                                        {claim.finalRiskLevel}
                                      </span>
                                    )}
                                  </div>
                                  {expandedSection === 'risk' ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                                {expandedSection === 'risk' && (
                                  <div className="px-6 py-5 border-t border-pebble bg-pale/5">
                                    {claim.finalRiskSummary.inheritanceTrace && (
                                      <div className="mb-4 bg-pale/60 text-sky text-xs px-3 py-2 rounded-lg border border-sky/20">
                                        <span className="font-semibold mr-1">ℹ Note:</span> {claim.finalRiskSummary.inheritanceTrace}
                                      </div>
                                    )}
                                    <div className="grid grid-cols-4 gap-6 mb-5">
                                      <div>
                                        <label className="block text-[10px] text-sky/70 uppercase tracking-wide mb-1.5 font-semibold">Final Risk Level</label>
                                        <div className="text-sm font-semibold text-night">{claim.finalRiskLevel || 'Not assessed'}</div>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-sky/70 uppercase tracking-wide mb-1.5 font-semibold">Classification</label>
                                        <div className="text-sm font-semibold text-night">{claim.finalRiskSummary.claimClassificationLevel || '—'}</div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="block text-[10px] text-sky/70 uppercase tracking-wide mb-1.5 font-semibold">Reason</label>
                                        <div className="text-sm text-gray-700 leading-relaxed">{claim.finalRiskSummary.reason || '—'}</div>
                                      </div>
                                    </div>
                                    
                                    {/* Functional Summaries */}
                                    <div className="grid grid-cols-2 gap-6 bg-white/50 p-4 rounded-lg border border-sky/10">
                                      <div>
                                        <label className="block text-[10px] text-sky/70 uppercase tracking-wide mb-1.5 font-semibold">Claims Forum Summary</label>
                                        <div className="text-sm text-gray-600 italic">{(claim.finalRiskSummary as any).claimsForumSummary || '—'}</div>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-sky/70 uppercase tracking-wide mb-1.5 font-semibold">Legal Summary</label>
                                        <div className="text-sm text-gray-700">{claim.finalRiskSummary.legalSummary || '—'}</div>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-sky/70 uppercase tracking-wide mb-1.5 font-semibold">RA Summary</label>
                                        <div className="text-sm text-gray-700">{claim.finalRiskSummary.raSummary || '—'}</div>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] text-sky/70 uppercase tracking-wide mb-1.5 font-semibold">R&amp;D Summary</label>
                                        <div className="text-sm text-gray-700">{claim.finalRiskSummary.rdSummary || '—'}</div>
                                      </div>
                                      <div className="col-span-2">
                                        <label className="block text-[10px] text-sky/70 uppercase tracking-wide mb-1.5 font-semibold">Marketing Feedback</label>
                                        <div className="text-sm text-gray-700">{claim.finalRiskSummary.marketingFeedback || '—'}</div>
                                        <div className="mt-1.5 text-xs">
                                          <span className="font-medium text-gray-500">Signoff Status: </span>
                                          {claim.finalRiskSummary.marketingRiskSignoff ? <span className="text-green-600 font-medium">✓ Complete</span> : <span className="text-gray-500">Pending</span>}
                                        </div>
                                      </div>
                                    </div>

                                    {/* M6: iRA Output Block */}
                                    {claim.finalRiskSummary.iRAOutput === 'Completed' && (
                                      <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                          <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">iRA Automated Assessment</span>
                                          <span className="px-2 py-0.5 rounded-md text-[10px] bg-blue-600 text-white font-semibold shadow-sm">iRA</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                          <div>
                                            <span className="text-[10px] text-blue-600 font-semibold uppercase block mb-1">Final Risk Level (iRA)</span>
                                            <div className="text-sm font-bold text-blue-900">{claim.finalRiskLevelIRA || '—'}</div>
                                          </div>
                                          <div>
                                            <span className="text-[10px] text-blue-600 font-semibold uppercase block mb-1">Classification Level (iRA)</span>
                                            <div className="text-sm font-bold text-blue-900">{claim.finalRiskSummary.claimClassificationLevelIRA || '—'}</div>
                                          </div>
                                          <div className="col-span-2">
                                            <span className="text-[10px] text-blue-600 font-semibold uppercase block mb-1">Reasons (iRA)</span>
                                            <div className="text-sm text-blue-800 leading-relaxed">{claim.finalRiskSummary.reasonIRA || '—'}</div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Section 3: Comments */}
                              <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => toggleSection(claim.id, 'comments')}
                                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-earth transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-night font-medium">Comments</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-pebble font-semibold">
                                      {(claimComments[claim.id] || []).length}
                                    </span>
                                  </div>
                                  {expandedSection === 'comments' ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                                {expandedSection === 'comments' && (
                                  <div className="px-6 py-5 border-t border-pebble bg-pale/5">
                                    <div className="space-y-4 max-h-60 overflow-y-auto mb-4 no-scrollbar">
                                      {(claimComments[claim.id] || []).length === 0 ? (
                                        <div className="text-xs text-gray-400 italic py-2">No comments yet. Be the first to start the discussion.</div>
                                      ) : (
                                        (claimComments[claim.id] || []).map((c) => (
                                          <div key={c.id} className="flex gap-3">
                                            <div className="w-7 h-7 rounded-full bg-sky text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                              {c.initials}
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-xs font-semibold text-night">
                                                  {c.author}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                  {new Date(c.timestamp).toLocaleString()}
                                                </span>
                                              </div>
                                              <p className="text-xs text-gray-700 leading-relaxed bg-earth rounded-lg px-3 py-2">
                                                {c.text}
                                              </p>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      <textarea
                                        id={`new-comment-${claim.id}`}
                                        placeholder="Add a comment... (Press Send or Enter to submit)"
                                        rows={2}
                                        className="flex-1 px-3 py-2 border border-pebble rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky resize-none bg-white text-night"
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            const target = e.currentTarget;
                                            const text = target.value.trim();
                                            if (text) {
                                              const newEntry: CommentEntry = {
                                                id: `c-${Date.now()}`,
                                                author: 'Current User',
                                                initials: 'CU',
                                                text,
                                                timestamp: new Date().toISOString()
                                              };
                                              setClaimComments(prev => ({
                                                ...prev,
                                                [claim.id]: [...(prev[claim.id] || []), newEntry]
                                              }));
                                              target.value = '';
                                            }
                                          }
                                        }}
                                      />
                                      <button
                                        onClick={() => {
                                          const textarea = document.getElementById(`new-comment-${claim.id}`) as HTMLTextAreaElement | null;
                                          if (textarea) {
                                            const text = textarea.value.trim();
                                            if (text) {
                                              const newEntry: CommentEntry = {
                                                id: `c-${Date.now()}`,
                                                author: 'Current User',
                                                initials: 'CU',
                                                text,
                                                timestamp: new Date().toISOString()
                                              };
                                              setClaimComments(prev => ({
                                                ...prev,
                                                [claim.id]: [...(prev[claim.id] || []), newEntry]
                                              }));
                                              textarea.value = '';
                                            }
                                          }
                                        }}
                                        className="px-4 bg-sky text-white rounded-lg hover:bg-dark text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                                      >
                                        <Send className="w-3.5 h-3.5" />
                                        Send
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                            </div>
                          </div>
                        </td>
                      </tr>
                  )}
                </React.Fragment>
              );
            })}
            {claims.length === 0 && (
              <tr>
              <td colSpan={columnOrder.length + 3} className="px-0 py-0">
                  <EmptyState
                    icon={FileText}
                    title="No claims found"
                    description="Try adjusting your filters or search to find claims."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}