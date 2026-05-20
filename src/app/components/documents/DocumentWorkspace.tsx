import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft, Download, GitBranch, Trash2,
  FileText, Package, Paperclip, History, MessageSquare,
  Info, AlertTriangle, Clock, User, Archive, ChevronDown,
  ZoomIn, ZoomOut, Maximize2, MessageCircle, Link2, Anchor, X,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import type { DocumentRecord } from './documentsData';
import { isDocumentReadOnly, canCreateNewVersion } from './documentsData';
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
  onDocumentSelect?: (doc: DocumentRecord) => void;
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
  onDocumentSelect,
}: DocumentWorkspaceProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const readOnly = isDocumentReadOnly(document);
  const currentVer = document.versions.find(v => v.versionNumber === document.currentVersion);

  const currentIndex = allDocuments && document ? allDocuments.findIndex(doc => doc.id === document.id) : -1;
  const totalDocuments = allDocuments ? allDocuments.length : 0;

  const handlePrev = () => {
    if (currentIndex > 0 && onDocumentSelect && allDocuments) {
      onDocumentSelect(allDocuments[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < totalDocuments - 1 && onDocumentSelect && allDocuments) {
      onDocumentSelect(allDocuments[currentIndex + 1]);
    }
  };
  const isExpiringSoon = document.validToDate
    ? (new Date(document.validToDate).getTime() - Date.now()) < 30 * 24 * 60 * 60 * 1000
    : false;

  // Rendition viewer state
  const [zoom, setZoom] = useState(100);
  const renditionRef = useRef<HTMLDivElement>(null);

  // Drag-select state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragRect, setDragRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectionPopup, setSelectionPopup] = useState<{ x: number; y: number } | null>(null);

  // Action modals
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState('');
  const [anchorModalOpen, setAnchorModalOpen] = useState(false);
  const [anchorName, setAnchorName] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Infinite scroll refs (matches ProjectWorkspace pattern)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to section when nav item clicked
  useEffect(() => {
    if (isNavigatingRef.current) return;
    const el = sectionRefs.current[activeSection];
    if (el) {
      isNavigatingRef.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    }
  }, [activeSection]);

  const handleScrollLeft = (e: React.UIEvent<HTMLDivElement>) => {
    if (isNavigatingRef.current) return;
    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const triggerLine = containerRect.top + containerRect.height * 0.3;
    for (const sec of SECTIONS) {
      const el = sectionRefs.current[sec.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerLine && rect.bottom > triggerLine) {
          if (activeSection !== sec.id) onSectionChange(sec.id);
          break;
        }
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

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

  // Drag handlers on rendition canvas
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!renditionRef.current) return;
    setSelectionPopup(null);
    setDragRect(null);
    const rect = renditionRef.current.getBoundingClientRect();
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !renditionRef.current) return;
    const rect = renditionRef.current.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setDragRect({
      x: Math.min(dragStart.x, cx),
      y: Math.min(dragStart.y, cy),
      w: Math.abs(cx - dragStart.x),
      h: Math.abs(cy - dragStart.y),
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragRect && dragRect.w > 10 && dragRect.h > 10) {
      setSelectionPopup({ x: e.clientX, y: e.clientY });
    } else {
      setDragRect(null);
    }
  }, [isDragging, dragRect]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-transparent">
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
            {/* Record navigation */}
            {allDocuments && allDocuments.length > 0 && (
              <div className="flex items-center border border-pebble rounded-lg overflow-hidden bg-white shadow-sm mr-1">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-r border-pebble"
                  title="Previous Document"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <span className="px-2.5 text-xs text-gray-500 font-medium">
                  {currentIndex + 1} / {totalDocuments}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentIndex < 0 || currentIndex >= totalDocuments - 1}
                  className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-l border-pebble"
                  title="Next Document"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}

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
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* ── LEFT: Infinite scroll content ── */}
        <div
          className="flex-1 overflow-y-auto min-w-0 snap-y snap-proximity scroll-smooth no-scrollbar md:max-w-[45%] lg:max-w-[42%]"
          onScroll={handleScrollLeft}
        >
          {SECTIONS.map((sec) => {
            /* ── Per-section content ──────────────────────── */
            let content: React.ReactNode = null;

            if (sec.id === 'Document Details') {
              content = document.documentType === 'Substantiation Evidence' ? (
                <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                  <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Substantiation Evidence Details</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Name', value: document.name },
                      { label: 'Description', value: document.description || '—' },
                      { label: 'Subtype', value: document.subtype || '—' },
                      { label: 'Valid To Date', value: formatDate(document.validToDate) },
                      { label: 'Created By', value: document.createdBy },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">{f.label}</p>
                        <p className="text-sm text-night">{f.value}</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Geography</p>
                      <div className="flex flex-wrap gap-1.5">{document.geography.map(g => <span key={g} className="px-2 py-0.5 rounded bg-earth text-night text-xs font-medium">{g}</span>)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
                  <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Document Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                    {[
                      { label: 'Name', value: document.name },
                      { label: 'Document Type', value: document.documentType },
                      { label: 'Version', value: `v${document.currentVersion}` },
                      { label: 'Lifecycle', value: document.lifecycleState },
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
              );
            }

            if (sec.id === 'Related Claims') {
              content = (
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
              );
            }

            if (sec.id === 'Related Assets') {
              content = (
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
              );
            }

            if (sec.id === 'Related Products') {
              const productsMap = new Map<string, typeof initialProducts[0]>();
              const directIds = [...(document.relatedProductIds || []), ...(document.linkedProductIds || [])];
              directIds.forEach(id => { const prod = initialProducts.find(p => p.id === id || p.productId === id); if (prod) productsMap.set(prod.id, prod); });
              (document.linkedClaimIds || []).forEach(claimId => { const claim = allClaims.find((c: any) => c.id === claimId); if (claim?.productId) { const prod = initialProducts.find(p => p.id === claim.productId || p.productId === claim.productId); if (prod) productsMap.set(prod.id, prod); } });
              (document.linkedAssetIds || []).forEach(assetId => { const asset = allAssets.find((a: any) => a.id === assetId); if (asset) { (asset.linkedClaimIds || asset.whereUsed?.claimIds || []).forEach((cid: string) => { const claim = allClaims.find((c: any) => c.id === cid); if (claim?.productId) { const prod = initialProducts.find(p => p.id === claim.productId || p.productId === claim.productId); if (prod) productsMap.set(prod.id, prod); } }); } });
              const derivedProducts = Array.from(productsMap.values());
              content = (
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
                            <tr key={prod.id} onClick={() => onNavigateToProduct?.(prod.id)} className="hover:bg-earth/50 cursor-pointer transition-colors">
                              <td className="px-4 py-3 font-mono text-xs text-sky">{prod.productId}</td>
                              <td className="px-4 py-3 text-xs text-gray-600 font-medium">{prod.name}</td>
                              <td className="px-4 py-3 text-xs text-gray-600">{prod.brand}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">{prod.type}</td>
                              <td className="px-4 py-3 text-xs"><span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">{prod.lifecycleState}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            }

            if (sec.id === 'Version History') {
              content = (
                <div>
                  <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Version History</h3>
                  <div className="space-y-3">
                    {[...document.versions].reverse().map(v => (
                      <div key={v.versionNumber} className={`flex items-start justify-between p-4 rounded-xl border ${v.versionNumber === document.currentVersion ? 'border-sky bg-pale' : 'border-pebble bg-white'}`}>
                        <div className="flex items-start gap-3">
                          <span className={`font-mono text-sm font-bold ${v.versionNumber === document.currentVersion ? 'text-sky' : 'text-night'}`}>v{v.versionNumber}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700">{v.lifecycleState}</span>
                              {v.versionedFrom && <span className="text-[10px] text-gray-400">versioned from v{v.versionedFrom}</span>}
                              {v.versionNumber === document.currentVersion && <span className="text-[10px] bg-sky text-white px-1.5 py-0.5 rounded-full font-bold">Current</span>}
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
              );
            }

            if (sec.id === 'Comments') {
              content = (
                <div>
                  <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Comments ({document.comments.length})</h3>
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
                  {!readOnly && (
                    <div className="flex gap-3">
                      <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} placeholder="Add a comment…" className="flex-1 px-3 py-2 border border-pebble rounded-xl text-sm focus:ring-2 focus:ring-sky outline-none resize-none" />
                      <button onClick={handleAddComment} disabled={!newComment.trim()} className="px-4 py-2 bg-sky text-white rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-dark transition-colors self-end">Post</button>
                    </div>
                  )}
                  {readOnly && <p className="text-xs text-gray-400 italic text-center mt-4">Comments are read-only for {document.lifecycleState} documents.</p>}
                </div>
              );
            }

            return (
              <div
                key={sec.id}
                ref={(el) => { sectionRefs.current[sec.id] = el; }}
                className={`w-full min-h-screen flex-shrink-0 flex flex-col snap-start snap-always bg-transparent transition-opacity duration-300 border-b-2 border-pebble/30 ${
                  activeSection === sec.id ? 'opacity-100' : 'opacity-75'
                }`}
              >
                <div className="flex-1 p-6 md:p-8 space-y-6">
                  {content}
                </div>
              </div>
            );
          })}
        </div>




        {/* ── RIGHT: Fixed Rendition Viewer ── */}
        <div className="w-full md:w-[55%] lg:w-[58%] xl:w-[60%] flex-shrink-0 border-l border-pebble bg-[#1e1e2e] flex flex-col overflow-hidden min-h-[400px] md:min-h-0">
          {/* Viewer toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#16162a] border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom(z => Math.max(25, z - 10))}
                className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Zoom Out"
              ><ZoomOut className="w-4 h-4" /></button>
              <span className="text-xs text-white/50 font-mono w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(300, z + 10))}
                className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Zoom In"
              ><ZoomIn className="w-4 h-4" /></button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={() => setZoom(100)}
                className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Fit to Page"
              ><Maximize2 className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                {currentVer?.fileType?.toUpperCase() || 'PDF'} · v{document.currentVersion}
              </span>
              <span className="text-[10px] text-sky/60 bg-sky/10 px-1.5 py-0.5 rounded font-bold">
                Drag to annotate
              </span>
            </div>
          </div>

          {/* Canvas area — drag-to-select */}
          <div
            ref={renditionRef}
            className="flex-1 overflow-auto relative select-none"
            style={{ cursor: isDragging ? 'crosshair' : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { if (isDragging) { setIsDragging(false); setDragRect(null); } }}
          >
            {/* Document page mock — scaled by zoom */}
            <div className="min-h-full min-w-full flex items-start justify-center p-6">
              <div
                className="bg-white shadow-2xl rounded-sm relative"
                style={{
                  width: `${(zoom / 100) * 595}px`,
                  minHeight: `${(zoom / 100) * 842}px`,
                  transformOrigin: 'top center',
                }}
              >
                {/* Simulated document content */}
                <div className="p-8" style={{ fontSize: `${zoom / 100 * 12}px` }}>
                  <div className="border-b-2 border-sky/30 pb-4 mb-6">
                    <div className="text-night font-bold text-xl mb-1">{document.name}</div>
                    <div className="text-gray-500 text-sm">{document.documentType} · {document.id}</div>
                  </div>
                  <div className="space-y-3">
                    {[...Array(18)].map((_, i) => (
                      <div key={i} className={`h-3 rounded-full bg-gray-200 ${i % 4 === 0 ? 'w-full' : i % 3 === 0 ? 'w-4/5' : i % 2 === 0 ? 'w-3/4' : 'w-11/12'}`} />
                    ))}
                    <div className="mt-6 p-4 bg-sky/5 border border-sky/20 rounded">
                      <div className="h-3 w-1/2 bg-sky/30 rounded mb-2" />
                      {[...Array(4)].map((_, i) => <div key={i} className="h-2.5 bg-gray-200 rounded mb-1.5" />)}
                    </div>
                    {[...Array(12)].map((_, i) => (
                      <div key={`b${i}`} className={`h-3 rounded-full bg-gray-200 ${i % 3 === 0 ? 'w-full' : i % 2 === 0 ? 'w-4/5' : 'w-11/12'}`} />
                    ))}
                  </div>
                </div>
                {!currentVer && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-sm">
                    <div className="text-center text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No rendition available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drag selection rectangle */}
            {isDragging && dragRect && dragRect.w > 2 && dragRect.h > 2 && (
              <div
                className="absolute border-2 border-sky bg-sky/10 pointer-events-none rounded-sm"
                style={{ left: dragRect.x, top: dragRect.y, width: dragRect.w, height: dragRect.h }}
              />
            )}
            {/* Show selection after release */}
            {!isDragging && dragRect && selectionPopup && (
              <div
                className="absolute border-2 border-sky/60 bg-sky/5 pointer-events-none rounded-sm"
                style={{ left: dragRect.x, top: dragRect.y, width: dragRect.w, height: dragRect.h }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Selection Context Popup ─────────────────────────────── */}
      {selectionPopup && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setSelectionPopup(null); setDragRect(null); }} />
          <div
            className="fixed z-50 bg-white border border-pebble rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
            style={{ left: selectionPopup.x + 8, top: selectionPopup.y - 10 }}
          >
            <div className="px-3 py-2 bg-night/5 border-b border-pebble">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Selection Actions</span>
            </div>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-sky/5 transition-colors"
              onClick={() => { setSelectionPopup(null); setCommentModalOpen(true); }}
            >
              <MessageCircle className="w-4 h-4 text-sky flex-shrink-0" />
              Create Comment
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-sky/5 transition-colors"
              onClick={() => { setSelectionPopup(null); setLinkModalOpen(true); }}
            >
              <Link2 className="w-4 h-4 text-sky flex-shrink-0" />
              Create Document Link
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-sky/5 transition-colors"
              onClick={() => { setSelectionPopup(null); setAnchorModalOpen(true); }}
            >
              <Anchor className="w-4 h-4 text-sky flex-shrink-0" />
              Create Anchor
            </button>
          </div>
        </>
      )}

      {/* ── Create Comment Modal ──────────────────────────────── */}
      {commentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCommentModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pebble">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-sky" />
                <h3 className="text-sm font-bold text-night">Create Comment</h3>
              </div>
              <button onClick={() => setCommentModalOpen(false)} className="text-gray-400 hover:text-night"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Comment</label>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={4}
                  placeholder="Enter your comment on the selected area…"
                  className="w-full px-3 py-2 border border-pebble rounded-xl text-sm focus:ring-2 focus:ring-sky outline-none resize-none"
                  autoFocus
                />
              </div>
              <div className="text-xs text-gray-400 bg-earth rounded-lg px-3 py-2 flex items-center gap-2">
                <Anchor className="w-3 h-3 flex-shrink-0" />
                Comment will be anchored to the selected region
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-pebble bg-gray-50">
              <button onClick={() => setCommentModalOpen(false)} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-pebble rounded-xl hover:bg-earth transition-colors">Cancel</button>
              <button
                disabled={!commentText.trim()}
                onClick={() => {
                  if (!commentText.trim()) return;
                  const updated: DocumentRecord = { ...document, comments: [...document.comments, { id: `c-${Date.now()}`, author: 'Sarah Johnson', content: commentText.trim(), timestamp: new Date().toISOString() }], modifiedDate: new Date().toISOString() };
                  onDocumentChange(updated);
                  setCommentText('');
                  setCommentModalOpen(false);
                  setDragRect(null);
                  showToast('Comment created on selection');
                }}
                className="flex-1 px-4 py-2 text-sm text-white bg-sky rounded-xl hover:bg-dark transition-colors font-semibold disabled:opacity-40"
              >Post Comment</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Document Link Modal ───────────────────────── */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setLinkModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pebble">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-sky" />
                <h3 className="text-sm font-bold text-night">Create Document Link</h3>
              </div>
              <button onClick={() => setLinkModalOpen(false)} className="text-gray-400 hover:text-night"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Target Document / URL</label>
                <input
                  value={linkTarget}
                  onChange={e => setLinkTarget(e.target.value)}
                  placeholder="Enter document ID or URL…"
                  className="w-full px-3 py-2 border border-pebble rounded-xl text-sm focus:ring-2 focus:ring-sky outline-none"
                  autoFocus
                />
              </div>
              <div className="text-xs text-gray-400 bg-earth rounded-lg px-3 py-2 flex items-center gap-2">
                <Link2 className="w-3 h-3 flex-shrink-0" />
                Link will be attached to the selected region
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-pebble bg-gray-50">
              <button onClick={() => setLinkModalOpen(false)} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-pebble rounded-xl hover:bg-earth transition-colors">Cancel</button>
              <button
                disabled={!linkTarget.trim()}
                onClick={() => { setLinkModalOpen(false); setLinkTarget(''); setDragRect(null); showToast('Document link created'); }}
                className="flex-1 px-4 py-2 text-sm text-white bg-sky rounded-xl hover:bg-dark transition-colors font-semibold disabled:opacity-40"
              >Create Link</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Anchor Modal ──────────────────────────────── */}
      {anchorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAnchorModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pebble">
              <div className="flex items-center gap-2">
                <Anchor className="w-5 h-5 text-sky" />
                <h3 className="text-sm font-bold text-night">Create Anchor</h3>
              </div>
              <button onClick={() => setAnchorModalOpen(false)} className="text-gray-400 hover:text-night"><X className="w-4 h-4" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1 block">Anchor Name</label>
                <input
                  value={anchorName}
                  onChange={e => setAnchorName(e.target.value)}
                  placeholder="e.g. Section 3.1 – Key Claim"
                  className="w-full px-3 py-2 border border-pebble rounded-xl text-sm focus:ring-2 focus:ring-sky outline-none"
                  autoFocus
                />
              </div>
              <div className="text-xs text-gray-400 bg-earth rounded-lg px-3 py-2 flex items-center gap-2">
                <Anchor className="w-3 h-3 flex-shrink-0" />
                Anchor marks this region for cross-document referencing
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-pebble bg-gray-50">
              <button onClick={() => setAnchorModalOpen(false)} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-pebble rounded-xl hover:bg-earth transition-colors">Cancel</button>
              <button
                disabled={!anchorName.trim()}
                onClick={() => { setAnchorModalOpen(false); setAnchorName(''); setDragRect(null); showToast(`Anchor "${anchorName}" created`); }}
                className="flex-1 px-4 py-2 text-sm text-white bg-sky rounded-xl hover:bg-dark transition-colors font-semibold disabled:opacity-40"
              >Create Anchor</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-night text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-fade-in">
          ✓ {toastMsg}
        </div>
      )}

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
