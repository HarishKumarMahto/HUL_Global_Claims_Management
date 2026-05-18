import { useState } from 'react';
import { X, Edit3, AlertCircle } from 'lucide-react';
import type { Asset, AssetSubtype } from '../../types';

interface ReclassifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onReclassify: (assetId: string, newSubtype: AssetSubtype) => void;
}

const SUBTYPES: AssetSubtype[] = [
  'TV Commercial', 'Digital Banner', 'Print Ad', 'Packaging Artwork',
  'Product Video', 'Social Media Kit', 'Audio Ad', 'In-Store Display',
  'Email Template', 'Brochure'
];

export default function ReclassifyModal({
  isOpen,
  onClose,
  asset,
  onReclassify
}: ReclassifyModalProps) {
  const [selectedSubtype, setSelectedSubtype] = useState<AssetSubtype | null>(asset.subtype);
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!selectedSubtype) return;

    onReclassify(asset.id, selectedSubtype);
    handleClose();
  };

  const handleClose = () => {
    setSelectedSubtype(asset.subtype);
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={handleClose}></div>

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl" style={{ border: '1px solid #DEDED7' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pale flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-xl" style={{ fontWeight: 600 }}>Reclassify Asset</h2>
              <p className="text-sm text-gray-500 mt-0.5">Change the subtype classification</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {/* Current Asset Info */}
          <div className="bg-earth rounded-lg p-4 border border-pebble">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Current Asset</div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-night font-medium mb-1">{asset.name}</div>
                <div className="text-xs text-gray-500 font-mono">{asset.id}</div>
              </div>
              {asset.subtype && (
                <span className="px-2.5 py-0.5 rounded-full text-xs bg-white text-gray-600 border border-pebble">
                  Current: {asset.subtype}
                </span>
              )}
            </div>
          </div>

          {/* New Subtype Selection */}
          <div>
            <label className="block text-sm text-night mb-3" style={{ fontWeight: 600 }}>
              Select New Subtype <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUBTYPES.map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedSubtype(st)}
                  className={`px-3 py-2.5 rounded-lg border text-sm text-left transition-colors ${selectedSubtype === st
                      ? 'border-sky bg-pale text-sky font-semibold'
                      : st === asset.subtype
                        ? 'border-pebble text-gray-400 bg-gray-50'
                        : 'border-pebble text-gray-600 hover:border-sky/50'
                    }`}
                  disabled={st === asset.subtype}
                >
                  {st}
                  {st === asset.subtype && <span className="text-xs ml-2">(Current)</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Reason (optional) */}
          <div>
            <label className="block text-sm text-night mb-2" style={{ fontWeight: 600 }}>
              Reason for Reclassification
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe why this asset is being reclassified..."
              rows={3}
              className="w-full px-4 py-2.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky resize-none"
            />
          </div>

          {/* Info Notice */}
          {selectedSubtype && selectedSubtype !== asset.subtype && (
            <div className="bg-pale/30 border border-sky/20 rounded-lg p-3 flex gap-3">
              <div className="text-sky flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs text-sky/90">
                Reclassifying this asset may require re-evaluation of risk assessments and linked claims.
                This action will be logged in the audit trail.
              </div>
            </div>
          )}
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
            onClick={handleSubmit}
            disabled={!selectedSubtype || selectedSubtype === asset.subtype}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-colors ${selectedSubtype && selectedSubtype !== asset.subtype
                ? 'bg-sky text-white hover:bg-dark'
                : 'bg-earth text-gray-400 cursor-not-allowed'
              }`}
          >
            <Edit3 className="w-4 h-4" />
            Reclassify Asset
          </button>
        </div>
      </div>
    </div>
  );
}
