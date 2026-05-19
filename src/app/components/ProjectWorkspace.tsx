import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  ArrowLeft,
  CheckCircle,
  Circle,
  Copy,
  RefreshCw,
  Archive,
  XCircle,
  RotateCcw,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  Lock,
  ClipboardList,
  X,
  FileText,
  Shield,
  Download,
  Check,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import {
  Project,
  LIFECYCLE_STAGES,
  AuditEntry,
  NotificationTeam,
  STAGE_TRANSITION_NOTIFICATIONS,
  MOCK_PROJECT_STATS,
  UserRole,
  mockClaims,
  isProjectArchived,
} from "../types";
import ProjectDetailsTab from "./workspace/ProjectDetailsTab";
import ProjectTeamTab from "./workspace/ProjectTeamTab";
import GeographyTab from "./workspace/GeographyTab";
import LinkedProductsTab from "./workspace/LinkedProductsTab";
import RelatedClaimsTab from "./workspace/RelatedClaimsTab";
import RiskReviewPanel from "./workspace/RiskReviewPanel";
import ProductDocumentsTab from './workspace/ProductDocumentsTab';
import LinkedAssetsTab from "./workspace/LinkedAssetsTab";
import CollaborationDrawer from "./CollaborationDrawer";
import AuditLogModal, { AuditLogItem } from "./AuditLogModal";
import CloneProjectModal from "./CloneProjectModal";
import CancelProjectModal from "./CancelProjectModal";

type WorkspaceSection =
  | "Project Details"
  | "Project Team"
  | "Geography"
  | "Linked Products"
  | "Related Claims"
  | "Risk & Review"
  | "Project Documents"
  | "Linked Assets";

interface ProjectWorkspaceProps {
  project: Project;
  projects: Project[];
  currentIndex: number;
  onBack: () => void;
  onProjectChange: (project: Project) => void;
  onProjectSave: (updated: Project) => void;
  activeSection: WorkspaceSection;
  onSectionChange: (section: WorkspaceSection) => void;
  currentUserRole?: UserRole;
  relatedClaimsSubFilter?: string;
  onRelatedClaimsSubFilterChange?: (filter: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-gray-100 text-gray-600 border border-gray-200",
  "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
  "Under Review": "bg-amber-50 text-amber-700 border border-amber-200",
  "Assessment Complete": "bg-purple-50 text-purple-700 border border-purple-200",
  Completed: "bg-green-50 text-green-700 border border-green-200",
  Archived: "bg-gray-100 text-gray-500 border border-gray-200",
  Cancelled: "bg-red-50 text-red-600 border border-red-200",
};

// Review progress mock data per project
const REVIEW_PROGRESS: Record<string, {
  global: { label: string; done: boolean; completedBy?: string; completedOn?: string }[];
  regional: { label: string; done: boolean; completedBy?: string; completedOn?: string }[];
  local: { label: string; done: boolean; completedBy?: string; completedOn?: string }[];
}> = {
  "1": {
    global: [
      { label: "R&D", done: true, completedBy: "John Doe", completedOn: "4/20/2026" },
      { label: "RA", done: true, completedBy: "Sarah Johnson", completedOn: "4/21/2026" },
      { label: "Legal", done: true, completedBy: "Michael Chen", completedOn: "4/22/2026" },
      { label: "Claims Forum", done: false },
    ],
    regional: [
      { label: "R&D", done: false },
      { label: "RA", done: false },
      { label: "Legal", done: true, completedBy: "Emma Wilson", completedOn: "4/23/2026" },
      { label: "Claims Forum", done: false },
    ],
    local: [
      { label: "R&D", done: true, completedBy: "David Kumar", completedOn: "4/24/2026" },
      { label: "RA", done: false },
      { label: "Legal", done: true, completedBy: "Lisa Anderson", completedOn: "4/25/2026" },
      { label: "Claims Forum", done: false },
    ],
  },
  "2": {
    global: [
      { label: "R&D", done: true, completedBy: "Tom Harris", completedOn: "4/18/2026" },
      { label: "RA", done: true, completedBy: "Nina Patel", completedOn: "4/19/2026" },
      { label: "Legal", done: false },
    ],
    regional: [
      { label: "R&D", done: true, completedBy: "Sam Lee", completedOn: "4/20/2026" },
      { label: "RA", done: true, completedBy: "Chris Brown", completedOn: "4/21/2026" },
      { label: "Legal", done: false },
    ],
    local: [
      { label: "R&D", done: true, completedBy: "Ana Silva", completedOn: "4/22/2026" },
      { label: "RA", done: false },
      { label: "Legal", done: false },
    ],
  },
};

// ─── Risk & Review Sub-Lifecycle Panel ────────────────────────────────────
function ReviewSubLifecyclePanel({ projectId, onClose, onNotify }: { projectId: string; onClose: () => void; onNotify: (tileLabel: string, scope: string) => void }) {

  const DEFAULT_CHECKLIST = [
    { label: "R&D", done: false },
    { label: "RA", done: false },
    { label: "Legal", done: false },
    { label: "Claims Forum", done: false },
  ];
  const rp = REVIEW_PROGRESS[projectId] ?? {
    global: DEFAULT_CHECKLIST.map(t => ({ ...t })),
    regional: DEFAULT_CHECKLIST.map(t => ({ ...t })),
    local: DEFAULT_CHECKLIST.map(t => ({ ...t })),
  };
  // Local mutable state so tiles can be toggled independently
  const [progress, setProgress] = useState(() => ({
    global: rp.global.map((t) => ({ ...t })),
    regional: rp.regional.map((t) => ({ ...t })),
    local: rp.local.map((t) => ({ ...t })),
  }));

  // Tracks which tiles have had a notification sent
  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const [toastKey, setToastKey] = useState<string | null>(null);

  const sendNotification = (key: string, tileLabel: string, scope: string) => {
    setNotified((prev) => ({ ...prev, [key]: true }));
    setToastKey(key);
    onNotify(tileLabel, scope);
    // Auto-clear inline tooltip after 3s
    setTimeout(() => setToastKey((cur) => (cur === key ? null : cur)), 3000);
  };

  const toggleDone = (scope: "global" | "regional" | "local", idx: number) => {
    setProgress((prev) => {
      const updated = prev[scope].map((t, i) => {
        if (i !== idx) return t;
        const nowDone = !t.done;
        return nowDone
          ? {
            ...t,
            done: true,
            completedBy: "You",
            completedOn: new Date().toLocaleDateString("en-US"),
          }
          : { ...t, done: false, completedBy: undefined, completedOn: undefined };
      });
      return { ...prev, [scope]: updated };
    });
  };

  const scopes: { label: string; key: "global" | "regional" | "local" }[] = [
    { label: "Global", key: "global" },
    { label: "Regional", key: "regional" },
    { label: "Local", key: "local" },
  ];

  return (
    <div className="w-[700px] bg-white rounded-xl border border-pebble shadow-2xl relative">
      {/* Caret notch — aligned over the pill */}
      <div className="absolute -top-[7px] left-12 w-3 h-3 bg-white border-l border-t border-pebble rotate-45 rounded-sm" />

      <div className="px-6 py-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-night">Risk &amp; Review Sub-Lifecycle</h3>
            <p className="text-xs text-gray-500 mt-1">
              Track review completion across functional teams and scopes with clear target timelines
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-night transition-colors ml-4 mt-0.5 p-1 hover:bg-earth rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scope rows — no scroll, compact tiles */}
        <div className="space-y-3 mt-4">
          {scopes.map(({ label, key }) => {
            const items = progress[key];
            const doneCount = items.filter((t) => t.done).length;
            return (
              <div key={label} className="flex items-start gap-3">
                {/* Scope label + count */}
                <div className="w-20 flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-night uppercase tracking-wider">{label}</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5 font-medium">{doneCount} of {items.length} done</span>
                </div>
                {/* Tiles row */}
                <div className="flex-1 grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
                >
                  {items.map((tile, idx) => {
                    const notifyKey = `${key}-${idx}`;
                    const isNotified = notified[notifyKey];
                    const isToastActive = toastKey === notifyKey;
                    return (
                      <div
                        key={tile.label}
                        className={`rounded-lg border px-3 py-2 transition-all ${tile.done
                          ? "bg-emerald-50 border-emerald-200 shadow-sm"
                          : "bg-white border-pebble hover:border-sky/50"
                          }`}
                      >
                        {/* Top row: label + actions */}
                        <div className="flex items-start justify-between gap-1.5">
                          <span className="text-xs font-bold text-night leading-snug truncate" title={tile.label}>{tile.label}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Bell */}
                            <div className="relative">
                              <button
                                onClick={() => sendNotification(notifyKey, tile.label, label)}
                                title={isNotified ? "Notification sent" : "Send notification"}
                                className={`transition-colors p-0.5 hover:bg-earth rounded ${isNotified ? "text-sky" : "text-gray-400 hover:text-sky"
                                  }`}
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleDone(key, idx)}
                              title={tile.done ? "Mark as incomplete" : "Mark as complete"}
                              className={`w-4.5 h-4.5 rounded flex items-center justify-center border transition-colors flex-shrink-0 ${tile.done
                                ? "bg-emerald-500 border-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-white border-gray-300 hover:border-emerald-400"
                                }`}
                            >
                              {tile.done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </button>
                          </div>
                        </div>
                        {/* Completed by — single compact line, full detail on hover */}
                        {tile.done && tile.completedBy && (
                          <p
                            className="text-[10px] text-emerald-600 font-semibold mt-1 truncate cursor-default bg-emerald-100/50 px-1 py-0.5 rounded text-center"
                            title={`Completed by: ${tile.completedBy}\nDate: ${tile.completedOn}`}
                          >
                            {tile.completedBy} · {tile.completedOn}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 mt-4 border-t border-pebble pt-3">
          <strong>Note:</strong> Tiles can be completed in any order. Lifecycle progression is
          independent of tile completion status. All actions are audit logged.
        </p>
      </div>
    </div>
  );
}

// ─── US-M1-53: Lifecycle Progress Tracker ─────────────────────────────────
interface LifecycleRibbonProps {
  currentStage: string;
  projectId: string;
  lastUpdated: string;
  reviewPanelOpen: boolean;
  onToggleReviewPanel: () => void;
  onNotify: (tileLabel: string, scope: string) => void;
  onSelectStage?: (stage: string) => void;
}

function LifecycleRibbon({
  currentStage,
  projectId,
  lastUpdated,
  reviewPanelOpen,
  onToggleReviewPanel,
  onNotify,
  onSelectStage,
}: LifecycleRibbonProps) {
  const currentIndex = LIFECYCLE_STAGES.indexOf(currentStage);
  const pillRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pillRect, setPillRect] = useState<DOMRect | null>(null);

  // Measure pill position when popover opens or on scroll/resize
  useEffect(() => {
    if (!reviewPanelOpen) return;
    const measure = () => {
      if (pillRef.current) setPillRect(pillRef.current.getBoundingClientRect());
    };
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [reviewPanelOpen]);

  // Close popover on outside click
  useEffect(() => {
    if (!reviewPanelOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        pillRef.current && !pillRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        onToggleReviewPanel();
      }
    };
    const id = setTimeout(() => document.addEventListener("mousedown", handleClick), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [reviewPanelOpen, onToggleReviewPanel]);

  return (
    <div className="bg-white border-b border-pebble flex-shrink-0">
      <div className="flex items-center px-6 py-3 gap-0 overflow-x-auto">
        {LIFECYCLE_STAGES.map((stage, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const isReviewStage = stage === "Review & Risk Assessment";
          const hasReviewData = isReviewStage && (isCurrent || isCompleted);
          const pillContent = (
            <div className="flex items-center gap-2">
              <span style={{ fontWeight: isCurrent ? 600 : 400 }}>{stage}</span>

              {/* Only show interactive checkbox for completed and future stages, not current */}
              {!isCurrent && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!onSelectStage || (currentStage === "Review & Risk Assessment" && stage === "Draft")) return;
                    onSelectStage(stage);
                  }}
                  className={`flex items-center justify-center rounded-full p-0.5 transition-all ${
                    (currentStage === "Review & Risk Assessment" && stage === "Draft")
                      ? "text-gray-200 bg-transparent cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:scale-110 active:scale-95"
                  } ${
                    isCompleted
                      ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-200"
                      : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                  }`}
                  title={(currentStage === "Review & Risk Assessment" && stage === "Draft") 
                    ? "Cannot revert to Draft from Review stage directly" 
                    : isCompleted ? "Click tick to move backward stage" : "Click circle to move forward stage"}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : (
                    <Circle className="w-3.5 h-3.5" />
                  ) }
                </span>
              )}

              {isReviewStage && hasReviewData && (
                <ChevronDown
                  className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${
                    reviewPanelOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>
          );

          const pillClass = `flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all select-none ${isCompleted
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
            : isCurrent
              ? (stage === "Complete" ? "bg-emerald-600 text-white shadow-sm border border-emerald-700 font-semibold" : "bg-sky text-white shadow-sm")
              : "bg-earth text-gray-400 border border-pebble"
            }`;

          return (
            <div key={stage} className="flex items-center flex-shrink-0">
              {isReviewStage && hasReviewData ? (
                <>
                  <button
                    ref={pillRef}
                    onClick={onToggleReviewPanel}
                    className={`${pillClass} ${reviewPanelOpen ? "ring-2 ring-sky/40 ring-offset-1" : ""
                      }`}
                    title="Click to view review progress"
                  >
                    {pillContent}
                  </button>

                  {/* ── Portal popover — renders at body level to escape overflow clipping ── */}
                  {reviewPanelOpen && pillRect && createPortal(
                    <div
                      ref={panelRef}
                      style={{
                        position: "fixed",
                        top: pillRect.bottom + 8,
                        left: pillRect.left,
                        zIndex: 9999,
                      }}
                    >
                      <ReviewSubLifecyclePanel
                        projectId={projectId}
                        onClose={onToggleReviewPanel}
                        onNotify={onNotify}
                      />
                    </div>,
                    document.body
                  )}
                </>
              ) : (
                <div className={pillClass}>{pillContent}</div>
              )}
              {i < LIFECYCLE_STAGES.length - 1 && (
                <div
                  className={`w-8 h-px mx-0.5 flex-shrink-0 ${isCompleted ? "bg-emerald-300" : "bg-pebble"
                    }`}
                />
              )}
            </div>
          );
        })}
        <span className="text-[11px] text-gray-400 ml-4 flex-shrink-0 whitespace-nowrap border-l border-pebble pl-4">
          Updated {new Date(lastUpdated).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
}

// ─── US-M1-54: Lifecycle Stage Dropdown ───────────────────────────────────
interface LifecycleDropdownProps {
  project: Project;
  canChange: boolean;
  isReadOnly: boolean;
  onSelect: (stage: string) => void;
}

function LifecycleDropdown({
  project,
  canChange,
  isReadOnly,
  onSelect,
}: LifecycleDropdownProps) {
  const [open, setOpen] = useState(false);
  const currentIdx = LIFECYCLE_STAGES.indexOf(project.lifecycleStage);

  const handleToggle = () => {
    if (canChange && !isReadOnly) setOpen(!open);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={handleToggle}
        disabled={!canChange || isReadOnly}
        title={
          !canChange
            ? "Only Project Lead or Claims Lead can change lifecycle stage"
            : isReadOnly
              ? "Project is Complete — use Reopen to re-enable"
              : "Change lifecycle stage"
        }
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${isReadOnly
          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          : canChange
            ? "bg-sky text-white border-sky hover:bg-dark cursor-pointer"
            : "bg-earth text-gray-400 border-pebble cursor-not-allowed opacity-60"
          }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
        {project.lifecycleStage}
        {canChange && !isReadOnly && <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {open && !isReadOnly && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1.5 bg-white border border-pebble rounded-xl shadow-xl z-20 min-w-[340px] overflow-hidden">
            <div className="px-4 py-3 border-b border-pebble bg-earth flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Select Lifecycle Stage
              </p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-night">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="py-2 divide-y divide-gray-50">
              {LIFECYCLE_STAGES.map((stage, i) => {
                const isCurrent = i === currentIdx;
                const isForward = i > currentIdx;
                const isBack = i < currentIdx;
                return (
                  <button
                    key={stage}
                    onClick={() => {
                      setOpen(false);
                      onSelect(stage);
                    }}
                    disabled={isCurrent || (project.lifecycleStage === "Review & Risk Assessment" && stage === "Draft")}
                    title={project.lifecycleStage === "Review & Risk Assessment" && stage === "Draft" ? "Cannot revert to Draft from Review stage — use Reopen option" : undefined}
                    className="w-full text-left px-4 py-3 text-sm text-night hover:bg-earth/60 disabled:opacity-50 disabled:hover:bg-transparent transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${isCurrent
                          ? "bg-sky ring-4 ring-sky/10"
                          : isForward
                            ? "bg-pebble"
                            : "bg-amber-300"
                          }`}
                      />
                      <div className="flex flex-col text-left">
                        <span className={`text-sm ${isCurrent ? 'text-sky font-bold' : 'text-night font-medium'}`}>{stage}</span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {stage === 'Draft' ? `Start Date: ${project.startDate || 'N/A'}` :
                            stage === 'Substantiate' ? `Evaluation Date: ${project.evaluationDate || 'N/A'}` :
                              stage === 'Review & Risk Assessment' ? 'Review & Validation' :
                                stage === 'Complete' ? `Launch Date: ${project.launchDate || 'N/A'}` : ''}
                        </span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-xs bg-sky-50 text-sky px-2 py-0.5 rounded-full font-bold border border-sky-100 flex-shrink-0">
                        Current
                      </span>
                    )}
                    {isForward && <span className="text-xs text-gray-400 flex-shrink-0">Advance →</span>}
                    {isBack && <span className="text-xs text-amber-600 font-medium flex-shrink-0">← Reverse</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Action Modal (for non-lifecycle project actions) ─────────────────────
interface ActionModalProps {
  action: string;
  project: Project;
  onConfirm: () => void;
  onCancel: () => void;
}

function ActionModal({ action, project, onConfirm, onCancel }: ActionModalProps) {
  const configs: Record<
    string,
    {
      title: string;
      description: string;
      confirmLabel: string;
      confirmClass: string;
      icon: JSX.Element;
    }
  > = {
    "Rollout Project": {
      title: "Rollout Project",
      description: `This will initiate a rollout of "${project.name}" to additional markets. The project will be duplicated for local market adaptation.`,
      confirmLabel: "Rollout",
      confirmClass: "bg-sky hover:bg-dark",
      icon: <RefreshCw className="w-5 h-5 text-sky" />,
    },
    "Clone Project": {
      title: "Clone Project",
      description: `A copy of "${project.name}" will be created with all claims and team members. You can then modify it independently.`,
      confirmLabel: "Clone",
      confirmClass: "bg-sky hover:bg-dark",
      icon: <Copy className="w-5 h-5 text-sky" />,
    },
    // "Reopen Project": {
    //   title: "Reopen Project",
    //   description: `"${project.name}" will be moved back to In Progress status and the lifecycle will be reset to Substantiate.`,
    //   confirmLabel: "Reopen",
    //   confirmClass: "bg-sky hover:bg-dark",
    //   icon: <RotateCcw className="w-5 h-5 text-sky" />,
    // },
    // "Archive Project": {
    //   title: "Archive Project",
    //   description: `"${project.name}" will be archived. It will no longer appear in active views but all data will be preserved.`,
    //   confirmLabel: "Archive",
    //   confirmClass: "bg-gray-600 hover:bg-gray-700",
    //   icon: <Archive className="w-5 h-5 text-gray-600" />,
    // },
    "Cancel Project": {
      title: "Cancel Project",
      description: `Are you sure you want to cancel "${project.name}"? This action should only be taken if the project will not proceed further.`,
      confirmLabel: "Cancel Project",
      confirmClass: "bg-red-600 hover:bg-red-700",
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    },
  };

  const config = configs[action];
  if (!config) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-earth rounded-lg">{config.icon}</div>
          <h3 className="text-night">{config.title}</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-6">{config.description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg text-sm ${config.confirmClass}`}
          >
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast Notification Container ─────────────────────────────────────────
interface Toast {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
}

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const styles = {
          success: "border-green-400 bg-green-50 text-green-800",
          info: "border-sky bg-pale text-sky",
          warning: "border-amber-400 bg-amber-50 text-amber-800",
          error: "border-red-400 bg-red-50 text-red-700",
        };
        const icons = {
          success: <CheckCircle className="w-4 h-4 flex-shrink-0" />,
          info: <Info className="w-4 h-4 flex-shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
          error: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
        };
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 border rounded-lg p-3 shadow-md ${styles[t.type]}`}
          >
            {icons[t.type]}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{t.title}</p>
              <p className="text-xs mt-0.5 opacity-80">{t.message}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="opacity-50 hover:opacity-100 flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Validation Error Modal ────────────────────────────────────────────────
function ValidationModal({ errors, onClose }: { errors: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-night">Transition Validation Failed</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Please resolve the issues below before proceeding
            </p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6 space-y-1.5">
          {errors.map((err, i) => (
            <p
              key={i}
              className={`text-sm leading-relaxed ${err.startsWith("  •")
                ? "pl-3 text-gray-600"
                : "text-red-700 font-medium"
                }`}
            >
              {err.startsWith("  •") ? `• ${err.slice(3)}` : err}
            </p>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lifecycle Transition Confirmation Modal ───────────────────────────────
interface ConfirmTransitionModalProps {
  fromStage: string;
  toStage: string;
  infoMessages: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmTransitionModal({
  fromStage,
  toStage,
  infoMessages,
  onConfirm,
  onCancel,
}: ConfirmTransitionModalProps) {
  const recipients = (STAGE_TRANSITION_NOTIFICATIONS[toStage] ?? []) as NotificationTeam[];

  const stageDescriptions: Record<string, string> = {
    Substantiate:
      "Substantiation activities will begin. The team will be notified to start claim review and evidence gathering.",
    Draft: "The project will revert to Draft. Substantiation readiness will need to be re-established.",
    "Review & Risk Assessment":
      "Legal and Regulatory teams will be notified to begin evaluation of the project claims.",
    "Assessment Complete":
      "All claims have been assessed. The project is ready for governance closure.",
    Complete:
      "The project lifecycle will be closed. The project will become read-only after this transition.",
  };

  const stageIcons: Record<string, JSX.Element> = {
    Substantiate: <FileText className="w-5 h-5 text-sky" />,
    Draft: <RotateCcw className="w-5 h-5 text-amber-500" />,
    "Review & Risk Assessment": <Shield className="w-5 h-5 text-purple-500" />,
    "Assessment Complete": <CheckCircle className="w-5 h-5 text-green-600" />,
    Complete: <CheckCircle className="w-5 h-5 text-sky" />,
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-earth rounded-xl">
            {stageIcons[toStage] ?? <RefreshCw className="w-5 h-5 text-sky" />}
          </div>
          <div>
            <h3 className="text-night">Confirm Transition</h3>
            <p className="text-xs text-gray-400 mt-0.5">Lifecycle stage change</p>
          </div>
        </div>

        {/* Stage change visual */}
        <div className="flex items-center gap-2 mb-4 bg-earth rounded-lg px-4 py-3">
          <span className="text-xs font-medium text-gray-500 truncate">{fromStage}</span>
          <div className="flex items-center gap-0.5 flex-shrink-0 mx-1">
            <div className="w-4 h-px bg-pebble" />
            <ChevronRight className="w-3.5 h-3.5 text-sky" />
          </div>
          <span className="text-xs font-semibold text-sky truncate">{toStage}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-4">
          {stageDescriptions[toStage] ??
            `Transition lifecycle from ${fromStage} to ${toStage}.`}
        </p>

        {/* Informational messages (non-blocking) */}
        {infoMessages.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-1.5 text-blue-700 text-xs font-semibold mb-1.5">
              <Info className="w-3.5 h-3.5" />
              Information (does not block transition)
            </div>
            <div className="space-y-0.5">
              {infoMessages.map((msg, i) => (
                <p
                  key={i}
                  className={`text-xs text-blue-700 leading-relaxed ${msg.startsWith("  •") ? "pl-3" : ""
                    }`}
                >
                  {msg}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Notification recipients */}
        {recipients.length > 0 && (
          <div className="bg-earth rounded-lg p-3 mb-5">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium mb-2">
              <Bell className="w-3.5 h-3.5" />
              Notifications will be sent to:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recipients.map((team) => (
                <span
                  key={team}
                  className="px-2.5 py-0.5 bg-white border border-pebble text-xs text-night rounded-full"
                >
                  {team}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
          >
            Confirm Transition
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ProjectWorkspace Component ──────────────────────────────────────
const mapAuditEntriesToLogs = (entries: AuditEntry[]): AuditLogItem[] => {
  return entries.map(entry => {
    let type: 'create' | 'update' | 'delete' | 'status' | 'link' | 'system' = 'update';
    if (entry.action.toLowerCase().includes('created') || entry.action.toLowerCase().includes('initialized')) {
      type = 'create';
    } else if (entry.action.toLowerCase().includes('transition') || entry.fromStage || entry.toStage) {
      type = 'status';
    } else if (entry.action.toLowerCase().includes('reopened')) {
      type = 'status';
    }

    let details = entry.details;
    if (!details && entry.fromStage && entry.toStage) {
      details = `Stage transitioned from "${entry.fromStage}" to "${entry.toStage}".`;
    }

    // Format timestamp nicely
    let formattedTime = entry.timestamp;
    try {
      formattedTime = new Date(entry.timestamp).toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      });
    } catch (e) { }

    return {
      id: entry.id,
      timestamp: formattedTime,
      actor: entry.actor,
      role: entry.actorRole,
      action: entry.action,
      details,
      type
    };
  });
};

export default function ProjectWorkspace({
  project,
  projects,
  currentIndex,
  onBack,
  onProjectChange,
  onProjectSave,
  activeSection,
  onSectionChange,
  currentUserRole = "Project Creator",
  relatedClaimsSubFilter = 'all',
  onRelatedClaimsSubFilterChange,
}: ProjectWorkspaceProps) {
  const [isFavorite, setIsFavorite] = useState(project.isFavorite || false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);
  const [showProjectRisk, setShowProjectRisk] = useState(true);
  const [exportConfig, setExportConfig] = useState<{
    isOpen: boolean;
    format: "pdf" | "excel" | "word" | "csv";
    selectedAttributes: string[];
  } | null>(null);

  // Compute highest risk level of any claim in this project
  const projectClaims = mockClaims.filter((c) => c.relatedProjectIds?.includes(project.id));

  const getHighestRisk = () => {
    if (projectClaims.length === 0) return null;

    const RISK_WEIGHTS: Record<string, number> = {
      'Low': 1,
      'Medium': 2,
      'High': 3,
      'Very High': 4,
      'Not Allowed': 5,
    };

    let maxWeight = -1;
    let highestRisk: string | null = null;

    projectClaims.forEach((claim) => {
      const risk = claim.finalRiskLevel;
      if (risk) {
        const weight = RISK_WEIGHTS[risk] || 0;
        if (weight > maxWeight) {
          maxWeight = weight;
          highestRisk = risk;
        }
      }
    });

    return highestRisk;
  };

  const highestRiskLevel = getHighestRisk();

  // Lifecycle transition state
  const [confirmStage, setConfirmStage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [infoMessages, setInfoMessages] = useState<string[]>([]);
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Audit log state
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    {
      id: "init-1",
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      actor: "Sarah Johnson",
      actorRole: "Project Creator",
      action: "Project created",
      toStage: "Draft",
    },
  ]);

  // Notifications (simulated via toasts)
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pushToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  };

  // Only Project Lead / Claims Lead can change lifecycle stage
  const canChangeStage =
    currentUserRole === "Project Creator" || currentUserRole === "Claims Lead";

  // Project becomes read-only when Complete
  const isProjectReadOnly = project.lifecycleStage === "Complete";

  // Per-project stats for validation
  const projectStats = MOCK_PROJECT_STATS[project.id] ?? {
    globalClaimsCount: 0,
    localClaimsCount: 0,
    assetsCount: 0,
    allClaimsAssessed: false,
    claimsWithMissingSupportStrategy: [],
  };

  const ALL_ATTRIBUTES = [
    "Project Name",
    "Type",
    "Business Group",
    "Category",
    "Scope",
    "Geography",
    "Project Creator/Lead",
    "Status",
    "Lifecycle Stage",
    "Last Modified",
  ];

  const handleExport = (format: "pdf" | "excel" | "word" | "csv") => {
    setExportConfig({
      isOpen: true,
      format,
      selectedAttributes: ALL_ATTRIBUTES,
    });
  };

  const executeExport = (format: "pdf" | "excel" | "word" | "csv", selectedAttrs: string[]) => {
    const headers = ["Attribute", "Value"];
    const allRows = [
      ["Project Name", project.name],
      ["Type", project.type],
      ["Business Group", project.businessGroup],
      ["Category", project.category],
      ["Scope", project.scope],
      ["Geography", project.region],
      ["Project Creator/Lead", project.projectLead],
      ["Status", project.status],
      ["Lifecycle Stage", project.lifecycleStage],
      ["Last Modified", new Date(project.lastUpdated).toLocaleString()],
    ];
    const rows = allRows.filter(r => selectedAttrs.includes(r[0]));

    if (format === "csv") {
      const csvContent = [
        headers.join(","),
        ...rows.map(r => `"${r[0]}","${r[1]}"`)
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, "_")}_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "excel") {
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/></head>
        <body>
          <h2>Project Details: ${project.name}</h2>
          <table border="1">
            <tr style="background-color: #F6F7F0; font-weight: bold;">
              ${headers.map(h => `<th>${h}</th>`).join("")}
            </tr>
            ${rows.map(r => `
              <tr>
                <td><b>${r[0]}</b></td>
                <td>${r[1]}</td>
              </tr>
            `).join("")}
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([html], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, "_")}_export_${new Date().toISOString().slice(0, 10)}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "word") {
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/><title>Project Export</title></head>
        <body>
          <h2>Project Details: ${project.name}</h2>
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #F6F7F0; font-weight: bold;">
              ${headers.map(h => `<th style="padding: 8px;">${h}</th>`).join("")}
            </tr>
            ${rows.map(r => `
              <tr>
                <td style="padding: 8px; width: 30%;"><b>${r[0]}</b></td>
                <td style="padding: 8px;">${r[1]}</td>
              </tr>
            `).join("")}
          </table>
        </body>
        </html>
      `;
      const blob = new Blob([html], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, "_")}_export_${new Date().toISOString().slice(0, 10)}.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === "pdf") {
      let report = `========================================================================================\n`;
      report += `                               PROJECT DETAILS REPORT EXPORT                            \n`;
      report += `                             Generated on: ${new Date().toLocaleDateString()}           \n`;
      report += `========================================================================================\n\n`;

      rows.forEach(r => {
        report += `• ${r[0].padEnd(25)}: ${r[1]}\n`;
      });
      report += `\n========================================================================================\n`;

      const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, "_")}_export_${new Date().toISOString().slice(0, 10)}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // ── Stage selection with per-story validation ──────────────────────────
  const handleStageSelect = (newStage: string) => {
    setValidationErrors([]);
    setInfoMessages([]);
    if (newStage === project.lifecycleStage) return;
    
    // Restriction: Cannot manually revert to Draft from Review & Risk Assessment
    if (project.lifecycleStage === "Review & Risk Assessment" && newStage === "Draft") {
      return;
    }

    const errors: string[] = [];
    const infos: string[] = [];

    if (newStage === "Substantiate") {
      const { globalClaimsCount, localClaimsCount, assetsCount } = projectStats;
      if (globalClaimsCount === 0 && localClaimsCount === 0 && assetsCount === 0) {
        errors.push(
          "Transition blocked: at least one of the following must exist before moving to Substantiate:"
        );
        errors.push("  • ≥ 1 Global Claim");
        errors.push("  • ≥ 1 Local Claim");
        errors.push("  • ≥ 1 Asset");
        errors.push(
          `Currently: ${globalClaimsCount} Global Claims, ${localClaimsCount} Local Claims, ${assetsCount} Assets.`
        );
      }
    } else if (newStage === "Review & Risk Assessment") {
      const { claimsWithMissingSupportStrategy } = projectStats;
      if (claimsWithMissingSupportStrategy.length > 0) {
        infos.push(
          `${claimsWithMissingSupportStrategy.length} claim(s) are missing a Support Strategy:`
        );
        claimsWithMissingSupportStrategy.forEach((c) => infos.push(`  • ${c}`));
        infos.push("This does not block the transition but should be addressed.");
      }
    } else if (newStage === "Complete") {
      if (!projectStats.allClaimsAssessed) {
        errors.push(
          "Transition blocked: all of the following must have status 'Assessed' before completing the project:"
        );
        errors.push("  • All Global Claims");
        errors.push("  • All Local Claims");
        errors.push("  • All SKU Claims");
        errors.push(
          "Navigate to the Related Claims tab to update outstanding claim statuses."
        );
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (infos.length > 0) setInfoMessages(infos);
    setConfirmStage(newStage);
  };

  // ── Confirm lifecycle transition ───────────────────────────────────────
  const confirmStageTransition = () => {
    if (!confirmStage) return;
    const prevStage = project.lifecycleStage;

    const entry: AuditEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      actor: currentUserRole === "Project Creator" ? "Sarah Johnson" : "Michael Chen",
      actorRole: currentUserRole as UserRole,
      action: "Lifecycle stage transition",
      fromStage: prevStage,
      toStage: confirmStage,
    };
    setAuditLog((prev) => [entry, ...prev]);
    onProjectSave({ ...project, lifecycleStage: confirmStage });

    const recipients = STAGE_TRANSITION_NOTIFICATIONS[confirmStage] ?? [];
    pushToast({
      type: "success",
      title: `Stage updated → ${confirmStage}`,
      message:
        recipients.length > 0
          ? `Notifications sent to: ${recipients.join(", ")}.`
          : "Lifecycle stage has been updated successfully.",
    });

    // if (confirmStage === "Complete") {
    //   setTimeout(
    //     () =>
    //       pushToast({
    //         type: "info",
    //         title: "Project is now read-only",
    //         message: "Use Actions → Reopen Project to re-enable editing.",
    //       }),
    //     600
    //   );
    // }

    setConfirmStage(null);
    setInfoMessages([]);
  };

  const handlePrev = () => {
    if (currentIndex > 0) onProjectChange(projects[currentIndex - 1]);
  };
  const handleNext = () => {
    if (currentIndex < projects.length - 1) onProjectChange(projects[currentIndex + 1]);
  };
  const handleAction = (action: string) => {
    setActionsOpen(false);
    setPendingAction(action);
  };

  const handleActionConfirm = () => {
    // if (pendingAction === "Reopen Project") {
    //   onProjectSave({ ...project, lifecycleStage: "Substantiate" });
    //   const entry: AuditEntry = {
    //     id: Date.now().toString(),
    //     timestamp: new Date().toISOString(),
    //     actor: "Sarah Johnson",
    //     actorRole: currentUserRole as UserRole,
    //     action: "Project reopened",
    //     fromStage: "Complete",
    //     toStage: "Substantiate",
    //   };
    //   setAuditLog((prev) => [entry, ...prev]);
    //   pushToast({
    //     type: "info",
    //     title: "Project Reopened",
    //     message: "Lifecycle reset to Substantiate. Editing is now enabled.",
    //   });
    // } 
    if (pendingAction === "Clone Project") {
      const clonedId = String(Date.now());
      const clonedProject: Project = {
        ...project,
        id: clonedId,
        projectId: `PRJ-${clonedId.slice(-4)}`,
        name: `${project.name} (Clone)`,
        lifecycleStage: "Draft",
        status: "Draft",
        lastUpdated: new Date().toISOString(),
        clonedFrom: project.name,
      };
      onProjectSave(clonedProject);
      pushToast({
        type: "success",
        title: "Project Cloned",
        message: `"${project.name}" has been successfully cloned!`,
      });
    } else if (pendingAction === "Rollout Project") {
      const clonedId = String(Date.now());
      const clonedProject: Project = {
        ...project,
        id: clonedId,
        projectId: `PRJ-${clonedId.slice(-4)}`,
        name: `${project.name} (Rollout)`,
        lifecycleStage: "Draft",
        status: "Draft",
        lastUpdated: new Date().toISOString(),
        clonedFrom: project.name,
      };
      onProjectSave(clonedProject);
      pushToast({
        type: "success",
        title: "Project Rollout Initiated",
        message: `Rollout project "${clonedProject.name}" has been successfully created.`,
      });
    }
    setPendingAction(null);
  };

  const ORDERED_SECTIONS = [
    { id: "Project Details", section: "Project Details", subFilter: "all", title: "Project Details" },
    { id: "Geography", section: "Geography", subFilter: "all", title: "Geography" },
    { id: "Project Team", section: "Project Team", subFilter: "all", title: "Project Team" },
    { id: "Linked Products", section: "Linked Products", subFilter: "all", title: "Linked Products" },
    { id: "Related Claims - Global", section: "Related Claims", subFilter: "global", title: "Related Claims — Global" },
    { id: "Related Claims - Regional", section: "Related Claims", subFilter: "regional", title: "Related Claims — Regional" },
    { id: "Related Claims - Local", section: "Related Claims", subFilter: "local", title: "Related Claims — Local" },
    { id: "Related Claims - SKU", section: "Related Claims", subFilter: "local_sku", title: "Related Claims — SKU Claim" },
    { id: "Linked Assets", section: "Linked Assets", subFilter: "all", title: "Linked Assets" },
    { id: "Project Documents", section: "Project Documents", subFilter: "all", title: "Project Documents" },
  ];

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isNavigatingRef.current) return;

    let targetId = activeSection as string;
    if (activeSection === "Related Claims") {
      targetId = relatedClaimsSubFilter === "all" || relatedClaimsSubFilter === "global"
        ? "Related Claims - Global"
        : relatedClaimsSubFilter === "regional"
        ? "Related Claims - Regional"
        : relatedClaimsSubFilter === "local"
        ? "Related Claims - Local"
        : "Related Claims - SKU";
    }

    const el = sectionRefs.current[targetId];
    if (el) {
      isNavigatingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    }
  }, [activeSection, relatedClaimsSubFilter]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Throttled scroll check to keep active nav in sync
    if (isNavigatingRef.current) return;

    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const triggerLine = containerRect.top + containerRect.height * 0.3;

    for (const item of ORDERED_SECTIONS) {
      const el = sectionRefs.current[item.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerLine && rect.bottom > triggerLine) {
          if (activeSection !== item.section) {
            onSectionChange(item.section as WorkspaceSection);
          }
          if (item.section === "Related Claims" && onRelatedClaimsSubFilterChange && relatedClaimsSubFilter !== item.subFilter) {
            onRelatedClaimsSubFilterChange(item.subFilter);
          }
          break;
        }
      }
    }
  };

  const renderSectionContent = (id: string) => {
    switch (id) {
      case "Project Details":
        return <ProjectDetailsTab project={project} onSave={onProjectSave} />;
      case "Geography":
        return <GeographyTab />;
      case "Project Team":
        return <ProjectTeamTab project={project} onSave={onProjectSave} />;
      case "Linked Products":
        return <LinkedProductsTab project={project} />;
      case "Related Claims - Global":
        return <RelatedClaimsTab subFilter="global" hideOuterHeader={true} />;
      case "Related Claims - Regional":
        return <RelatedClaimsTab subFilter="regional" hideOuterHeader={true} />;
      case "Related Claims - Local":
        return <RelatedClaimsTab subFilter="local" hideOuterHeader={true} />;
      case "Related Claims - SKU":
        return <RelatedClaimsTab subFilter="local_sku" hideOuterHeader={true} />;
      case "Linked Assets":
        return <LinkedAssetsTab />;
      case "Project Documents":
        return <ProductDocumentsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden no-scrollbar">
      {/* Toast notifications */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))}
      />

      {/* ── Workspace Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        {/* Breadcrumb + Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={onBack}
              className="flex items-center gap-1 hover:text-sky transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Projects
            </button>
            <span>/</span>
            <span className="text-night truncate max-w-[300px]">{project.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Record navigation */}
            <div className="flex items-center border border-pebble rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-r border-pebble"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="px-2.5 text-xs text-gray-500 font-medium">
                {currentIndex + 1} / {projects.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentIndex === projects.length - 1}
                className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-l border-pebble"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Collaborate */}
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors shadow-sm ${isDrawerOpen
                ? "bg-sky text-white border-sky"
                : "border-pebble text-night hover:bg-earth bg-white"
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden lg:inline">Collaborate</span>
            </button>

            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="flex items-center gap-2 px-3 py-1.5 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors bg-white shadow-sm"
              >
                Actions
                <ChevronDown className="w-4 h-4" />
              </button>
              {actionsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setActionsOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-lg z-20 min-w-[180px] overflow-hidden">
                    <button
                      onClick={() => {
                        setActionsOpen(false);
                        setShowAuditLog(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors flex items-center gap-2"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-sky" />
                      Audit Log
                    </button>
                    <div className="border-t border-pebble" />
                    {isProjectReadOnly ? (
                      <button
                        onClick={() => handleAction("Reopen Project")}
                        className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-sky" />
                        Reopen Project
                      </button>
                    ) : (
                      <>
                        {["Clone Project"].map((action) => (
                          <button
                            key={action}
                            onClick={() => handleAction(action)}
                            className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors flex items-center gap-2"
                          >

                            {action === "Clone Project" && (
                              <Copy className="w-3.5 h-3.5 text-sky" />
                            )}
                            {action}
                          </button>
                        ))}
                        {project.status === "Cancelled" ? (
                          canChangeStage && (
                            <button
                              onClick={() => {
                                setActionsOpen(false);
                                onProjectSave({
                                  ...project,
                                  status: "Draft",
                                  lifecycleStage: "Draft",
                                  cancelReasonCategory: undefined,
                                  cancelReasonText: undefined,
                                  lastUpdated: new Date().toISOString(),
                                });
                                pushToast({
                                  type: "success",
                                  title: "Project Restored",
                                  message: "Project has been restored to Draft status successfully."
                                });
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors flex items-center gap-2 text-amber-600 font-medium"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restore to Draft
                            </button>
                          )
                        ) : (
                          <>
                          {project.lifecycleStage === "Review & Risk Assessment" && canChangeStage && (
                            <button
                              onClick={() => {
                                setActionsOpen(false);
                                onProjectSave({
                                  ...project,
                                  lifecycleStage: "Draft",
                                  status: "Draft",
                                  lastUpdated: new Date().toISOString(),
                                });
                                pushToast({
                                  type: "info",
                                  title: "Project Reopened",
                                  message: "Project has been moved back to Draft stage.",
                                });
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors flex items-center gap-2 text-amber-600 font-medium"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Reopen Project (Draft)
                            </button>
                          )}
                          {canChangeStage && (
                            <button
                              onClick={() => handleAction("Cancel Project")}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600 font-medium"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancel Project
                            </button>
                          )}
                        </>
                        )}
                        <div className="border-t border-pebble" />
                        <div className="px-4 py-2.5 bg-earth/30">
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Export Project
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: "Excel", format: "excel", color: "text-green-600 hover:bg-green-50 hover:border-green-300" },
                              { label: "CSV", format: "csv", color: "text-blue-600 hover:bg-blue-50 hover:border-blue-300" },
                              { label: "PDF", format: "pdf", color: "text-red-600 hover:bg-red-50 hover:border-red-300" },
                              { label: "Word", format: "word", color: "text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300" },
                            ].map((item) => (
                              <button
                                key={item.label}
                                onClick={() => {
                                  setActionsOpen(false);
                                  handleExport(item.format as any);
                                }}
                                className={`flex items-center justify-center gap-1.5 py-1 px-1.5 border border-pebble rounded-lg text-xs font-medium transition-colors bg-white ${item.color}`}
                              >
                                <Download className="w-3 h-3 flex-shrink-0" />
                                {item.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Project Identity + Status + Lifecycle Dropdown */}
        <div className="flex items-start gap-3">
          <button onClick={() => setIsFavorite(!isFavorite)} className="mt-0.5 flex-shrink-0">
            <Star
              className={`w-5 h-5 transition-all ${isFavorite
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
                }`}
            />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <h2 className="text-night truncate font-semibold leading-tight">{project.name}</h2>

              {isProjectArchived(project) && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-600 text-white tracking-wide flex-shrink-0 shadow-sm flex items-center gap-1">
                  <Archive className="w-3 h-3" /> ARCHIVED
                </span>
              )}
              {project.status === "Cancelled" && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white tracking-wide flex-shrink-0 shadow-sm flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> CANCELLED
                </span>
              )}

              {/* Project Level Risk Pill with Toggle */}
              {highestRiskLevel && (
                <button
                  onClick={() => setShowProjectRisk(!showProjectRisk)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all shadow-sm ${showProjectRisk
                    ? highestRiskLevel === 'Low' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                      highestRiskLevel === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                        highestRiskLevel === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100' :
                          highestRiskLevel === 'Very High' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                            highestRiskLevel === 'Not Allowed' ? 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200' :
                              'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100 hover:text-gray-500'
                    }`}
                  title={showProjectRisk ? "Click to hide risk level" : "Click to show risk level"}
                >
                  <span className={`w-1.5 h-1.5 rounded-full transition-colors ${showProjectRisk
                    ? highestRiskLevel === 'Low' ? 'bg-green-500' :
                      highestRiskLevel === 'Medium' ? 'bg-amber-500' :
                        highestRiskLevel === 'High' ? 'bg-orange-500' :
                          highestRiskLevel === 'Very High' ? 'bg-red-600' :
                            highestRiskLevel === 'Not Allowed' ? 'bg-red-700' :
                              'bg-blue-500'
                    : 'bg-gray-300'
                    }`} />

                  <span>
                    Project Risk: {showProjectRisk ? highestRiskLevel : 'Hidden'}
                  </span>

                  {showProjectRisk ? (
                    <Eye className="w-3.5 h-3.5 opacity-60 ml-0.5 flex-shrink-0 text-gray-400" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 opacity-60 ml-0.5 flex-shrink-0 text-gray-400" />
                  )}
                </button>
              )}



              {project.clonedFrom && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-semibold flex-shrink-0">
                  <Copy className="w-3 h-3" />
                  Cloned from {project.clonedFrom}
                </span>
              )}



              {/* Read-only badge */}
              {isProjectReadOnly && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-xs flex-shrink-0">
                  <Lock className="w-3 h-3" />
                  Read-only
                </span>
              )}

              {/* Lifecycle Stage Dropdown */}


              <span className="text-xs text-gray-400 italic flex-shrink-0">
                ({currentUserRole})
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky/10 text-sky border border-sky/20 rounded-full text-xs flex-shrink-0">
                {project.businessGroup}
              </span>
              <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                {project.category}
              </span>
              <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                {project.type}
              </span>
              <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                {project.scope}
              </span>
              {project.region && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs flex-shrink-0">
                  <Globe className="w-3 h-3" />
                  {project.region}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Progress Tracker Ribbon */}
      <LifecycleRibbon
        currentStage={project.lifecycleStage}
        projectId={project.id}
        lastUpdated={project.lastUpdated}
        reviewPanelOpen={reviewPanelOpen}
        onToggleReviewPanel={() => setReviewPanelOpen((v) => !v)}
        onSelectStage={handleStageSelect}
        onNotify={(tileLabel, scope) =>
          pushToast({
            type: "success",
            title: "Notification sent",
            message: `Team notified for "${tileLabel}" (${scope} scope).`,
          })
        }
      />

      {/* Read-only banner */}
      {isProjectReadOnly && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center gap-2 flex-shrink-0">
          <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-700">
            This project is <strong>Complete</strong> and is read-only. Use{" "}
            <strong>Actions → Reopen Project</strong> to re-enable editing.
          </p>
        </div>
      )}

      {/* ── Main Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div 
            className="flex-1 overflow-y-auto bg-transparent snap-y snap-proximity scroll-smooth no-scrollbar"
            onScroll={handleScroll}
          >
            {ORDERED_SECTIONS.map((item) => {
              const isItemActive = activeSection === item.section && (
                item.section !== "Related Claims" || 
                relatedClaimsSubFilter === item.subFilter || 
                (relatedClaimsSubFilter === "all" && item.subFilter === "global")
              );

              return (
                <div
                  key={item.id}
                  ref={(el) => { sectionRefs.current[item.id] = el; }}
                  className={`w-full h-full flex-shrink-0 flex flex-col snap-start snap-always bg-transparent transition-opacity duration-300 border-b-2 border-amber-100/60 ${
                    isItemActive ? "opacity-100" : "opacity-80"
                  }`}
                >
                  <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {renderSectionContent(item.id)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collaboration Drawer */}
        {isDrawerOpen && (
          <CollaborationDrawer onClose={() => setIsDrawerOpen(false)} projectName={project.name} />
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showAuditLog && (
        <AuditLogModal
          isOpen={showAuditLog}
          onClose={() => setShowAuditLog(false)}
          title="Project Audit Trail"
          itemName={project.name}
          itemId={project.projectId}
          logs={mapAuditEntriesToLogs(auditLog)}
        />
      )}

      {pendingAction === "Clone Project" ? (
        <CloneProjectModal
          isOpen={true}
          onClose={() => setPendingAction(null)}
          sourceProject={project}
          existingProjects={projects}
          currentUserRole={currentUserRole}
          onCloneProject={(clonedProject) => {
            onProjectSave(clonedProject);
            pushToast({
              type: "success",
              title: "Project Cloned",
              message: `"${project.name}" has been successfully cloned!`,
            });
            setPendingAction(null);
          }}
        />
      ) : pendingAction === "Cancel Project" ? (
        <CancelProjectModal
          isOpen={true}
          onClose={() => setPendingAction(null)}
          project={project}
          onConfirm={(category, reason) => {
            onProjectSave({
              ...project,
              status: "Cancelled",
              lifecycleStage: "Cancelled",
              cancelReasonCategory: category,
              cancelReasonText: reason,
              lastUpdated: new Date().toISOString(),
            });
            pushToast({
              type: "success",
              title: "Project Cancelled",
              message: `"${project.name}" has been cancelled successfully.`
            });
            setPendingAction(null);
          }}
        />
      ) : pendingAction ? (
        <ActionModal
          action={pendingAction}
          project={project}
          onConfirm={handleActionConfirm}
          onCancel={() => setPendingAction(null)}
        />
      ) : null}

      {validationErrors.length > 0 && (
        <ValidationModal
          errors={validationErrors}
          onClose={() => setValidationErrors([])}
        />
      )}

      {confirmStage && (
        <ConfirmTransitionModal
          fromStage={project.lifecycleStage}
          toStage={confirmStage}
          infoMessages={infoMessages}
          onConfirm={confirmStageTransition}
          onCancel={() => {
            setConfirmStage(null);
            setInfoMessages([]);
          }}
        />
      )}

      {/* Export Attributes Selection Pop-Up Modal */}
      {exportConfig && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-150" onClick={() => setExportConfig(null)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto animate-in fade-in zoom-in-95 duration-150 border border-pebble">
              <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-earth/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky/10 rounded-xl text-sky font-bold">
                    <Download className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-night">Select Attributes to Export</h2>
                    <p className="text-xs text-gray-500">Format: {exportConfig.format.toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={() => setExportConfig(null)} className="p-1.5 hover:bg-pebble rounded-lg transition-colors text-gray-400 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-2.5 text-left no-scrollbar">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Exportable Attributes</span>
                  <button
                    type="button"
                    onClick={() => {
                      const isAllSelected = exportConfig.selectedAttributes.length === ALL_ATTRIBUTES.length;
                      setExportConfig(prev => prev ? { ...prev, selectedAttributes: isAllSelected ? [] : ALL_ATTRIBUTES } : null);
                    }}
                    className="text-sky hover:underline cursor-pointer lowercase font-semibold"
                  >
                    toggle all
                  </button>
                </div>
                {ALL_ATTRIBUTES.map(attr => {
                  const isChecked = exportConfig.selectedAttributes.includes(attr);
                  return (
                    <label key={attr} className="flex items-center gap-3 p-2 rounded-lg hover:bg-earth cursor-pointer transition-colors border border-transparent hover:border-pebble">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setExportConfig(prev => {
                            if (!prev) return prev;
                            const nextAttrs = isChecked
                              ? prev.selectedAttributes.filter(a => a !== attr)
                              : [...prev.selectedAttributes, attr];
                            return { ...prev, selectedAttributes: nextAttrs };
                          });
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-sky focus:ring-sky cursor-pointer"
                      />
                      <span className="text-sm text-night font-medium">{attr}</span>
                    </label>
                  );
                })}
              </div>
              <div className="px-6 py-4 bg-gray-50/50 border-t border-pebble flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setExportConfig(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-earth rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={exportConfig.selectedAttributes.length === 0}
                  onClick={() => {
                    executeExport(exportConfig.format, exportConfig.selectedAttributes);
                    setExportConfig(null);
                  }}
                  className="px-4 py-2 text-sm font-bold bg-sky text-white hover:bg-dark rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Confirm &amp; Export
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}