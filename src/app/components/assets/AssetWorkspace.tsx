import React, { useState, useRef, useEffect, Fragment, useCallback } from 'react';
import { Asset, AssetLifecycle, AssetRiskRecord, AssetComment, AssetApprovalWorkflow, ASSET_LIFECYCLE_COLORS } from '../../types';
import { ChevronLeft, ChevronRight, Users, Star, ChevronDown, Plus, Upload, Link2, Shield, History, CheckCircle, CheckCircle2, FileText, Image, Film, Music, Sparkles, X, Download, ArrowRight, MessageSquare, Send, FolderKanban, ExternalLink, Zap, ArrowLeft, Globe, Search, ZoomIn, ZoomOut, Maximize2, MessageCircle, Anchor } from 'lucide-react';
import DownloadAssetModal from './DownloadAssetModal';
import SPARCiPanel from './SPARCiPanel';
import LifecycleTransitionModal from './LifecycleTransitionModal';
import ApprovalWorkflowModal from './ApprovalWorkflowModal';
import ApprovalWorkflowPanel from './ApprovalWorkflowPanel';
import UploadDocumentModal from '../documents/UploadDocumentModal';
import CopyAssetModal from './CopyAssetModal';

type RenditionAnnotation = {
  id: string;
  type: 'link' | 'comment' | 'anchor';
  label: string;
  rect: { x: number; y: number; w: number; h: number };
  linkedDocIds?: string[];
};

const SAMPLE_LIBRARY_DOCS = [
  { id: 'DOC-SE-001', name: 'Dove Intensive Repair Clinical Study Report', documentType: 'Substantiation Evidence', subtype: 'Clinical Reports' },
  { id: 'DOC-SE-002', name: 'Persil Stain Removal Laboratory Test Results', documentType: 'Substantiation Evidence', subtype: 'Laboratory Test' },
  { id: 'DOC-SE-003', name: "Hellmann's Consumer Preference Study", documentType: 'Substantiation Evidence', subtype: 'Consumer Study' },
  { id: 'DOC-FD-001', name: 'Dove Intensive Repair Formulation Spec v0.1', documentType: 'Formulation Document', subtype: 'Skin Care' },
  { id: 'DOC-FD-002', name: 'Persil Deep Clean Formulation Spec', documentType: 'Formulation Document', subtype: 'Fabric Care' },
  { id: 'DOC-FD-003', name: 'Vaseline Intensive Care Microbiome Formula', documentType: 'Formulation Document', subtype: 'Skin Care' },
  { id: 'DOC-PD-001', name: 'Dove IR Project Charter', documentType: 'Project Document', subtype: '' },
  { id: 'DOC-PD-002', name: 'Persil Deep Clean Risk Assessment Summary', documentType: 'Project Document', subtype: '' },
  { id: 'DOC-PD-003', name: 'TRESemmé LATAM Launch Briefing Deck', documentType: 'Project Document', subtype: '' },
];

interface AssetWorkspaceProps {
  asset: Asset;
  assets: Asset[];
  onBack: () => void;
  onAssetSave: (asset: Asset) => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onNavigateToProject?: (projectId: string) => void;
  onNavigateToClaim?: (claimId: string) => void;
  onAssetSelect?: (asset: Asset) => void;
  onAssetCreate?: (asset: Asset) => void;
}

const ORDERED_ASSET_SECTIONS = [
  { id: 'Asset Details', label: 'Asset Details' },
  { id: 'Support Strategy & Substantiation', label: 'Support Strategy & Substantiation' },
  { id: 'Final Risk Level Summary', label: 'Final Risk Level Summary' },
  { id: 'Risk Level Assessments', label: 'Risk Level Assessments' },
  { id: 'Approval Workflow', label: 'Approval Workflow' },
  { id: 'Linked Claims', label: 'Linked Claims' },
  { id: 'Related Projects', label: 'Related Projects' },
  { id: 'Related Products', label: 'Related Products' },
];

export default function AssetWorkspace({
  asset,
  assets,
  onBack,
  onAssetSave,
  activeSection,
  onSectionChange,
  onNavigateToProject,
  onNavigateToClaim,
  onAssetSelect,
  onAssetCreate,
}: AssetWorkspaceProps) {
  const [isFavorite, setIsFavorite] = useState(asset.isFavorite);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showVersionMenu, setShowVersionMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSPARCi, setShowSPARCi] = useState(false);
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [lifecycleTarget, setLifecycleTarget] = useState<AssetLifecycle>('Assessed');
  const [notUsedReason, setNotUsedReason] = useState('');
  // Comment state (F04)
  const [newComment, setNewComment] = useState('');
  // Risk assessment add state (F05)
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [newRiskDept, setNewRiskDept] = useState<AssetRiskRecord['department']>('Legal');
  const [newRiskLevel, setNewRiskLevel] = useState<'Low' | 'Medium' | 'High' | 'Very High'>('Low');
  const [newRiskComment, setNewRiskComment] = useState('');
  const [showCollabToast, setShowCollabToast] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [seModalOpen, setSeModalOpen] = useState(false);
  const [localSEDocs, setLocalSEDocs] = useState<any[]>([]);

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
  const [anchorModalOpen, setAnchorModalOpen] = useState(false);
  const [anchorName, setAnchorName] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Rendition annotations panel
  const [annotations, setAnnotations] = useState<RenditionAnnotation[]>([]);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);
  const [docLibSearch, setDocLibSearch] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isRenditionExpanded, setIsRenditionExpanded] = useState(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isNavigatingRef.current) return;

    const el = sectionRefs.current[activeSection];
    if (el) {
      isNavigatingRef.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 800);
    }
  }, [activeSection]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isNavigatingRef.current) return;

    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const triggerLine = containerRect.top + containerRect.height * 0.3;

    for (const item of ORDERED_ASSET_SECTIONS) {
      const el = sectionRefs.current[item.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerLine && rect.bottom > triggerLine) {
          if (activeSection !== item.id) {
            onSectionChange(item.id);
          }
          break;
        }
      }
    }
  };
  // Linked Claims tab filter — must be at top level (React hook rules)
  type ClaimFilterTab = 'All' | 'Global' | 'Regional' | 'Local' | 'SKU';
  const [claimTypeFilter, setClaimTypeFilter] = useState<ClaimFilterTab>('All');
  const [expandedClaimSection, setExpandedClaimSection] = useState<string | null>(null);
  const [expandedClaimRow, setExpandedClaimRow] = useState<string | null>(null);
  const [linkedClaimSearch, setLinkedClaimSearch] = useState('');

  const currentVersion = asset.versions.find(v => v.versionNumber === asset.currentVersionNumber);

  // Navigation Logic
  const currentIndex = assets.findIndex(a => a.id === asset.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < assets.length - 1;

  const handlePrev = () => {
    if (hasPrev && onAssetSelect) onAssetSelect(assets[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext && onAssetSelect) onAssetSelect(assets[currentIndex + 1]);
  };

  const toggleFavorite = () => {
    const updated = { ...asset, isFavorite: !isFavorite };
    setIsFavorite(!isFavorite);
    onAssetSave(updated);
  };

  // F04 - Add comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const isReadOnly = asset.lifecycleStage === 'Assessed';
    if (isReadOnly) return;
    const comment: AssetComment = {
      id: `ac-${Date.now()}`,
      author: 'Current User',
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      mentions: [],
      isReadOnly: false,
    };
    const updated: Asset = {
      ...asset,
      assetLevelComments: [...asset.assetLevelComments, comment],
      auditLog: [...asset.auditLog, { id: `al-${Date.now()}`, action: 'Comment added', actor: 'Current User', timestamp: new Date().toISOString() }],
    };
    setNewComment('');
    onAssetSave(updated);
  };

  // F05 - Add risk record
  const handleAddRisk = () => {
    if (!newRiskComment.trim()) return;
    const currentVersion = asset.versions.find(v => v.versionNumber === asset.currentVersionNumber);
    if (!currentVersion) return;
    const record: AssetRiskRecord = {
      id: `rr-${Date.now()}`,
      department: newRiskDept,
      assessedBy: 'Current User',
      riskLevel: newRiskLevel,
      comments: newRiskComment.trim(),
      createdAt: new Date().toISOString(),
    };
    const updatedVersions = asset.versions.map(v =>
      v.versionNumber === asset.currentVersionNumber
        ? { ...v, riskRecords: [...v.riskRecords, record] }
        : v
    );
    const updated: Asset = {
      ...asset,
      versions: updatedVersions,
      auditLog: [...asset.auditLog, { id: `al-${Date.now()}`, action: `Risk record added by ${newRiskDept}`, actor: 'Current User', timestamp: new Date().toISOString() }],
    };
    setShowAddRisk(false);
    setNewRiskComment('');
    onAssetSave(updated);
  };

  // F07 - Approval Workflow save handler
  const handleSaveWorkflow = (assetId: string, workflow: AssetApprovalWorkflow) => {
    const updated: Asset = {
      ...asset,
      approvalWorkflow: workflow,
      auditLog: [
        ...asset.auditLog,
        {
          id: `AL-${Date.now()}`,
          action: asset.approvalWorkflow
            ? 'Approval workflow updated'
            : 'Approval workflow initiated',
          actor: 'Sarah Johnson',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    onAssetSave(updated);
  };

  // F06 - Lifecycle transition
  const handleLifecycleTransition = () => {
    const now = new Date().toISOString();
    const updated: Asset = {
      ...asset,
      lifecycleStage: lifecycleTarget,
      modifiedAt: now,
      auditLog: [
        ...asset.auditLog,
        {
          id: `al-${Date.now()}`,
          action: `Lifecycle changed to ${lifecycleTarget}`,
          actor: 'Current User',
          timestamp: now,
          details: lifecycleTarget === 'Not Used' ? `Reason: ${notUsedReason}` : undefined,
        }
      ],
    };
    onAssetSave(updated);
    setShowLifecycleModal(false);
    setNotUsedReason('');
  };

  const getFileIcon = () => {
    if (!currentVersion) return <FileText className="w-5 h-5 text-gray-400" />;
    switch (currentVersion.fileType) {
      case 'image': return <Image className="w-5 h-5 text-blue-500" />;
      case 'video': return <Film className="w-5 h-5 text-purple-500" />;
      case 'audio': return <Music className="w-5 h-5 text-green-500" />;
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
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

  const renderSectionContent = (id: string) => {
    switch (id) {
      case 'Asset Details':
        return (
          <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm">
            <div className="flex items-center justify-between border-b border-pebble pb-3 mb-4">
              <h3 className="text-base font-bold text-night">Asset Details</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Business Group', value: asset.businessGroup || '—' },
                { label: 'Category', value: asset.category || '—' },
                { label: 'Subtype', value: asset.subtype || 'Unclassified' },
                { label: 'Version', value: `v${asset.currentVersionNumber}` },
              ].map(f => (
                <div key={f.label}>
                  <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm text-night">{f.value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Lifecycle Stage</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${ASSET_LIFECYCLE_COLORS[asset.lifecycleStage]}`}>
                    {asset.lifecycleStage}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Geography</p>
                <div className="flex flex-wrap gap-1.5">
                  {asset.geography.map(geo => (
                    <span key={geo} className="px-2 py-0.5 rounded bg-earth text-night text-xs font-medium">{geo}</span>
                  ))}
                  {asset.geography.length === 0 && <span className="text-sm text-night">—</span>}
                </div>
              </div>
              {asset.copiedFromAssetId && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">Copied From</p>
                  <p className="text-sm text-night flex items-center gap-1 font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg w-max border border-purple-100">
                    <Link2 className="w-3.5 h-3.5" />
                    {assets.find(a => a.id === asset.copiedFromAssetId)?.name || asset.copiedFromAssetId}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-pebble">
                <h4 className="text-sm font-bold text-night mb-3">File Info</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Total Versions</p>
                    <p className="text-xs font-mono">{asset.versions.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Created By</p>
                    <p className="text-xs font-mono">{asset.createdBy}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Created At</p>
                    <p className="text-xs font-mono">{formatRelativeDate(asset.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Last Modified</p>
                    <p className="text-xs font-mono">{formatRelativeDate(asset.modifiedAt)}</p>
                  </div>
                  {currentVersion && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">File Type</p>
                      <p className="text-xs font-mono capitalize">{currentVersion.fileType}</p>
                    </div>
                  )}
                  {currentVersion && (
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">File Size</p>
                      <p className="text-xs font-mono">{currentVersion.fileSize}</p>
                    </div>
                  )}
                </div>
              </div>

              {asset.isPlaceholder && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <Upload className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    This is a placeholder asset. Upload the actual file to complete.
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'Support Strategy & Substantiation':
        return (
          <div>
            <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Support Strategy &amp; Substantiation</h3>
            <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm space-y-6">
              {/* Support Strategy Panel */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Support Strategy</label>
                </div>
                <div className="border border-pebble rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-earth border-b border-pebble flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium">Format:</span>
                    <button className="text-xs px-1.5 py-0.5 rounded hover:bg-pebble transition-colors font-bold text-gray-600">B</button>
                    <button className="text-xs px-1.5 py-0.5 rounded hover:bg-pebble transition-colors italic text-gray-600">I</button>
                    <button className="text-xs px-1.5 py-0.5 rounded hover:bg-pebble transition-colors text-gray-600">• List</button>
                  </div>
                  <textarea
                    placeholder="Describe the support strategy for this asset..."
                    rows={5}
                    className="w-full px-4 py-3 text-sm text-night focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Substantiation Documents */}
              <div className="border-t border-pebble pt-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Substantiation Documents</h4>
                  <button onClick={() => setSeModalOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 border border-pebble rounded-lg text-xs text-sky hover:bg-pale transition-colors font-semibold">
                    <Plus className="w-3.5 h-3.5" />
                    Upload Substantiation Evidence
                  </button>
                </div>
                {localSEDocs.length === 0 ? (
                  <div className="border-2 border-dashed border-pebble rounded-lg p-6 text-center">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-30" />
                    <p className="text-sm text-gray-400">No substantiation documents yet</p>
                    <p className="text-xs text-gray-400 mt-1">Upload PDFs, images, or other supporting files</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {localSEDocs.map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-earth rounded-lg border border-pebble">
                        <FileText className="w-4 h-4 text-sky/60 flex-shrink-0" />
                        <span className="text-sm text-night flex-1 truncate">{doc.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">{doc.subtype}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'Final Risk Level Summary':
        return (
          <div>
            <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Final Risk Level Summary</h3>
            <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm space-y-5">
              {currentVersion?.finalRisk.finalRiskLevel ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Final Risk Level</label>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${currentVersion.finalRisk.finalRiskLevel === 'High' || currentVersion.finalRisk.finalRiskLevel === 'Very High'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : currentVersion.finalRisk.finalRiskLevel === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${currentVersion.finalRisk.finalRiskLevel === 'High' || currentVersion.finalRisk.finalRiskLevel === 'Very High'
                          ? 'bg-red-500' : currentVersion.finalRisk.finalRiskLevel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                          }`} />
                        {currentVersion.finalRisk.finalRiskLevel}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Marketing Risk Signoff</label>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${currentVersion.finalRisk.marketingRiskSignoff ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                        }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {currentVersion.finalRisk.marketingRiskSignoff ? 'Signed Off' : 'Pending'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-earth rounded-lg p-4 border border-pebble">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-sky" />
                      <span className="text-xs font-semibold text-night uppercase tracking-wide">Risk Summary Notes</span>
                    </div>
                    <p className="text-sm text-gray-600">No additional notes recorded.</p>
                  </div>
                  {asset.otherBrandSay && (
                    <div className="mt-4 bg-sky/10 border border-sky/20 rounded-lg p-3 text-sm text-sky font-medium">
                      This field is mandatory to move this asset to an assessed state except if "Other Say" field is Yes.
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-10">
                  <Shield className="w-12 h-12 text-gray-200 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium text-gray-500">No risk assessment completed</p>
                  <p className="text-xs text-gray-400 mt-1">Complete department risk records first</p>
                  {asset.otherBrandSay && (
                    <div className="mt-4 mx-auto max-w-sm bg-sky/10 border border-sky/20 rounded-lg p-3 text-sm text-sky font-medium text-center">
                      This field is mandatory to move this asset to an assessed state except if "Other Say" field is Yes.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'Risk Level Assessments':
        return (
          <div>
            <div className="flex items-center justify-between border-b border-pebble pb-3 mb-4">
              <h3 className="text-base font-bold text-night">Risk Level Assessments</h3>
              {asset.lifecycleStage !== 'Assessed' && (
                <button
                  onClick={() => setShowAddRisk(!showAddRisk)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  Add Assessment
                </button>
              )}
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-300 shadow-sm space-y-4">
              {showAddRisk && (
                <div className="border border-sky/20 rounded-xl p-4 bg-pale space-y-3">
                  <div className="text-sm text-night font-medium mb-2">New Risk Record</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Department</label>
                      <select
                        value={newRiskDept}
                        onChange={e => setNewRiskDept(e.target.value as AssetRiskRecord['department'])}
                        className="w-full px-2 py-1.5 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                      >
                        {(['R&D', 'Legal', 'RA', 'Claims Lead', 'Marketing'] as AssetRiskRecord['department'][]).map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Risk Level</label>
                      <select
                        value={newRiskLevel}
                        onChange={e => setNewRiskLevel(e.target.value as 'Low' | 'Medium' | 'High' | 'Very High')}
                        className="w-full px-2 py-1.5 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                      >
                        {['Low', 'Medium', 'High', 'Very High'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Assessment Comments *</label>
                    <textarea
                      value={newRiskComment}
                      onChange={e => setNewRiskComment(e.target.value)}
                      placeholder="Describe the risk assessment findings..."
                      rows={3}
                      className="w-full px-3 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setShowAddRisk(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-pebble rounded-lg hover:bg-earth">Cancel</button>
                    <button onClick={handleAddRisk} disabled={!newRiskComment.trim()} className="px-3 py-1.5 text-sm bg-sky text-white rounded-lg hover:bg-dark disabled:opacity-40 font-semibold">Save Record</button>
                  </div>
                </div>
              )}
              {currentVersion && currentVersion.riskRecords.length > 0 ? (
                <div className="space-y-3">
                  {currentVersion.riskRecords.map(record => (
                    <div key={record.id} className="p-4 bg-earth rounded-xl border border-pebble">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-night">{record.department}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${record.riskLevel === 'High' || record.riskLevel === 'Very High'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : record.riskLevel === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-green-50 text-green-700 border border-green-200'
                          }`}>
                          {record.riskLevel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{record.comments}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Assessed by {record.assessedBy} · {formatRelativeDate(record.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-10 h-10 text-gray-200 mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-gray-400">No risk assessments yet</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'Linked Claims': {
        const ALL_LINKED_CLAIMS = [
          {
            statement: 'Clinically proven to provide deep moisture for 24 hours',
            id: 'CLM-001', claimType: 'Global' as ClaimFilterTab,
            lifecycleStage: 'Assessed', product: 'Dove Intensive Repair Lotion',
            riskLevel: 'Low' as const, channel: 'All Channels', qualifier: 'When used as directed',
            rcfSummary: 'Supported by 3 clinical studies (n=120). ICH E6 compliant.',
          },
          {
            statement: 'Made with 100% cage-free eggs',
            id: 'CLM-002', claimType: 'Global' as ClaimFilterTab,
            lifecycleStage: 'Proposed', product: "Hellmann's Real Mayonnaise",
            riskLevel: 'Low' as const, channel: 'Digital, Print', qualifier: 'All varieties',
            rcfSummary: 'Sourcing audit completed. Third-party certification obtained.',
          },
          {
            statement: 'Restores natural moisture in 7 days',
            id: 'CLM-010', claimType: 'Regional' as ClaimFilterTab,
            lifecycleStage: 'Assessed', product: 'Dove Body Wash',
            riskLevel: 'High' as const, channel: 'TV, Digital, OOH', qualifier: 'With continued use',
            rcfSummary: "FTC 'restore' claim requires specific support. Under legal review.",
          },
          {
            statement: 'Long-lasting freshness for 48 hours',
            id: 'CLM-015', claimType: 'Local' as ClaimFilterTab,
            lifecycleStage: 'Proposed', product: 'Lynx Africa',
            riskLevel: 'Medium' as const, channel: 'TV, OOH', qualifier: 'Under normal conditions',
            rcfSummary: 'Consumer study data available. Market-specific adaptation required.',
          },
          {
            statement: 'Clinically proven — 250ml pack variant',
            id: 'CLM-020', claimType: 'SKU' as ClaimFilterTab,
            lifecycleStage: 'Assessed', product: 'Dove Intensive Repair 250ml',
            riskLevel: 'Low' as const, channel: 'E-Commerce', qualifier: 'SKU 98765',
            rcfSummary: 'SKU formulation matches general local standard.',
          },
        ];

        const CLAIM_TYPE_TABS: ClaimFilterTab[] = ['All', 'Global', 'Regional', 'Local', 'SKU'];
        const LIFECYCLE_COLORS: Record<string, string> = {
          'Assessed': 'bg-green-50 text-green-700 border border-green-200',
          'Proposed': 'bg-blue-50 text-blue-700 border border-blue-200',
          'Challenged': 'bg-amber-50 text-amber-700 border border-amber-200',
          'Draft': 'bg-gray-100 text-gray-600',
          'Under Review': 'bg-amber-100 text-amber-700',
        };
        const RISK_STYLE: Record<string, string> = {
          'Low': 'text-green-600',
          'Medium': 'text-amber-600',
          'High': 'text-orange-600',
          'Very High': 'text-red-600',
        };
        const RISK_ICON: Record<string, React.ReactNode> = {
          'Low': <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
          'Medium': <Zap className="w-3.5 h-3.5 text-amber-500" />,
          'High': <Zap className="w-3.5 h-3.5 text-orange-500" />,
          'Very High': <Zap className="w-3.5 h-3.5 text-red-500" />,
        };

        const typeFiltered = claimTypeFilter === 'All' ? ALL_LINKED_CLAIMS : ALL_LINKED_CLAIMS.filter(c => c.claimType === claimTypeFilter);
        const filteredClaims = linkedClaimSearch
          ? typeFiltered.filter(c =>
              c.statement.toLowerCase().includes(linkedClaimSearch.toLowerCase()) ||
              c.id.toLowerCase().includes(linkedClaimSearch.toLowerCase())
            )
          : typeFiltered;

        // Group by claim type for accordion display
        const sections: Record<string, typeof ALL_LINKED_CLAIMS> = {};
        const sectionOrder = ['Global', 'Regional', 'Local', 'SKU'];
        filteredClaims.forEach(c => {
          if (!sections[c.claimType]) sections[c.claimType] = [];
          sections[c.claimType].push(c);
        });

        return (
          <div>
            <div className="flex items-center justify-between border-b border-pebble pb-3 mb-4">
              <h3 className="text-base font-bold text-night">Linked Claims</h3>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-pebble text-night rounded-lg text-xs hover:bg-earth transition-colors font-semibold">
                  <Link2 className="w-3.5 h-3.5" /> Link Claim
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors font-semibold">
                  <Plus className="w-3.5 h-3.5" /> Add Claim
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-pebble overflow-hidden bg-white shadow-sm flex flex-col min-h-[400px]">
              {/* Search + type filter tabs */}
              <div className="px-4 py-3 border-b border-pebble flex items-center gap-3 flex-wrap bg-white">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={linkedClaimSearch}
                    onChange={e => setLinkedClaimSearch(e.target.value)}
                    placeholder="Search claims..."
                    className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky bg-white"
                  />
                  {linkedClaimSearch && (
                    <button onClick={() => setLinkedClaimSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                </div>
                <div className="flex gap-1 bg-earth rounded-lg p-1">
                  {CLAIM_TYPE_TABS.map(tab => (
                    <button
                      key={tab}
                      onClick={() => setClaimTypeFilter(tab)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        claimTypeFilter === tab ? 'bg-white text-sky shadow-sm' : 'text-gray-500 hover:text-night'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {filteredClaims.length > 0 ? (
                <div className="p-4 space-y-3 overflow-y-auto flex-1 no-scrollbar">
                  {(claimTypeFilter === 'All' ? sectionOrder : [claimTypeFilter]).map(sType => {
                    const sectionClaims = sections[sType];
                    if (!sectionClaims || sectionClaims.length === 0) return null;
                    return (
                      <div key={sType} className="bg-white rounded-xl border border-pebble overflow-hidden">
                        {/* Section header */}
                        <button
                          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-earth transition-colors"
                          onClick={() => setExpandedClaimSection(expandedClaimSection === sType ? null : sType)}
                        >
                          <div className="flex items-center gap-3">
                            {expandedClaimSection === sType
                              ? <ChevronRight className="w-4 h-4 text-sky" />
                              : <ChevronDown className="w-4 h-4 text-sky" />
                            }
                            <div className="text-left">
                              <div className="text-sm text-night font-semibold">{sType} Claims</div>
                              <div className="text-xs text-gray-500">{sectionClaims.length} claim{sectionClaims.length !== 1 ? 's' : ''} linked</div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 bg-earth px-2 py-1 rounded">{sectionClaims.length}</span>
                        </button>

                        {expandedClaimSection !== sType && (
                          <div className="overflow-x-auto border-t border-pebble">
                            <table className="w-full text-sm">
                              <thead className="bg-[#F6F7F0]">
                                <tr>
                                  <th className="px-4 py-2.5 text-left text-xs font-bold text-night uppercase tracking-wide min-w-[220px]">Claim Statement</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-bold text-night uppercase tracking-wide">ID</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-bold text-night uppercase tracking-wide">Status</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-bold text-night uppercase tracking-wide">Channel</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-bold text-night uppercase tracking-wide">Risk</th>
                                  <th className="px-4 py-2.5 text-left text-xs font-bold text-night uppercase tracking-wide min-w-[100px]">Product</th>
                                  <th className="px-4 py-2.5 w-10" />
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-pebble">
                                {sectionClaims.map((claim, i) => (
                                  <Fragment key={claim.id}>
                                    <tr
                                      className={`border-b border-pebble hover:bg-earth transition-colors cursor-pointer ${expandedClaimRow === claim.id ? 'bg-pale/30' : i % 2 !== 0 ? 'bg-earth/20' : ''}`}
                                      onClick={() => setExpandedClaimRow(expandedClaimRow === claim.id ? null : claim.id)}
                                    >
                                      <td className="px-4 py-3">
                                        <div className="flex items-start gap-2">
                                          <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                          <div>
                                            <button
                                              onClick={e => { e.stopPropagation(); onNavigateToClaim?.(claim.id); }}
                                              className="text-sm text-night hover:text-sky transition-colors text-left font-medium flex items-center gap-1 group"
                                            >
                                              {claim.statement}
                                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky" />
                                            </button>
                                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{claim.qualifier}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{claim.id}</td>
                                      <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${LIFECYCLE_COLORS[claim.lifecycleStage] || 'bg-gray-100 text-gray-500'}`}>
                                          {claim.lifecycleStage}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{claim.channel}</td>
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                          {RISK_ICON[claim.riskLevel]}
                                          <span className={`text-xs font-medium ${RISK_STYLE[claim.riskLevel]}`}>{claim.riskLevel}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-xs text-gray-600 truncate max-w-[100px]">{claim.product}</td>
                                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        <button
                                          onClick={() => onNavigateToClaim?.(claim.id)}
                                          className="p-1 hover:bg-earth rounded text-gray-400 hover:text-sky transition-colors"
                                        >
                                          <ExternalLink className="w-3.5 h-3.5" />
                                        </button>
                                      </td>
                                    </tr>
                                    {expandedClaimRow === claim.id && (
                                      <tr key={`${claim.id}-detail`}>
                                        <td colSpan={7} className="px-0 py-0 border-b-2 border-sky">
                                          <div className="bg-pale/30 border-l-4 border-sky px-6 py-4">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                                              <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Claim ID</div>
                                                <div className="text-night font-mono">{claim.id}</div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</div>
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">{claim.claimType}</span>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Level</div>
                                                <div className={`flex items-center gap-1.5 text-sm font-medium ${RISK_STYLE[claim.riskLevel]}`}>
                                                  {RISK_ICON[claim.riskLevel]} {claim.riskLevel}
                                                </div>
                                              </div>
                                              <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Product</div>
                                                <div className="text-night text-sm">{claim.product}</div>
                                              </div>
                                            </div>
                                            {claim.rcfSummary && (
                                              <div className="mb-4">
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">RCF Summary</div>
                                                <p className="text-sm text-gray-700 bg-white border border-pebble rounded-lg px-3 py-2">{claim.rcfSummary}</p>
                                              </div>
                                            )}
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => onNavigateToClaim?.(claim.id)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark font-semibold"
                                              >
                                                <ExternalLink className="w-3 h-3" /> Open Claim
                                              </button>
                                              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50 font-semibold">
                                                Unlink
                                              </button>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </Fragment>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 flex-1 flex flex-col justify-center">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No linked claims</p>
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'Related Projects': {
        const relatedProjects = [
          {
            name: "Dove Intensive Repair Claims Project",
            id: "PRJ-2026-001",
            status: "In Progress",
            lead: "Sarah Johnson",
            stage: "Substantiate",
          },
          {
            name: "Vaseline Intensive Care Reformulation",
            id: "PRJ-2026-008",
            status: "In Progress",
            lead: "Matthew Jackson",
            stage: "Review & Risk Assessment",
          },
        ];
        return (
          <div>
            <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Related Projects</h3>
            {relatedProjects.length > 0 ? (
              <div className="rounded-xl border border-pebble overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-[#F6F7F0]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Project Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Project ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Stage</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Lead</th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pebble">
                    {relatedProjects.map((project, i) => (
                      <tr
                        key={project.id}
                        className={`border-b border-pebble hover:bg-earth transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-earth/30'}`}
                        onClick={() => onNavigateToProject?.(project.id)}
                      >
                        <td className="px-4 py-3">
                          <button className="text-sky hover:underline text-left flex items-center gap-1.5 font-medium">
                            <FolderKanban className="w-3.5 h-3.5 flex-shrink-0" />
                            {project.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{project.id}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">{project.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{project.stage}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{project.lead}</td>
                        <td className="px-4 py-3">
                          <button className="p-1 hover:bg-earth rounded text-gray-400 hover:text-sky transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 border border-pebble rounded-xl bg-white shadow-sm">
                <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No related projects</p>
              </div>
            )}
          </div>
        );
      }

      case 'Related Products': {
        const LINKED_PRODUCTS = [
          { id: 'PRD-VAR-001', name: 'Dove Intensive Repair Lotion 250ml', brand: 'Dove', category: 'Skin Care', lifecycleState: 'Active', claimsCount: 3, level: 'Format' },
          { id: 'PRD-VAR-002', name: 'Dove Intensive Repair Shampoo 400ml', brand: 'Dove', category: 'Hair Care', lifecycleState: 'Active', claimsCount: 2, level: 'Sub Range' },
        ];
        return (
          <div>
            <div className="flex items-center justify-between border-b border-pebble pb-3 mb-4">
              <h3 className="text-base font-bold text-night">Related Products</h3>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark transition-colors font-semibold">
                <Plus className="w-3.5 h-3.5" /> Link Product
              </button>
            </div>
            {LINKED_PRODUCTS.length > 0 ? (
              <div className="rounded-xl border border-pebble overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-[#F6F7F0]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Product ID</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Brand</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Level</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-night uppercase">Claims</th>
                      <th className="px-4 py-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pebble">
                    {LINKED_PRODUCTS.map((product, i) => (
                      <tr key={product.id} className={`border-b border-pebble hover:bg-earth transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-earth/30'}`}>
                        <td className="px-4 py-3">
                          <span className="text-sky hover:underline flex items-center gap-1.5 font-medium">
                            <Globe className="w-3.5 h-3.5 flex-shrink-0" />
                            {product.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{product.id}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{product.brand}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{product.category}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{product.level}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">{product.lifecycleState}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{product.claimsCount} claims</td>
                        <td className="px-4 py-3">
                          <button className="p-1 hover:bg-earth rounded text-gray-400 hover:text-sky transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 border border-pebble rounded-xl bg-white shadow-sm">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No related products</p>
              </div>
            )}
          </div>
        );
      }

      case 'Approval Workflow':
        return (
          <div>
            <h3 className="text-base font-bold text-night border-b border-pebble pb-3 mb-4">Approval Workflow</h3>
            <ApprovalWorkflowPanel
              asset={asset}
              onAssetSave={onAssetSave}
              onManageApprovers={() => setShowApprovalModal(true)}
              onInitiateWorkflow={() => setShowApprovalModal(true)}
            />
          </div>
        );

      default:
        return (
          <p className="text-sm text-gray-400">Section content coming soon</p>
        );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-transparent no-scrollbar">
      {/* Toast */}
      {showCollabToast && (
        <div className="absolute top-4 right-4 z-50 bg-night text-white px-4 py-2.5 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Users className="w-4 h-4 text-sky" />
          Collaboration coming soon for Assets!
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        {/* Row 1: breadcrumb + actions */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={onBack}
              className="flex items-center gap-1 hover:text-sky transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Assets
            </button>
            <span>/</span>
            <span className="text-night truncate max-w-[300px] font-medium">
              {asset.name}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Record Navigation */}
            <div className="flex items-center border border-pebble rounded-lg overflow-hidden bg-white shadow-sm">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-r border-pebble"
              >
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="px-2.5 text-xs text-gray-500 font-medium">
                {currentIndex + 1} / {assets.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1.5 hover:bg-earth disabled:opacity-30 transition-colors border-l border-pebble"
              >
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Download */}
            <button
              onClick={() => setShowDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-pebble rounded-lg text-sm text-gray-600 hover:bg-earth shadow-sm bg-white hover:border-sky transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>

            {/* SPARCi → Extract Claim (SPARCi) */}
            <button
              onClick={() => setShowSPARCi(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-sky/30 bg-sky/5 rounded-lg text-sm text-sky hover:bg-pale shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Extract Claims 
            </button>

            {/* Lifecycle transition */}
            {asset.lifecycleStage === 'Proposed' && (
              <button
                onClick={() => { setLifecycleTarget('Assessed'); setShowLifecycleModal(true); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 shadow-sm transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                Mark Assessed
              </button>
            )}

            {/* Collaborate Button */}
            <button
              onClick={() => {
                setShowCollabToast(true);
                setTimeout(() => setShowCollabToast(false), 3000);
              }}
              className="flex items-center gap-2 px-3 py-1.5 border border-pebble rounded-lg text-sm text-night hover:bg-earth bg-white shadow-sm transition-colors"
            >
              <Users className="w-4 h-4 text-gray-500" />
              <span className="hidden lg:inline">Collaborate</span>
            </button>

            {/* Actions Dropdown — FILE 1: available to all assets, not just Social First */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-pebble bg-white text-night rounded-lg text-sm shadow-sm hover:bg-earth transition-colors font-medium"
              >
                Actions
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {showActionsMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(false)}></div>
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-pebble rounded-xl shadow-xl z-20 py-1">
                    <button
                      onClick={() => { setShowActionsMenu(false); setShowApprovalModal(true); }}
                      className="w-full px-4 py-2 text-sm text-night hover:bg-earth text-left transition-colors flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-sky" />
                      {asset.approvalWorkflow ? 'Manage Approval Workflow' : 'Initiate Approval Workflow'}
                    </button>
                    <div className="border-t border-pebble my-1"></div>
                    <button className="w-full px-4 py-2 text-sm text-night hover:bg-earth text-left transition-colors">
                      Edit Details
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-night hover:bg-earth text-left transition-colors">
                      Create New Version
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-night hover:bg-earth text-left transition-colors">
                      Reclassify
                    </button>
                    <button 
                      onClick={() => { setShowActionsMenu(false); setShowCopyModal(true); }}
                      className="w-full px-4 py-2 text-sm text-night hover:bg-earth text-left transition-colors"
                    >
                      Copy Asset
                    </button>
                    {asset.lifecycleStage !== 'Not Used' && (
                      <button
                        onClick={() => { setShowActionsMenu(false); setLifecycleTarget('Not Used'); setShowLifecycleModal(true); }}
                        className="w-full px-4 py-2 text-sm text-amber-600 hover:bg-earth text-left transition-colors"
                      >
                        Mark as Not Used
                      </button>
                    )}
                    <div className="border-t border-pebble my-1"></div>
                    <button className="w-full px-4 py-2 text-sm text-red-500 hover:bg-earth text-left transition-colors">
                      Delete Asset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: identity — FILE 1 layout: asset ID badge inline, lifecycle badge before version */}
        <div className="flex items-start gap-3">
          <button
            onClick={toggleFavorite}
            className="mt-1 flex-shrink-0"
          >
            <Star
              className={`w-5 h-5 transition-all ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
            />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              {getFileIcon()}
              <h2 className="text-night truncate font-semibold leading-tight">
                {asset.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
                V {asset.currentVersionNumber}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${ASSET_LIFECYCLE_COLORS[asset.lifecycleStage] || 'bg-gray-100 text-gray-600'}`}>
                {asset.lifecycleStage}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                {asset.subtype || 'Unclassified'}
              </span>
              {asset.businessGroup && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-sky/10 text-sky border border-sky/20 rounded-full text-xs flex-shrink-0">
                  {asset.businessGroup}
                </span>
              )}
              {asset.category && (
                <span className="px-2.5 py-1 bg-earth text-gray-600 border border-pebble/40 rounded-full text-xs flex-shrink-0">
                  {asset.category}
                </span>
              )}
              {asset.geography && asset.geography.length > 0 && (
                <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs flex-shrink-0">
                  <Globe className="w-3 h-3" />
                  {asset.geography.length === 1
                    ? asset.geography[0]
                    : `${asset.geography.length} geographies`}
                </span>
              )}
              {asset.isPlaceholder && (
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs flex-shrink-0">
                  Placeholder
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-transparent">
        {/* ── LEFT COLUMN: Sections up to Approval Workflow ── */}
        <div
          className={`flex-1 overflow-y-auto min-w-0 snap-y snap-proximity scroll-smooth no-scrollbar transition-all duration-300 ${isRenditionExpanded ? 'md:max-w-[45%] lg:max-w-[42%]' : 'max-w-full'}`}
          onScroll={handleScroll}
        >
          {ORDERED_ASSET_SECTIONS.map((item) => {
            const isItemActive = activeSection === item.id;
            return (
              <div
                key={item.id}
                ref={(el) => { sectionRefs.current[item.id] = el; }}
                className={`w-full min-h-screen flex-shrink-0 flex flex-col snap-start snap-always bg-transparent transition-opacity duration-300 border-b-2 border-pebble/30 ${
                  isItemActive ? 'opacity-100' : 'opacity-75'
                }`}
              >
                <div className="flex-1 p-6 md:p-8 space-y-6">
                  {renderSectionContent(item.id)}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── RIGHT COLUMN: Rendition Viewer ── */}
        <div className={`flex-shrink-0 border-l border-pebble bg-[#1e1e2e] flex flex-col overflow-hidden h-full hidden md:flex transition-all duration-300 ${
          isRenditionExpanded ? 'w-full md:w-[55%] lg:w-[58%] xl:w-[60%]' : 'w-10'
        }`}>
          {!isRenditionExpanded ? (
            <div className="flex flex-col items-center py-4 h-full border-l border-white/10 bg-[#16162a]">
              <button
                onClick={() => setIsRenditionExpanded(true)}
                className="p-1.5 rounded-lg bg-sky/20 text-sky hover:bg-sky hover:text-white transition-colors"
                title="Expand Rendition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="writing-vertical-rl text-white/30 text-xs tracking-widest uppercase font-semibold mt-8 rotate-180">
                Rendition Viewer
              </div>
            </div>
          ) : (
            <>
              {/* Viewer toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#16162a] border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsRenditionExpanded(false)}
                    className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors mr-2"
                    title="Collapse Rendition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
                    {currentVersion?.fileType?.toUpperCase() || 'PDF'} · v{asset.currentVersionNumber}
                  </span>
                  <span className="text-[10px] text-sky/60 bg-sky/10 px-1.5 py-0.5 rounded font-bold">
                    Drag to annotate
                  </span>
                </div>
              </div>

              {/* Canvas + Annotations Panel */}
              <div className="flex-1 flex flex-row overflow-hidden">
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
                          <div className="text-night font-bold text-xl mb-1">{asset.name}</div>
                          <div className="text-gray-500 text-sm">{asset.category}</div>
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
                      {!currentVersion && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-sm">
                          <div className="text-center text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No rendition available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Persistent annotation rects — hover highlights */}
                  {annotations.map(ann => (
                    <div
                      key={`rect-${ann.id}`}
                      className="absolute pointer-events-none rounded-sm transition-all duration-150"
                      style={{
                        left: ann.rect.x,
                        top: ann.rect.y,
                        width: ann.rect.w,
                        height: ann.rect.h,
                        border: hoveredAnnotationId === ann.id
                          ? '2px solid #0ea5e9'
                          : ann.type === 'link' ? '2px solid #3b82f6' : ann.type === 'comment' ? '2px solid #f59e0b' : '2px solid #8b5cf6',
                        background: hoveredAnnotationId === ann.id
                          ? 'rgba(14,165,233,0.18)'
                          : ann.type === 'link' ? 'rgba(59,130,246,0.07)' : ann.type === 'comment' ? 'rgba(245,158,11,0.07)' : 'rgba(139,92,246,0.07)',
                        boxShadow: hoveredAnnotationId === ann.id ? '0 0 0 4px rgba(14,165,233,0.2)' : 'none',
                      }}
                    />
                  ))}

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

                {/* ── Annotations Panel ──────────────────────────────── */}
                {annotations.length > 0 && (
                  <div className="w-60 flex-shrink-0 border-l border-white/10 bg-[#12121e] flex flex-col overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">Annotations</span>
                      <span className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full font-bold">{annotations.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
                      {annotations.map(ann => (
                        <div
                          key={ann.id}
                          className={`group rounded-xl p-3 border transition-all duration-150 cursor-default ${
                            hoveredAnnotationId === ann.id
                              ? 'border-sky/50 bg-sky/10'
                              : ann.type === 'link'
                                ? 'border-blue-500/20 bg-blue-500/5 hover:border-blue-400/40'
                                : ann.type === 'comment'
                                  ? 'border-amber-400/20 bg-amber-400/5 hover:border-amber-300/40'
                                  : 'border-purple-400/20 bg-purple-400/5 hover:border-purple-300/40'
                          }`}
                          onMouseEnter={() => setHoveredAnnotationId(ann.id)}
                          onMouseLeave={() => setHoveredAnnotationId(null)}
                        >
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">
                                {ann.type === 'link' ? '🔗' : ann.type === 'comment' ? '💬' : '⚓'}
                              </span>
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                ann.type === 'link' ? 'text-blue-400' : ann.type === 'comment' ? 'text-amber-400' : 'text-purple-400'
                              }`}>
                                {ann.type === 'link' ? 'Doc Link' : ann.type === 'comment' ? 'Comment' : 'Anchor'}
                              </span>
                            </div>
                            <button
                              onClick={() => setAnnotations(prev => prev.filter(a => a.id !== ann.id))}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-red-400 p-0.5 rounded flex-shrink-0"
                              title="Remove annotation"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          {ann.type === 'link' ? (
                            <div className="space-y-1">
                              {[
                                ...SAMPLE_LIBRARY_DOCS,
                                ...(assets || []).map(a => ({ id: a.id, name: a.name, documentType: 'Asset', subtype: a.subtype || a.category || '' }))
                              ].filter(d => ann.linkedDocIds?.includes(d.id)).map(d => (
                                <a
                                  key={d.id}
                                  href="#"
                                  onClick={e => {
                                    e.preventDefault();
                                    if (d.documentType === 'Asset') {
                                      const foundAsset = assets.find(a => a.id === d.id);
                                      if (foundAsset) {
                                        onAssetSelect?.(foundAsset);
                                      }
                                    }
                                  }}
                                  className="block text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 truncate transition-colors leading-relaxed"
                                  title={d.name}
                                >
                                  {d.name}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-white/60 leading-relaxed line-clamp-4">{ann.label}</p>
                          )}
                          <div className="mt-1.5 text-[9px] text-white/20 font-mono">
                            {Math.round(ann.rect.w)}×{Math.round(ann.rect.h)}px
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
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
                  const updated: Asset = { ...asset, assetLevelComments: [...asset.assetLevelComments, { id: `ac-${Date.now()}`, author: 'Current User', content: commentText.trim(), createdAt: new Date().toISOString(), mentions: [], isReadOnly: false }] };
                  onAssetSave(updated);
                  if (dragRect) {
                    setAnnotations(prev => [...prev, { id: `ann-${Date.now()}`, type: 'comment' as const, label: commentText.trim(), rect: dragRect }]);
                  }
                  setCommentText('');
                  setCommentModalOpen(false);
                  setDragRect(null);
                  showToast('Comment added to annotations panel');
                }}
                className="flex-1 px-4 py-2 text-sm text-white bg-sky rounded-xl hover:bg-dark transition-colors font-semibold disabled:opacity-40"
              >Post Comment</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Document Library Picker Modal ─────────────────────── */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setLinkModalOpen(false); setSelectedDocIds([]); setDocLibSearch(''); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-pebble flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-sky/10 rounded-lg flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-sky" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-night">Link Documents</h3>
                  <p className="text-xs text-gray-400">Select documents from the library to link to this region</p>
                </div>
              </div>
              <button onClick={() => { setLinkModalOpen(false); setSelectedDocIds([]); setDocLibSearch(''); }} className="text-gray-400 hover:text-night p-1 rounded-lg hover:bg-earth transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Search bar */}
            <div className="px-6 py-3 border-b border-pebble bg-earth/40 flex-shrink-0">
              <div className="relative">
                <input
                  value={docLibSearch}
                  onChange={e => setDocLibSearch(e.target.value)}
                  placeholder="Search by document name…"
                  className="w-full pl-9 pr-3 py-2 border border-pebble rounded-xl text-sm focus:ring-2 focus:ring-sky outline-none bg-white"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            {/* Selection count badge */}
            {selectedDocIds.length > 0 && (
              <div className="px-6 py-2 bg-sky/5 border-b border-sky/10 flex-shrink-0">
                <span className="text-xs text-sky font-semibold">{selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} selected</span>
              </div>
            )}
            {/* Document table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-earth border-b border-pebble z-10">
                  <tr>
                    <th className="px-4 py-3 w-10" />
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide font-semibold">Document Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide font-semibold">SubType</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ...SAMPLE_LIBRARY_DOCS,
                    ...(assets || []).filter(a => a.id !== asset.id).map(a => ({ id: a.id, name: a.name, documentType: 'Asset', subtype: a.subtype || a.category || '' }))
                  ].filter(d => d.name.toLowerCase().includes(docLibSearch.toLowerCase())).map(d => (
                    <tr
                      key={d.id}
                      onClick={() => setSelectedDocIds(prev => prev.includes(d.id) ? prev.filter(x => x !== d.id) : [...prev, d.id])}
                      className={`border-b border-pebble/50 hover:bg-sky/5 cursor-pointer transition-colors ${
                        selectedDocIds.includes(d.id) ? 'bg-sky/8 border-l-2 border-l-sky' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input type="checkbox" readOnly checked={selectedDocIds.includes(d.id)} className="accent-sky w-4 h-4 cursor-pointer" />
                      </td>
                      <td className="px-4 py-3 font-medium text-night text-sm">{d.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          d.documentType === 'Formulation Document' ? 'bg-purple-50 text-purple-700'
                          : d.documentType === 'Substantiation Evidence' ? 'bg-sky/10 text-sky'
                          : d.documentType === 'Asset' ? 'bg-orange-50 text-orange-700'
                          : 'bg-green-50 text-green-700'
                        }`}>{d.documentType}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{d.subtype || '—'}</td>
                    </tr>
                  ))}
                  {[
                    ...SAMPLE_LIBRARY_DOCS,
                    ...(assets || []).filter(a => a.id !== asset.id).map(a => ({ id: a.id, name: a.name, documentType: 'Asset', subtype: a.subtype || a.category || '' }))
                  ].filter(d => d.name.toLowerCase().includes(docLibSearch.toLowerCase())).length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">No documents match your search</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-pebble bg-gray-50 flex-shrink-0">
              <button
                onClick={() => { setLinkModalOpen(false); setSelectedDocIds([]); setDocLibSearch(''); }}
                className="flex-1 px-4 py-2 text-sm text-gray-600 border border-pebble rounded-xl hover:bg-earth transition-colors"
              >Cancel</button>
              <button
                disabled={selectedDocIds.length === 0}
                onClick={() => {
                  if (selectedDocIds.length === 0 || !dragRect) return;
                  const availableDocs = [
                    ...SAMPLE_LIBRARY_DOCS,
                    ...(assets || []).filter(a => a.id !== asset.id).map(a => ({ id: a.id, name: a.name, documentType: 'Asset', subtype: a.subtype || a.category || '' }))
                  ];
                  const linkedDocs = availableDocs.filter(d => selectedDocIds.includes(d.id));
                  const label = linkedDocs.map(d => d.name).join(', ');
                  setAnnotations(prev => [...prev, { id: `ann-${Date.now()}`, type: 'link' as const, label, rect: dragRect, linkedDocIds: [...selectedDocIds] }]);
                  setLinkModalOpen(false);
                  setSelectedDocIds([]);
                  setDocLibSearch('');
                  setDragRect(null);
                  showToast(`${linkedDocs.length} document${linkedDocs.length > 1 ? 's' : ''} linked to region`);
                }}
                className="flex-1 px-4 py-2 text-sm text-white bg-sky rounded-xl hover:bg-dark transition-colors font-semibold disabled:opacity-40"
              >
                {selectedDocIds.length > 0 ? `Link ${selectedDocIds.length} Document${selectedDocIds.length > 1 ? 's' : ''}` : 'Link Documents'}
              </button>
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
                onClick={() => {
                  if (dragRect) {
                    setAnnotations(prev => [...prev, { id: `ann-${Date.now()}`, type: 'anchor' as const, label: anchorName.trim(), rect: dragRect }]);
                  }
                  const newAnchor = {
                    id: `anc-${Date.now()}`,
                    anchorNumber: asset.anchors.length + 1,
                    x: dragRect?.x,
                    y: dragRect?.y,
                    comments: []
                  };
                  const updated: Asset = { ...asset, anchors: [...asset.anchors, newAnchor] };
                  onAssetSave(updated);
                  setAnchorModalOpen(false);
                  setAnchorName('');
                  setDragRect(null);
                  showToast(`Anchor "${anchorName}" added to annotations panel`);
                }}
                className="flex-1 px-4 py-2 text-sm text-white bg-sky rounded-xl hover:bg-dark transition-colors font-semibold disabled:opacity-40"
              >Create Anchor</button>
            </div>
          </div>
        </div>
      )}

      {/* F10 - Download Modal */}
      {showDownloadModal && (
        <DownloadAssetModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          asset={asset}
        />
      )}

      {/* F13 - SPARCi Panel */}
      {showSPARCi && (
        <SPARCiPanel
          isOpen={showSPARCi}
          onClose={() => setShowSPARCi(false)}
          asset={asset}
          onAcceptClaim={(id) => console.log('Claim accepted:', id)}
          onAcceptProduct={(id) => console.log('Product accepted:', id)}
          onAssetUpdate={onAssetSave}
        />
      )}

      {/* F06 - Lifecycle Transition Modal */}
      {showLifecycleModal && (
        <LifecycleTransitionModal
          isOpen={showLifecycleModal}
          onClose={() => setShowLifecycleModal(false)}
          asset={asset}
          targetLifecycle={lifecycleTarget}
          onConfirm={handleLifecycleTransition}
          notUsedReason={notUsedReason}
          onNotUsedReasonChange={setNotUsedReason}
        />
      )}

      {/* F07 - Approval Workflow Modal */}
      {showApprovalModal && (
        <ApprovalWorkflowModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          asset={asset}
          onSave={handleSaveWorkflow}
        />
      )}
      {/* SE Upload Modal */}
      {seModalOpen && (
        <UploadDocumentModal
          isOpen={seModalOpen}
          onClose={() => setSeModalOpen(false)}
          contextDocType="Substantiation Evidence"
          contextAssetId={asset.id}
          onCreate={(doc) => {
            setLocalSEDocs(prev => [...prev, doc]);
            setSeModalOpen(false);
          }}
        />
      )}

      {/* Copy Asset Modal */}
      {showCopyModal && (
        <CopyAssetModal
          isOpen={showCopyModal}
          onClose={() => setShowCopyModal(false)}
          sourceAsset={asset}
          onCopy={(newAsset) => {
            if (onAssetCreate) onAssetCreate(newAsset);
            setShowCopyModal(false);
          }}
        />
      )}
    </div>
  );
}