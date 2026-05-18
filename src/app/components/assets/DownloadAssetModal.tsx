import { useState } from 'react';
import { X, Download, FileText, Image, Film, Music, Package, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { Asset } from '../../types';

interface DownloadAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  isBulk?: boolean;
  bulkCount?: number;
}

type DownloadType = 'original' | 'rendition';
type DownloadStatus = 'idle' | 'generating' | 'ready' | 'async';

const FILE_ICON_MAP: Record<string, JSX.Element> = {
  image: <Image className="w-5 h-5 text-blue-500" />,
  video: <Film className="w-5 h-5 text-purple-500" />,
  audio: <Music className="w-5 h-5 text-green-500" />,
  pdf: <FileText className="w-5 h-5 text-red-500" />,
  document: <FileText className="w-5 h-5 text-gray-500" />,
  placeholder: <Package className="w-5 h-5 text-amber-400" />,
};

export default function DownloadAssetModal({
  isOpen,
  onClose,
  asset,
  isBulk = false,
  bulkCount = 1,
}: DownloadAssetModalProps) {
  const [downloadType, setDownloadType] = useState<DownloadType>('rendition');
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [hasDownloadPermission] = useState(true); // In real app gated by role

  const currentVersion = asset.versions.find(v => v.versionNumber === asset.currentVersionNumber);
  const fileIcon = currentVersion ? (FILE_ICON_MAP[currentVersion.fileType] ?? FILE_ICON_MAP.document) : FILE_ICON_MAP.document;

  const handleClose = () => {
    setDownloadType('rendition');
    setStatus('idle');
    onClose();
  };

  const handleDownload = () => {
    if (downloadType === 'original' && !hasDownloadPermission) return;
    if (isBulk && bulkCount > 50) {
      setStatus('async');
      return;
    }

    setStatus('generating');

    // Simulate pre-signed URL TTL generation (5 min)
    setTimeout(() => {
      setStatus('ready');
      // In real app, trigger browser download via pre-signed URL
      setTimeout(handleClose, 1500);
    }, 1400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-sky" />
            <h2 className="text-night font-semibold text-base">Download Asset</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-earth rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Asset Info */}
        <div className="px-6 py-4 bg-earth border-b border-pebble">
          <div className="flex items-center gap-3">
            {fileIcon}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-night font-medium truncate">{asset.name}</div>
              <div className="text-xs text-gray-500 font-mono">{asset.id} · v{asset.currentVersionNumber}</div>
            </div>
            {isBulk && (
              <span className="text-xs bg-sky/10 text-sky font-medium px-2 py-0.5 rounded-full">
                {bulkCount} files
              </span>
            )}
          </div>
          {asset.isPlaceholder && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              This is a placeholder — no file has been uploaded yet.
            </div>
          )}
        </div>

        {/* Download Type Selection */}
        {!asset.isPlaceholder && status === 'idle' && (
          <div className="px-6 py-5 space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Select format</p>

            {/* Rendition Option */}
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${downloadType === 'rendition' ? 'border-sky bg-pale' : 'border-pebble hover:border-gray-300'
              }`}>
              <input
                type="radio"
                name="dlType"
                value="rendition"
                checked={downloadType === 'rendition'}
                onChange={() => setDownloadType('rendition')}
                className="mt-0.5 accent-sky"
              />
              <div className="flex-1">
                <div className="text-sm text-night font-medium">Rendition Preview</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Web-optimised viewable version. Available to all viewers. No special permission required.
                </div>
              </div>
            </label>

            {/* Original Option */}
            <label className={`flex items-start gap-3 p-3.5 rounded-xl border-2 transition-all ${hasDownloadPermission ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              } ${downloadType === 'original' ? 'border-sky bg-pale' : 'border-pebble hover:border-gray-300'
              }`}>
              <input
                type="radio"
                name="dlType"
                value="original"
                checked={downloadType === 'original'}
                onChange={() => hasDownloadPermission && setDownloadType('original')}
                disabled={!hasDownloadPermission}
                className="mt-0.5 accent-sky"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-night font-medium">Original File</span>
                  {!hasDownloadPermission && (
                    <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded">
                      Restricted
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Full-quality source file. Requires download permission. Action logged in Audit Trail.
                </div>
                {currentVersion && (
                  <div className="text-xs text-gray-400 mt-1">
                    {currentVersion.fileType.toUpperCase()} · {currentVersion.fileSize}
                  </div>
                )}
              </div>
            </label>

            {isBulk && bulkCount > 50 && (
              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Bulk download exceeds 50 files — will trigger async export with email notification.
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1">
              Pre-signed download link expires after 5 minutes.
            </p>
          </div>
        )}

        {/* Generating */}
        {status === 'generating' && (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
            <Loader2 className="w-8 h-8 text-sky animate-spin" />
            <div className="text-sm text-night font-medium">Generating secure download link…</div>
            <div className="text-xs text-gray-400">Pre-signed URL (TTL 5 min) being prepared</div>
          </div>
        )}

        {/* Ready */}
        {status === 'ready' && (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
            <div className="text-sm text-night font-medium">Download started!</div>
            <div className="text-xs text-gray-400">
              {downloadType === 'original' ? 'Download logged in Audit Trail.' : 'Rendition download complete.'}
            </div>
          </div>
        )}

        {/* Async Export */}
        {status === 'async' && (
          <div className="px-6 py-8 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <Download className="w-5 h-5 text-sky" />
            </div>
            <div className="text-sm text-night font-medium">Export queued</div>
            <div className="text-xs text-gray-500 max-w-xs">
              Your {bulkCount}-file bulk export is being prepared. You'll receive an email with the download link when it's ready.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 border border-pebble rounded-lg hover:bg-earth transition-colors"
          >
            {status === 'ready' || status === 'async' ? 'Close' : 'Cancel'}
          </button>
          {status === 'idle' && !asset.isPlaceholder && (
            <button
              onClick={handleDownload}
              disabled={downloadType === 'original' && !hasDownloadPermission}
              className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
