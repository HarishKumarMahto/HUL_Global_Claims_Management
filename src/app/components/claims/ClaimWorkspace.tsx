import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  MoreVertical,
  Copy,
  Users,
  History,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Send,
  X,
  Upload,
  Plus,
  Sparkles,
  ChevronDown,
  Lock,
  Save,
  Bold,
  Italic,
  List,
  Link,
  ExternalLink,
  FileText,
  Settings,
  Globe,
} from "lucide-react";
import type { Claim, ClaimType, RiskLevel, AuditEntry, UserRole } from "../../types";
import {
  CLAIM_LIFECYCLE_COLORS,
  RISK_LEVEL_COLORS,
  RISK_LEVEL_ICON_COLOR,
  initialProjects,
  REGIONS,
  CURRENT_USER,
  CURRENT_USER_ROLE,
  canEditSupportStrategy,
} from "../../types";
import {
  RISK_LEVEL_OPTIONS,
  formatDate,
} from "../ui/tableUtils";
import DuplicateClaimModal from "./DuplicateClaimModal";
import AdaptationModal from "./AdaptationModal";
import ClaimCreationModal from "./ClaimCreationModal";
import IRAModal from "./IRAModal";
import RiskAssessmentModal from "./RiskAssessmentModal";
import RiskLevelAssessmentsSection from "./RiskLevelAssessmentsSection";
import UploadDocumentModal from "../documents/UploadDocumentModal";
import type { DocumentRecord } from "../documents/documentsData";

interface CommentEntry {
  id: string;
  author: string;
  initials: string;
  text: string;
  timestamp: string;
}

const MOCK_COMMENTS: CommentEntry[] = [
  {
    id: "c1",
    author: "Sarah Johnson",
    initials: "SJ",
    text: "Claim substantiation looks good — please ensure the doc classification is updated.",
    timestamp: "2026-04-28T10:30:00Z",
  },
  {
    id: "c2",
    author: "Michael Chen",
    initials: "MC",
    text: "@Sarah Johnson Done — all docs are now classified as Level 1.",
    timestamp: "2026-04-28T11:05:00Z",
  },
];

function CollabDrawer({
  claimId,
  onClose,
}: {
  claimId: string;
  onClose: () => void;
}) {
  const [comments, setComments] =
    useState<CommentEntry[]>(MOCK_COMMENTS);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!draft.trim()) return;
    const entry: CommentEntry = {
      id: `c${Date.now()}`,
      author: "Current User",
      initials: "CU",
      text: draft.trim(),
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => [...prev, entry]);
    setDraft("");
    setTimeout(
      () =>
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
        }),
      50,
    );
  };

  return (
    <div
      className="w-80 bg-white border-l border-pebble flex-shrink-0 flex flex-col"
      style={{ maxHeight: "100%" }}
    >
      <div className="px-4 py-3 border-b border-pebble flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-sm text-night font-semibold">
            Comments
          </div>
          <div className="text-xs text-gray-400">{claimId}</div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-earth rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-sky text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {c.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs font-semibold text-night">
                  {c.author}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-earth rounded-lg px-3 py-2">
                {c.text}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t border-pebble flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Add a comment… (Enter to send)"
            rows={2}
            className="flex-1 px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            className="p-2.5 bg-sky text-white rounded-lg hover:bg-dark disabled:opacity-40 transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── M13 Final Risk Summary Section ──────────────────────────────────────────
function FinalRiskSummarySection({
  claim,
  onClaimSave,
}: {
  claim: Claim;
  onClaimSave: (updated: Claim) => void;
}) {
  const isLocked = claim.lifecycleStage === "Assessed";

  const [draft, setDraft] = useState({
    finalRiskLevel: claim.finalRiskLevel ?? "",
    claimClassificationLevel:
      claim.finalRiskSummary.claimClassificationLevel ?? "",
    reasons:
      claim.finalRiskSummary.reasons ??
      (claim.finalRiskSummary.reason
        ? claim.finalRiskSummary.reason
            .split(";")
            .map((r) => r.trim())
            .filter(Boolean)
        : []),
    claimsForumSummary:
      claim.finalRiskSummary.claimsForumSummary ?? "",
    legalSummary: claim.finalRiskSummary.legalSummary ?? "",
    raSummary: claim.finalRiskSummary.raSummary ?? "",
    rdSummary: claim.finalRiskSummary.rdSummary ?? "",
    marketingFeedback:
      claim.finalRiskSummary.marketingFeedback ?? "",
    marketingRiskSignoff:
      claim.finalRiskSummary.marketingRiskSignoff,
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationMsg, setValidationMsg] = useState<
    string | null
  >(null);

  // Auto risk icon colours
  const iconColorMap: Record<string, string> = {
    Low: "bg-green-500",
    Medium: "bg-amber-500",
    High: "bg-red-500",
    "Very High": "bg-red-700",
    "Not Allowed": "bg-red-600",
    "Varied / Channel Dependent": "bg-blue-500",
  };

  const reasonsNeeded =
    draft.finalRiskLevel === "High" ||
    draft.finalRiskLevel === "Not Allowed";

  const REASONS_PICKLIST = [
    "Regulatory sensitivity",
    "Ambiguous wording",
    "Scientific backing moderate",
    "Competitor challenge risk",
    "Market-specific restriction",
    "Lack of clinical data",
    "Environmental impact concern",
    "Label compliance issue",
    "Consumer perception risk",
    "Substantiation not available",
  ];

  const toggleReason = (r: string) => {
    setDraft((d) => ({
      ...d,
      reasons: d.reasons.includes(r)
        ? d.reasons.filter((x) => x !== r)
        : [...d.reasons, r],
    }));
  };

  const handleSave = () => {
    if (reasonsNeeded && draft.reasons.length === 0) {
      setValidationMsg(
        "At least one Reason is required when Risk Level is High or Not Allowed.",
      );
      return;
    }
    setValidationMsg(null);
    onClaimSave({
      ...claim,
      finalRiskLevel: (draft.finalRiskLevel as any) || null,
      finalRiskSummary: {
        ...claim.finalRiskSummary,
        claimClassificationLevel:
          draft.claimClassificationLevel || undefined,
        reasons: draft.reasons,
        reason: draft.reasons.join("; "),
        claimsForumSummary: draft.claimsForumSummary,
        legalSummary: draft.legalSummary,
        raSummary: draft.raSummary,
        rdSummary: draft.rdSummary,
        marketingFeedback: draft.marketingFeedback,
        marketingRiskSignoff: draft.marketingRiskSignoff,
      },
      updatedAt: new Date().toISOString(),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const inputClass = `w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky ${isLocked ? "bg-earth text-gray-500 cursor-not-allowed" : "bg-white text-night"}`;
  const selectClass = `w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky ${isLocked ? "bg-earth text-gray-500 cursor-not-allowed" : "bg-white text-night"}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-night font-semibold text-lg">Final Risk Summary</h2>
          <p className="text-sm text-gray-500 mt-0.5">Final assessment and categorization for this claim</p>
        </div>
        {isLocked && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
            🔒 Locked — Claim is Assessed
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-pebble p-6 space-y-6">
        {/* ── Row 1: Final Risk Level + Classification ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Final Risk Level */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            Final Risk Level
            <span
              className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help"
              title="Editable By: Claims Lead / Legal"
            >
              Roles
            </span>
          </label>
          <div className="flex items-center gap-2">
            {/* Auto risk icon */}
            {draft.finalRiskLevel &&
              draft.finalRiskLevel !== "Not Allowed" && (
                <span
                  className={`w-4 h-4 rounded-full flex-shrink-0 ${iconColorMap[draft.finalRiskLevel] ?? "bg-gray-400"}`}
                  title={`Risk icon: ${draft.finalRiskLevel}`}
                />
              )}
            {draft.finalRiskLevel === "Not Allowed" && (
              <span className="text-red-600 font-bold text-lg leading-none flex-shrink-0">
                ✕
              </span>
            )}
            <select
              disabled={isLocked}
              value={draft.finalRiskLevel}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  finalRiskLevel: e.target.value,
                }))
              }
              className={selectClass}
            >
              <option value="">Select risk level…</option>
              {[
                "Low",
                "Medium",
                "High",
                "Not Allowed",
                "Varied / Channel Dependent",
              ].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Claim Classification Level */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            Claim Classification Level
            <span
              className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help"
              title="Editable By: Claims Lead"
            >
              Roles
            </span>
          </label>
          <select
            disabled={isLocked}
            value={draft.claimClassificationLevel}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                claimClassificationLevel: e.target.value,
              }))
            }
            className={selectClass}
          >
            <option value="">Select classification…</option>
            {[
              "Level 1 (GO)",
              "Level 2 (ASK)",
              "Level 3 (NO GO)",
            ].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Row 2: Reasons multi-select picklist (M13 US5) ── */}
      <div>
        <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
          Reasons
          {reasonsNeeded && (
            <span className="text-red-500 text-xs font-semibold">
              * Required for {draft.finalRiskLevel}
            </span>
          )}
          <span
            className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help"
            title="Editable By: Claims Lead"
          >
            Roles
          </span>
        </label>
        <div className="flex flex-wrap gap-2 p-3 border border-pebble rounded-lg bg-earth/30">
          {REASONS_PICKLIST.map((r) => {
            const isSelected = draft.reasons.includes(r);
            return (
              <button
                key={r}
                disabled={isLocked}
                onClick={() => toggleReason(r)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                  isSelected
                    ? "bg-sky text-white border-sky"
                    : "bg-white text-gray-600 border-pebble hover:border-sky hover:text-sky"
                } ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {r}
                {isSelected && <span className="ml-1">✓</span>}
              </button>
            );
          })}
        </div>
        {draft.reasons.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {draft.reasons.map((r) => (
              <span
                key={r}
                className="px-2 py-0.5 rounded-full text-xs bg-sky/10 text-sky border border-sky/20"
              >
                {r}
              </span>
            ))}
          </div>
        )}
        {validationMsg && (
          <p className="mt-2 text-xs text-red-500">
            {validationMsg}
          </p>
        )}
      </div>

      {/* ── Row 3: Functional Summaries (M13 US6) ── */}
      <div className="grid grid-cols-2 gap-5">
        {/* Claims Forum Summary */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            Claims Forum Summary
            <span
              className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
              title="Editable By: Claims Lead"
            >
              Claims Lead
            </span>
          </label>
          <textarea
            disabled={isLocked}
            value={draft.claimsForumSummary}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                claimsForumSummary: e.target.value,
              }))
            }
            placeholder="Enter Claims Forum summary…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
        {/* Legal Summary */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            Legal Summary
            <span
              className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
              title="Editable By: Legal / Claims Lead"
            >
              Legal
            </span>
          </label>
          <textarea
            disabled={isLocked}
            value={draft.legalSummary}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                legalSummary: e.target.value,
              }))
            }
            placeholder="Enter Legal summary…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
        {/* RA Summary */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            RA Summary
            <span
              className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
              title="Editable By: RA / Claims Lead"
            >
              RA
            </span>
          </label>
          <textarea
            disabled={isLocked}
            value={draft.raSummary}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                raSummary: e.target.value,
              }))
            }
            placeholder="Enter RA summary…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
        {/* R&D Summary (NEW — M13 US6) */}
        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            R&amp;D Summary
            <span
              className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
              title="Editable By: R&D / Claims Lead"
            >
              R&amp;D
            </span>
          </label>
          <textarea
            disabled={isLocked}
            value={draft.rdSummary}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                rdSummary: e.target.value,
              }))
            }
            placeholder="Enter R&D summary…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
        {/* Marketing Feedback (NEW — M13 US7) */}
        <div className="col-span-2">
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            Marketing Feedback
            <span
              className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded"
              title="Editable By: Project Lead / Claims Lead"
            >
              Project Lead
            </span>
          </label>
          <textarea
            disabled={isLocked}
            value={draft.marketingFeedback}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                marketingFeedback: e.target.value,
              }))
            }
            placeholder="Enter Marketing feedback…"
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      {/* ── Row 4: Marketing Risk Signoff (M13 US8) ── */}
      <div className="flex items-center justify-between p-4 bg-earth rounded-xl border border-pebble">
        <div>
          <div className="text-sm font-semibold text-night mb-0.5">
            Marketing Risk Signoff
          </div>
          <div className="text-xs text-gray-500">
            Confirm marketing alignment and business risk
            acceptance
          </div>
        </div>
        <label
          className={`flex items-center gap-2 ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <input
            type="checkbox"
            disabled={isLocked}
            checked={draft.marketingRiskSignoff}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                marketingRiskSignoff: e.target.checked,
              }))
            }
            className="w-4 h-4 rounded border-gray-300 text-sky focus:ring-sky"
          />
          <span className="text-sm font-medium text-night">
            {draft.marketingRiskSignoff
              ? "✓ Signed off"
              : "Mark as signed off"}
          </span>
        </label>
      </div>

      {/* ── iRA Output Block (M6 US-M4-66) ── */}
      {claim.finalRiskSummary.iRAOutput === "Completed" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
              iRA Automated Assessment
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-600 text-white font-semibold">
              iRA
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-blue-600 font-semibold uppercase block mb-1">
                Final Risk Level (iRA)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-900">
                  {claim.finalRiskLevelIRA}
                </span>
                {claim.finalRiskSummary.iRARiskConfidence && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    {claim.finalRiskSummary.iRARiskConfidence}%
                    confidence
                  </span>
                )}
              </div>
            </div>
            <div>
              <span className="text-xs text-blue-600 font-semibold uppercase block mb-1">
                Classification Level (iRA)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-900">
                  {
                    claim.finalRiskSummary
                      .claimClassificationLevelIRA
                  }
                </span>
                {claim.finalRiskSummary
                  .iRAClassificationConfidence && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">
                    {
                      claim.finalRiskSummary
                        .iRAClassificationConfidence
                    }
                    % confidence
                  </span>
                )}
              </div>
            </div>
            {claim.finalRiskSummary.iRAReasons &&
              claim.finalRiskSummary.iRAReasons.length > 0 && (
                <div className="col-span-2">
                  <span className="text-xs text-blue-600 font-semibold uppercase block mb-2">
                    Reasons (iRA)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {claim.finalRiskSummary.iRAReasons.map(
                      (r, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs"
                        >
                          {r.reason}
                          <span className="px-1.5 py-0.5 rounded bg-blue-200 text-blue-700 text-xs font-semibold">
                            {r.confidence}%
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-xs bg-blue-600 text-white font-semibold">
                            iRA
                          </span>
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Inheritance trace */}
      {claim.finalRiskSummary.inheritanceTrace && (
        <div className="px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-700">
          ℹ {claim.finalRiskSummary.inheritanceTrace}
        </div>
      )}

      {/* ── Save Button (M13 US9) ── */}
      {!isLocked && (
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-pebble">
          {saveSuccess && (
            <span className="text-sm text-green-600 flex items-center gap-1.5 font-medium">
              ✓ Final Risk Summary saved
            </span>
          )}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors font-medium"
          >
            Save Final Risk Summary
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

// ─── US-M5.1 Support Strategy & Substantiation Section ───────────────────────
// Covers F01 (rich-text edit, save/cancel, auto-save, last-modified),
// F02 (role-based + lifecycle lock), F04 (grouped layout with docs),
// F05 (notification dispatch), F06 (audit log on every save)

interface SupportStrategySectionProps {
  claim: Claim;
  onClaimSave: (updated: Claim) => void;
  fileUploadRef: React.RefObject<HTMLInputElement>;
  surface: 'inline' | 'detail' | 'workspace';
  onDocumentCreated?: (doc: DocumentRecord) => void;
}

function SupportStrategySection({
  claim,
  onClaimSave,
  fileUploadRef,
  surface,
  onDocumentCreated,
}: SupportStrategySectionProps) {
  // F02 — role + lifecycle access control
  const isLifecycleLocked = claim.lifecycleStage === 'Assessed';
  const hasEditRole = canEditSupportStrategy(CURRENT_USER_ROLE);
  const canEdit = hasEditRole && !isLifecycleLocked;

  // SE attach modal state
  const [seModalOpen, setSeModalOpen] = useState(false);
  const [linkedSEDocs, setLinkedSEDocs] = useState<DocumentRecord[]>([]);

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

  const buildAuditEntry = (beforeValue: string, afterValue: string): AuditEntry => ({
    id: `AUD-SS-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: CURRENT_USER,
    actorRole: CURRENT_USER_ROLE,
    action: 'SUPPORT_STRATEGY_UPDATED',
    field: 'supportStrategy',
    beforeValue,
    afterValue,
    surface,
  });

  // F05 — dispatch notification (appends to a global event for App to consume)
  const dispatchStrategyNotification = (claimId: string, strategy: string) => {
    window.dispatchEvent(new CustomEvent('supportStrategyChanged', {
      detail: {
        claimId,
        claimLabel: claimId,
        modifiedBy: CURRENT_USER,
        timestamp: new Date().toISOString(),
        strategy,
      }
    }));
  };

  const commitSave = (value: string) => {
    // F02 — server-side rejection simulation
    if (!canEdit) {
      if (!hasEditRole) console.error('[403 PERMISSION_DENIED] Insufficient role to edit Support Strategy.');
      if (isLifecycleLocked) console.error('[423 LOCKED] Support Strategy is locked — claim is in Assessed state.');
      setIsEditing(false);
      return;
    }
    const trimmedNew = value.trim();
    const trimmedOld = (claim.supportStrategy || '').trim();
    // F06 — no-op save is not audited or notified
    if (trimmedNew === trimmedOld) {
      setIsEditing(false);
      return;
    }
    const now = new Date().toISOString();
    const auditEntry = buildAuditEntry(claim.supportStrategy, value);
    const updated: Claim = {
      ...claim,
      supportStrategy: value,
      supportStrategyLastModifiedBy: CURRENT_USER,
      supportStrategyLastModifiedAt: now,
      updatedAt: now,
      auditLog: [...(claim.auditLog || []), auditEntry],
    };
    onClaimSave(updated);
    // F05 — notify
    dispatchStrategyNotification(claim.id, value);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
    setIsEditing(false);
  };

  const handleBlur = () => {
    // F01 — auto-save on blur (feature-flagged; enabled here)
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

  // Minimal rich-text toolbar actions via execCommand on a contentEditable (simulated)
  // Since we use a textarea for simplicity, we apply markdown-style formatting hints
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
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-night font-semibold text-lg">Support Strategy &amp; Substantiation</h2>
          <p className="text-sm text-gray-500 mt-0.5">Capture the justification and evidence behind this claim</p>
        </div>
        {savedToast && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 animate-pulse">
            <CheckCircle className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-pebble p-6 space-y-6">
        {/* ── Support Strategy Panel (F04: visually distinct from docs) ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
                Support Strategy
              </label>
              {/* F02 — role badge */}
              <span
                className="text-[10px] bg-sky/10 text-sky px-2 py-0.5 rounded-full cursor-help border border-sky/20"
                title="Editable by: Claims Lead, TPL, Nutritionist, Substantiator"
              >
                Claims Lead · TPL · Nutritionist · Substantiator
              </span>
            </div>
            {/* F02 — lifecycle lock badge */}
            {isLifecycleLocked && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Lock className="w-3 h-3" /> Locked after assessment
              </span>
            )}
            {/* F01 — Edit button for detail surface when not editing */}
            {canEdit && !isEditing && (
              <button
                onClick={() => { setIsEditing(true); setTimeout(() => textareaRef.current?.focus(), 50); }}
                className="text-xs text-sky hover:text-sky/80 border border-sky/30 px-3 py-1 rounded-lg hover:bg-sky/5 transition-colors"
              >
                Edit
              </button>
            )}
          </div>

          {/* F02 — view-only users see static text */}
          {!canEdit || !isEditing ? (
            <div
              onClick={() => { if (canEdit) { setIsEditing(true); } }}
              className={`min-h-[100px] px-4 py-3 rounded-lg border text-sm leading-relaxed transition-all rich-text-content
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
                    {isLifecycleLocked || !hasEditRole
                      ? 'No support strategy recorded.'
                      : 'Click to add support strategy…'}
                  </span>
              }
            </div>
          ) : (
            /* F01 — Rich-text editor (contentEditable + toolbar) */
            <div className="border border-sky/30 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky/40">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={handleBlur}
                placeholder="Describe the support strategy and justification for this claim…"
                className="w-full px-4 py-3 text-sm text-night focus:outline-none resize-none bg-white"
                rows={6}
              />
              {/* F01 — Save / Cancel controls when editing */}
              <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-sky/15">
                <span className="text-xs text-gray-400">Auto-saves on blur</span>
                <div className="flex items-center gap-2">
                  <button onClick={handleCancel} className="text-xs px-3 py-1.5 border border-pebble text-gray-500 rounded-lg hover:bg-earth transition-colors">Cancel</button>
                  <button onClick={handleSaveClick} disabled={draft === claim.supportStrategy} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors disabled:opacity-50">
                    <Save className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* F02 — tooltip for edit-permitted users on a locked claim */}
          {hasEditRole && isLifecycleLocked && (
            <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Field locked — claim is in Assessed state. Re-open via challenge or BA override to edit.
            </p>
          )}
          {/* F02 — message for non-permitted roles */}
          {!hasEditRole && (
            <p className="mt-1.5 text-xs text-gray-400">
              You have view-only access to this field. Edit access requires Claims Lead, TPL, Nutritionist, or Substantiator role.
            </p>
          )}

          {/* F01 — last modified metadata */}
          {claim.supportStrategyLastModifiedBy && (
            <p className="mt-1.5 text-[11px] text-gray-400">
              Last modified by <span className="text-gray-600 font-medium">{claim.supportStrategyLastModifiedBy}</span>
              {claim.supportStrategyLastModifiedAt && (
                <> on {new Date(claim.supportStrategyLastModifiedAt).toLocaleString()}</>
              )}
            </p>
          )}
        </div>

        {/* ── Substantiation Documents Panel (F04 — visually separated) ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              Substantiation Documents ({claim.substantiationDocs.length})
            </label>
            {canEdit && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileUploadRef.current?.click()}
                  className="flex items-center gap-1 text-xs text-sky hover:underline"
                >
                  <Upload className="w-3 h-3" /> Upload Document
                </button>
                <span className="text-gray-300 text-xs">|</span>
                <button
                  onClick={() => setSeModalOpen(true)}
                  className="flex items-center gap-1 text-xs text-violet-600 hover:underline font-medium"
                >
                  <FileText className="w-3 h-3" /> Upload Substantiation Evidence
                </button>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              ref={fileUploadRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const doc = {
                    id: `DOC-${Date.now()}`,
                    fileName: file.name,
                    classification: '',
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: CURRENT_USER,
                  };
                  onClaimSave({ ...claim, substantiationDocs: [...claim.substantiationDocs, doc] });
                }
              }}
            />
          </div>
          {claim.substantiationDocs.length === 0 ? (
            <div className="text-sm text-gray-400 italic py-2">No documents uploaded</div>
          ) : (
            <div className="space-y-2">
              {claim.substantiationDocs.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 px-3 py-2 bg-earth rounded-lg border border-pebble">
                  <FileText className="w-4 h-4 text-sky/60 flex-shrink-0" />
                  <span className="text-sm text-night flex-1 truncate">{doc.fileName}</span>
                  {doc.classification
                    ? <span className="text-xs text-gray-500 flex-shrink-0">{doc.classification}</span>
                    : <span className="text-xs text-amber-500 flex-shrink-0">⚠ Unclassified</span>
                  }
                  {doc.inUse && (
                    <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-700 border border-green-200 flex-shrink-0">In Use</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── F06 Audit Log — Support Strategy changes ── */}
        <AuditLogPanel auditLog={claim.auditLog} />
      </div>

      {/* SE Upload Modal — opens in context of this claim */}
      {seModalOpen && (
        <UploadDocumentModal
          isOpen={seModalOpen}
          onClose={() => setSeModalOpen(false)}
          contextDocType="Substantiation Evidence"
          contextClaimId={claim.id}
          onCreate={(doc) => {
            setLinkedSEDocs(prev => [doc, ...prev]);
            onDocumentCreated?.(doc);
            setSeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─── F06 Audit Log Panel ──────────────────────────────────────────────────────
function AuditLogPanel({ auditLog }: { auditLog?: AuditEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  const strategyEntries = (auditLog || [])
    .filter(e => e.field === 'supportStrategy' || e.action === 'SUPPORT_STRATEGY_UPDATED' || e.action === 'LIFECYCLE_LOCK')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (strategyEntries.length === 0) return null;

  return (
    <div className="border-t border-pebble pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-night transition-colors"
      >
        <History className="w-3.5 h-3.5" />
        <span className="font-medium uppercase tracking-wide">Strategy Change History</span>
        <span className="bg-earth px-1.5 py-0.5 rounded-full text-gray-500">{strategyEntries.length}</span>
        <ChevronDown className={`w-3.5 h-3.5 ml-1 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="mt-3 space-y-2">
          {strategyEntries.map((entry) => (
            <div key={entry.id} className="flex gap-3 py-2 border-b border-pebble last:border-0">
              <div className="w-6 h-6 rounded-full bg-sky/10 text-sky flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                {entry.actor?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-night">{entry.actor}</span>
                  <span className="text-[10px] text-gray-400">{entry.actorRole}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${entry.action === 'LIFECYCLE_LOCK' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-sky/10 text-sky border-sky/20'}`}>
                    {entry.action === 'LIFECYCLE_LOCK' ? 'Locked' : 'Edited'}
                  </span>
                  {entry.surface && (
                    <span className="text-[10px] text-gray-400 capitalize">(via {entry.surface})</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">{new Date(entry.timestamp).toLocaleString()}</p>
                {entry.afterValue && (
                  <p className="mt-1 text-xs text-gray-600 bg-earth px-2 py-1 rounded truncate">
                    → {entry.afterValue.slice(0, 120)}{entry.afterValue.length > 120 ? '…' : ''}
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

interface ClaimWorkspaceProps {
  claim: Claim;
  claims: Claim[];
  onBack: () => void;
  onClaimSave: (updated: Claim) => void;
  onClaimsChange: (claims: Claim[]) => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClaimSelect?: (claim: Claim) => void;
}

// Related Assets section — mirrors Projects → Linked Assets tab (US-M1-108/109)
function RelatedAssetsSection({ claim, onClaimSave }: { claim: Claim; onClaimSave: (updated: Claim) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [addAssetMenuOpen, setAddAssetMenuOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [colConfigOpen, setColConfigOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState({ type: true, lifecycleState: true, assetNumber: true });

  const assets = claim.linkedAssets || [];
  const assetTypes = ['All', ...Array.from(new Set(assets.map(a => a.type)))];

  const filtered = assets.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.assetNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'All' || a.type === filterType;
    return matchSearch && matchType;
  });

  const handleUnlink = (assetId: string) => {
    const updated: Claim = { ...claim, linkedAssets: assets.filter(a => a.id !== assetId) };
    onClaimSave(updated);
    setActionMenuOpen(null);
    if (selectedAsset === assetId) setSelectedAsset(null);
  };

  const LIFECYCLE_STYLE: Record<string, string> = {
    'Active': 'bg-green-100 text-green-700',
    'In Production': 'bg-blue-100 text-blue-700',
    'Approved': 'bg-green-100 text-green-700',
    'Archived': 'bg-gray-100 text-gray-600',
    'Draft': 'bg-blue-100 text-blue-600',
    'Superseded': 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-night font-semibold text-lg">Related Assets</h2>
          <p className="text-sm text-gray-500 mt-0.5">Documents, studies, certificates, and media linked to this claim</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors">
            <Link className="w-4 h-4" />Link Existing
          </button>
          <div className="relative">
            <button
              onClick={() => setAddAssetMenuOpen(!addAssetMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Asset
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {addAssetMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAddAssetMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-pebble rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                  <button
                    onClick={() => setAddAssetMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 text-sky" />
                    <div>
                      <div className="font-medium">Upload Existing File</div>
                      <div className="text-xs text-gray-500">Upload from your device</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { alert('This would navigate to the Assets module and open the Create Asset modal'); setAddAssetMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-sky" />
                    <div>
                      <div className="font-medium">Create New Asset</div>
                      <div className="text-xs text-gray-500">Go to Assets module</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-pebble overflow-hidden flex flex-col min-h-[400px]">
        {/* Toolbar */}
      <div className="px-4 py-3 border-b border-pebble flex items-center gap-3 flex-wrap bg-white">
        <div className="relative flex-1 max-w-sm">
          <ExternalLink className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ display: 'none' }} />
          <Settings className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ display: 'none' }} />
          {/* search icon inline */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex gap-1 flex-wrap">
          {assetTypes.map(type => (
            <button key={type} onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterType === type ? 'bg-sky text-white' : 'bg-earth text-gray-600 hover:bg-pebble'}`}>
              {type}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <button onClick={() => setColConfigOpen(!colConfigOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs transition-colors ${colConfigOpen ? 'border-sky text-sky bg-pale' : 'border-pebble text-gray-500 hover:bg-earth'}`}>
            <Settings className="w-3.5 h-3.5" />Columns
          </button>
          {colConfigOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setColConfigOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-52 overflow-hidden">
                <div className="px-3 py-2 border-b border-pebble text-xs text-gray-500 uppercase tracking-wide">Show/Hide Columns</div>
                <div className="p-2">
                  {([['type', 'Type'], ['lifecycleState', 'Lifecycle State'], ['assetNumber', 'Asset Number']] as [keyof typeof visibleCols, string][]).map(([id, label]) => (
                    <button key={id} onClick={() => setVisibleCols(p => ({ ...p, [id]: !p[id] }))}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-earth text-left transition-colors">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${visibleCols[id] ? 'bg-sky border-sky' : 'border-gray-300'}`}>
                        {visibleCols[id] && <span className="text-white text-[10px] font-bold">✓</span>}
                      </div>
                      <span className="text-sm text-night">{label}</span>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-pebble">
                  <button onClick={() => setColConfigOpen(false)} className="w-full text-center text-xs text-sky hover:underline">Done</button>
                </div>
              </div>
            </>
          )}
        </div>
        <span className="text-sm text-gray-500">{filtered.length} assets</span>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1 bg-white">
        <table className="w-full">
          <thead className="bg-earth sticky top-0 z-10 border-b border-pebble">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide min-w-[200px]">Asset Name</th>
              {visibleCols.type && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Type</th>}
              {visibleCols.lifecycleState && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Lifecycle State</th>}
              {visibleCols.assetNumber && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Asset No.</th>}
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-pebble">
            {filtered.map(asset => (
              <>
                <tr
                  key={asset.id}
                  onClick={() => setSelectedAsset(prev => prev === asset.id ? null : asset.id)}
                  className={`hover:bg-earth transition-colors cursor-pointer ${selectedAsset === asset.id ? 'bg-pale/30' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-night">{asset.name}</span>
                    </div>
                  </td>
                  {visibleCols.type && (
                    <td className="px-4 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{asset.type}</span>
                    </td>
                  )}
                  {visibleCols.lifecycleState && (
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${LIFECYCLE_STYLE[asset.lifecycleState] || 'bg-gray-100 text-gray-600'}`}>
                        {asset.lifecycleState}
                      </span>
                    </td>
                  )}
                  {visibleCols.assetNumber && (
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{asset.assetNumber || '—'}</td>
                  )}
                  <td className="px-4 py-3 relative" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button title="Open asset" className="p-1.5 hover:bg-pale rounded-lg text-gray-400 hover:text-sky transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuOpen(actionMenuOpen === asset.id ? null : asset.id)}
                          className="p-1.5 hover:bg-earth rounded-lg text-gray-400 hover:text-night transition-colors"
                          title="More actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {actionMenuOpen === asset.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenuOpen(null)} />
                            <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-lg z-20 min-w-[140px] overflow-hidden">
                              <button onClick={() => setActionMenuOpen(null)} className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">Open Asset</button>
                              <button onClick={() => setActionMenuOpen(null)} className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">Download</button>
                              <div className="border-t border-pebble" />
                              <button onClick={() => handleUnlink(asset.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">Unlink Asset</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                {selectedAsset === asset.id && (
                  <tr key={`${asset.id}-detail`}>
                    <td colSpan={5} className="px-0 py-0">
                      <div className="bg-pale/30 border-l-4 border-sky px-6 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
                          <div><div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Asset Number</div><div className="text-night font-mono">{asset.assetNumber || '—'}</div></div>
                          <div><div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</div><div className="text-night">{asset.type}</div></div>
                          <div><div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lifecycle State</div><div className="text-night">{asset.lifecycleState}</div></div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark">
                            <ExternalLink className="w-3 h-3" /> Open Asset
                          </button>
                          <button
                            onClick={() => handleUnlink(asset.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50"
                          >
                            Unlink
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{assets.length === 0 ? 'No assets linked to this claim yet' : 'No assets match your search'}</p>
            {assets.length === 0 && (
              <button
                onClick={() => setAddAssetMenuOpen(true)}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark mx-auto"
              >
                <Plus className="w-4 h-4" /> Add Asset
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

const ORDERED_SECTIONS = [
  { id: "Claim Details", label: "Claim Details" },
  { id: "Support Strategy & Substantiation", label: "Support Strategy & Substantiation" },
  { id: "Final Risk Summary", label: "Final Risk Summary" },
  { id: "Risk Level Assessments", label: "Risk Level Assessments" },
  { id: "Related Assets", label: "Related Assets" },
];

export default function ClaimWorkspace({
  claim,
  claims,
  onBack,
  onClaimSave,
  onClaimsChange,
  activeSection,
  onSectionChange,
  onClaimSelect,
}: ClaimWorkspaceProps) {
  const [isFavorite, setIsFavorite] = useState(
    claim.isFavorite || false,
  );
  const [showVersionHistory, setShowVersionHistory] =
    useState(false);
  const [showCollabDrawer, setShowCollabDrawer] =
    useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [validationError, setValidationError] = useState<
    string | null
  >(null);
  const [reasonModal, setReasonModal] = useState<{
    targetStage: string;
    reason: string;
  } | null>(null);
  // US-M4-080: Versioning state
  const [versioningMode, setVersioningMode] = useState(false);
  const [versionDraft, setVersionDraft] = useState("");
  // US-M4-088: Version preview in history panel
  const [previewVersion, setPreviewVersion] = useState<
    import("../../types").ClaimVersion | null
  >(null);
  // US-M4-069: Duplicate claim modal
  const [showDuplicateModal, setShowDuplicateModal] =
    useState(false);
  // US-M4-092: Adaptation modal
  const [showAdaptationModal, setShowAdaptationModal] =
    useState(false);
  // US-M4-055: Risk Assessment Modal (M7)
  const [showRiskModal, setShowRiskModal] = useState(false);
  // US-M4-053: File upload in Support Strategy
  const fileUploadRef = useRef<HTMLInputElement>(null);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isNavigatingRef.current) return;

    const el = sectionRefs.current[activeSection];
    if (el) {
      isNavigatingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    }
  }, [activeSection]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isNavigatingRef.current) return;

    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const triggerLine = containerRect.top + containerRect.height * 0.3;

    for (const item of ORDERED_SECTIONS) {
      const el = sectionRefs.current[item.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerLine && rect.bottom > triggerLine) {
          if (activeSection !== item.id) {
            onSectionChange(item.id);
          }
          break;
        }
      }
    }
  };
  // US-M4-055: Inline add-assessment form in workspace
  const [showAddAssessment, setShowAddAssessment] =
    useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    fn: "R&D",
    risk: "Low",
    comments: "",
    geo: "",
  });
  const [inlineGeoOpen, setInlineGeoOpen] = useState(false);
  const [inlineGeoSearch, setInlineGeoSearch] = useState("");

  // Creation modal state for Duplicate/Adapt workflows
  const [creationConfig, setCreationConfig] = useState<{
    open: boolean;
    initialTabs?: any[];
    type?: ClaimType;
  }>({ open: false });

  // ── M6 iRA state ──────────────────────────────────────────────────────────
  const [showIRAModal, setShowIRAModal] = useState(false);
  const [iraSaveSuccess, setIraSaveSuccess] = useState(false);

  /** Check if this claim is eligible for iRA (Business Group = Home Care) */
  const isHomeCare = (() => {
    if ((claim as any).businessGroup === "Home Care")
      return true;
    return claim.relatedProjectIds.some((pid) => {
      const proj = initialProjects.find((p) => p.id === pid);
      return proj?.businessGroup === "Home Care";
    });
  })();

  const canRunIRA =
    isHomeCare && claim.lifecycleStage !== "Assessed";

  const handleCreateClaims = (partials: Partial<Claim>[]) => {
    const now = new Date().toISOString();
    const newClaims = partials.map((partial, idx) => {
      const ct = (partial.claimType || "Global") as ClaimType;
      const geo = (partial as any).geography as
        | string
        | undefined;
      const num = String(claims.length + idx + 1).padStart(
        3,
        "0",
      );
      const geoCode = geo
        ? geo.replace(/\s+/g, "").slice(0, 4).toUpperCase()
        : "";
      const id =
        ct === "Global"
          ? `CLM-${num}`
          : ct === "Local SKU"
            ? `CLM-${num}-${geoCode}-SKU`
            : `CLM-${num}-${geoCode}`;
      const parent =
        ct !== "Global"
          ? claims.find(
              (c) =>
                c.claimType === "Global" &&
                c.productName === partial.productName,
            )?.id
          : undefined;
      return {
        id,
        claimType: ct,
        parentClaimId: parent,
        productName: partial.productName || "",
        productId: `PRD-${id}`,
        versions:
          partial.versions && partial.versions.length > 0
            ? partial.versions
            : [
                {
                  versionNumber: 1,
                  isLatest: true,
                  globalStatement: "",
                  localStatement: "",
                  createdAt: now,
                  createdBy: "Current User",
                },
              ],
        currentVersion: 0,
        lifecycleStage: "Proposed" as any,
        marketingChannels: partial.marketingChannels || [],
        finalRiskLevel: null,
        finalRiskSummary: {
          marketingRiskSignoff: false,
          inheritanceTrace: parent
            ? `Inherited from ${parent}`
            : null,
        } as any,
        substantiationDocs: [],
        riskAssessments: [],
        supportStrategy: "",
        restrictedUse: false,
        order: null as any,
        claimIdentifier: null as any,
        claimCategory: null as any,
        geography: geo || (null as any),
        qualifier: (partial as any).qualifier,
        relatedProjectIds: [],
        challenged: false,
        expiryDate: null as any,
        isFavorite: false,
        linkedAssets: [],
        createdAt: now,
        updatedAt: now,
        cucCode: null as any,
      } as Claim;
    });
    onClaimsChange([...claims, ...newClaims]);
    setCreationConfig({ open: false });
  };

  /** M6 US-M4-65: Map iRA results to claim fields without overwriting manual values */
  const handleIRASave = (results: {
    claimClassificationLevel: string;
    claimClassificationConfidence: number;
    finalRiskLevel: RiskLevel;
    finalRiskConfidence: number;
    reasons: Array<{ reason: string; confidence: number }>;
  }) => {
    onClaimSave({
      ...claim,
      finalRiskLevelIRA: `${results.finalRiskLevel} (${results.finalRiskConfidence}%)`,
      finalRiskSummary: {
        ...claim.finalRiskSummary,
        claimClassificationLevelIRA: `${results.claimClassificationLevel} (${results.claimClassificationConfidence}%)`,
        reasonIRA: results.reasons
          .map((r) => `${r.reason} (${r.confidence}%)`)
          .join("; "),
        iRAOutput: "Completed",
        iRAClassificationConfidence:
          results.claimClassificationConfidence,
        iRARiskConfidence: results.finalRiskConfidence,
        iRAReasons: results.reasons,
      },
      updatedAt: new Date().toISOString(),
    });
    setIraSaveSuccess(true);
    setTimeout(() => setIraSaveSuccess(false), 3500);
  };

  const currentIndex = claims.findIndex(
    (c) => c.id === claim.id,
  );
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < claims.length - 1;

  const version = claim.versions[claim.currentVersion];
  const primaryStatement =
    claim.claimType === "Global"
      ? version.globalStatement
      : version.localStatement;

  const handlePrev = () => {
    if (hasPrev && onClaimSelect) {
      onClaimSelect(claims[currentIndex - 1]);
    }
  };
  const handleNext = () => {
    if (hasNext && onClaimSelect) {
      onClaimSelect(claims[currentIndex + 1]);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    onClaimSave({ ...claim, isFavorite: !isFavorite });
  };

  // US-M4-059: Validate before moving to Assessed
  const validateAssessed = (): string | null => {
    if (!claim.supportStrategy?.trim())
      return "Support Strategy must be filled before marking as Assessed.";
    if (!claim.finalRiskLevel)
      return "Final Risk Level must be selected before marking as Assessed.";
    if (claim.marketingChannels.length === 0)
      return "At least one Marketing Channel must be selected.";
    const unclassified = claim.substantiationDocs.filter(
      (d) => !d.classification,
    );
    if (unclassified.length > 0)
      return `${unclassified.length} substantiation document(s) must be classified before assessment.`;
    return null;
  };

  const handleTransition = (targetStage: string) => {
    const reasonRequired = [
      "Rejected",
      "Challenged",
      "Withdrawn",
      "Not Pursued",
      "Obsolete",
    ];
    if (targetStage === "Assessed") {
      // F03 — server-side mirror: block if Support Strategy is empty
      if (!claim.supportStrategy?.trim()) {
        setValidationError("Support Strategy is required before assessment.");
        return;
      }
      const err = validateAssessed();
      if (err) {
        setValidationError(err);
        return;
      }
      const now = new Date().toISOString();
      // F06 — audit LIFECYCLE_LOCK event
      const lockAuditEntry: AuditEntry = {
        id: `AUD-LOCK-${Date.now()}`,
        timestamp: now,
        actor: CURRENT_USER,
        actorRole: CURRENT_USER_ROLE,
        action: 'LIFECYCLE_LOCK',
        fromStage: claim.lifecycleStage,
        toStage: 'Assessed',
        field: 'supportStrategy',
        surface: 'workspace',
      };
      const updated = {
        ...claim,
        lifecycleStage: "Assessed" as any,
        challenged:
          claim.lifecycleStage === "Challenged"
            ? claim.challenged
            : false,
        updatedAt: now,
        auditLog: [...(claim.auditLog || []), lockAuditEntry],
      };
      onClaimSave(updated);
    } else if (reasonRequired.includes(targetStage)) {
      setReasonModal({ targetStage, reason: "" });
    } else {
      onClaimSave({
        ...claim,
        lifecycleStage: targetStage as any,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const commitReasonTransition = () => {
    if (!reasonModal || !reasonModal.reason.trim()) return;
    const isChallenged =
      reasonModal.targetStage === "Challenged";
    onClaimSave({
      ...claim,
      lifecycleStage: reasonModal.targetStage as any,
      challenged: isChallenged ? true : claim.challenged,
      updatedAt: new Date().toISOString(),
    });
    setReasonModal(null);
  };

  // Lifecycle button visibility
  const [showLifecycleDropdown, setShowLifecycleDropdown] = useState(false);

  const canMarkAssessed = ["Proposed", "Challenged"].includes(
    claim.lifecycleStage,
  );
  const canReject = claim.lifecycleStage === "Proposed";
  const canChallenge = claim.lifecycleStage === "Assessed";
  const canReturnToAssessed =
    claim.lifecycleStage === "Challenged";
  const canWithdraw = claim.lifecycleStage === "Challenged";
  const canReturnToProposed =
    claim.lifecycleStage === "Rejected";
  const canMarkObsolete = ["Withdrawn", "Not Pursued"].includes(
    claim.lifecycleStage,
  );
  const isExpired = claim.lifecycleStage === "Expired";

  // US-M4-080: Create new version
  const handleCreateNewVersion = () => {
    setShowActionsMenu(false);
    const curVer = claim.versions[claim.currentVersion];
    const currentPrimary =
      claim.claimType === "Global"
        ? curVer.globalStatement
        : curVer.localStatement;
    setVersionDraft(currentPrimary);
    setVersioningMode(true);
  };

  const handleSaveNewVersion = () => {
    if (!versionDraft.trim()) return;
    const curVer = claim.versions[claim.currentVersion];
    const oldVersions = claim.versions.map((v, i) =>
      i === claim.currentVersion
        ? { ...v, isLatest: false }
        : v,
    );
    const newVersion = {
      versionNumber: claim.versions.length + 1,
      isLatest: true,
      globalStatement:
        claim.claimType === "Global"
          ? versionDraft
          : curVer.globalStatement,
      localStatement:
        claim.claimType !== "Global"
          ? versionDraft
          : curVer.localStatement,
      createdAt: new Date().toISOString(),
      createdBy: "Current User",
    };
    onClaimSave({
      ...claim,
      versions: [...oldVersions, newVersion],
      currentVersion: oldVersions.length,
      lifecycleStage: "Proposed",
      updatedAt: new Date().toISOString(),
    });
    setVersioningMode(false);
    setVersionDraft("");
  };

  const renderSectionContent = (id: string) => {
    switch (id) {
      case "Claim Details":
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-night font-semibold text-lg">Claim Details</h2>
                <p className="text-sm text-gray-500 mt-0.5">Core metadata and configuration for this claim</p>
              </div>
            </div>
            
            {/* Claim Details Body */}
            <div className="bg-white rounded-xl border border-pebble p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                <div className="col-span-3">
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Global Statement
                  </label>
                  <div className="text-sm text-night bg-earth/30 p-3 rounded border border-pebble">
                    {version.globalStatement || "—"}
                  </div>
                </div>
                {version.localStatement && (
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Local Statement
                    </label>
                    <div className="text-sm text-night bg-earth/30 p-3 rounded border border-pebble">
                      {version.localStatement}
                    </div>
                  </div>
                )}
                {version.backtranslation && (
                  <div className="col-span-3">
                    <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                      Backtranslation
                    </label>
                    <div className="text-sm text-night bg-earth/30 p-3 rounded border border-pebble">
                      {version.backtranslation}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Claim Type
                  </label>
                  <div className="text-sm text-night">
                    {claim.claimType}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Version
                  </label>
                  <div className="text-sm text-night">
                    v{version.versionNumber}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Order
                  </label>
                  <div className="text-sm text-night">
                    {claim.order || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    Lifecycle Stage
                    <span
                      className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help"
                      title="Editable By: Legal / Claims Lead"
                    >
                      Roles
                    </span>
                  </label>
                  <div className="text-sm text-night">
                    {claim.lifecycleStage}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Marketing Channels
                  </label>
                  <div className="text-sm text-night flex flex-wrap gap-1">
                    {claim.marketingChannels.length > 0
                      ? claim.marketingChannels.map((ch) => (
                          <span
                            key={ch}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                          >
                            {ch}
                          </span>
                        ))
                      : "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    Final Risk Level
                    <span
                      className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded cursor-help"
                      title="Editable By: Claims Lead / R&D / Legal"
                    >
                      Roles
                    </span>
                  </label>
                  <div className="text-sm text-night flex items-center gap-1.5">
                    {claim.finalRiskLevel === "Low" ? (
                      <Shield className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <AlertTriangle
                        className={`w-3.5 h-3.5 ${claim.finalRiskLevel === "Medium" ? "text-amber-500" : "text-orange-500"}`}
                      />
                    )}
                    <span
                      className={
                        claim.finalRiskLevel
                          ? RISK_LEVEL_COLORS[
                              claim.finalRiskLevel
                            ]
                          : ""
                      }
                    >
                      {claim.finalRiskLevel || "Pending"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Restricted Use
                  </label>
                  <div className="text-sm text-night">
                    {claim.restrictedUse ? (
                      <span className="text-orange-600 font-medium">
                        Yes
                      </span>
                    ) : (
                      "No"
                    )}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Restricted Use Comment
                  </label>
                  <div className="text-sm text-night">
                    {(claim as any).restrictedUseComment ||
                      "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Claim Identifier
                  </label>
                  <div className="text-sm text-night">
                    {claim.claimIdentifier || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Claim Categories
                  </label>
                  <div className="text-sm text-night">
                    {claim.claimCategory || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Geography
                  </label>
                  <div className="text-sm text-night">
                    {claim.claimType === "Global" ? (
                      <span className="text-gray-400 italic">
                        Global (Hidden)
                      </span>
                    ) : (
                      claim.geography || "—"
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Related Projects
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {claim.relatedProjectIds.length > 0 ? (
                      claim.relatedProjectIds.map(
                        (p: string) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            {p}
                          </span>
                        ),
                      )
                    ) : (
                      <span className="text-sm text-night">
                        —
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Challenged
                  </label>
                  <div className="text-sm text-night">
                    {claim.challenged ? (
                      <span className="text-red-500 font-medium">
                        Yes
                      </span>
                    ) : (
                      "No"
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Copied From
                  </label>
                  <div className="text-sm text-night font-medium">
                    {claim.copiedFromClaimId || "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Component */}
            <div className="bg-white rounded-xl border border-pebble p-6">
              <h3
                className="text-night mb-4"
                style={{ fontWeight: 600 }}
              >
                Product Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-6">
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Product Name
                  </label>
                  <div className="text-sm text-sky cursor-pointer hover:underline">
                    {claim.productName || "—"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Product Hierarchy
                  </label>
                  <div className="text-sm text-night">
                    {(claim as any).productHierarchy ||
                      "Variant"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Business Group (BG)
                  </label>
                  <div className="text-sm text-night">
                    {(claim as any).businessGroup ||
                      "Beauty & Personal Care"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Category
                  </label>
                  <div className="text-sm text-night">
                    {(claim as any).category || "Skin Care"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Technology Linkage
                  </label>
                  <div className="text-sm text-night">
                    {(claim as any).technologyLinkage ||
                      "MicroMoisture Technology"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Consumer Benefit Platform
                  </label>
                  <div className="text-sm text-night">
                    {(claim as any).consumerBenefitPlatform ||
                      "Deep Hydration"}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Target Audience
                  </label>
                  <div className="text-sm text-night">
                    {(claim as any).targetAudience ||
                      "Adults 25–45"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "Support Strategy & Substantiation":
        return (
          <SupportStrategySection
            claim={claim}
            onClaimSave={onClaimSave}
            fileUploadRef={fileUploadRef}
            surface="workspace"
          />
        );
      case "Final Risk Summary":
        return (
          <FinalRiskSummarySection
            claim={claim}
            onClaimSave={onClaimSave}
          />
        );
      case "Risk Level Assessments":
        return (
          <RiskLevelAssessmentsSection claim={claim} onClaimSave={onClaimSave} />
        );
      case "Related Assets":
        return (
          <RelatedAssetsSection claim={claim} onClaimSave={onClaimSave} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden no-scrollbar bg-transparent">
      {/* M6 iRA Success Toast */}
      {iraSaveSuccess && (
        <div className="fixed top-4 right-4 z-[9999] flex items-center gap-3 bg-green-600 text-white px-5 py-3 rounded-xl shadow-2xl animate-pulse">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <div className="fontsemibold text-sm">
              iRA results saved
            </div>
            <div className="text-xs text-green-100">
              Fields tagged with (iRA) suffix. Manual values
              unchanged.
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          {/* Breadcrumb */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-sky transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Claims
          </button>

          {/* Record Navigation */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Record Navigation */}
            <div className="flex items-center border border-pebble rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-r border-pebble"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="px-2.5 text-xs text-gray-500 font-medium">
                {currentIndex + 1} / {claims.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-l border-pebble"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            {/* US-M4-087: Version History */}
            <button
              onClick={() =>
                setShowVersionHistory(!showVersionHistory)
              }
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors shadow-sm ${showVersionHistory ? "bg-sky text-white border-sky" : "border-pebble text-night hover:bg-earth bg-white"}`}
              title="Version History"
            >
              <History className={`w-4 h-4 ${showVersionHistory ? "text-white" : "text-gray-500"}`} />
              <span className="hidden lg:inline">History</span>
            </button>
            
            {/* Collaborate Button */}
            <button
              onClick={() =>
                setShowCollabDrawer(!showCollabDrawer)
              }
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors shadow-sm ${showCollabDrawer ? "bg-sky text-white border-sky" : "border-pebble text-night hover:bg-earth bg-white"}`}
            >
              <Users className={`w-4 h-4 ${showCollabDrawer ? "text-white" : "text-gray-500"}`} />
              <span className="hidden lg:inline">Collaborate</span>
            </button>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() =>
                  setShowActionsMenu(!showActionsMenu)
                }
                className="flex items-center gap-2 px-3 py-1.5 border border-pebble text-night rounded-lg text-sm transition-colors shadow-sm hover:bg-earth bg-white"
              >
                Actions
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showActionsMenu ? 'rotate-180' : ''}`} />
              </button>
              {showActionsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() =>
                      setShowActionsMenu(false)
                    }
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-20 min-w-[220px] overflow-hidden py-1">
                    <button
                      onClick={() => {
                        setShowDuplicateModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors flex items-center gap-2.5"
                    >
                      <Copy className="w-4 h-4 text-sky" />
                      Duplicate Claim
                    </button>
                    <button
                      onClick={handleCreateNewVersion}
                      className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors flex items-center gap-2.5"
                    >
                      <FileText className="w-4 h-4 text-sky" />
                      Create New Version
                    </button>
                    <button
                      onClick={() => {
                        setShowAdaptationModal(true);
                        setShowActionsMenu(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors flex items-center gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-sky" />
                      Create Local/Regional Claim
                    </button>
                    <div className="border-t border-pebble my-1" />
                    {canRunIRA ? (
                      <button
                        onClick={() => {
                          setShowIRAModal(true);
                          setShowActionsMenu(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors flex items-center gap-2.5"
                      >
                        <Sparkles className="w-4 h-4 text-sky animate-pulse" />
                        Run iRA
                      </button>
                    ) : (
                      <div
                        className="px-4 py-2.5 text-sm text-gray-400 flex items-center gap-2.5 cursor-not-allowed bg-earth/30"
                        title={
                          !isHomeCare
                            ? "iRA is only available for Home Care claims"
                            : "iRA is disabled after Assessed"
                        }
                      >
                        <Sparkles className="w-4 h-4 text-gray-300" />
                        Run iRA
                        <span className="ml-auto text-xs text-gray-400">
                          {!isHomeCare
                            ? "Home Care only"
                            : "Assessed"}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          {/* Favorite star */}
          <button onClick={toggleFavorite} className="mt-1">
            <Star
              className={`w-5 h-5 transition-colors ${
                isFavorite
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            />
          </button>

          <div className="flex-1 min-w-0">
            {/* Row 1: Primary statement + actions */}
            <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
              <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
                <h2 className="text-night leading-tight font-semibold">
                  {primaryStatement}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
                  V {typeof version.versionNumber === 'number' ? version.versionNumber.toFixed(1) : version.versionNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${CLAIM_LIFECYCLE_COLORS[claim.lifecycleStage] || 'bg-gray-100 text-gray-600'}`}>
                  {claim.lifecycleStage}
                </span>
              </div>

              {/* Lifecycle action buttons */}
              <div className="flex items-center gap-2">
                {/* Validation error banner */}
                {validationError && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                      className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                      onClick={() => setValidationError(null)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
                      <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 border-b border-amber-200">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-amber-800">Assessment Blocked</h3>
                          <p className="text-xs text-amber-600 mt-0.5">{claim.id}</p>
                        </div>
                      </div>
                      <div className="px-6 py-5">
                        <p className="text-sm text-night leading-relaxed">{validationError}</p>
                      </div>
                      <div className="flex items-center gap-3 px-6 py-4 border-t border-pebble bg-gray-50">
                        {validationError.includes("Support Strategy") && (
                          <button
                            onClick={() => {
                              setValidationError(null);
                              onSectionChange("Support Strategy & Substantiation");
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky text-white rounded-xl text-sm font-medium hover:bg-dark transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Go to Support Strategy
                          </button>
                        )}
                        <button
                          onClick={() => setValidationError(null)}
                          className="px-4 py-2.5 border border-pebble text-gray-600 rounded-xl text-sm hover:bg-earth transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Reason capture modal */}
                {reasonModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                      className="fixed inset-0 bg-black/40"
                      onClick={() => setReasonModal(null)}
                    />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 z-10">
                      <h3 className="text-night font-semibold mb-1">
                        Move to {reasonModal.targetStage}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        A reason is required to proceed.
                      </p>
                      <textarea
                        value={reasonModal.reason}
                        onChange={(e) =>
                          setReasonModal((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  reason: e.target.value,
                                }
                              : prev,
                          )
                        }
                        placeholder="Enter reason..."
                        rows={4}
                        className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none mb-4"
                      />
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setReasonModal(null)}
                          className="px-4 py-2 text-sm text-gray-600 hover:text-night"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={commitReasonTransition}
                          disabled={!reasonModal.reason.trim()}
                          className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {canMarkAssessed && (
                  <button
                    onClick={() => handleTransition("Assessed")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Assessed
                  </button>
                )}
                {/* Claim Lifecycle Dropdown — mirrors Project screen lifecycle dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowLifecycleDropdown(!showLifecycleDropdown)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                      claim.lifecycleStage === 'Expired' || claim.lifecycleStage === 'Obsolete'
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                        : 'bg-sky text-white border-sky hover:bg-dark cursor-pointer'
                    }`}
                    title="Change lifecycle stage"
                    disabled={claim.lifecycleStage === 'Expired'}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                    {claim.lifecycleStage}
                    <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                  {showLifecycleDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowLifecycleDropdown(false)} />
                      <div className="absolute right-0 top-full mt-1.5 bg-white border border-pebble rounded-xl shadow-xl z-20 min-w-[240px] overflow-hidden">
                        <div className="px-4 py-2.5 border-b border-pebble bg-earth flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Lifecycle Stage</p>
                          <button onClick={() => setShowLifecycleDropdown(false)} className="text-gray-400 hover:text-night">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="py-1">
                          {(['Proposed', 'Assessed', 'Challenged', 'Rejected', 'Withdrawn', 'Not Pursued', 'Obsolete'] as const).map((stage) => {
                            const isCurrent = claim.lifecycleStage === stage;
                            const CLAIM_LIFECYCLE_STAGE_ORDER = ['Proposed', 'Assessed', 'Challenged', 'Rejected', 'Withdrawn', 'Not Pursued', 'Obsolete'];
                            const currentIdx = CLAIM_LIFECYCLE_STAGE_ORDER.indexOf(claim.lifecycleStage);
                            const targetIdx = CLAIM_LIFECYCLE_STAGE_ORDER.indexOf(stage);
                            const isForward = targetIdx > currentIdx;
                            return (
                              <button
                                key={stage}
                                onClick={() => {
                                  setShowLifecycleDropdown(false);
                                  if (!isCurrent) handleTransition(stage);
                                }}
                                disabled={isCurrent}
                                className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isCurrent ? 'bg-sky' : isForward ? 'bg-pebble' : 'bg-amber-300'}`} />
                                  <span style={{ fontWeight: isCurrent ? 600 : 400 }}>{stage}</span>
                                </div>
                                {isCurrent && <span className="text-xs bg-sky/10 text-sky px-2 py-0.5 rounded-full font-medium">Current</span>}
                                {!isCurrent && isForward && <span className="text-xs text-gray-400">Advance →</span>}
                                {!isCurrent && !isForward && <span className="text-xs text-amber-500">← Reverse</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {canReject && (
                  <button
                    onClick={() => handleTransition("Rejected")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}
                {canChallenge && (
                  <button
                    onClick={() =>
                      handleTransition("Challenged")
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Challenge
                  </button>
                )}
                {canReturnToAssessed && (
                  <button
                    onClick={() => handleTransition("Assessed")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Return to Assessed
                  </button>
                )}
                {canWithdraw && (
                  <button
                    onClick={() =>
                      handleTransition("Withdrawn")
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                  >
                    Withdraw
                  </button>
                )}
                {canReturnToProposed && (
                  <button
                    onClick={() => handleTransition("Proposed")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Return to Proposed
                  </button>
                )}
                {canMarkObsolete && (
                  <button
                    onClick={() => handleTransition("Obsolete")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
                  >
                    Mark Obsolete
                  </button>
                )}
                {isExpired && (
                  <div className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm border border-orange-200">
                    Expired
                  </div>
                )}

              </div>
            </div>
            {/* US-M4-081: Versioning mode banner */}
            {versioningMode && (
              <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Editing — New Version (Statement Only)
                  </span>
                  <span className="text-xs text-amber-600">
                    Current v
                    {
                      claim.versions[claim.currentVersion]
                        .versionNumber
                    }{" "}
                    will be archived as read-only
                  </span>
                </div>
                <textarea
                  value={versionDraft}
                  onChange={(e) =>
                    setVersionDraft(e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNewVersion}
                    disabled={!versionDraft.trim()}
                    className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-50 transition-colors"
                  >
                    Save New Version
                  </button>
                  <button
                    onClick={() => {
                      setVersioningMode(false);
                      setVersionDraft("");
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-night"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Row 2: Summary strip */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {claim.finalRiskLevel && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${RISK_LEVEL_COLORS[claim.finalRiskLevel]}`}>
                  {claim.finalRiskLevel} Risk
                </span>
              )}
              {claim.claimCategory && (
                <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                  {claim.claimCategory}
                </span>
              )}
              {claim.marketingChannels.slice(0, 3).map((ch) => (
                <span
                  key={ch}
                  className="px-2.5 py-1 bg-sky/10 text-sky border border-sky/20 rounded-full text-xs flex-shrink-0"
                >
                  {ch}
                </span>
              ))}
              {claim.marketingChannels.length > 3 && (
                <span className="text-xs text-gray-400">
                  +{claim.marketingChannels.length - 3} more
                </span>
              )}
              {claim.challenged && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs flex-shrink-0">
                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                  Challenged
                </span>
              )}
              {claim.copiedFromClaimId && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs flex-shrink-0">
                  <Copy className="w-3 h-3 text-indigo-500" />
                  Copied from {claim.copiedFromClaimId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div 
            className="flex-1 overflow-y-auto bg-transparent snap-y snap-proximity scroll-smooth no-scrollbar"
            onScroll={handleScroll}
          >
            {ORDERED_SECTIONS.map((item) => {
              const isItemActive = activeSection === item.id;
              return (
                <div
                  key={item.id}
                  ref={(el) => { sectionRefs.current[item.id] = el; }}
                  className={`w-full h-full flex-shrink-0 flex flex-col snap-start snap-always bg-transparent transition-opacity duration-300 border-b-2 border-amber-100/60 ${
                    isItemActive ? "opacity-100" : "opacity-80"
                  }`}
                >
                  <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
                    {renderSectionContent(item.id)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="w-64 bg-white border-l border-pebble flex-shrink-0 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm text-night"
                style={{ fontWeight: 600 }}
              >
                Version History
              </h3>
              <button
                onClick={() => setShowVersionHistory(false)}
              >
                <History className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="space-y-1">
              {[...claim.versions].reverse().map((v, idx) => {
                const isActive =
                  v.versionNumber ===
                  claim.versions[claim.currentVersion]
                    ?.versionNumber;
                const isPreview =
                  previewVersion?.versionNumber ===
                  v.versionNumber;
                return (
                  <div key={v.versionNumber}>
                    <button
                      onClick={() =>
                        setPreviewVersion(isPreview ? null : v)
                      }
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                        isActive
                          ? "bg-pale text-sky font-semibold"
                          : "text-gray-400 hover:bg-earth"
                      }`}
                    >
                      <span>v{v.versionNumber}</span>
                      <div className="flex items-center gap-1.5">
                        {v.isLatest && (
                          <span className="px-1.5 py-0.5 text-xs bg-sky text-white rounded-full">
                            Latest
                          </span>
                        )}
                        <span className="text-xs">
                          {new Date(
                            v.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                    {isPreview && (
                      <div className="mx-2 mb-2 p-3 bg-earth rounded-lg border border-pebble text-xs">
                        <p className="font-semibold text-night mb-1">
                          Global Statement
                        </p>
                        <p className="text-gray-600 mb-2">
                          {v.globalStatement || "—"}
                        </p>
                        <p className="font-semibold text-night mb-1">
                          Local Statement
                        </p>
                        <p className="text-gray-600">
                          {v.localStatement || "—"}
                        </p>
                        {v.backtranslation && (
                          <>
                            <p className="font-semibold text-night mt-2 mb-1">
                              Backtranslation
                            </p>
                            <p className="text-gray-500 italic">
                              {v.backtranslation}
                            </p>
                          </>
                        )}
                        <p className="text-gray-400 mt-2">
                          By {v.createdBy}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Collaboration Drawer — US-M4-057 */}
        {showCollabDrawer && (
          <CollabDrawer
            claimId={claim.id}
            onClose={() => setShowCollabDrawer(false)}
          />
        )}

        {/* Modals */}
        <DuplicateClaimModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          claim={claim}
          onDuplicate={(claimId, targetProducts, settings) => {
            const version =
              claim.versions[claim.currentVersion];
            const initialTabs = targetProducts.map((p) => ({
              key: `${p}||${claim.geography || "Global"}`,
              label:
                claim.claimType === "Global"
                  ? p
                  : `${p} – ${claim.geography}`,
              product: p,
              geography: claim.geography || "Global",
              rows: [
                {
                  id: `row-${Date.now()}-${p}`,
                  order: 1,
                  globalStatement:
                    version.globalStatement || "",
                  localStatement: version.localStatement || "",
                  backtranslation:
                    version.backtranslation || "",
                  qualifier: claim.qualifier || "",
                  marketingChannels: [
                    ...claim.marketingChannels,
                  ],
                },
              ],
              saved: false,
            }));
            setShowDuplicateModal(false);
            setCreationConfig({
              open: true,
              type: claim.claimType,
              initialTabs,
            });
          }}
        />

        <AdaptationModal
          isOpen={showAdaptationModal}
          onClose={() => setShowAdaptationModal(false)}
          parentClaim={claim}
          onCreateAdaptation={(
            claimId,
            targetProducts,
            targetGeographies,
            config,
          ) => {
            const version =
              claim.versions[claim.currentVersion];
            const initialTabs: any[] = [];
            targetProducts.forEach((p) => {
              targetGeographies.forEach((g) => {
                initialTabs.push({
                  key: `${p}||${g}`,
                  label: `${p} – ${g}`,
                  product: p,
                  geography: g,
                  rows: [
                    {
                      id: `row-${Date.now()}-${p}-${g}`,
                      order: 1,
                      globalStatement:
                        version.globalStatement || "",
                      localStatement:
                        version.globalStatement || "",
                      backtranslation: "",
                      qualifier: claim.qualifier || "",
                      marketingChannels: [
                        ...claim.marketingChannels,
                      ],
                    },
                  ],
                  saved: false,
                });
              });
            });
            setShowAdaptationModal(false);
            setCreationConfig({
              open: true,
              type: config.adaptationType,
              initialTabs,
            });
          }}
        />

        {creationConfig.open && (
          <ClaimCreationModal
            isOpen={true}
            onClose={() => setCreationConfig({ open: false })}
            onCreate={handleCreateClaims}
            prefilledType={creationConfig.type}
            initialTabs={creationConfig.initialTabs}
            initialStep={2}
          />
        )}

        {/* M6 iRA Modal — US-M4-62 */}
        <IRAModal
          isOpen={showIRAModal}
          onClose={() => setShowIRAModal(false)}
          claim={claim}
          onSave={handleIRASave}
        />

        {/* M7 Risk Assessment Modal */}
        <RiskAssessmentModal
          isOpen={showRiskModal}
          onClose={() => setShowRiskModal(false)}
          claim={claim}
          onSave={(assessments) => {
            const mapped = assessments.map((a, i) => ({
              ...a,
              id: `RA-${Date.now()}-${i}`,
            }));
            onClaimSave({
              ...claim,
              riskAssessments: [...claim.riskAssessments, ...mapped],
              updatedAt: new Date().toISOString()
            });
            setShowRiskModal(false);
          }}
        />
      </div>
    </div>
  );
}