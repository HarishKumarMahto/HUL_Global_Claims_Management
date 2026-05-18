import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import type { Asset } from '../../types';

interface DeleteAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onDelete: (assetId: string) => void;
}

export default function DeleteAssetModal({
  isOpen,
  onClose,
  asset,
  onDelete
}: DeleteAssetModalProps) {
  const [confirmText, setConfirmText] = useState('');

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  const handleDelete = () => {
    if (confirmText !== asset.name) return;
    onDelete(asset.id);
    handleClose();
  };

  if (!isOpen) return null;

  const hasLinkedData = asset.linkedClaimIds.length > 0 ||
    asset.linkedProjectIds.length > 0 ||
    asset.relatedAssetIds.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={handleClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg" style={{ border: '1px solid #DEDED7' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-night text-xl" style={{ fontWeight: 600 }}>Delete Asset</h2>
              <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Asset Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-xs text-red-600 uppercase tracking-wide mb-2">Asset to Delete</div>
            <div>
              <div className="text-sm text-night font-medium mb-1">{asset.name}</div>
              <div className="text-xs text-gray-600 font-mono">{asset.id}</div>
              <div className="text-xs text-gray-500 mt-2">
                {asset.versions.length} version{asset.versions.length !== 1 ? 's' : ''} •
                Created {new Date(asset.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Warning if linked */}
          {hasLinkedData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-amber-900 mb-1">Warning: This asset has dependencies</div>
                <ul className="text-xs text-amber-700 space-y-1">
                  {asset.linkedClaimIds.length > 0 && (
                    <li>• Linked to {asset.linkedClaimIds.length} claim{asset.linkedClaimIds.length !== 1 ? 's' : ''}</li>
                  )}
                  {asset.linkedProjectIds.length > 0 && (
                    <li>• Used in {asset.linkedProjectIds.length} project{asset.linkedProjectIds.length !== 1 ? 's' : ''}</li>
                  )}
                  {asset.relatedAssetIds.length > 0 && (
                    <li>• Related to {asset.relatedAssetIds.length} other asset{asset.relatedAssetIds.length !== 1 ? 's' : ''}</li>
                  )}
                </ul>
                <p className="text-xs text-amber-600 mt-2">These relationships will be removed when you delete this asset.</p>
              </div>
            </div>
          )}

          {/* Confirmation */}
          <div>
            <label className="block text-sm text-night mb-2" style={{ fontWeight: 600 }}>
              Type the asset name to confirm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={asset.name}
              className="w-full px-4 py-2.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Please type <span className="font-mono font-semibold">{asset.name}</span> to confirm deletion
            </p>
          </div>

          {/* Final Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
            <div className="text-red-500 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xs text-red-700">
              <strong>This action is permanent.</strong> All versions, comments, anchors, and audit history for this asset will be deleted.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-night transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={confirmText !== asset.name}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-colors ${confirmText === asset.name
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-earth text-gray-400 cursor-not-allowed'
              }`}
          >
            <Trash2 className="w-4 h-4" />
            Delete Asset Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
