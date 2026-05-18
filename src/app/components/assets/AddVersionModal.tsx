import { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import type { Asset, AssetVersion } from '../../types';

interface AddVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onAddVersion: (assetId: string, version: AssetVersion) => void;
}

export default function AddVersionModal({
  isOpen,
  onClose,
  asset,
  onAddVersion
}: AddVersionModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [versionNotes, setVersionNotes] = useState('');

  const handleClose = () => {
    setUploadedFile(null);
    setDragActive(false);
    setVersionNotes('');
    onClose();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!uploadedFile) return;

    // Calculate next version number
    const currentVersionParts = asset.currentVersionNumber.split('.');
    const major = parseInt(currentVersionParts[0]);
    const minor = parseInt(currentVersionParts[1] || '0');
    const nextVersion = `${major}.${minor + 1}`;

    const now = new Date().toISOString();
    const newVersion: AssetVersion = {
      versionNumber: nextVersion,
      fileType: uploadedFile.type.startsWith('image/') ? 'image' :
        uploadedFile.type.startsWith('video/') ? 'video' :
          uploadedFile.type.startsWith('audio/') ? 'audio' :
            uploadedFile.type === 'application/pdf' ? 'pdf' : 'docx',
      fileSizeMB: Number((uploadedFile.size / 1024 / 1024).toFixed(2)),
      uploadedAt: now,
      uploadedBy: 'Current User',
      versionNotes: versionNotes.trim() || undefined,
      riskRecords: [],
      finalRisk: {
        finalRiskLevel: null,
        marketingRiskSignoff: false,
      },
    };

    onAddVersion(asset.id, newVersion);
    handleClose();
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
              <Upload className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="text-night text-xl" style={{ fontWeight: 600 }}>Add New Version</h2>
              <p className="text-sm text-gray-500 mt-0.5">Upload a new version of this asset</p>
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
                <div className="text-xs text-gray-500">Current Version: {asset.currentVersionNumber}</div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-white text-gray-600 border border-pebble">
                {asset.versions.length} version{asset.versions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm text-night mb-2" style={{ fontWeight: 600 }}>
              New Version File <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-sky bg-pale/30' : 'border-pebble'
                }`}
            >
              {uploadedFile ? (
                <div className="flex items-center justify-between p-3 bg-earth rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-sky" />
                    <div className="text-left">
                      <div className="text-sm text-night font-medium">{uploadedFile.name}</div>
                      <div className="text-xs text-gray-500">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setUploadedFile(null)}
                    className="p-1 hover:bg-pebble rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-night mb-1">Drag and drop your file here, or</p>
                  <label className="inline-block">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileInput}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    />
                    <span className="text-sm text-sky hover:underline cursor-pointer">browse to upload</span>
                  </label>
                  <p className="text-xs text-gray-400 mt-2">Supported: Images, Videos, Audio, PDF, DOCX</p>
                </>
              )}
            </div>
          </div>

          {/* Version Notes */}
          <div>
            <label className="block text-sm text-night mb-2" style={{ fontWeight: 600 }}>
              Version Notes
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <textarea
              value={versionNotes}
              onChange={e => setVersionNotes(e.target.value)}
              placeholder="Describe what changed in this version..."
              rows={3}
              className="w-full px-4 py-2.5 border border-pebble rounded-lg text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky resize-none"
            />
          </div>

          {/* Info Notice */}
          {uploadedFile && (
            <div className="bg-pale/30 border border-sky/20 rounded-lg p-3 flex gap-3">
              <div className="text-sky flex-shrink-0 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="text-xs text-sky/90">
                The new version will be set as the current version. Previous versions will remain accessible in the version history.
                Risk assessments must be completed for the new version.
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
            disabled={!uploadedFile}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm transition-colors ${uploadedFile
                ? 'bg-sky text-white hover:bg-dark'
                : 'bg-earth text-gray-400 cursor-not-allowed'
              }`}
          >
            <Upload className="w-4 h-4" />
            Add Version
          </button>
        </div>
      </div>
    </div>
  );
}
