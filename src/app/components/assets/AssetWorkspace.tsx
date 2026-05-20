import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import { Asset, AssetLifecycle, AssetRiskRecord, AssetComment, AssetApprovalWorkflow, ASSET_LIFECYCLE_COLORS } from '../../types';
import { ChevronLeft, ChevronRight, Users, Star, ChevronDown, Plus, Upload, Link2, Shield, History, CheckCircle, CheckCircle2, FileText, Image, Film, Music, Sparkles, X, Download, ArrowRight, MessageSquare, Send, FolderKanban, ExternalLink, Zap, ArrowLeft, Globe, Search } from 'lucide-react';
import DownloadAssetModal from './DownloadAssetModal';
import SPARCiPanel from './SPARCiPanel';
import LifecycleTransitionModal from './LifecycleTransitionModal';
import ApprovalWorkflowModal from './ApprovalWorkflowModal';
import ApprovalWorkflowPanel from './ApprovalWorkflowPanel';

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
}

const ORDERED_ASSET_SECTIONS = [
  { id: 'Asset Details', label: 'Asset Details' },
  { id: 'Support Strategy & Substantiation', label: 'Support Strategy & Substantiation' },
  { id: 'Final Risk Level Summary', label: 'Final Risk Level Summary' },
  { id: 'Risk Level Assessments', label: 'Risk Level Assessments' },
  { id: 'Linked Claims', label: 'Linked Claims' },
  { id: 'Related Projects', label: 'Related Projects' },
  { id: 'Related Products', label: 'Related Products' },
  { id: 'Approval Workflow', label: 'Approval Workflow' },
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
}: AssetWorkspaceProps) {
  const [isFavorite, setIsFavorite] = useState(asset.isFavorite);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showVersionMenu, setShowVersionMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSPARCi, setShowSPARCi] = useState(false);
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
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

  const renderRenditionPanel = () => {
    return (
      <div className="space-y-4">
        <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Rendition</h4>
        {currentVersion && !asset.isPlaceholder ? (
          <div className="border border-pebble rounded-xl overflow-hidden">
            <div className="aspect-video bg-earth flex items-center justify-center">
              {getFileIcon()}
              <span className="ml-2 text-sm text-gray-500">Asset Rendition Preview</span>
            </div>
            <div className="p-3 bg-white border-t border-pebble">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{currentVersion.fileType.toUpperCase()} • {currentVersion.fileSize}</span>
                <span>Version {asset.currentVersionNumber}</span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              const updated = {
                ...asset,
                isPlaceholder: false,
                currentVersionNumber: 1,
                versions: [
                  {
                    versionNumber: 1,
                    fileType: 'pdf',
                    fileSize: '2.4 MB',
                    uploadDate: new Date().toISOString(),
                    uploadedBy: 'Current User',
                    riskRecords: [],
                    finalRisk: {
                      finalRiskLevel: null,
                      marketingRiskSignoff: false,
                    }
                  }
                ]
              } as Asset;
              onAssetSave(updated);
            }}
            className="w-full border-2 border-dashed border-pebble rounded-xl p-12 text-center hover:bg-earth transition-colors cursor-pointer"
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium mb-1">Upload Asset file</p>
            <p className="text-xs text-gray-400">Click to upload your asset rendition</p>
          </button>
        )}

        {/* Anchors */}
        <div>
          <h4 className="text-sm text-night font-medium mb-3">Anchors ({asset.anchors.length})</h4>
          {asset.anchors.length > 0 ? (
            <div className="space-y-2">
              {asset.anchors.map(anchor => (
                <div key={anchor.id} className="p-3 bg-earth rounded-lg border border-pebble">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-sky font-medium">Anchor #{anchor.anchorNumber}</span>
                    <span className="text-xs text-gray-400">({anchor.x?.toFixed(0) || 0}, {anchor.y?.toFixed(0) || 0})</span>
                  </div>
                  {anchor.comments?.map(comment => (
                    <div key={comment.id} className="text-sm text-gray-700 mb-1">
                      <span className="font-medium">{comment.author}:</span> {comment.content}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No anchors yet.</p>
          )}
        </div>
      </div>
    );
  };

  const renderSectionContent = (id: string) => {
    switch (id) {
      case 'Asset Details':
        return (
          <div className="space-y-5">
            {/* Asset Details subsection */}
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Details</h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Business Group</label>
                  <div className="text-sm text-night font-medium">{asset.businessGroup}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Category</label>
                  <div className="text-sm text-night">{asset.category}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Lifecycle Stage</label>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${ASSET_LIFECYCLE_COLORS[asset.lifecycleStage]}`}>
                    {asset.lifecycleStage}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Subtype</label>
                  <div className="text-sm text-night">{asset.subtype || <span className="text-gray-400">Unclassified</span>}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Geography</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {asset.geography.map(geo => (
                      <span key={geo} className="px-2 py-0.5 rounded bg-earth text-night text-xs">{geo}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Version</label>
                  <div className="text-sm text-night font-medium">v{asset.currentVersionNumber}</div>
                </div>
              </div>
            </div>

            {/* File Info subsection */}
            <div className="border-t border-pebble pt-4">
              <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">File Info</h4>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Total Versions</label>
                  <div className="text-sm text-night">{asset.versions.length}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Created By</label>
                  <div className="text-sm text-night">{asset.createdBy}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Created At</label>
                  <div className="text-sm text-gray-600">{formatRelativeDate(asset.createdAt)}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Last Modified</label>
                  <div className="text-sm text-gray-600">{formatRelativeDate(asset.modifiedAt)}</div>
                </div>
                {currentVersion && (
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">File Type</label>
                    <div className="text-sm text-night capitalize">{currentVersion.fileType}</div>
                  </div>
                )}
                {currentVersion && (
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">File Size</label>
                    <div className="text-sm text-night">{currentVersion.fileSize}</div>
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
        );

      case 'Support Strategy & Substantiation':
        return (
          <div className="bg-white rounded-xl border border-pebble overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-white">
              <div>
                <h3 className="text-night font-semibold text-base">Support Strategy &amp; Substantiation</h3>
                <p className="text-xs text-gray-400 mt-0.5">Capture the justification and evidence behind this asset</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
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
                  <button className="flex items-center gap-1.5 px-3 py-1.5 border border-pebble rounded-lg text-xs text-sky hover:bg-pale transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    Add Document
                  </button>
                </div>
                <div className="border-2 border-dashed border-pebble rounded-lg p-6 text-center">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No substantiation documents yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload PDFs, images, or other supporting files</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Final Risk Level Summary':
        return (
          <div className="bg-white rounded-xl border border-pebble overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-white">
              <div>
                <h3 className="text-night font-semibold text-base">Final Risk Level Summary</h3>
                <p className="text-xs text-gray-400 mt-0.5">Consolidated risk assessment for this asset version</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
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
                </>
              ) : (
                <div className="text-center py-10">
                  <Shield className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No risk assessment completed</p>
                  <p className="text-xs text-gray-400 mt-1">Complete department risk records first</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'Risk Level Assessments':
        return (
          <div className="bg-white rounded-xl border border-pebble overflow-hidden">
            <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-white">
              <div>
                <h3 className="text-night font-semibold text-base">Risk Level Assessments</h3>
                <p className="text-xs text-gray-400 mt-0.5">Department-level risk records for this asset version</p>
              </div>
              {asset.lifecycleStage !== 'Assessed' && (
                <button
                  onClick={() => setShowAddRisk(!showAddRisk)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Assessment
                </button>
              )}
            </div>
            <div className="p-6 space-y-4">
              {showAddRisk && (
                <div className="border border-sky/20 rounded-xl p-4 bg-pale space-y-3">
                  <div className="text-sm text-night font-medium mb-2">New Risk Record</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Department</label>
                      <select
                        value={newRiskDept}
                        onChange={e => setNewRiskDept(e.target.value as AssetRiskRecord['department'])}
                        className="w-full px-2 py-1.5 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
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
                        className="w-full px-2 py-1.5 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
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
                    <button onClick={handleAddRisk} disabled={!newRiskComment.trim()} className="px-3 py-1.5 text-sm bg-sky text-white rounded-lg hover:bg-dark disabled:opacity-40">Save Record</button>
                  </div>
                </div>
              )}
              {currentVersion && currentVersion.riskRecords.length > 0 ? (
                <div className="space-y-3">
                  {currentVersion.riskRecords.map(record => (
                    <div key={record.id} className="p-4 bg-earth rounded-xl border border-pebble">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-night">{record.department}</span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${record.riskLevel === 'High' || record.riskLevel === 'Very High'
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
                  <Shield className="w-10 h-10 text-gray-200 mx-auto mb-2" />
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
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-night font-semibold text-base">Linked Claims</h3>
                <p className="text-sm text-gray-500 mt-0.5">{ALL_LINKED_CLAIMS.length} claims linked to this asset</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth transition-colors">
                  <Link2 className="w-4 h-4" />
                  Link Claim
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Claim
                </button>
              </div>
            </div>

            {/* Search + type filter tabs */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={linkedClaimSearch}
                  onChange={e => setLinkedClaimSearch(e.target.value)}
                  placeholder="Search claims..."
                  className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
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

            {/* Section accordions — one per claim type */}
            {filteredClaims.length > 0 ? (
              <div className="space-y-3">
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
                            <thead className="bg-earth">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide min-w-[220px]">Claim Statement</th>
                                <th className="px-4 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide">ID</th>
                                <th className="px-4 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-4 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide">Channel</th>
                                <th className="px-4 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide">Risk</th>
                                <th className="px-4 py-2.5 text-left text-xs text-gray-500 uppercase tracking-wide min-w-[100px]">Product</th>
                                <th className="px-4 py-2.5 w-10" />
                              </tr>
                            </thead>
                            <tbody>
                              {sectionClaims.map((claim, i) => (
                                <>
                                  <tr
                                    key={claim.id}
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
                                              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark"
                                            >
                                              <ExternalLink className="w-3 h-3" /> Open Claim
                                            </button>
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50">
                                              Unlink
                                            </button>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </>
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
              <div className="text-center py-10 border-2 border-dashed border-pebble rounded-xl">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No {claimTypeFilter !== 'All' ? claimTypeFilter : ''} claims linked to this asset</p>
              </div>
            )}
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
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              {relatedProjects.length} projects using this asset
            </div>
            {relatedProjects.length > 0 ? (
              <div className="border border-pebble rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-earth">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Project Name</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Project ID</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Stage</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Lead</th>
                      <th className="px-4 py-3 w-12" />
                    </tr>
                  </thead>
                  <tbody>
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
              <div className="text-center py-10 border-2 border-dashed border-pebble rounded-xl">
                <FolderKanban className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Not used in any projects yet</p>
              </div>
            )}
          </div>
        );
      }

      case 'Related Products': {
        // FILE 2: includes `level` field
        const LINKED_PRODUCTS = [
          { id: 'PRD-VAR-001', name: 'Dove Intensive Repair Lotion 250ml', brand: 'Dove', category: 'Skin Care', lifecycleState: 'Active', claimsCount: 3, level: 'Format' },
          { id: 'PRD-VAR-002', name: 'Dove Intensive Repair Shampoo 400ml', brand: 'Dove', category: 'Hair Care', lifecycleState: 'Active', claimsCount: 2, level: 'Sub Range' },
        ];
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-night font-semibold text-base">Related Products</h3>
                <p className="text-sm text-gray-500 mt-0.5">{LINKED_PRODUCTS.length} products associated with this asset</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors">
                <Plus className="w-4 h-4" />
                Link Product
              </button>
            </div>
            <div className="border border-pebble rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-earth">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Product Name</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Product ID</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Brand</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Level</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Claims</th>
                    <th className="px-4 py-3 w-10" />
                  </tr>
                </thead>
                <tbody>
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
          </div>
        );
      }

      case 'Approval Workflow':
        return (
          <ApprovalWorkflowPanel
            asset={asset}
            onAssetSave={onAssetSave}
            onManageApprovers={() => setShowApprovalModal(true)}
            onInitiateWorkflow={() => setShowApprovalModal(true)}
          />
        );

      // case 'Audit Log': — commented out per requirements

      default:
        return (
          <p className="text-sm text-gray-400">Section content coming soon</p>
        );
    }
  };

  const renderWrappedSection = (id: string) => {
    if (
      id === 'Support Strategy & Substantiation' ||
      id === 'Final Risk Level Summary' ||
      id === 'Risk Level Assessments'
    ) {
      return renderSectionContent(id);
    }
    const headerTitle = id === 'Asset Details' ? 'Asset Details' : id;
    return (
      <div className="bg-white rounded-xl border border-pebble p-6">
        <h3 className="text-lg text-night mb-5 flex items-center gap-2" style={{ fontWeight: 600 }}>
          {headerTitle}
        </h3>
        {renderSectionContent(id)}
      </div>
    );
  };

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden relative bg-transparent no-scrollbar">
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
                      Add Version
                    </button>
                    <button className="w-full px-4 py-2 text-sm text-night hover:bg-earth text-left transition-colors">
                      Reclassify
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

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col bg-transparent">
        <div 
          className="flex-1 overflow-y-auto bg-transparent scroll-smooth no-scrollbar p-6 relative"
          onScroll={handleScroll}
        >
          <div className="flex gap-8 items-start relative w-full">
            {/* LEFT COLUMN: Scrollable Sections */}
            <div className="w-[40%] flex-shrink-0 space-y-8 min-w-0">
              {ORDERED_ASSET_SECTIONS.slice(0, 4).map((item) => {
                return (
                  <div
                    key={item.id}
                    ref={(el) => { sectionRefs.current[item.id] = el; }}
                    className="w-full flex-shrink-0"
                  >
                    {renderWrappedSection(item.id)}
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: Sticky Rendition */}
            <div className="flex-1 flex-shrink-0 sticky top-0 bg-white rounded-xl border border-pebble p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-160px)] no-scrollbar hidden md:block">
              {renderRenditionPanel()}
            </div>
          </div>

          {/* FULL WIDTH SECTIONS */}
          <div className="space-y-8 mt-8 w-full">
            {ORDERED_ASSET_SECTIONS.slice(4).map((item) => {
              return (
                <div
                  key={item.id}
                  ref={(el) => { sectionRefs.current[item.id] = el; }}
                  className="w-full flex-shrink-0"
                >
                  {renderWrappedSection(item.id)}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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
    </div>
  );
}