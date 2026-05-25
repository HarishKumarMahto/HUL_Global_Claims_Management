import React, { useState, useRef, useEffect, useCallback } from "react";
import type { ReactElement } from "react";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Copy,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Shield,
  Search,
  GripVertical,
  Settings,
  ExternalLink,
  Clock,
  Filter,
  Check,
  Eye,
  EyeOff,
  ArrowUpRight,
  Bold,
  Italic,
  List,
  Link,
  Save,
  Lock,
  Upload,
  FileText,
} from "lucide-react";
import AddClaimModal from "../claims/AddClaimModal";
import ClaimCreationModal from "../claims/ClaimCreationModal";
import { CURRENT_USER, CURRENT_USER_ROLE, canEditSupportStrategy } from "../../types";

export type RiskLevel = "Low" | "Medium" | "High" | "Very High";
export type ClaimStatus =
  | "Draft"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Pending"
  | "Assessed";

export interface Claim {
  id: string;
  order: number;
  version: string;
  allVersions: string[];
  statement: string;
  status: ClaimStatus;
  qualifier: string;
  channel: string;
  riskLevel: RiskLevel;
  rcfSummary: string;
  supportStrategy: string;
  riskAssessment: string;
  comments: string;
  // F01 — last-modified metadata (US-M5.1-F01)
  supportStrategyLastModifiedBy?: string;
  supportStrategyLastModifiedAt?: string;
  // F06 — audit log (US-M5.1-F06)
  auditLog?: Array<{
    id: string;
    timestamp: string;
    actor: string;
    actorRole: string;
    action: string;
    field: string;
    beforeValue?: string;
    afterValue?: string;
    surface?: string;
  }>;
}

export interface ClaimSection {
  id: string;
  title: string;
  description: string;
  claims: Claim[];
}

export const SECTION_VIEW_MAP: Record<string, string> = {
  "global": "Global Claims",
  "regional": "Regional Claims",
  "local": "Local Claims",
  "local_sku": "SKU Claims",
};

const mockSections: ClaimSection[] = [
  {
    id: "global",
    title: "Global Claims",
    description: "Core claims applicable across all markets",
    claims: [
      {
        id: "CLM-001",
        order: 1,
        version: "v2.1",
        allVersions: ["v1.0", "v1.1", "v2.0", "v2.1"],
        statement:
          "Clinically proven to moisturize skin for 24 hours",
        status: "Approved",
        qualifier: "When used as directed",
        channel: "All Channels",
        riskLevel: "Low",
        rcfSummary:
          "Supported by 3 clinical studies (n=120). ICH E6 compliant. All primary endpoints met.",
        supportStrategy:
          "Double-blind, placebo-controlled clinical trial conducted at 3 independent research centers. Primary endpoint: TEWL measurement at 24h post-application.",
        riskAssessment:
          "Risk: LOW. Claims are well-substantiated with robust clinical data. No significant adverse findings. Suitable for all claimed markets.",
        comments:
          "Approved by RA team. Final sign-off obtained from Legal. Ready for market deployment.",
      },
      {
        id: "CLM-002",
        order: 2,
        version: "v1.3",
        allVersions: ["v1.0", "v1.1", "v1.2", "v1.3"],
        statement:
          "98% of users reported visibly softer skin after 2 weeks",
        status: "Approved",
        qualifier: "Based on consumer panel (n=200)",
        channel: "Digital, Print",
        riskLevel: "Low",
        rcfSummary:
          "Consumer perception study. Blinded evaluation. Statistically significant (p<0.05).",
        supportStrategy:
          "Home use test conducted across 3 markets. Participants evaluated skin softness using standardized scale.",
        riskAssessment:
          "Risk: LOW. Consumer study methodology is sound. Sample size adequate for claim.",
        comments:
          "Final approved version. Legal reviewed qualifier language.",
      },
      {
        id: "CLM-003",
        order: 3,
        version: "v3.0",
        allVersions: ["v1.0", "v2.0", "v3.0"],
        statement:
          "#1 Dermatologist recommended moisturizer brand",
        status: "Under Review",
        qualifier:
          "Among dermatologists who recommend moisturizers",
        channel: "TV, Digital",
        riskLevel: "Medium",
        rcfSummary:
          "Survey of 500 dermatologists. Methodology under review by RA.",
        supportStrategy:
          "Independent survey conducted by third-party research firm. Dermatologists screened for relevant specialization.",
        riskAssessment:
          "Risk: MEDIUM. Superlative claim requires robust methodology. Survey design needs validation.",
        comments:
          "RA review in progress. Legal flagged potential issues with US FTC guidelines.",
      },
    ],
  },
  {
    id: "regional",
    title: "Regional Claims",
    description:
      "Claims adapted for specific regional regulatory requirements",
    claims: [
      {
        id: "CLM-004-EMEA",
        order: 1,
        version: "v1.0",
        allVersions: ["v1.0"],
        statement:
          "Proven to strengthen skin barrier function (EMEA)",
        status: "Draft",
        qualifier: "Measured by TEWL reduction",
        channel: "All Channels",
        riskLevel: "Medium",
        rcfSummary:
          "Clinical data under preparation. EFSA guidelines applicable.",
        supportStrategy:
          "Planned clinical study using TEWL measurement protocol per EFSA guidelines.",
        riskAssessment:
          "Risk: MEDIUM. EFSA has specific requirements for skin barrier claims.",
        comments:
          "Study protocol submitted to ethics committee. Awaiting approval.",
      },
      {
        id: "CLM-005-UK",
        order: 2,
        version: "v1.1",
        allVersions: ["v1.0", "v1.1"],
        statement:
          "Restores skin's natural moisture in 7 days (North America)",
        status: "Under Review",
        qualifier: "With continued use",
        channel: "TV, Digital, OOH",
        riskLevel: "High",
        rcfSummary:
          'Efficacy data available but FTC "restoration" claim requires specific support.',
        supportStrategy:
          "US consumer use study with instrumental measurement component.",
        riskAssessment:
          'Risk: HIGH. FTC has strict requirements for "restore" claims.',
        comments:
          "US Legal team review in progress. FTC interpretation memo requested.",
      },
    ],
  },
  {
    id: "local",
    title: "Local Claims",
    description: "Market-specific claim versions",
    claims: [
      {
        id: "CLM-001-FR",
        order: 1,
        version: "v1.0",
        allVersions: ["v1.0"],
        statement: "BIS-certified skin care formula (India)",
        status: "Draft",
        qualifier: "Certified under BIS IS 6608",
        channel: "All Channels",
        riskLevel: "Low",
        rcfSummary:
          "BIS certification obtained for Indian market formulation.",
        supportStrategy:
          "BIS certification IS 6608 obtained. Certificate number: BIS-2026-12345.",
        riskAssessment:
          "Risk: LOW. Official certification claim.",
        comments:
          "Certification valid through 2028. Annual audit scheduled.",
      },
    ],
  },
  {
    id: "local_sku",
    title: "SKU Claims",
    description: "SKU-specific local claim versions",
    claims: [
      {
        id: "CLM-001-FR-400ML",
        order: 1,
        version: "v1.0",
        allVersions: ["v1.0"],
        statement: "Clinical skin barrier SKU formulation (UK)",
        status: "Draft",
        qualifier: "SKU 98765",
        channel: "E-Commerce",
        riskLevel: "Low",
        rcfSummary: "SKU formulation matches general local standard.",
        supportStrategy: "Strategy matches parent local claim formulation.",
        riskAssessment: "Risk: LOW. Standard SKU formulation.",
        comments: "SKU-level clearance completed."
      }
    ]
  },
];

const STATUS_STYLES: Record<ClaimStatus, string> = {
  Draft: "bg-gray-100 text-gray-600",
  "Under Review": "bg-amber-100 text-amber-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Pending: "bg-blue-100 text-blue-700",
  Assessed: "bg-purple-100 text-purple-700",
};

const RISK_STYLES: Record<RiskLevel, string> = {
  Low: "text-green-600",
  Medium: "text-amber-600",
  High: "text-orange-600",
  "Very High": "text-red-600",
};

const RISK_ICONS: Record<RiskLevel, ReactElement> = {
  Low: <CheckCircle className="w-4 h-4 text-green-500" />,
  Medium: <Info className="w-4 h-4 text-amber-500" />,
  High: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  "Very High": (
    <AlertTriangle className="w-4 h-4 text-red-500" />
  ),
};

// Column config for claims table
const BASE_COLUMNS = [
  { id: "order", label: "#", width: 40, visible: true },
  { id: "version", label: "Version", width: 70, visible: true },
  { id: "statement", label: "Claim Statement", width: 240, visible: true },
  { id: "status", label: "Status", width: 110, visible: true },
  { id: "qualifier", label: "Qualifier", width: 160, visible: true },
  { id: "channel", label: "Channel", width: 140, visible: true },
  { id: "riskLevel", label: "Final Risk Level", width: 140, visible: true },
  { id: "riskIcon", label: "", width: 40, visible: true },
  { id: "rcfSummary", label: "RCF Summary", width: 180, visible: true },
];

// Expanded panel with inline vertical sections
function ExpandedClaimPanel({
  claim,
  onClose,
  onClaimSave,
}: {
  claim: Claim;
  onClose: () => void;
  onClaimSave?: (updated: Claim) => void;
}) {
  // F02 — role + lifecycle access control
  const isLifecycleLocked = claim.status === "Assessed";
  const hasEditRole = canEditSupportStrategy(CURRENT_USER_ROLE);
  const canEdit = hasEditRole && !isLifecycleLocked;

  // F01 — editor state
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(claim.supportStrategy);
  const [savedToast, setSavedToast] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Keep draft in sync if claim changes externally
  useEffect(() => {
    if (!isEditing) setDraft(claim.supportStrategy);
  }, [claim.supportStrategy, isEditing]);

  // F06 — build audit entry
  const buildAuditEntry = (beforeVal: string, afterVal: string) => ({
    id: `AUD-SS-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: CURRENT_USER,
    actorRole: CURRENT_USER_ROLE,
    action: "SUPPORT_STRATEGY_UPDATED",
    field: "supportStrategy",
    beforeValue: beforeVal,
    afterValue: afterVal,
    surface: "detail",
  });

  // F05 — dispatch notification
  const dispatchNotification = (claimId: string, strategy: string) => {
    window.dispatchEvent(new CustomEvent("supportStrategyChanged", {
      detail: {
        claimId,
        claimLabel: claim.statement?.slice(0, 40) || claimId,
        modifiedBy: CURRENT_USER,
        timestamp: new Date().toISOString(),
        strategy,
      }
    }));
  };

  // F01 + F06: commit save
  const commitSave = (value: string) => {
    // F02 — server-side rejection simulation
    if (!canEdit) {
      if (!hasEditRole) console.error('[403 PERMISSION_DENIED] Insufficient role to edit Support Strategy.');
      if (isLifecycleLocked) console.error('[423 LOCKED] Support Strategy is locked — claim is in Assessed state.');
      setIsEditing(false);
      return;
    }
    const trimmedNew = value.trim();
    const trimmedOld = (claim.supportStrategy || "").trim();
    if (trimmedNew === trimmedOld) { setIsEditing(false); return; }
    const now = new Date().toISOString();
    const auditEntry = buildAuditEntry(claim.supportStrategy, value);
    const updated: Claim = {
      ...claim,
      supportStrategy: value,
      supportStrategyLastModifiedBy: CURRENT_USER,
      supportStrategyLastModifiedAt: now,
      updatedAt: now,
      auditLog: [...((claim as any).auditLog || []), auditEntry],
    };
    onClaimSave?.(updated);
    dispatchNotification(claim.id, value);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
    setIsEditing(false);
  };

  const handleBlur = () => {
    if (isEditing) {
      const timer = setTimeout(() => commitSave(draft), 300);
      setAutoSaveTimer(timer);
    }
  };

  const handleCancel = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    setDraft(claim.supportStrategy);
    setIsEditing(false);
  };

  const handleSaveClick = () => {
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    commitSave(draft);
  };

  const applyFormat = (fmt: "bold" | "italic" | "bullet" | "link") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = draft.substring(start, end);
    let replacement = "";
    if (fmt === "bold") replacement = `**${selected || "bold text"}**`;
    if (fmt === "italic") replacement = `_${selected || "italic text"}_`;
    if (fmt === "bullet") replacement = `\n• ${selected || "item"}`;
    if (fmt === "link") replacement = `[${selected || "link text"}](https://)`;
    const newVal = draft.substring(0, start) + replacement + draft.substring(end);
    setDraft(newVal);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + replacement.length, start + replacement.length); }, 0);
  };

  return (
    <tr>
      <td colSpan={12} className="px-0 py-0 border-b-2 border-sky">
        <div className="bg-pale/30 border-l-4 border-sky">
          <div className="flex items-center justify-between px-6 py-3 border-b border-pebble">
            <span className="text-sm text-night" style={{ fontWeight: 600 }}>Claim Workspace details</span>
            <button onClick={onClose} className="p-1 hover:bg-earth rounded">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="px-6 py-4 space-y-6">
            {/* Section 1: Support Strategy & Substantiation */}
            <div className="bg-white p-4 rounded-xl border border-pebble shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-pebble pb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky" />
                  <span className="text-sm text-night" style={{ fontWeight: 600 }}>Support Strategy & Substantiation</span>
                  <span className="text-[10px] bg-sky/10 text-sky px-2 py-0.5 rounded-full border border-sky/20 cursor-help" title="Editable by: Claims Lead, R&D TPL, Nutritionist, Substantiator">
                    Claims Lead · TPL · Nutritionist · Substantiator
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {savedToast && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">✓ Saved</span>}
                  {isLifecycleLocked && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Lock className="w-3 h-3" /> Locked after assessment
                    </span>
                  )}
                  {canEdit && !isEditing && (
                    <button onClick={() => { setIsEditing(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                      className="text-xs text-sky hover:text-sky/80 border border-sky/30 px-3 py-1 rounded-lg hover:bg-sky/5 transition-colors font-medium">
                      Edit Support Strategy
                    </button>
                  )}
                </div>
              </div>

              {/* F02 — view-only or edit */}
              {!canEdit || !isEditing ? (
                <div
                  onClick={() => { if (canEdit) { setIsEditing(true); } }}
                  className={`min-h-[72px] px-3 py-2.5 rounded-lg border text-sm leading-relaxed transition-all rich-text-content
                    ${isLifecycleLocked ? "bg-gray-50 border-pebble text-gray-500 cursor-default"
                      : !hasEditRole ? "bg-gray-50 border-pebble text-gray-600 cursor-default"
                        : "bg-earth/30 border-pebble text-night cursor-text hover:border-sky/40 hover:bg-earth/50"}`}
                >
                  {claim.supportStrategy
                    ? <div dangerouslySetInnerHTML={{ __html: claim.supportStrategy }} />
                    : <span className="text-gray-400 italic">
                      {isLifecycleLocked || !hasEditRole ? "No support strategy recorded." : "Click to add support strategy…"}
                    </span>
                  }
                </div>
              ) : (
                <div className="border border-sky/30 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky/30">
                  <textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Describe the support strategy and justification for this claim…"
                    className="w-full px-4 py-3 text-sm text-night focus:outline-none resize-none bg-white"
                    rows={4}
                  />
                  {/* F01 — save/cancel */}
                  <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-t border-sky/15">
                    <span className="text-xs text-gray-400">Auto-saves on blur</span>
                    <div className="flex items-center gap-2">
                      <button onClick={handleCancel} className="px-3 py-1.5 border border-pebble text-gray-500 rounded-lg text-xs hover:bg-earth transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleSaveClick} disabled={draft === claim.supportStrategy} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors disabled:opacity-50">
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* F02 — access messages */}
              {hasEditRole && isLifecycleLocked && (
                <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Field locked — claim is in Assessed state.
                </p>
              )}
              {!hasEditRole && (
                <p className="mt-1.5 text-xs text-gray-400">
                  View-only access. Edit requires Claims Lead, R&D TPL, Nutritionist, or Substantiator role.
                </p>
              )}

              {/* F01 — last modified metadata */}
              {(claim as any).supportStrategyLastModifiedBy && (
                <p className="mt-1.5 text-[11px] text-gray-400">
                  Last modified by <span className="text-gray-600 font-medium">{(claim as any).supportStrategyLastModifiedBy}</span>
                  {(claim as any).supportStrategyLastModifiedAt && <> on {new Date((claim as any).supportStrategyLastModifiedAt).toLocaleString()}</>}
                </p>
              )}

              {/* F06 — mini audit trail */}
              {((claim as any).auditLog?.filter((e: any) => e.field === "supportStrategy").length ?? 0) > 0 && (
                <AuditTrailMini auditLog={(claim as any).auditLog} />
              )}
            </div>

            {/* Section 2: Risk Assessment */}
            <div className="bg-white p-4 rounded-xl border border-pebble shadow-sm">
              <div className="flex items-center gap-2 mb-3 border-b border-pebble pb-2">
                {RISK_ICONS[claim.riskLevel]}
                <span className={`text-sm ${RISK_STYLES[claim.riskLevel]}`} style={{ fontWeight: 600 }}>
                  Risk Assessment – {claim.riskLevel} Risk
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {claim.riskAssessment || <span className="text-gray-400 italic">No risk assessment recorded.</span>}
              </p>
            </div>

            {/* Section 3: Comments & Notes */}
            <div className="bg-white p-4 rounded-xl border border-pebble shadow-sm">
              <div className="flex items-center gap-2 mb-3 border-b border-pebble pb-2">
                <Info className="w-4 h-4 text-sky" />
                <span className="text-sm text-night" style={{ fontWeight: 600 }}>Comments & Notes</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {claim.comments || <span className="text-gray-400 italic">No comments or notes recorded.</span>}
              </p>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// F06 — mini audit trail for strategy changes in expanded row
function AuditTrailMini({ auditLog }: { auditLog?: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const entries = (auditLog || [])
    .filter((e: any) => e.field === "supportStrategy")
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);
  if (entries.length === 0) return null;
  return (
    <div className="mt-3 border-t border-pebble pt-2">
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-xs text-gray-400 hover:text-night transition-colors">
        <Clock className="w-3 h-3" />
        <span className="font-medium uppercase tracking-wide">Strategy change history</span>
        <span className="bg-earth px-1.5 py-0.5 rounded-full">{entries.length}</span>
        <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="mt-2 space-y-1.5">
          {entries.map((entry: any) => (
            <div key={entry.id} className="flex gap-2 py-1.5 border-b border-pebble last:border-0">
              <div className="w-5 h-5 rounded-full bg-sky/10 text-sky flex items-center justify-center flex-shrink-0 text-[9px] font-bold">
                {entry.actor?.charAt(0) || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-medium text-night">{entry.actor}</span>
                  <span className="text-[10px] text-gray-400">{entry.actorRole}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-sky/10 text-sky border-sky/20">Edited</span>
                  <span className="text-[10px] text-gray-400 capitalize">(via {entry.surface})</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
                {entry.afterValue && (
                  <p className="mt-0.5 text-xs text-gray-600 bg-earth px-2 py-0.5 rounded truncate">
                    → {entry.afterValue.slice(0, 100)}{entry.afterValue.length > 100 ? "…" : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Column config dropdown for claims (US-M1-96)
function ClaimColumnConfig({
  columns,
  onToggle,
  onClose,
}: {
  columns: typeof BASE_COLUMNS;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-56 overflow-hidden">
        <div
          className="px-4 py-2.5 border-b border-pebble text-xs text-gray-500 uppercase tracking-wide"
          style={{ fontWeight: 600 }}
        >
          Visible Columns
        </div>
        <div className="p-2 max-h-60 overflow-y-auto no-scrollbar">
          {columns
            .filter(
              (c) => c.id !== "order" && c.id !== "statement",
            )
            .map((col) => (
              <button
                key={col.id}
                onClick={() => onToggle(col.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-earth text-left transition-colors"
              >
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${col.visible ? "bg-sky border-sky" : "border-gray-300"}`}
                >
                  {col.visible && (
                    <Check className="w-2.5 h-2.5 text-white" />
                  )}
                </div>
                <span className="text-sm text-night">
                  {col.label}
                </span>
                <span className="ml-auto">
                  {col.visible ? (
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-gray-300" />
                  )}
                </span>
              </button>
            ))}
        </div>
        <div className="px-4 py-2.5 border-t border-pebble">
          <button
            onClick={onClose}
            className="w-full text-center text-xs text-sky hover:underline"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}

interface ClaimSectionProps {
  section: ClaimSection;
  searchQuery: string;
  visibleColumns: typeof BASE_COLUMNS;
  showColConfig: boolean;
  onToggleColConfig: () => void;
  onToggleColumn: (id: string) => void;
  onAddClaimClick: () => void;
  selectedClaimIds: Set<string>;
  onToggleSelectClaim: (id: string) => void;
  onSelectAllClaims: (ids: string[], select: boolean) => void;
}

function ClaimSectionBlock({
  section,
  searchQuery,
  visibleColumns,
  showColConfig,
  onToggleColConfig,
  onToggleColumn,
  onAddClaimClick,
  selectedClaimIds,
  onToggleSelectClaim,
  onSelectAllClaims,
}: ClaimSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedClaim, setExpandedClaim] = useState<
    string | null
  >(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(
    null,
  );
  const [claims, setClaims] = useState(section.claims);
  const [versionDropdown, setVersionDropdown] = useState<
    string | null
  >(null);
  const [selectedVersions, setSelectedVersions] = useState<
    Record<string, string>
  >({});
  const [columnOrder, setColumnOrder] = useState(visibleColumns);
  const [draggedCol, setDraggedCol] = useState<number | null>(null);

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

  const toggleClaim = (id: string) =>
    setExpandedClaim((prev) => (prev === id ? null : id));

  const filteredClaims = claims.filter(
    (c) =>
      !searchQuery ||
      c.statement
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      c.qualifier
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  // Drag to reorder claims (US-M1-100)
  const handleDragStart = (idx: number) => setDraggedIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const reordered = [...claims];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(idx, 0, moved);
    setClaims(reordered);
    setDraggedIdx(idx);
  };
  const handleDragEnd = () => setDraggedIdx(null);

  const isColVisible = (id: string) =>
    columnOrder.find((c) => c.id === id)?.visible !== false;

  return (
    <div id={section.id} className="bg-white rounded-xl border border-pebble overflow-hidden mb-4">
      {/* Section Header */}
      <div
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-earth transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-sky" />
          ) : (
            <ChevronRight className="w-4 h-4 text-sky" />
          )}
          <div className="text-left">
            <div
              className="text-sm text-night"
              style={{ fontWeight: 600 }}
            >
              {section.title}
            </div>
            <div className="text-xs text-gray-500">
              {section.description} · {filteredClaims.length}{" "}
              claims
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 bg-earth px-2 py-1 rounded">
            {filteredClaims.length}
          </span>
          {/* Section specific Show in Tab */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const targetView = SECTION_VIEW_MAP[section.id] || "Global Claims";
              window.dispatchEvent(new CustomEvent('navigateToClaimsView', { detail: { view: targetView } }));
            }}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-sky/30 text-sky bg-sky/5 rounded-lg hover:bg-sky/10 transition-colors mr-1 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Show in Tab
          </button>
          {/* Column config button (US-M1-96) — only on first section visually */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleColConfig();
              }}
              className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg hover:bg-earth transition-colors border ${showColConfig ? "border-sky text-sky bg-pale" : "border-pebble text-gray-500"}`}
            >
              <Settings className="w-3 h-3" />
              Cols
            </button>
            {showColConfig && (
              <div onClick={(e) => e.stopPropagation()}>
                <ClaimColumnConfig
                  columns={visibleColumns}
                  onToggle={onToggleColumn}
                  onClose={onToggleColConfig}
                />
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClaimClick();
            }}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-sky text-white rounded-lg hover:bg-dark ml-1"
          >
            <Plus className="w-3 h-3" /> Add Claim
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto border-t border-pebble">
          <table className="w-full">
            <thead className="bg-earth">
              <tr>
                {/* Drag handle col */}
                <th className="w-8 px-2 py-2.5" />
                {/* Checkbox all col */}
                <th className="w-10 px-3 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={filteredClaims.length > 0 && filteredClaims.every(c => selectedClaimIds.has(c.id))}
                    onChange={(e) => {
                      onSelectAllClaims(filteredClaims.map(c => c.id), e.target.checked);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer accent-sky"
                  />
                </th>
                {columnOrder.map((col, i) =>
                  col.visible !== false ? (
                    <th
                      key={col.id}
                      draggable
                      onDragStart={() => handleColDragStart(i)}
                      onDragOver={(e) => handleColDragOver(e, i)}
                      onDragEnd={handleColDragEnd}
                      style={{ width: col.width, minWidth: col.width }}
                      className={`px-3 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide cursor-move select-none transition-colors ${draggedCol === i ? 'bg-pale opacity-60' : ''
                        }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="w-3.5 h-3.5 text-gray-300" />
                        {col.label}
                      </div>
                    </th>
                  ) : null
                )}
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim, idx) => (
                <React.Fragment key={claim.id}>
                  <tr
                    key={claim.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`border-b border-pebble hover:bg-earth cursor-pointer transition-colors ${expandedClaim === claim.id ? "bg-pale/30" : ""} ${draggedIdx === idx ? "opacity-50" : ""}`}
                    onClick={() => toggleClaim(claim.id)}
                  >
                    {/* Drag handle (US-M1-100) */}
                    <td
                      className="px-2 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-gray-300 hover:text-gray-500 transition-colors" />
                      </div>
                    </td>
                    {/* Checkbox row */}
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedClaimIds.has(claim.id)}
                        onChange={() => onToggleSelectClaim(claim.id)}
                        className="w-4 h-4 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer accent-sky"
                      />
                    </td>
                    {isColVisible("order") && (
                      <td className="px-3 py-3 text-xs text-gray-500">
                        {claim.order}
                      </td>
                    )}
                    {/* Version dropdown (US-M1-99) */}
                    {isColVisible("version") && (
                      <td
                        className="px-3 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative">
                          <button
                            onClick={() =>
                              setVersionDropdown(
                                versionDropdown === claim.id
                                  ? null
                                  : claim.id,
                              )
                            }
                            className="flex items-center gap-1 text-xs bg-earth text-gray-600 px-1.5 py-0.5 rounded hover:bg-pale hover:text-sky transition-colors"
                          >
                            {selectedVersions[claim.id] ||
                              claim.version}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {versionDropdown === claim.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() =>
                                  setVersionDropdown(null)
                                }
                              />
                              <div className="absolute left-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-20 w-36 overflow-hidden">
                                <div className="px-3 py-2 border-b border-pebble text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Version History
                                </div>
                                {claim.allVersions.map((v) => (
                                  <button
                                    key={v}
                                    onClick={() => {
                                      setSelectedVersions(
                                        (prev) => ({
                                          ...prev,
                                          [claim.id]: v,
                                        }),
                                      );
                                      setVersionDropdown(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-earth transition-colors flex items-center justify-between ${(selectedVersions[claim.id] || claim.version) === v ? "text-sky" : "text-night"}`}
                                  >
                                    {v}
                                    {v === claim.version && (
                                      <span className="text-xs text-gray-400">
                                        latest
                                      </span>
                                    )}
                                    {(selectedVersions[
                                      claim.id
                                    ] || claim.version) ===
                                      v && (
                                        <Check className="w-3 h-3 text-sky" />
                                      )}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                    {/* Claim statement with link (US-M1-98) */}
                    {isColVisible("statement") && (
                      <td className="px-3 py-3">
                        <div className="flex items-start gap-2">
                          <div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.dispatchEvent(new CustomEvent('navigateToClaimDetails', { detail: { claimId: claim.id } }));
                              }}
                              className="text-sm text-night hover:text-sky transition-colors text-left group flex items-center gap-1"
                              style={{ fontWeight: 500 }}
                            >
                              {claim.statement}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-sky" />
                            </button>
                            {expandedClaim !== claim.id && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                Click to expand details
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    {isColVisible("status") && (
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[claim.status]}`}
                        >
                          {claim.status}
                        </span>
                      </td>
                    )}
                    {isColVisible("qualifier") && (
                      <td className="px-3 py-3 text-xs text-gray-500 max-w-[140px] truncate">
                        {claim.qualifier}
                      </td>
                    )}
                    {isColVisible("channel") && (
                      <td className="px-3 py-3 text-xs text-gray-600">
                        {claim.channel}
                      </td>
                    )}
                    {isColVisible("riskLevel") && (
                      <td className="px-3 py-3">
                        <span
                          className={`text-xs ${RISK_STYLES[claim.riskLevel]}`}
                          style={{ fontWeight: 500 }}
                        >
                          {claim.riskLevel}
                        </span>
                      </td>
                    )}
                    {isColVisible("riskIcon") && (
                      <td className="px-3 py-3">
                        {RISK_ICONS[claim.riskLevel]}
                      </td>
                    )}
                    {isColVisible("rcfSummary") && (
                      <td className="px-3 py-3 text-xs text-gray-500 max-w-[180px]">
                        <div className="line-clamp-2">
                          {claim.rcfSummary}
                        </div>
                      </td>
                    )}
                  </tr>
                  {expandedClaim === claim.id && (
                    <ExpandedClaimPanel
                      key={`${claim.id}-expanded`}
                      claim={claim}
                      onClose={() => setExpandedClaim(null)}
                      onClaimSave={(updated) => {
                        setClaims(prev => prev.map(c => c.id === updated.id ? updated : c));
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
              {filteredClaims.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-sm text-gray-400"
                  >
                    No claims match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function RelatedClaimsTab({ subFilter = "all", hideOuterHeader = false }: { subFilter?: string; hideOuterHeader?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    ClaimStatus | ""
  >("");
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "">(
    "",
  );
  const [activeChips, setActiveChips] = useState<
    Array<{ key: string; label: string }>
  >([]);
  const [claimColumns, setClaimColumns] = useState(
    BASE_COLUMNS,
  );
  const [colConfigSectionId, setColConfigSectionId] = useState<
    string | null
  >(null);
  const [isAddClaimModalOpen, setIsAddClaimModalOpen] =
    useState(false);
  const [isClaimCreationModalOpen, setIsClaimCreationModalOpen] = useState(false);
  const [sections, setSections] =
    useState<ClaimSection[]>(mockSections);

  const [selectedClaimIds, setSelectedClaimIds] = useState<Set<string>>(new Set());

  // Get all existing claims to prevent duplicates
  const allExistingClaims = sections.flatMap((s) => s.claims);

  const handleAddClaims = (newClaims: Claim[]) => {
    // Add claims to appropriate sections based on claim type
    // For now, add all to Global Claims section
    setSections((prev) =>
      prev.map((section) => {
        if (section.id === "global") {
          // Check for duplicates
          const existingStatements = new Set(
            section.claims.map((c) => c.id),
          );
          const claimsToAdd = newClaims.filter(
            (c) => !existingStatements.has(c.id),
          );

          // Update order for new claims
          const updatedClaims = claimsToAdd.map(
            (claim, idx) => ({
              ...claim,
              order: section.claims.length + idx + 1,
            }),
          );

          return {
            ...section,
            claims: [...section.claims, ...updatedClaims],
          };
        }
        return section;
      }),
    );
  };

  const handleToggleColumn = (id: string) => {
    setClaimColumns((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, visible: !c.visible } : c,
      ),
    );
  };

  const handleToggleSelectClaim = (id: string) => {
    setSelectedClaimIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllClaims = (ids: string[], select: boolean) => {
    setSelectedClaimIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => {
        if (select) next.add(id);
        else next.delete(id);
      });
      return next;
    });
  };

  const activeFilterCount = [statusFilter, riskFilter].filter(
    Boolean,
  ).length;

  const addChip = (key: string, label: string) => {
    setActiveChips((prev) => [
      ...prev.filter((c) => c.key !== key),
      { key, label },
    ]);
  };

  const removeChip = (key: string) => {
    setActiveChips((prev) => prev.filter((c) => c.key !== key));
    if (key === "status") setStatusFilter("");
    if (key === "risk") setRiskFilter("");
  };

  return (
    <div className={hideOuterHeader ? "p-4" : "p-0 h-full flex flex-col overflow-hidden"}>
      {/* Header */}
      {!hideOuterHeader ? (
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-night">Related Claims</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage and track all marketing claims associated
                with this project
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedClaimIds.size > 0 && (
                <div className="flex items-center gap-2 bg-sky/10 border border-sky/30 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky animate-in fade-in zoom-in-95 duration-200 shadow-sm mr-2">
                  <span>{selectedClaimIds.size} selected</span>
                  <button
                    type="button"
                    onClick={() => setIsAddClaimModalOpen(true)}
                    className="flex items-center gap-1.5 bg-sky text-white px-2.5 py-1 rounded-md hover:bg-dark transition-colors font-bold shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> Add Selected to Project Claims
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  const targetView = SECTION_VIEW_MAP[subFilter] || "Global Claims";
                  window.dispatchEvent(new CustomEvent('navigateToClaimsView', { detail: { view: targetView } }));
                }}
                className="flex items-center gap-2 px-3 py-2 border border-sky/30 text-sky bg-sky/5 rounded-lg text-sm hover:bg-sky/10 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                Show in Tab
              </button>
              <button
                onClick={() => setIsAddClaimModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors cursor-pointer font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Claim
              </button>
            </div>
          </div>

          {/* Search Bar only */}
          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search claims by statement, qualifier..."
                className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search claims by statement, qualifier..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedClaimIds.size > 0 && (
              <div className="flex items-center gap-2 bg-sky/10 border border-sky/30 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                <span>{selectedClaimIds.size} selected</span>
                <button
                  type="button"
                  onClick={() => setIsAddClaimModalOpen(true)}
                  className="flex items-center gap-1.5 bg-sky text-white px-2.5 py-1 rounded-md hover:bg-dark transition-colors font-bold shadow-sm cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Bulk Actions
                </button>
              </div>
            )}
            <button
              onClick={() => setIsAddClaimModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors cursor-pointer font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Claim
            </button>
          </div>
        </div>
      )}
      {/* Scrollable Content */}
      <div className={hideOuterHeader ? "pr-1 -mr-1 no-scrollbar" : "flex-1 overflow-y-auto pr-1 -mr-1 no-scrollbar"}>
        {sections
          .filter((section) => subFilter === "all" || section.id === subFilter)
          .map((section) => (
            <ClaimSectionBlock
              key={section.id}
              section={
                sections.find((s) => s.id === section.id) ||
                section
              }
              searchQuery={searchQuery}
              visibleColumns={claimColumns}
              showColConfig={colConfigSectionId === section.id}
              onToggleColConfig={() =>
                setColConfigSectionId(
                  colConfigSectionId === section.id
                    ? null
                    : section.id,
                )
              }
              onToggleColumn={handleToggleColumn}
              onAddClaimClick={() => setIsAddClaimModalOpen(true)}
              selectedClaimIds={selectedClaimIds}
              onToggleSelectClaim={handleToggleSelectClaim}
              onSelectAllClaims={handleSelectAllClaims}
            />
          ))}
      </div>

      {/* Add Claim Modal (US-M1-101 & US-M1-103) */}
      <AddClaimModal
        isOpen={isAddClaimModalOpen}
        onClose={() => setIsAddClaimModalOpen(false)}
        onAddClaims={handleAddClaims}
        linkedProductIds={["prod-1", "prod-2", "prod-3"]} // These should come from project data
        existingClaims={allExistingClaims}
        initialSelectedClaims={allExistingClaims.filter(c => selectedClaimIds.has(c.id))}
        initialTab="select"
      />

      <ClaimCreationModal
        isOpen={isClaimCreationModalOpen}
        onClose={() => setIsClaimCreationModalOpen(false)}
        onCreate={(newClaims) => {
          handleAddClaims(newClaims as any);
        }}
      />
    </div>
  );
}