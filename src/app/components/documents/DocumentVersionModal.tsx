import React, { useState } from 'react';
import { X, GitBranch, AlertCircle } from 'lucide-react';
import type { DocumentRecord, DocumentVersion } from './documentsData';
import { incrementVersion, canCreateNewVersion } from './documentsData';
import { CURRENT_USER } from '../../types';

interface DocumentVersionModalProps {
  isOpen: boolean;
  document: DocumentRecord;
  onClose: () => void;
  onConfirm: (updatedOriginal: DocumentRecord, newDoc: DocumentRecord) => void;
}

export default function DocumentVersionModal({
  isOpen, document, onClose, onConfirm,
}: DocumentVersionModalProps) {
  const proposed = incrementVersion(document.currentVersion);
  const [newVersion, setNewVersion] = useState(proposed);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateVersion = (v: string): string => {
    const parts = v.split('.');
    if (parts.length !== 2 || isNaN(Number(parts[0])) || isNaN(Number(parts[1]))) {
      return 'Version must be in format X.Y (e.g. 0.2)';
    }
    const [curMaj, curMin] = document.currentVersion.split('.').map(Number);
    const [newMaj, newMin] = v.split('.').map(Number);
    if (newMaj < curMaj || (newMaj === curMaj && newMin <= curMin)) {
      return `Version must be greater than current (${document.currentVersion})`;
    }
    return '';
  };

  const handleConfirm = () => {
    const err = validateVersion(newVersion);
    if (err) { setError(err); return; }

    const now = new Date().toISOString();

    // Mark previous version as Obsolete (Formulation) or keep (SE)
    const updatedOriginalVersions: DocumentVersion[] = document.versions.map(v =>
      v.versionNumber === document.currentVersion
        ? {
            ...v,
            lifecycleState: document.documentType === 'Formulation Document' ? 'Obsolete' : v.lifecycleState,
          }
        : v
    );

    const updatedOriginal: DocumentRecord = {
      ...document,
      versions: updatedOriginalVersions,
    };

    const newVersionRecord: DocumentVersion = {
      versionNumber: newVersion,
      versionedFrom: document.currentVersion,
      lifecycleState: document.documentType === 'Formulation Document' ? 'Created' : 'Draft',
      uploadedAt: now,
      uploadedBy: CURRENT_USER,
      fileName: undefined, // user will upload in separate step
    };

    const newDoc: DocumentRecord = {
      ...document,
      id: `${document.id}-v${newVersion.replace('.', '')}`,
      currentVersion: newVersion,
      versions: [newVersionRecord],
      lifecycleState: document.documentType === 'Formulation Document' ? 'Created' : 'Draft',
      createdDate: now,
      modifiedDate: now,
      createdBy: CURRENT_USER,
      linkedClaimIds: [], // relationships reset for new version
      linkedAssetIds: [],
      linkedProductIds: [],
      relatedProductIds: [],
      linkedProjectIds: document.linkedProjectIds, // Project docs keep project links
      comments: [],
    };

    onConfirm(updatedOriginal, newDoc);
  };

  if (!canCreateNewVersion(document)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky/10 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-sky" />
            </div>
            <div>
              <h2 className="text-base font-bold text-night">Create New Version</h2>
              <p className="text-xs text-gray-400">Current: v{document.currentVersion}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-xl transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">
            A new version of <strong className="text-night">{document.name}</strong> will be created.
            {document.documentType === 'Formulation Document' && (
              <span className="text-amber-600"> The current version will be marked as <strong>Obsolete</strong>.</span>
            )}
            {document.documentType === 'Substantiation Evidence' && (
              <span className="text-gray-500"> The new version will start in <strong>Draft</strong> state — no relationships are copied.</span>
            )}
          </p>

          <div>
            <label className="block text-xs font-bold text-night mb-1.5">New Version Number</label>
            <input
              value={newVersion}
              onChange={e => { setNewVersion(e.target.value); setError(''); }}
              className={`w-full px-3 py-2.5 border rounded-xl text-sm font-mono focus:ring-2 focus:ring-sky outline-none ${error ? 'border-red-400' : 'border-pebble'}`}
              placeholder="e.g. 0.2"
            />
            {error && (
              <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500">
                <AlertCircle className="w-3.5 h-3.5" />{error}
              </p>
            )}
          </div>

          {/* Summary box */}
          <div className="bg-earth rounded-xl p-4 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-400">Document</span>
              <span className="font-medium text-night truncate ml-2 max-w-[200px]">{document.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span>{document.documentType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">From version</span>
              <span className="font-mono">v{document.currentVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">New version</span>
              <span className="font-mono text-sky font-bold">v{newVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Initial state</span>
              <span>{document.documentType === 'Formulation Document' ? 'Created' : 'Draft'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-earth rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 text-sm font-bold text-white bg-sky hover:bg-dark rounded-xl shadow-sm transition-all active:scale-95"
          >
            Create Version v{newVersion}
          </button>
        </div>
      </div>
    </div>
  );
}
