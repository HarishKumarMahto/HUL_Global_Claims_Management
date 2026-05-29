import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronUp, Check, Flag, AlertCircle, FileText, Shield, Scale, Plus, Upload, X, Search, Lock, Save, Bold, Italic, List, Link, MoreHorizontal, Eye, EyeOff, ArrowUpDown, MessageSquare, Star, Send, Network } from 'lucide-react';
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
    <div className="flex flex-col gap-4">
      {/* Docs table taking full width */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs text-sky/70 uppercase tracking-wide font-semibold">Substantiation Evidence Documents ({claim.substantiationDocs.length})</label>
          {canEdit && (
            <button onClick={() => fileRef.current[claim.id]?.click()} className="flex items-center gap-1.5 text-xs text-sky hover:underline border border-sky/30 px-2.5 py-0.5 rounded-lg hover:bg-sky/5 transition-colors">
              <Plus className="w-3 h-3" /> Add Document
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
          <div className="text-xs text-gray-400 italic py-2">No documents uploaded. Click "Add Document" to attach substantiation evidence.</div>
        ) : (
          <div className="rounded-lg border border-pebble overflow-hidden bg-white">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-earth/60 border-b border-pebble">
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Substantiation Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Substantiation Evidence Document</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Uploaded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pebble">
                {claim.substantiationDocs.map(doc => (
                  <tr key={doc.id} className="hover:bg-earth/20 transition-colors">
                    <td className="px-3 py-2 text-night font-medium truncate max-w-[140px]">{doc.fileName.split('.')[0]}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-sky/50 flex-shrink-0" />
                        <span className="text-sky hover:underline cursor-pointer truncate max-w-[140px]">{doc.fileName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
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
                          className="text-xs border border-pebble rounded px-1 py-0.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-sky w-full max-w-[180px]"
                        >
                          <option value="">⚠ Classify…</option>
                          {['Level 1 (GO)', 'Level 2 (ASK)', 'Level 3 (NO GO)', 'Internal Reference', 'Published Study', 'Consumer Panel', 'Regulatory Filing'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      ) : (
                        doc.classification
                          ? <span className="text-gray-600">{doc.classification}</span>
                          : <span className="text-amber-500">⚠ Unclassified</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-gray-500">{doc.uploadedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
  isBulkSelectionEnabled?: boolean;
  onToggleBulkSelection?: () => void;
  lifecycleFilter?: ClaimLifecycle[];
  riskLevelFilter?: RiskLevel[];
  channelsFilter?: string[];
  geographyFilter?: string[];
  onClearLifecycleFilter?: () => void;
  onClearRiskLevelFilter?: () => void;
  onClearChannelsFilter?: () => void;
  onClearGeographyFilter?: () => void;
  onClearAllFilters?: () => void;
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
  isBulkSelectionEnabled = false,
  onToggleBulkSelection,
  lifecycleFilter = [],
  riskLevelFilter = [],
  channelsFilter = [],
  geographyFilter = [],
  onClearLifecycleFilter,
  onClearRiskLevelFilter,
  onClearChannelsFilter,
  onClearGeographyFilter,
  onClearAllFilters,
}: ClaimsTableProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  // Multi-open accordion: each claim can have multiple sections open simultaneously (US-M4-009, US-M4-012)
  const [expandedSections, setExpandedSections] = useState<Record<string, Set<'support' | 'final' | 'risk' | 'comments' | 'versions' | 'parent'>>>({});
  const [expandedVersionIds, setExpandedVersionIds] = useState<Set<string>>(new Set());
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string>>(new Set());
  // Track editing state for unsaved changes warning (US-M4-012)
  const [editingClaimId, setEditingClaimId] = useState<string | null>(null);
  // Risk record edit state (US-M4-011)
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [editingRiskDraft, setEditingRiskDraft] = useState<{riskLevel: string; comments: string; geography: string} | null>(null);
  const [replyingToComment, setReplyingToComment] = useState<Record<string, {id: string; author: string} | null>>({});

  interface CommentEntry {
    id: string;
    author: string;
    initials: string;
    text: string;
    timestamp: string;
    replyToId?: string;
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
        replyToId: 'c1',
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
      
      // Force all expanded claims to show the relevant section tab (multi-open)
      setExpandedSections(prev => {
        const next = { ...prev };
        claims.forEach(c => {
          next[c.id] = new Set([section]);
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

  const checkboxWidth = isBulkSelectionEnabled ? 40 : 0;
  const favoriteLeft = isBulkSelectionEnabled ? 40 : 0;
  const expandLeft = isBulkSelectionEnabled ? 80 : 40;
  const claimStatementLeft = isBulkSelectionEnabled ? 120 : 80;

  const toggleFavorite = (claim: any) => {
    if (!onClaimsChange) return;
    const versionIndex = claim.currentVersion;
    const updatedVersions = [...claim.versions];
    updatedVersions[versionIndex] = {
      ...updatedVersions[versionIndex],
      isFavorite: !updatedVersions[versionIndex].isFavorite
    };
    const updated = { ...claim, versions: updatedVersions };
    onClaimsChange(claims.map(c => c.id === claim.id ? updated : c));
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        // US-M4-012: warn if editing in this row
        if (editingClaimId === id) {
          const confirmed = window.confirm('You have unsaved changes. Collapse anyway?');
          if (!confirmed) return prev;
          setEditingClaimId(null);
        }
        next.delete(id);
        setExpandedSections(ps => { const n = {...ps}; delete n[id]; return n; });
      } else {
        // US-M4-009: Auto-open the relevant section, but allow all to be open (multi-open)
        const autoSection: 'support' | 'final' | 'risk' | null =
          activeWorkView === 'Support Strategy & Substantiation' ? 'support' :
          activeWorkView === 'Final Risk Summary' ? 'final' :
          activeWorkView === 'Risk Level Assessments' ? 'risk' : null;
        setExpandedSections(ps => ({ ...ps, [id]: new Set(autoSection ? [autoSection] : []) }));
        next.add(id);
      }
      return next;
    });
  };

  // US-M4-009: Multi-open toggle — each section toggles independently
  const toggleSection = (id: string, section: 'support' | 'final' | 'risk' | 'comments' | 'versions' | 'parent') => {
    setExpandedSections(prev => {
      const current = prev[id] ? new Set(prev[id]) : new Set<typeof section>();
      if (current.has(section)) current.delete(section);
      else current.add(section);
      return { ...prev, [id]: current };
    });
  };

  const isSectionOpen = (id: string, section: 'support' | 'final' | 'risk' | 'comments' | 'versions' | 'parent') => {
    return expandedSections[id]?.has(section) ?? false;
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

  const flattenedAndSortedVersions = React.useMemo(() => {
    const allVersions = claims.flatMap(claim => 
      claim.versions.map((ver, idx) => ({
        ...claim,
        currentVersion: idx,
        uniqueRowId: `${claim.id}-v${ver.versionNumber}`
      }))
    );

    return allVersions
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

  const allSelected = flattenedAndSortedVersions.length > 0 && selectedIds.length === claims.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < claims.length;

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

  const renderClaimCell = (claim: any, colId: string, primaryStatement: string, isLatest: boolean, isSelected: boolean, bgOverride?: string, isSubRow = false) => {
    const col = columnOrder.find(c => c.id === colId);
    const colWidth = col ? col.width : 100;
    const cellStyle = {
      width: colWidth,
      minWidth: colWidth,
    };

    const textColor = isSubRow ? 'text-gray-400' : 'text-night';
    const softTextColor = isSubRow ? 'text-gray-400' : 'text-gray-600';
    const metaTextColor = isSubRow ? 'text-gray-400' : 'text-gray-500';
    const strongTextColor = isSubRow ? 'text-gray-400' : 'text-gray-700';

    switch (colId) {
      case 'claimStatement':
        return (
          <td 
            key={colId} 
            className={`px-4 py-3 ${isFrozen ? "sticky z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
            style={{
              ...cellStyle,
              left: isFrozen ? claimStatementLeft : undefined,
              ...(isFrozen ? { backgroundColor: bgOverride || (isSelected ? "#F3F7FC" : "#ffffff") } : {})
            }}
          >
            <div className="flex flex-col gap-1 overflow-hidden">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => onClaimClick(claim)} className={`text-left flex-1 ${textColor} leading-relaxed hover:text-sky transition-colors line-clamp-2 font-medium`}>
                  {primaryStatement}
                </button>
                {claim.parentClaimId && !isSubRow && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedParentIds(prev => {
                        const next = new Set(prev);
                        if (next.has(claim.uniqueRowId)) next.delete(claim.uniqueRowId);
                        else next.add(claim.uniqueRowId);
                        return next;
                      });
                    }}
                    title="View Parent Hierarchy"
                    className={`flex-shrink-0 mt-0.5 p-1 rounded transition-colors ${expandedParentIds.has(claim.uniqueRowId) ? 'text-sky bg-sky/10' : 'text-gray-400 hover:text-sky hover:bg-sky/5'}`}
                  >
                    <Network className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {claim.challenged && (
                  <span className={`flex items-center gap-1 text-[10px] font-medium ${isSubRow ? 'text-gray-400' : 'text-amber-700'}`}>
                    <Flag className="w-2.5 h-2.5" /> Challenged
                  </span>
                )}
                {claim.lifecycleStage === 'Expired' && (
                  <span className={`flex items-center gap-1 text-[10px] font-medium ml-2 ${isSubRow ? 'text-gray-400' : 'text-orange-600'}`}>
                    <AlertCircle className="w-2.5 h-2.5" /> Expired
                  </span>
                )}
              </div>
            </div>
          </td>
        );
      case 'version':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <div className="flex flex-col gap-1 overflow-hidden items-start">
              {claim.versions.length > 1 && !isSubRow ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedVersionIds(prev => {
                      const next = new Set(prev);
                      if (next.has(claim.uniqueRowId)) next.delete(claim.uniqueRowId);
                      else next.add(claim.uniqueRowId);
                      return next;
                    });
                  }}
                  className="text-sky hover:underline flex items-center gap-1 font-medium text-left"
                >
                  v{claim.versions[claim.currentVersion].versionNumber}
                  {expandedVersionIds.has(claim.uniqueRowId) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              ) : (
                <span className={`${textColor} block truncate font-medium`}>v{claim.versions[claim.currentVersion].versionNumber}</span>
              )}
              {isLatest && <span className={`text-xs font-medium block truncate ${isSubRow ? 'text-gray-400' : 'text-green-700'}`}>Latest</span>}
            </div>
          </td>
        );
      case 'order':
        return <td key={colId} className={`px-4 py-3 truncate ${softTextColor}`} style={cellStyle}>{claim.order || '—'}</td>;
      case 'lifecycle':
        return <td key={colId} className={`px-4 py-3 truncate ${textColor}`} style={cellStyle}>{claim.lifecycleStage}</td>;
      case 'channels':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <div className="flex flex-wrap gap-1 overflow-hidden">
              {claim.marketingChannels.slice(0, 2).map((ch: string, i: number) => (
                <span key={ch} className={`text-xs block truncate ${softTextColor}`}>
                  {ch}{i === 0 && claim.marketingChannels.length > 1 ? ', ' : ''}
                </span>
              ))}
              {claim.marketingChannels.length > 2 && (
                <span className={`text-xs ml-1 ${metaTextColor}`}>+{claim.marketingChannels.length - 2}</span>
              )}
            </div>
          </td>
        );
      case 'finalRisk':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            {claim.finalRiskLevel ? (
              <span className={`text-xs font-semibold block truncate ${textColor}`}>{claim.finalRiskLevel}</span>
            ) : (
              <span className={`text-xs block truncate ${metaTextColor}`}>—</span>
            )}
          </td>
        );
      case 'product':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            <span className={`text-xs font-medium block truncate ${strongTextColor}`} title={claim.productName}>{claim.productName}</span>
          </td>
        );
      case 'restricted':
        return (
          <td key={colId} className="px-4 py-3 text-left" style={cellStyle}>
            {claim.restrictedUse ? (
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold block truncate w-fit ${isSubRow ? 'bg-gray-100 text-gray-400 border border-gray-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>Yes</span>
            ) : (
              <span className={`text-xs block truncate ${metaTextColor}`}>—</span>
            )}
          </td>
        );
      case 'identifier':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            {claim.claimIdentifier ? (
              <span className={`text-xs font-mono block truncate ${strongTextColor}`}>{claim.claimIdentifier}</span>
            ) : (
              <span className={`text-xs block truncate ${metaTextColor}`}>—</span>
            )}
          </td>
        );
      case 'category':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            {claim.claimCategory ? (
              <span className={`text-xs block truncate ${strongTextColor}`}>{claim.claimCategory}</span>
            ) : (
              <span className={`text-xs block truncate ${metaTextColor}`}>—</span>
            )}
          </td>
        );
      case 'geography':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            {claim.geography ? (
              <span className={`text-xs block truncate ${strongTextColor}`}>{claim.geography}</span>
            ) : (
              <span className={`text-xs block truncate ${metaTextColor}`}>—</span>
            )}
          </td>
        );
      case 'relatedProjects':
        return (
          <td key={colId} className="px-4 py-3" style={cellStyle}>
            {claim.relatedProjectIds.length > 0 ? (
              <span className={`text-xs block truncate ${strongTextColor}`}>{claim.relatedProjectIds.length}</span>
            ) : (
              <span className={`text-xs block truncate ${metaTextColor}`}>—</span>
            )}
          </td>
        );
      default:
        return <td key={colId} className="px-4 py-3" style={cellStyle}>—</td>;
    }
  };

  const hasActiveFilters = lifecycleFilter.length > 0 || riskLevelFilter.length > 0 || channelsFilter.length > 0 || geographyFilter.length > 0;

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-xl border border-gray-300 overflow-hidden shadow-sm">
      {/* Active filter chips row */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-earth/30 border-b border-pebble flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 font-medium mr-1">
              Active filters:
            </span>
            {lifecycleFilter.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pebble text-sky rounded-full text-xs font-medium shadow-sm">
                <span className="text-gray-400 font-normal">Lifecycle:</span>
                <span>{lifecycleFilter.join(", ")}</span>
                <button
                  onClick={() => onClearLifecycleFilter?.()}
                  className="hover:text-red-500 ml-1 text-gray-400 transition-colors"
                  title="Clear Lifecycle filters"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {riskLevelFilter.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pebble text-sky rounded-full text-xs font-medium shadow-sm">
                <span className="text-gray-400 font-normal">Risk Level:</span>
                <span>{riskLevelFilter.join(", ")}</span>
                <button
                  onClick={() => onClearRiskLevelFilter?.()}
                  className="hover:text-red-500 ml-1 text-gray-400 transition-colors"
                  title="Clear Risk Level filters"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {channelsFilter.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pebble text-sky rounded-full text-xs font-medium shadow-sm">
                <span className="text-gray-400 font-normal">Channels:</span>
                <span>{channelsFilter.join(", ")}</span>
                <button
                  onClick={() => onClearChannelsFilter?.()}
                  className="hover:text-red-500 ml-1 text-gray-400 transition-colors"
                  title="Clear Channels filters"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
            {geographyFilter.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-pebble text-sky rounded-full text-xs font-medium shadow-sm">
                <span className="text-gray-400 font-normal">Geography:</span>
                <span>{geographyFilter.join(", ")}</span>
                <button
                  onClick={() => onClearGeographyFilter?.()}
                  className="hover:text-red-500 ml-1 text-gray-400 transition-colors"
                  title="Clear Geography filters"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
          {onClearAllFilters && (
            <button
              onClick={onClearAllFilters}
              className="text-xs text-red-500 hover:text-red-700 transition-colors font-semibold px-2 py-1 hover:bg-red-50 rounded-lg mr-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Top Toolbar / Header Row */}
      <div className="bg-white border-b border-pebble px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {isBulkSelectionEnabled ? (
            <>
              <span className="text-sm text-sky font-medium bg-sky/10 px-2.5 py-0.5 rounded">
                Bulk Action Mode ({selectedIds.length} selected)
              </span>
              {selectedIds.length > 0 && (
                <button
                  onClick={onSelectAll}
                  className="text-xs text-sky hover:text-sky/80 transition-colors font-medium border border-sky/30 px-2 py-0.5 rounded hover:bg-sky/5"
                >
                  {selectedIds.length === claims.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-600 font-medium ml-1">
              {activeBaseView} Library
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsTableMenuOpen(!isTableMenuOpen)}
              className="p-1.5 border border-pebble rounded-lg text-gray-500 hover:bg-earth transition-colors hover:text-night shadow-sm bg-white"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {isTableMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsTableMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-pebble rounded-xl shadow-xl z-40 min-w-[200px] py-1.5 overflow-hidden text-left font-normal normal-case tracking-normal">
                  <button
                    onClick={() => {
                      setIsTableMenuOpen(false);
                      onToggleBulkSelection?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                  >
                    <span>{isBulkSelectionEnabled ? "Disable Bulk Selection" : "Bulk Action"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTableMenuOpen(false);
                      setIsFrozen(!isFrozen);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                  >
                    <span>Freeze Columns</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isFrozen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {isFrozen ? "ON" : "OFF"}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setIsTableMenuOpen(false);
                      setColumnOrder(BASE_COLUMNS);
                      setSortCol(null);
                      setSortDir(null);
                      setColSearch({});
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors"
                  >
                    ↺ Reset Table State
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        <table className="w-full border-collapse text-sm" style={{ minWidth: "1200px" }}>
          <thead className="bg-earth sticky top-0 z-10">
            <tr className="border-b border-gray-300">
              {/* Checkbox */}
              {isBulkSelectionEnabled && (
                <th
                  className={`px-4 py-3 ${isFrozen ? "sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" : ""}`}
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
              )}

              {/* Favorite */}
              <th
                className="px-4 py-3"
                style={{
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  ...(isFrozen ? { position: "sticky", left: favoriteLeft, zIndex: 20, backgroundColor: "#F6F7F0", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {})
                }}
              ></th>

              {/* Expand */}
              <th
                className="px-4 py-3"
                style={{
                  width: "40px",
                  minWidth: "40px",
                  maxWidth: "40px",
                  ...(isFrozen ? { position: "sticky", left: expandLeft, zIndex: 20, backgroundColor: "#F6F7F0", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {})
                }}
              ></th>

              {/* Draggable columns */}
              {columnOrder.map((col, index) => {
                const isSticky = isFrozen && col.id === "claimStatement";
                const leftOffset = claimStatementLeft;
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300">
            {flattenedAndSortedVersions.map((claim: any) => {
              const isSelected = selectedIds.includes(claim.id); // Selection remains at the overall claim ID level
              const isExpanded = expandedIds.has(claim.uniqueRowId);
              const version = claim.versions[claim.currentVersion];
              const primaryStatement = claim.claimType === 'Global' ? version.globalStatement : version.localStatement;
              const isLatest = version.isLatest;

              return (
                <React.Fragment key={claim.uniqueRowId}>
                  {/* Parent Expansion Row (Above) */}
                  {expandedParentIds.has(claim.uniqueRowId) && claim.parentClaimId && (() => {
                    let parentClaim = claims.find(c => c.id === claim.parentClaimId);
                    
                    // Show dummy data if the parent is not loaded in the current view
                    if (!parentClaim) {
                      parentClaim = {
                        id: claim.parentClaimId,
                        claimIdentifier: 'Clinically proven to hydrate skin',
                        claimType: 'Global',
                        lifecycleStage: 'Approved',
                        finalRiskLevel: 'Low',
                        versions: [{ versionNumber: 1, globalStatement: 'Clinically proven to hydrate skin for 24 hours, providing the foundational support for this local adaptation.', isLatest: true }]
                      } as any;
                    }

                    const pVer = parentClaim.versions[parentClaim?.currentVersion || 0];
                    const pStmt = parentClaim.claimType === 'Global' ? pVer?.globalStatement : pVer?.localStatement;
                    return (
                      <tr className="bg-sky/5 border-b-2 border-sky/20">
                        <td colSpan={columnOrder.length + (isBulkSelectionEnabled ? 3 : 2)} className="p-0">
                          <div className="px-4 py-3 flex gap-4">
                            <div className="flex-shrink-0 text-sky opacity-50 mt-1">
                              <Network className="w-4 h-4" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-sky uppercase">{parentClaim.claimIdentifier || parentClaim.id}</span>
                                <span className="text-[10px] text-gray-500 font-medium">Parent Claim</span>
                                <span className="text-[10px] text-gray-400 border-l border-gray-300 pl-3">v{pVer?.versionNumber} · {parentClaim.claimType} · {parentClaim.lifecycleStage}</span>
                                {parentClaim.finalRiskLevel && <span className="text-[10px] text-gray-400 border-l border-gray-300 pl-3">Risk: {parentClaim.finalRiskLevel}</span>}
                              </div>
                              <p className="text-xs text-night font-medium leading-snug">{pStmt || '—'}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })()}

                  <tr
                    className={`border-b border-gray-300 transition-colors ${
                      isSelected ? 'bg-pale/30 font-medium' : 'hover:bg-earth/50'
                    }`}
                    style={{ height: 48 }}
                  >
                    {/* Checkbox */}
                    {isBulkSelectionEnabled && (
                      <td
                        className="px-4 py-3"
                        style={{
                          width: "40px",
                          minWidth: "40px",
                          maxWidth: "40px",
                          ...(isFrozen ? { position: "sticky", left: 0, zIndex: 10, backgroundColor: "#ffffff", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {})
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onSelectId(claim.id)}
                          className="w-4 h-4 rounded border border-gray-400 text-sky focus:ring-2 focus:ring-sky cursor-pointer transition-colors"
                        />
                      </td>
                    )}

                    {/* Favorite */}
                    <td
                      className="px-4 py-3"
                      style={{
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        ...(isFrozen ? { position: "sticky", left: favoriteLeft, zIndex: 10, backgroundColor: "#ffffff", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {})
                      }}
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(claim); }}
                        className="focus:outline-none transition-transform duration-200 transform hover:scale-110 mt-0.5"
                      >
                        <Star
                          className={`w-4 h-4 transition-all ${
                            claim.versions[claim.currentVersion].isFavorite
                              ? 'fill-yellow-400 text-yellow-500'
                              : 'text-gray-300 hover:text-yellow-400 hover:fill-yellow-100'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Expand chevron */}
                    <td
                      className="px-4 py-3"
                      style={{
                        width: "40px",
                        minWidth: "40px",
                        maxWidth: "40px",
                        ...(isFrozen ? { position: "sticky", left: expandLeft, zIndex: 10, backgroundColor: "#ffffff", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {})
                      }}
                    >
                      <button
                        onClick={() => toggleExpand(claim.uniqueRowId)}
                        className="text-gray-400 hover:text-sky transition-colors focus:outline-none"
                      >
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Draggable data cells */}
                    {columnOrder.map((col) => renderClaimCell(claim, col.id, primaryStatement, isLatest, isSelected, undefined, false))}
                  </tr>

                  {/* Version History Expansion - read-only grey text */}
                  {expandedVersionIds.has(claim.uniqueRowId) && claim.versions.map((ver: any, idx: number) => {
                    if (idx === claim.currentVersion) return null; // Skip the version shown in the parent row
                    const verStatement = claim.claimType === 'Global' ? ver.globalStatement : ver.localStatement;
                    const oldClaim = { ...claim, currentVersion: idx };
                    return (
                      <tr
                        key={`${claim.uniqueRowId}-sub-v${ver.versionNumber}`}
                        className="border-b border-gray-200 bg-gray-50 opacity-90 transition-opacity"
                        style={{ height: 48 }}
                      >
                        {/* Checkbox (empty) */}
                        {isBulkSelectionEnabled && (
                          <td className="px-4 py-3" style={{ width: "40px", minWidth: "40px", maxWidth: "40px", ...(isFrozen ? { position: "sticky", left: 0, zIndex: 10, backgroundColor: "#f9fafb", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {}) }}></td>
                        )}
                        
                        {/* Favorite (empty) */}
                        <td className="px-4 py-3" style={{ width: "40px", minWidth: "40px", maxWidth: "40px", ...(isFrozen ? { position: "sticky", left: favoriteLeft, zIndex: 10, backgroundColor: "#f9fafb", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {}) }}></td>
                        
                        {/* Expand chevron (indent) */}
                        <td className="px-4 py-3" style={{ width: "40px", minWidth: "40px", maxWidth: "40px", ...(isFrozen ? { position: "sticky", left: expandLeft, zIndex: 10, backgroundColor: "#f9fafb", boxShadow: "2px 0 5px -2px rgba(0,0,0,0.1)" } : {}) }}>
                          <span className="text-gray-400 flex justify-center text-lg">↳</span>
                        </td>

                        {/* Draggable data cells (rendered as grey text sub-rows) */}
                        {columnOrder.map((col) => {
                          return renderClaimCell(oldClaim, col.id, verStatement, ver.isLatest, false, "#f9fafb", true);
                        })}
                      </tr>
                    );
                  })}

                  {/* Inline Expanded Workbench — US-M4-008 */}
                  {isExpanded && (
                    <tr>
                      <td colSpan={columnOrder.length + (isBulkSelectionEnabled ? 3 : 2)} className="p-0">
                        <div className="border-b-2 border-sky/20" style={{ background: '#EEF4FB' }}>
                          <div className="px-3 py-2 space-y-1.5">

                          {/* Section 1: Substantiations — US-M4-010 */}
                          <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => toggleSection(claim.uniqueRowId, 'support')}
                              className="w-full px-3 py-2 flex items-center justify-between hover:bg-earth transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-night font-medium">Support Strategy &amp; Substantiations</span>
                                <span className="text-[10px] text-gray-400">({claim.substantiationDocs.length} docs)</span>
                              </div>
                              {isSectionOpen(claim.uniqueRowId, 'support') ? (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </button>
                            {isSectionOpen(claim.uniqueRowId, 'support') && (
                              <div className="px-4 py-3 border-t border-pebble bg-pale/5">
                                <InlineSupportStrategyEditor
                                  claim={claim}
                                  onClaimsChange={onClaimsChange}
                                  fileRef={fileRefs}
                                />
                              </div>
                            )}
                          </div>

                          {/* Section 2: Risk Level Assessments — US-M4-011 */}
                          <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                            <div
                              onClick={() => toggleSection(claim.uniqueRowId, 'risk')}
                              className="w-full px-3 py-2 flex items-center justify-between hover:bg-earth transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <Shield className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-night font-medium">Risk Level Assessments</span>
                                {claim.finalRiskLevel && (
                                  <span className="text-[10px] font-semibold text-night bg-white px-1.5 py-0.5 rounded-full border border-pebble">
                                    {claim.finalRiskLevel}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400 border-r border-pebble pr-3">({claim.riskAssessments.filter((r: any) => !r.isRemoved).length} records)</span>
                                <div className="flex items-center gap-3 pl-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!onClaimsChange) return;
                                      if (!isSectionOpen(claim.uniqueRowId, 'risk')) {
                                        toggleSection(claim.uniqueRowId, 'risk');
                                      }
                                      const now = new Date().toISOString();
                                      const newRecord = {
                                        id: `RA-${Date.now()}`,
                                        functionDept: CURRENT_USER_ROLE || 'R&D',
                                        assessedBy: CURRENT_USER,
                                        riskLevel: 'Low' as any,
                                        comments: '',
                                        geography: claim.claimType !== 'Global' ? (claim.geography || '') : '',
                                        dateTime: now,
                                      };
                                      const allC = (claim as any)._allClaims ?? claims;
                                      onClaimsChange(allC.map((c: any) => c.id === claim.id
                                        ? { ...c, riskAssessments: [...c.riskAssessments, newRecord] }
                                        : c
                                      ));
                                      setEditingRiskId(newRecord.id);
                                      setEditingRiskDraft({ riskLevel: 'Low', comments: '', geography: newRecord.geography as string });
                                    }}
                                    className="flex items-center gap-1.5 text-xs text-sky border border-sky/30 px-2.5 py-1 rounded-lg hover:bg-sky/5 transition-colors font-medium bg-white"
                                  >
                                    <Plus className="w-3 h-3" /> Add Assessment
                                  </button>
                              
                                </div>
                              </div>
                              {isSectionOpen(claim.uniqueRowId, 'risk') ? (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                            {isSectionOpen(claim.uniqueRowId, 'risk') && (
                              <div className="px-4 py-2 border-t border-pebble bg-pale/5 space-y-2">
                                {/* Individual Risk Assessment Records */}
                                <div>
                                  
                                  {claim.riskAssessments.length === 0 ? (
                                    <p className="text-[10px] text-gray-400 italic mb-2">No risk assessments recorded.</p>
                                  ) : (
                                    <div className="rounded-lg border border-pebble overflow-hidden bg-white mb-2">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="bg-earth/60 border-b border-pebble">
                                            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Created by</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Marketing Channel</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Risk level</th>
                                            <th className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wide">Comment</th>
                                            <th className="px-3 py-2"></th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-pebble">
                                          {claim.riskAssessments.map((record: any) => {
                                            const isOwn = record.assessedBy === CURRENT_USER;
                                            const isEditing = editingRiskId === record.id;
                                            if (record.isRemoved) {
                                              return (
                                                <tr key={record.id} className="bg-gray-50 opacity-50">
                                                  <td colSpan={6} className="px-3 py-2 text-[10px] text-gray-400 italic">Removed by {record.assessedBy}</td>
                                                </tr>
                                              );
                                            }
                                            
                                            if (isEditing && editingRiskDraft) {
                                              return (
                                                <tr key={record.id} className="bg-pale/10">
                                                  <td colSpan={6} className="px-3 py-2">
                                                    <div className="space-y-1.5">
                                                      <div className="flex gap-2 items-end">
                                                        <div className="w-1/4">
                                                          <label className="block text-[10px] text-gray-500 uppercase mb-0.5 font-semibold">Risk Level</label>
                                                          <select value={editingRiskDraft.riskLevel} onChange={e => setEditingRiskDraft(d => d ? { ...d, riskLevel: e.target.value } : d)} className="w-full text-xs border border-pebble rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky bg-white">
                                                            {['Low', 'Medium', 'High', 'Very High'].map(r => <option key={r} value={r}>{r}</option>)}
                                                          </select>
                                                        </div>
                                                        {claim.claimType !== 'Global' && (
                                                          <div className="w-1/4">
                                                            <label className="block text-[10px] text-gray-500 uppercase mb-0.5 font-semibold">Geography <span className="text-red-400">*</span></label>
                                                            <input type="text" value={editingRiskDraft.geography} onChange={e => setEditingRiskDraft(d => d ? { ...d, geography: e.target.value } : d)} placeholder="e.g. UK" className="w-full text-xs border border-pebble rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky bg-white" />
                                                          </div>
                                                        )}
                                                        <div className="flex-1">
                                                          <label className="block text-[10px] text-gray-500 uppercase mb-0.5 font-semibold">Comments</label>
                                                          <input type="text" value={editingRiskDraft.comments} onChange={e => setEditingRiskDraft(d => d ? { ...d, comments: e.target.value } : d)} className="w-full text-xs border border-pebble rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky bg-white" placeholder="Comments…" />
                                                        </div>
                                                        <div className="flex gap-1.5 pb-[2px]">
                                                          <button onClick={() => { if (!onClaimsChange || !editingRiskDraft) return; const allC = (claim as any)._allClaims ?? claims; onClaimsChange(allC.map((c: any) => c.id === claim.id ? { ...c, riskAssessments: c.riskAssessments.map((r: any) => r.id === record.id ? { ...r, riskLevel: editingRiskDraft.riskLevel, comments: editingRiskDraft.comments, geography: editingRiskDraft.geography } : r) } : c)); setEditingRiskId(null); setEditingRiskDraft(null); }} className="flex items-center gap-1 px-2 py-1 bg-sky text-white rounded text-[10px] font-semibold hover:bg-dark transition-colors"><Save className="w-2.5 h-2.5" /> Save</button>
                                                          <button onClick={() => { setEditingRiskId(null); setEditingRiskDraft(null); }} className="px-2 py-1 border border-pebble text-gray-500 rounded text-[10px] hover:bg-earth transition-colors">Cancel</button>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </td>
                                                </tr>
                                              );
                                            }

                                            return (
                                              <tr key={record.id} className={`hover:bg-earth/20 transition-colors ${isOwn ? 'bg-pale/5' : ''}`}>
                                                <td className="px-3 py-2">
                                                  <span className="text-[10px] font-semibold uppercase bg-sky/10 text-sky px-1.5 py-0.5 rounded-full border border-sky/20 whitespace-nowrap">{record.functionDept}</span>
                                                </td>
                                                <td className="px-3 py-2 text-night font-medium">{record.assessedBy}</td>
                                                <td className="px-3 py-2 text-gray-600 max-w-[120px] truncate" title={claim.marketingChannels.join(', ')}>
                                                  {claim.marketingChannels.join(', ')}
                                                </td>
                                                <td className="px-3 py-2">
                                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                                                    record.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                                                    record.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                    record.riskLevel === 'High' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                                  }`}>{record.riskLevel}</span>
                                                </td>
                                                <td className="px-3 py-2 text-gray-600 max-w-[200px]">
                                                  <div className="line-clamp-2" title={record.comments}>{record.comments || '—'}</div>
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                  {isOwn && (
                                                    <div className="flex items-center justify-end gap-1">
                                                      <button onClick={() => { setEditingRiskId(record.id); setEditingRiskDraft({ riskLevel: record.riskLevel, comments: record.comments, geography: Array.isArray(record.geography) ? record.geography.join(', ') : (record.geography || '') }); }} className="text-[10px] text-sky hover:underline">Edit</button>
                                                      <span className="text-gray-300">|</span>
                                                      <button onClick={() => { const confirmed = window.confirm('Remove this assessment record?'); if (!confirmed || !onClaimsChange) return; const allC = (claim as any)._allClaims ?? claims; onClaimsChange(allC.map((c: any) => c.id === claim.id ? { ...c, riskAssessments: c.riskAssessments.map((r: any) => r.id === record.id ? { ...r, isRemoved: true } : r) } : c)); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
                                                    </div>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Section 3: Comments — US-M4-009 */}
                          <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                            <button
                              type="button"
                              onClick={() => toggleSection(claim.uniqueRowId, 'comments')}
                              className="w-full px-3 py-2 flex items-center justify-between hover:bg-earth transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-xs text-night font-medium">Comments</span>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-pebble font-semibold">{(claimComments[claim.id] || []).length}</span>
                              </div>
                              {isSectionOpen(claim.uniqueRowId, 'comments') ? (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </button>
                            {isSectionOpen(claim.uniqueRowId, 'comments') && (
                              <div className="px-3 py-2 border-t border-pebble bg-pale/5">
                                {/* Max 4 comments visible, rest scroll — single-line per comment */}
                                <div style={{ maxHeight: '80px', overflowY: 'auto', marginBottom: '6px' }}>
                                  {(claimComments[claim.id] || []).length === 0 ? (
                                    <div className="text-[10px] text-gray-400 italic py-1">No comments yet.</div>
                                  ) : (
                                    (claimComments[claim.id] || []).map((c) => (
                                      <div key={c.id} className={`group flex items-start gap-2 py-1 min-w-0 ${c.replyToId ? 'ml-6' : ''}`}>
                                        <div className="w-4 h-4 rounded-full bg-sky text-white flex items-center justify-center text-[8px] font-semibold flex-shrink-0 mt-0.5">{c.initials}</div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-semibold text-night">{c.author}</span>
                                            <span className="text-[9px] text-gray-400">{new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            <button 
                                              onClick={() => setReplyingToComment(prev => ({ ...prev, [claim.id]: { id: c.id, author: c.author } }))}
                                              className="opacity-0 group-hover:opacity-100 text-sky hover:text-sky/80 transition-opacity p-0.5 rounded focus:outline-none"
                                              title="Reply to comment"
                                            >
                                              <MessageSquare className="w-3 h-3" />
                                            </button>
                                          </div>
                                          <p className="text-[10px] text-gray-700 leading-snug mt-0.5 whitespace-pre-wrap">{c.text}</p>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>

                                {replyingToComment[claim.id] && (
                                  <div className="flex items-center justify-between bg-sky/5 border border-sky/20 rounded px-2 py-1 mb-1.5 text-[10px] text-sky">
                                    <span>Replying to <span className="font-semibold">{replyingToComment[claim.id]?.author}</span></span>
                                    <button onClick={() => setReplyingToComment(prev => ({ ...prev, [claim.id]: null }))} className="hover:text-sky/70">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}

                                <div className="flex gap-1.5">
                                  <textarea
                                    id={`new-comment-${claim.id}`}
                                    placeholder="Add a comment… (Enter to submit)"
                                    rows={1}
                                    className="flex-1 px-2 py-1 border border-pebble rounded text-[10px] focus:outline-none focus:ring-1 focus:ring-sky resize-none bg-white text-night"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        const text = e.currentTarget.value.trim();
                                        if (text) { 
                                          setClaimComments(prev => ({ 
                                            ...prev, 
                                            [claim.id]: [
                                              ...(prev[claim.id] || []), 
                                              { 
                                                id: `c-${Date.now()}`, 
                                                author: 'Current User', 
                                                initials: 'CU', 
                                                text, 
                                                timestamp: new Date().toISOString(),
                                                replyToId: replyingToComment[claim.id]?.id
                                              }
                                            ] 
                                          })); 
                                          e.currentTarget.value = '';
                                          setReplyingToComment(prev => ({ ...prev, [claim.id]: null }));
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    onClick={() => { 
                                      const ta = document.getElementById(`new-comment-${claim.id}`) as HTMLTextAreaElement | null; 
                                      if (ta) { 
                                        const text = ta.value.trim(); 
                                        if (text) { 
                                          setClaimComments(prev => ({ 
                                            ...prev, 
                                            [claim.id]: [
                                              ...(prev[claim.id] || []), 
                                              { 
                                                id: `c-${Date.now()}`, 
                                                author: 'Current User', 
                                                initials: 'CU', 
                                                text, 
                                                timestamp: new Date().toISOString(),
                                                replyToId: replyingToComment[claim.id]?.id
                                              }
                                            ] 
                                          })); 
                                          ta.value = ''; 
                                          setReplyingToComment(prev => ({ ...prev, [claim.id]: null }));
                                        } 
                                      } 
                                    }}
                                    className="px-3 bg-sky text-white rounded hover:bg-dark text-[10px] font-semibold transition-colors flex items-center gap-1"
                                  ><Send className="w-2.5 h-2.5" /> Send</button>
                                </div>
                              </div>
                            )}
                          </div>



                          {/* Section 4: Parent Claim Tab — US-M4-009 */}
                          {claim.parentClaimId && (
                            <div className="bg-white rounded-lg border border-pebble overflow-hidden shadow-sm">
                              <button
                                type="button"
                                onClick={() => toggleSection(claim.uniqueRowId, 'parent')}
                                className="w-full px-3 py-2 flex items-center justify-between hover:bg-earth transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Scale className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-xs text-night font-medium">Parent Claim</span>
                                  <span className="text-[10px] text-sky bg-pale border border-sky/20 px-1.5 py-0.5 rounded-full font-semibold">{claim.parentClaimId}</span>
                                </div>
                                {isSectionOpen(claim.uniqueRowId, 'parent') ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </button>
                              {isSectionOpen(claim.uniqueRowId, 'parent') && (() => {
                                const parentClaim = claims.find(c => c.id === claim.parentClaimId);
                                if (!parentClaim) return (
                                  <div className="px-3 py-2 border-t border-pebble bg-pale/5">
                                    <p className="text-[10px] text-gray-400 italic">Parent claim ({claim.parentClaimId}) not found in current view.</p>
                                  </div>
                                );
                                const pVer = parentClaim.versions[parentClaim.currentVersion];
                                const pStmt = parentClaim.claimType === 'Global' ? pVer?.globalStatement : pVer?.localStatement;
                                return (
                                  <div className="px-3 py-2 border-t border-pebble bg-pale/5">
                                    <div className="p-2 rounded border border-sky/20 bg-pale/10">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-semibold text-sky uppercase">{parentClaim.id}</span>
                                        <span className="text-[10px] text-gray-400">{parentClaim.claimType} · v{pVer?.versionNumber}</span>
                                        <span className="text-[10px] text-gray-400">{parentClaim.lifecycleStage}</span>
                                        <span className="text-[10px] text-gray-400">{parentClaim.finalRiskLevel || '—'}</span>
                                      </div>
                                      <p className="text-xs text-night leading-snug">{pStmt || '—'}</p>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}

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
                <td colSpan={columnOrder.length + (isBulkSelectionEnabled ? 3 : 2)} className="px-0 py-0">
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