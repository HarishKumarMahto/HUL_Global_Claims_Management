import React, { useState } from 'react';
import {
  ArrowLeft, Download, GitBranch, Trash2, MoreHorizontal,
  FileText, Package, Paperclip, History, MessageSquare,
  Info, AlertTriangle, Clock, User, Archive, ChevronDown
} from 'lucide-react';
import type { DocumentRecord } from './documentsData';
import { isDocumentReadOnly, canCreateNewVersion, evaluateSELifecycle } from './documentsData';
import DocumentVersionModal from './DocumentVersionModal';
import CancelDocumentModal from './CancelDocumentModal';
import { initialProducts } from '../products/productData';

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
  onNavigateToClaim?: (claimId: string) => void;
  onNavigateToAsset?: (assetId: string) => void;
  onNavigateToProduct?: (productId: string) => void;
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
  onNavigateToClaim,
  onNavigateToAsset,
  onNavigateToProduct,
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
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── Workspace Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        {/* Breadcrumb + Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={onClose}
              className="flex items-center gap-1 hover:text-sky transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Documents
            </button>
            <span>/</span>
            <span className="text-night truncate max-w-[300px]">{document.name}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setActionsOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors bg-white shadow-sm font-medium"
              >
                Actions
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {actionsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setActionsOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 min-w-[200px] overflow-hidden">
                    <button className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                      <Download className="w-4 h-4 text-sky" /> Download Original
                    </button>
                    <button className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                      <Download className="w-4 h-4 text-sky" /> Download Rendition (PDF)
                    </button>
                    <button className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors">
                      <Download className="w-4 h-4 text-sky" /> Download with Annotations
                    </button>
                    {canCreateNewVersion(document) && (
                      <>
                        <div className="border-t border-pebble my-1" />
                        <button
                          onClick={() => { setVersionModalOpen(true); setActionsOpen(false); }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors"
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
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-earth transition-colors"
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
                          className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-earth transition-colors"
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
        </div>

        {/* Identity & Metadata Strip */}
        <div className="flex items-start gap-3 mt-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <h2 className="text-night truncate font-bold leading-tight text-lg">{document.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                {document.lifecycleState}
              </span>
              <span className="text-xs text-gray-400 font-mono">v{document.currentVersion}</span>
              {document.versions.length > 1 && (
                <span className="text-xs text-gray-400 font-medium">({document.versions.length} versions)</span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2.5 py-1 bg-sky/10 text-sky border border-sky/20 rounded-full text-xs flex-shrink-0 font-medium">
                {document.documentType}
              </span>
              <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0 font-mono">
                {document.id}
              </span>
              {document.businessGroup && (
                <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                  {document.businessGroup}
                </span>
              )}
              {document.category && (
                <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                  {document.category}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expiry / Warning banners below header strip */}
        {isExpiringSoon && document.lifecycleState === 'In Use' && (
          <div className="mt-3 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 max-w-max">
            <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
            <span className="text-xs text-orange-700 font-medium">Expiring soon — {formatDate(document.validToDate)}</span>
          </div>
        )}
        {document.lifecycleState === 'Expired' && (
          <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-max">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-600 font-medium">This document has expired</span>
          </div>
        )}
      </div>

      {/* ── Main Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Document Details ─────────────────────────── */}
          {activeSection === 'Document Details' && (
            document.documentType === 'Substantiation Evidence' ? (
              <div className="flex flex-col lg:flex-row gap-6 w-full items-stretch">
                {/* Left Panel: Metadata (40% width on large screens) */}
                <div className="lg:w-2/5 flex-shrink-0 bg-white p-6 rounded-xl border border-gray-300 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Substantiation Evidence Details</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Name</p>
                        <p className="text-sm font-semibold text-night">{document.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Description</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{document.description || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Subtype</p>
                        <p className="text-sm text-night">{document.subtype || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Geography</p>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {document.geography.map(geo => (
                            <span key={geo} className="px-2 py-0.5 rounded bg-earth text-night text-xs font-medium">{geo}</span>
                          )) || '—'}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Valid To Date</p>
                        <p className="text-sm text-night">{formatDate(document.validToDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Created By</p>
                        <p className="text-sm text-night">{document.createdBy}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Document Rendition (60% width) */}
                <div className="flex-1 bg-white p-6 rounded-xl border border-gray-300 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Document Rendition</h3>
                    {currentVer ? (
                      <div className="border border-pebble rounded-xl overflow-hidden bg-earth">
                        <div className="aspect-video flex flex-col items-center justify-center p-6 text-center">
                          <FileText className="w-12 h-12 text-sky mb-3" />
                          <p className="text-sm font-semibold text-night mb-1">{currentVer.fileName || document.name}</p>
                          <p className="text-xs text-gray-500">{formatBytes(currentVer.fileSizeBytes)} • {currentVer.fileType?.toUpperCase() || 'PDF'}</p>
                          <span className="mt-3 px-2 py-0.5 bg-sky/10 text-sky text-[10px] rounded font-bold uppercase tracking-wider">Version v{currentVer.versionNumber} Preview</span>
                        </div>
                        <div className="bg-[#F6F7F0] px-4 py-3 border-t border-pebble flex items-center justify-between text-xs text-gray-500">
                          <span>Uploaded by {currentVer.uploadedBy}</span>
                          <span>{formatDate(currentVer.uploadedAt)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-pebble rounded-xl p-12 text-center bg-earth">
                        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">No rendition available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 w-full bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                <h3 className="text-base font-bold text-night border-b border-pebble pb-3">Document Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
                  {[
                    { label: 'Name', value: document.name },
                    { label: 'Document Type', value: document.documentType },
                    { label: 'Version', value: `v${document.currentVersion}` },
                    { label: 'Lifecycle', value: <span className="text-sm font-medium text-gray-700">{document.lifecycleState}</span> },
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
                    { label: 'File Name', value: currentVer?.fileName || '—' },
                    { label: 'File Size', value: formatBytes(currentVer?.fileSizeBytes) },
                    { label: 'File Type', value: currentVer?.fileType || '—' },
                    { label: 'Modified Date', value: formatDate(document.modifiedDate) },
                    document.description && { label: 'Description', value: document.description },
                  ].filter(Boolean).map((field: any) => (
                    <div key={field.label} className={field.label === 'Description' ? 'col-span-full' : ''}>
                      <p className="text-xs text-gray-400 font-medium mb-1">{field.label}</p>
                      <p className="text-sm text-night">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
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
                <div className="rounded-xl border border-pebble overflow-hidden bg-white">
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
                          <tr key={id} onClick={() => onNavigateToClaim?.(id)} className="hover:bg-earth/50 cursor-pointer transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-sky">{id}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">{claim?.versions?.[claim.currentVersion]?.globalStatement?.slice(0, 80) || '—'}…</td>
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
                <div className="rounded-xl border border-pebble overflow-hidden bg-white">
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
                          <tr key={id} onClick={() => onNavigateToAsset?.(id)} className="hover:bg-earth/50 cursor-pointer transition-colors">
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
          {activeSection === 'Related Products' && (() => {
            const productsMap = new Map<string, typeof initialProducts[0]>();

            // 1. Directly linked product IDs
            const directIds = [...(document.relatedProductIds || []), ...(document.linkedProductIds || [])];
            directIds.forEach(id => {
              const prod = initialProducts.find(p => p.id === id || p.productId === id);
              if (prod) productsMap.set(prod.id, prod);
            });

            // 2. Products from related claims
            const relatedClaimIds = document.linkedClaimIds || [];
            relatedClaimIds.forEach(claimId => {
              const claim = allClaims.find(c => c.id === claimId);
              if (claim && claim.productId) {
                const prod = initialProducts.find(p => p.id === claim.productId || p.productId === claim.productId);
                if (prod) productsMap.set(prod.id, prod);
              }
            });

            // 3. Products from related assets (derived through asset claims)
            const relatedAssetIds = document.linkedAssetIds || [];
            relatedAssetIds.forEach(assetId => {
              const asset = allAssets.find(a => a.id === assetId);
              if (asset) {
                const assetClaimIds = asset.linkedClaimIds || asset.whereUsed?.claimIds || [];
                assetClaimIds.forEach((claimId: string) => {
                  const claim = allClaims.find(c => c.id === claimId);
                  if (claim && claim.productId) {
                    const prod = initialProducts.find(p => p.id === claim.productId || p.productId === claim.productId);
                    if (prod) productsMap.set(prod.id, prod);
                  }
                });
              }
            });

            const derivedProducts = Array.from(productsMap.values());

            return (
              <div>
                <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Related Products</h3>
                {derivedProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No related products</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-pebble overflow-hidden bg-white">
                    <table className="w-full text-sm">
                      <thead className="bg-[#F6F7F0]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Product ID</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Brand</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Lifecycle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-pebble">
                        {derivedProducts.map(prod => (
                          <tr
                            key={prod.id}
                            onClick={() => onNavigateToProduct?.(prod.id)}
                            className="hover:bg-earth/50 cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-xs text-sky">{prod.productId}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 font-medium">{prod.name}</td>
                            <td className="px-4 py-3 text-xs text-gray-600">{prod.brand}</td>
                            <td className="px-4 py-3 text-xs text-gray-400">{prod.type}</td>
                            <td className="px-4 py-3 text-xs">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                                {prod.lifecycleState}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

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
                          <span className="text-sm font-medium text-gray-700">{v.lifecycleState}</span>
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
