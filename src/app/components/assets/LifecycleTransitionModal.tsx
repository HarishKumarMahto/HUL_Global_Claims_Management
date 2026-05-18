import { X, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import type { Asset, AssetLifecycle } from '../../types';

interface LifecycleTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  targetLifecycle: AssetLifecycle;
  onConfirm: () => void;
  notUsedReason?: string;
  onNotUsedReasonChange?: (r: string) => void;
}

interface GatingCheck {
  label: string;
  pass: boolean;
  detail?: string;
}

export function computeGates(asset: Asset, target: AssetLifecycle): GatingCheck[] {
  if (target === 'Assessed') {
    const currentVersion = asset.versions.find(v => v.versionNumber === asset.currentVersionNumber);
    const finalRiskSet = currentVersion?.finalRisk?.finalRiskLevel != null || currentVersion?.finalRisk?.otherBrandSay;
    const noProposedClaims = asset.linkedClaimIds.length === 0; // simplified — in real app checks claim lifecycle
    const hasFile = !asset.isPlaceholder;
    const highRisk = currentVersion?.finalRisk?.finalRiskLevel === 'High';
    const hasSignOff = (currentVersion?.finalRisk?.signOffDocuments?.length ?? 0) > 0;

    return [
      { label: 'File uploaded (not a placeholder)', pass: hasFile, detail: asset.isPlaceholder ? 'Upload the asset file first.' : undefined },
      { label: 'Final Risk Level populated (or Brand Say = Yes)', pass: !!finalRiskSet, detail: !finalRiskSet ? 'Set the Final Risk Level in the Risk Summary section.' : undefined },
      { label: 'No linked claims in Proposed/Challenged state', pass: noProposedClaims, detail: !noProposedClaims ? 'All linked claims must be Assessed or Not Used.' : undefined },
      { label: 'High-risk sign-off documents uploaded', pass: !highRisk || hasSignOff, detail: highRisk && !hasSignOff ? 'Upload at least one sign-off document for High risk assets.' : undefined },
    ];
  }

  if (target === 'Not Used') {
    return [
      { label: 'Asset can be marked Not Used', pass: true },
    ];
  }

  return [];
}

export default function LifecycleTransitionModal({
  isOpen,
  onClose,
  asset,
  targetLifecycle,
  onConfirm,
  notUsedReason = '',
  onNotUsedReasonChange,
}: LifecycleTransitionModalProps) {
  const gates = computeGates(asset, targetLifecycle);
  const allPass = gates.every(g => g.pass);
  const canTransition = allPass && (targetLifecycle !== 'Not Used' || notUsedReason.trim().length > 0);

  const TARGET_COLORS: Record<AssetLifecycle, string> = {
    Proposed: 'bg-blue-50 text-blue-700 border-blue-200',
    Assessed: 'bg-green-50 text-green-700 border-green-200',
    'Not Used': 'bg-gray-100 text-gray-500 border-gray-200',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-sky" />
            <h2 className="text-night font-semibold text-base">Change Lifecycle State</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-earth rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Transition summary */}
          <div className="flex items-center gap-3 justify-center py-2">
            <span className={`px-3 py-1 rounded-full text-xs border ${TARGET_COLORS[asset.lifecycleStage]}`}>
              {asset.lifecycleStage}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className={`px-3 py-1 rounded-full text-xs border ${TARGET_COLORS[targetLifecycle]}`}>
              {targetLifecycle}
            </span>
          </div>

          {/* Gates */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pre-flight checks</p>
            {gates.map((gate, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg ${gate.pass ? 'bg-green-50' : 'bg-red-50'}`}>
                {gate.pass
                  ? <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  : <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                }
                <div>
                  <div className={`text-xs font-medium ${gate.pass ? 'text-green-800' : 'text-red-800'}`}>{gate.label}</div>
                  {gate.detail && <div className="text-xs text-red-600 mt-0.5">{gate.detail}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Not Used reason */}
          {targetLifecycle === 'Not Used' && onNotUsedReasonChange && (
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide mb-1.5 block">
                Reason for marking Not Used <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notUsedReason}
                onChange={e => onNotUsedReasonChange(e.target.value)}
                placeholder="Provide a reason for retiring this asset..."
                rows={3}
                className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none"
              />
              {notUsedReason.trim().length === 0 && (
                <p className="text-xs text-red-400 mt-1">Reason is mandatory.</p>
              )}
            </div>
          )}

          {!allPass && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              One or more checks failed. Resolve the issues above before transitioning.
            </div>
          )}

          {allPass && targetLifecycle === 'Assessed' && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              All checks passed. This transition will be recorded in the Audit Trail.
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canTransition}
            className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Confirm — Move to {targetLifecycle}
          </button>
        </div>
      </div>
    </div>
  );
}
