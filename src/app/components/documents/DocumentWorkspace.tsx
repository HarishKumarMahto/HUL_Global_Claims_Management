import React, { useState } from 'react';
import {
  ArrowLeft, Download, GitBranch, Trash2, MoreHorizontal,
  FileText, Package, Paperclip, History, MessageSquare,
  Info, AlertTriangle, Clock, User, Archive
} from 'lucide-react';
import type { DocumentRecord } from './documentsData';
import { isDocumentReadOnly, canCreateNewVersion, evaluateSELifecycle } from './documentsData';
import DocumentLifecycleBadge from './DocumentLifecycleBadge';
import DocumentVersionModal from './DocumentVersionModal';
import CancelDocumentModal from './CancelDocumentModal';

interface DocumentWorkspaceProps {
  document: DocumentRecord;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose: () => void;
  onDocumentChange: (doc: DocumentRecord) => void;
  onNewDocumentCreated?: (doc: DocumentRecord) => void;
  allClaims?: any[];
  allAssets?: any[];
  allDocuments?: DocumentRecord[];
}

const SECTIONS = [
  { id: 'Document Details', icon: <Info className="w-4 h-4" /> },
  { id: 'Related Claims',   icon: <FileText className="w-4 h-4" /> },
  { id: 'Related Assets',   icon: <Paperclip className="w-4 h-4" /> },
  { id: 'Related Products', icon: <Package className="w-4 h-4" /> },
  { id: 'Version History',  icon: <History className="w-4 h-4" /> },
  { id: 'Comments',         icon: <MessageSquare className="w-4 h-4" /> },
];

function formatDate(d?: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatBytes(b?: number) {
  if (!b) return '—';
  return b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;
}

const TYPE_COLOR: Record<string, string> = {
  'Substantiation Evidence': 'text-sky-700 bg-sky-50',
  'Formulation Document':    'text-violet-700 bg-violet-50',
  'Project Document':        'text-amber-700 bg-amber-50',
};

export default function DocumentWorkspace({
  document,
  activeSection,
  onSectionChange,
  onClose,
  onDocumentChange,
  onNewDocumentCreated,
  allClaims = [],
  allAssets = [],
  allDocuments = [],
}: DocumentWorkspaceProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const readOnly = isDocumentReadOnly(document);
  const currentVer = document.versions.find(v => v.versionNumber === document.currentVersion);
  const isExpiringSoon = document.validToDate
    ? (new Date(document.validToDate).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000
    : false;

  const handleAddComment = () => {
    if (!newComment.trim() || readOnly) return;
    const updated: DocumentRecord = {
      ...document,
      comments: [
        ...document.comments,
        { id: `c-${Date.now()}`, author: 'Sarah Johnson', content: newComment.trim(), timestamp: new Date().toISOString() },
      ],
      modifiedDate: new Date().toISOString(),
    };
    onDocumentChange(updated);
    setNewComment('');
  };

  return (
    <div className="flex h-full overflow-hidden bg-[#F6F7F0]">
      {/* ── Left Panel ─────────────────────────────────────────────── */}
      <div className="w-[340px] flex-shrink-0 bg-white border-r border-pebble flex flex-col overflow-hidden">
        {/* Back button */}
        <div className="px-4 py-3 border-b border-pebble flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-night transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Library
          </button>
        </div>

        {/* Doc header */}
        <div className="px-5 py-4 border-b border-pebble flex-shrink-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_COLOR[document.documentType] ?? 'text-gray-600 bg-gray-100'}`}>
                {document.documentType}
              </span>
              <h2 className="text-base font-bold text-night mt-2 leading-tight">{document.name}</h2>
              <p className="text-xs text-gray-400 mt-1">{document.id}</p>
            </div>
            {/* Actions menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setActionsOpen(o => !o)}
                className="p-2 hover:bg-earth rounded-xl transition-colors text-gray-400 hover:text-night"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {actionsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setActionsOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 min-w-[200px] overflow-hidden">
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth">
                      <Download className="w-4 h-4 text-sky" /> Download Original
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth">
                      <Download className="w-4 h-4 text-sky" /> Download Rendition (PDF)
                    </button>
                    <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth">
                      <Download className="w-4 h-4 text-sky" /> Download with Annotations
                    </button>
                    {canCreateNewVersion(document) && (
                      <>
                        <div className="border-t border-pebble my-1" />
                        <button
                          onClick={() => { setVersionModalOpen(true); setActionsOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth"
                        >
                          <GitBranch className="w-4 h-4 text-sky" /> Create New Version
                        </button>
                      </>
                    )}
                    {!readOnly && (
                      <>
                        <div className="border-t border-pebble my-1" />
                        <button
                          onClick={() => { setCancelModalOpen(true); setActionsOpen(false); }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-earth"
                        >
                          <Trash2 className="w-4 h-4" /> Cancel Document
                        </button>
                      </>
                    )}
                    {document.lifecycleState === 'Cancelled' && !document.isArchived && (
                      <>
                        <div className="border-t border-pebble my-1" />
                        <button
                          onClick={() => {
                            onDocumentChange({ ...document, isArchived: true, archivedDate: new Date().toISOString() });
                            setActionsOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-earth"
                        >
                          <Archive className="w-4 h-4" /> Archive Document
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Lifecycle badge + version */}
          <div className="flex items-center gap-2 flex-wrap">
            <DocumentLifecycleBadge state={document.lifecycleState} />
            <span className="text-xs text-gray-400 font-mono">v{document.currentVersion}</span>
            {document.versions.length > 1 && (
              <span className="text-xs text-gray-400">({document.versions.length} versions)</span>
            )}
          </div>

          {/* Expiry warning */}
          {isExpiringSoon && document.lifecycleState === 'In Use' && (
            <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <span className="text-xs text-orange-700 font-medium">Expiring soon — {formatDate(document.validToDate)}</span>
            </div>
          )}
          {document.lifecycleState === 'Expired' && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-xs text-red-600 font-medium">This document has expired</span>
            </div>
          )}
        </div>

        {/* Section navigation */}
        <nav className="p-3 flex-shrink-0 border-b border-pebble">
          <div className="space-y-0.5">
            {SECTIONS
              .filter(s => {
                // Hide Related Claims/Assets for Project Docs; hide Related Products for Project Docs
                if (document.documentType === 'Project Document') {
                  return !['Related Claims', 'Related Assets', 'Related Products'].includes(s.id);
                }
                return true;
              })
              .map(s => {
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onSectionChange(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      isActive ? 'bg-pale text-sky' : 'text-gray-600 hover:bg-earth hover:text-night'
                    }`}
                  >
                    <span className={isActive ? 'text-sky' : 'text-gray-400'}>{s.icon}</span>
                    <span className="flex-1 text-left" style={{ fontWeight: isActive ? 500 : 400 }}>{s.id}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-sky flex-shrink-0" />}
                  </button>
                );
              })}
          </div>
        </nav>

        {/* File info */}
        <div className="px-5 py-4 mt-auto border-t border-pebble flex-shrink-0 bg-[#F6F7F0]/50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">File Info</p>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">File</span><span className="text-night font-medium truncate ml-2 max-w-[160px]">{currentVer?.fileName || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Size</span><span className="text-night">{formatBytes(currentVer?.fileSizeBytes)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="text-night">{currentVer?.fileType || '—'}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Created</span><span className="text-night">{formatDate(document.createdDate)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Modified</span><span className="text-night">{formatDate(document.modifiedDate)}</span></div>
          </div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Document Details ─────────────────────────── */}
          {activeSection === 'Document Details' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-base font-bold text-night border-b border-pebble pb-3">Document Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Name', value: document.name },
                  { label: 'Document Type', value: document.documentType },
                  { label: 'Version', value: `v${document.currentVersion}` },
                  { label: 'Lifecycle', value: <DocumentLifecycleBadge state={document.lifecycleState} size="sm" /> },
                  document.subtype && { label: 'Subtype', value: document.subtype },
                  document.cucSpecNumber && { label: 'CUC Spec No.', value: document.cucSpecNumber },
                  document.documentNumber && { label: 'Document No.', value: document.documentNumber },
                  document.businessGroup && { label: 'Business Group', value: document.businessGroup },
                  document.category && { label: 'Category', value: document.category },
                  document.brand && { label: 'Brand', value: document.brand },
                  { label: 'Created By', value: document.createdBy },
                  { label: 'Created Date', value: formatDate(document.createdDate) },
                  { label: 'Valid To', value: document.validToDate ? formatDate(document.validToDate) : '—' },
                  { label: 'Geography', value: document.geography.join(', ') || '—' },
                  document.description && { label: 'Description', value: document.description },
                ].filter(Boolean).map((field: any) => (
                  <div key={field.label} className={field.label === 'Description' ? 'col-span-2' : ''}>
                    <p className="text-xs text-gray-400 font-medium mb-1">{field.label}</p>
                    <p className="text-sm text-night">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Related Claims ───────────────────────────── */}
          {activeSection === 'Related Claims' && (
            <div>
              <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Related Claims</h3>
              {(document.linkedClaimIds || []).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No related claims</p>
                </div>
              ) : (
                <div className="rounded-xl border border-pebble overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F6F7F0]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Claim ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Statement</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pebble">
                      {(document.linkedClaimIds || []).map(id => {
                        const claim = allClaims.find((c: any) => c.id === id);
                        return (
                          <tr key={id} className="hover:bg-earth/50 cursor-pointer">
                            <td className="px-4 py-3 font-mono text-xs text-sky">{id}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">{claim?.versions?.[claim.currentVersion]?.globalStatement?.slice(0, 60) || '—'}…</td>
                            <td className="px-4 py-3 text-xs text-gray-400">{claim?.claimType || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Related Assets ───────────────────────────── */}
          {activeSection === 'Related Assets' && (
            <div>
              <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Related Assets</h3>
              {(document.linkedAssetIds || []).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Paperclip className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No related assets</p>
                </div>
              ) : (
                <div className="rounded-xl border border-pebble overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F6F7F0]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Asset ID</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Lifecycle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-pebble">
                      {(document.linkedAssetIds || []).map(id => {
                        const asset = allAssets.find((a: any) => a.id === id);
                        return (
                          <tr key={id} className="hover:bg-earth/50 cursor-pointer">
                            <td className="px-4 py-3 font-mono text-xs text-sky">{id}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">{asset?.name || '—'}</td>
                            <td className="px-4 py-3 text-xs text-gray-400">{asset?.lifecycleStage || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Related Products ─────────────────────────── */}
          {activeSection === 'Related Products' && (
            <div>
              <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Related Products</h3>
              {(document.relatedProductIds || document.linkedProductIds || []).length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No related products</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...(document.relatedProductIds || []), ...(document.linkedProductIds || [])].filter((v, i, a) => a.indexOf(v) === i).map(id => (
                    <div key={id} className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-pebble hover:border-sky cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-night">{id}</span>
                        {(document.relatedProductIds || []).includes(id) && (
                          <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">System</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Version History ──────────────────────────── */}
          {activeSection === 'Version History' && (
            <div>
              <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Version History</h3>
              <div className="space-y-3">
                {[...document.versions].reverse().map(v => (
                  <div key={v.versionNumber} className={`flex items-start justify-between p-4 rounded-xl border ${v.versionNumber === document.currentVersion ? 'border-sky bg-pale' : 'border-pebble bg-white'}`}>
                    <div className="flex items-start gap-3">
                      <span className={`font-mono text-sm font-bold ${v.versionNumber === document.currentVersion ? 'text-sky' : 'text-night'}`}>
                        v{v.versionNumber}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <DocumentLifecycleBadge state={v.lifecycleState} size="sm" />
                          {v.versionedFrom && (
                            <span className="text-[10px] text-gray-400">versioned from v{v.versionedFrom}</span>
                          )}
                          {v.versionNumber === document.currentVersion && (
                            <span className="text-[10px] bg-sky text-white px-1.5 py-0.5 rounded-full font-bold">Current</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" />{v.uploadedBy}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(v.uploadedAt)}</span>
                        </div>
                        {v.fileName && <p className="text-xs text-gray-500 mt-1">{v.fileName}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Comments ─────────────────────────────────── */}
          {activeSection === 'Comments' && (
            <div>
              <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">
                Comments ({document.comments.length})
              </h3>
              <div className="space-y-3 mb-6">
                {document.comments.length === 0 && (
                  <div className="text-center py-10 text-gray-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No comments yet</p>
                  </div>
                )}
                {document.comments.map(c => (
                  <div key={c.id} className="bg-white border border-pebble rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-sky/20 text-sky text-[9px] font-bold flex items-center justify-center">
                        {c.author.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="text-xs font-semibold text-night">{c.author}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{formatDate(c.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{c.content}</p>
                  </div>
                ))}
              </div>
              {/* Add comment */}
              {!readOnly && (
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    rows={3}
                    placeholder="Add a comment…"
                    className="flex-1 px-3 py-2 border border-pebble rounded-xl text-sm focus:ring-2 focus:ring-sky outline-none resize-none"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-sky text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-dark transition-colors self-end"
                  >
                    Post
                  </button>
                </div>
              )}
              {readOnly && (
                <p className="text-xs text-gray-400 italic text-center mt-4">Comments are read-only for {document.lifecycleState} documents.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      <DocumentVersionModal
        isOpen={versionModalOpen}
        document={document}
        onClose={() => setVersionModalOpen(false)}
        onConfirm={(updatedOriginal, newDoc) => {
          onDocumentChange(updatedOriginal);
          onNewDocumentCreated?.(newDoc);
          setVersionModalOpen(false);
        }}
      />
      <CancelDocumentModal
        isOpen={cancelModalOpen}
        document={document}
        allDocuments={allDocuments}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={(updatedDoc) => {
          onDocumentChange(updatedDoc);
          setCancelModalOpen(false);
        }}
      />
    </div>
  );
}
