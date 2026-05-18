import { useState } from 'react';
import {
  CheckCircle2, XCircle, HelpCircle, Calendar, Users, Clock,
  AlertCircle, ChevronDown, ChevronUp, Shield, Edit2, ArrowRight,
  CheckSquare, MessageSquare, History, User
} from 'lucide-react';
import type { Asset, AssetApprovalWorkflow, AssetApprover, ApprovalVerdict } from '../../types';

interface ApprovalWorkflowPanelProps {
  asset: Asset;
  onAssetSave: (asset: Asset) => void;
  onManageApprovers: () => void;
  onInitiateWorkflow: () => void;
}

const CURRENT_USER = 'Sarah Johnson';

const verdictConfig: Record<
  NonNullable<ApprovalVerdict>,
  { label: string; color: string; icon: React.ReactNode }
> = {
  Approved: {
    label: 'Approved',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Rejected: {
    label: 'Rejected',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
  'Need More Info': {
    label: 'Need More Info',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: <HelpCircle className="w-3.5 h-3.5" />,
  },
};

function formatDate(isoDate: string | undefined): string {
  if (!isoDate) return '—';
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function isDueDateBreached(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

/* ── SubmitVerdictRow ─────────────────────────────── */
interface SubmitVerdictRowProps {
  approver: AssetApprover;
  onSubmit: (approverId: string, verdict: NonNullable<ApprovalVerdict>, comment: string) => void;
  onAccept: (approverId: string) => void;
}

function SubmitVerdictRow({ approver, onSubmit, onAccept }: SubmitVerdictRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [pendingVerdict, setPendingVerdict] = useState<NonNullable<ApprovalVerdict>>('Approved');
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');

  const requiresComment = pendingVerdict === 'Rejected' || pendingVerdict === 'Need More Info';

  const handleSubmit = () => {
    if (requiresComment && !comment.trim()) {
      setCommentError('A comment is mandatory for this verdict.');
      return;
    }
    setCommentError('');
    onSubmit(approver.id, pendingVerdict, comment.trim());
    setExpanded(false);
  };

  if (approver.status === 'Pending') {
    return (
      <button
        onClick={() => onAccept(approver.id)}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-sky/30 bg-sky/5 text-sky rounded-lg text-xs font-medium hover:bg-pale transition-colors"
      >
        <CheckSquare className="w-3.5 h-3.5" />
        Accept Task
      </button>
    );
  }

  if (approver.status === 'Accepted') {
    return (
      <div className="w-full">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-xs font-medium hover:bg-dark transition-colors"
        >
          Submit Verdict
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-2 p-3 border border-sky/20 rounded-xl bg-sky/5 space-y-2">
            {/* Verdict selector */}
            <div className="flex gap-2">
              {(['Approved', 'Rejected', 'Need More Info'] as NonNullable<ApprovalVerdict>[]).map(v => (
                <button
                  key={v}
                  onClick={() => { setPendingVerdict(v); setCommentError(''); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    pendingVerdict === v
                      ? verdictConfig[v].color + ' border'
                      : 'border-pebble text-gray-500 hover:bg-earth'
                  }`}
                >
                  {verdictConfig[v].icon}
                  {v}
                </button>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Comment{requiresComment ? <span className="text-red-500"> *</span> : ' (optional)'}
              </label>
              <textarea
                value={comment}
                onChange={e => { setComment(e.target.value); setCommentError(''); }}
                placeholder={requiresComment ? 'A comment is required for this verdict…' : 'Add a comment (optional)…'}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg text-xs text-night focus:outline-none focus:ring-2 focus:ring-sky resize-none ${
                  commentError ? 'border-red-400 bg-red-50/30' : 'border-pebble bg-white'
                }`}
              />
              {commentError && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{commentError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setExpanded(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-night"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-3 py-1.5 bg-sky text-white rounded-lg text-xs font-medium hover:bg-dark transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null; // status === Submitted — no actions
}

/* ── Main Panel ───────────────────────────────────── */
export default function ApprovalWorkflowPanel({
  asset,
  onAssetSave,
  onManageApprovers,
  onInitiateWorkflow,
}: ApprovalWorkflowPanelProps) {
  const wf = asset.approvalWorkflow;
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showRiskDecision, setShowRiskDecision] = useState(false);

  /* ── Helpers ─────────────────────────────────────*/
  const totalApprovers = wf?.approvers.length ?? 0;
  const submittedCount = wf?.approvers.filter(a => a.status === 'Submitted').length ?? 0;
  const progressPct = totalApprovers > 0 ? Math.round((submittedCount / totalApprovers) * 100) : 0;

  const currentUserApprover = wf?.approvers.find(a => a.name === CURRENT_USER);

  /* ── Actions ─────────────────────────────────────*/
  const acceptTask = (approverId: string) => {
    if (!wf) return;
    const now = new Date().toISOString();
    const updatedApprovers = wf.approvers.map(a =>
      a.id === approverId ? { ...a, status: 'Accepted' as const } : a
    );
    const updatedAsset: Asset = {
      ...asset,
      approvalWorkflow: { ...wf, approvers: updatedApprovers },
      auditLog: [
        ...asset.auditLog,
        { id: `AL-${Date.now()}`, action: `Approval task accepted by ${CURRENT_USER}`, actor: CURRENT_USER, timestamp: now },
      ],
    };
    onAssetSave(updatedAsset);
  };

  const submitVerdict = (
    approverId: string,
    verdict: NonNullable<ApprovalVerdict>,
    comment: string,
  ) => {
    if (!wf) return;
    const now = new Date().toISOString();
    const updatedApprovers = wf.approvers.map(a =>
      a.id === approverId
        ? { ...a, status: 'Submitted' as const, verdict, comment, submittedAt: now }
        : a
    );
    const isComplete = updatedApprovers.every(a => a.verdict !== null);
    const updatedAsset: Asset = {
      ...asset,
      approvalWorkflow: { ...wf, approvers: updatedApprovers, isComplete },
      auditLog: [
        ...asset.auditLog,
        {
          id: `AL-${Date.now()}`,
          action: `Approval verdict "${verdict}" submitted by ${CURRENT_USER}`,
          actor: CURRENT_USER,
          timestamp: now,
          details: comment || undefined,
        },
      ],
    };
    onAssetSave(updatedAsset);
    if (isComplete) setShowRiskDecision(true);
  };

  /* ── No workflow state ────────────────────────── */
  if (!wf) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-sky/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-7 h-7 text-sky" />
        </div>
        <p className="text-sm font-medium text-night mb-1">No approval workflow yet</p>
        <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">
          Launch a workflow to route this asset to Legal, Regulatory, and Claims Lead approvers.
        </p>
        <button
          onClick={onInitiateWorkflow}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky text-white rounded-xl text-sm font-medium hover:bg-dark transition-colors shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          Initiate Approval Workflow
        </button>
      </div>
    );
  }

  /* ── Workflow exists ──────────────────────────── */
  const overallVerdictColors: Record<string, string> = {
    Approved: 'bg-green-50 text-green-700 border border-green-200',
    'All Approved': 'bg-green-50 text-green-700 border border-green-200',
    Rejected: 'bg-red-50 text-red-700 border border-red-200',
    'Need More Info': 'bg-amber-50 text-amber-700 border border-amber-200',
    'In Progress': 'bg-blue-50 text-blue-700 border border-blue-200',
    Complete: 'bg-purple-50 text-purple-700 border border-purple-200',
    Pending: 'bg-gray-100 text-gray-600 border border-gray-200',
  };

  const overallStatus = wf.isComplete ? 'Complete' : submittedCount > 0 ? 'In Progress' : 'Pending';

  return (
    <div className="space-y-5">

      {/* ── Summary bar ─────────────────────── */}
      <div className="bg-white rounded-xl border border-pebble overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-pebble">
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${overallVerdictColors[overallStatus]}`}>
              {overallStatus}
            </div>
            <span className="text-sm text-night font-medium">
              {submittedCount}/{totalApprovers} approvers complete
            </span>
          </div>

          {/* Manage Approvers — single button for WF owner */}
          {!wf.isComplete && (
            <button
              onClick={onManageApprovers}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-pebble rounded-lg text-xs text-night hover:bg-earth transition-colors font-medium"
            >
              <Edit2 className="w-3.5 h-3.5 text-sky" />
              Manage Approvers
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 bg-earth/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Progress</span>
            <span className="text-xs text-gray-500 font-medium">{progressPct}%</span>
          </div>
          <div className="h-2 bg-pebble rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                wf.isComplete ? 'bg-green-500' : progressPct > 0 ? 'bg-sky' : 'bg-gray-200'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="px-5 py-3 flex items-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            Initiated by <span className="font-medium text-night ml-1">{wf.initiatedBy}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDate(wf.initiatedAt)}
          </span>
        </div>
      </div>

      {/* ── Approver rows ───────────────────── */}
      <div className="space-y-3">
        {wf.approvers.map(approver => {
          const breached = isDueDateBreached(approver.dueDate);
          const isCurrentUser = approver.name === CURRENT_USER;
          const deptColors: Record<string, string> = {
            'Legal': 'bg-purple-50 text-purple-700',
            'Regulatory': 'bg-blue-50 text-blue-700',
            'Claims Lead': 'bg-teal-50 text-teal-700',
          };

          return (
            <div
              key={approver.id}
              className="bg-white rounded-xl border border-pebble overflow-hidden"
            >
              {/* Row header */}
              <div className="flex items-start gap-3 p-4">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-sky/15 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-sky">
                    {approver.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Identity */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-night">{approver.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${deptColors[approver.department]}`}>
                      {approver.department}
                    </span>

                    {/* Verdict badge */}
                    {approver.verdict && (
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${verdictConfig[approver.verdict].color}`}>
                        {verdictConfig[approver.verdict].icon}
                        {approver.verdict}
                      </span>
                    )}
                    {!approver.verdict && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        approver.status === 'Accepted'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {approver.status === 'Accepted' ? 'Task Accepted' : 'Pending'}
                      </span>
                    )}
                  </div>

                  {/* Due date */}
                  <div className={`flex items-center gap-1 text-xs mt-1 ${
                    breached && approver.status !== 'Submitted' ? 'text-red-500' : 'text-gray-400'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    Due: {formatDate(approver.dueDate)}
                    {breached && approver.status !== 'Submitted' && (
                      <span className="ml-1 font-medium">· Overdue (reminder sent)</span>
                    )}
                  </div>
                </div>

                {/* Action button — only for the current user's row & incomplete task */}
                <div className="flex-shrink-0">
                  {isCurrentUser && approver.status !== 'Submitted' && (
                    <SubmitVerdictRow
                      approver={approver}
                      onAccept={acceptTask}
                      onSubmit={submitVerdict}
                    />
                  )}
                </div>
              </div>

              {/* Comment + timestamp (shown once submitted) */}
              {approver.status === 'Submitted' && (
                <div className="mx-4 mb-4 border-t border-pebble/60 pt-3 flex gap-2.5">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {approver.comment || <span className="italic text-gray-400">No comment provided.</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Submitted {formatDate(approver.submittedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Lifecycle lock notice ────────────── */}
      {!wf.isComplete && (
        <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Asset lifecycle cannot progress until all approvers submit their verdicts.
          </p>
        </div>
      )}

      {/* ── Post-completion: Risk Assessment decision ── */}
      {(wf.isComplete || showRiskDecision) && (
        <div className="bg-white rounded-xl border border-pebble overflow-hidden">
          <div className="px-5 py-4 border-b border-pebble flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky" />
            <h4 className="text-sm font-semibold text-night">Post-Approval: Risk Assessment</h4>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              All approvers have submitted their verdicts. As Workflow Owner, you can decide
              whether to proceed with a full risk assessment for this asset (same workflow members
              will provide their risk assessments).
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const now = new Date().toISOString();
                  const updated: Asset = {
                    ...asset,
                    auditLog: [
                      ...asset.auditLog,
                      {
                        id: `AL-${Date.now()}`,
                        action: 'Risk assessment phase initiated post-approval',
                        actor: CURRENT_USER,
                        timestamp: now,
                      },
                    ],
                  };
                  onAssetSave(updated);
                  setShowRiskDecision(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm font-medium hover:bg-dark transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Proceed with Risk Assessment
              </button>
              <button
                onClick={() => setShowRiskDecision(false)}
                className="px-4 py-2 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Audit trail ─────────────────────── */}
      <div className="bg-white rounded-xl border border-pebble overflow-hidden">
        <button
          onClick={() => setShowAuditLog(!showAuditLog)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-earth transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-night">
            <History className="w-4 h-4 text-gray-400" />
            Workflow Audit Trail
          </div>
          {showAuditLog ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showAuditLog && (
          <div className="border-t border-pebble divide-y divide-pebble/60">
            {asset.auditLog
              .filter(e =>
                e.action.toLowerCase().includes('approval') ||
                e.action.toLowerCase().includes('verdict') ||
                e.action.toLowerCase().includes('workflow') ||
                e.action.toLowerCase().includes('accept') ||
                e.action.toLowerCase().includes('reassign')
              )
              .slice()
              .reverse()
              .map(entry => (
                <div key={entry.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-night">{entry.action}</p>
                    {entry.details && (
                      <p className="text-xs text-gray-400 mt-0.5 italic">{entry.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {entry.actor} · {formatDate(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            {asset.auditLog.filter(e =>
              e.action.toLowerCase().includes('approval') ||
              e.action.toLowerCase().includes('verdict') ||
              e.action.toLowerCase().includes('workflow') ||
              e.action.toLowerCase().includes('accept') ||
              e.action.toLowerCase().includes('reassign')
            ).length === 0 && (
              <div className="px-5 py-4 text-xs text-gray-400 text-center">
                No workflow audit entries yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
