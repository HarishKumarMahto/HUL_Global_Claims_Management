You are adding the M10 Assets Module to an EXISTING React + TypeScript + TailwindCSS 
application. Do NOT rebuild or modify any existing module except where explicitly 
instructed below. Match every existing pattern exactly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 0 — TWO GLOBAL FIXES APPLIED EVERYWHERE FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FIX 1 — STANDARDISE ALL MODAL BACKDROPS (blur everywhere)
──────────────────────────────────────────────────────────
Every modal backdrop in the entire codebase must use this single standard:
  className="fixed inset-0 bg-night/40 backdrop-blur-sm"

Find every file that uses bg-black/40, bg-black/50, bg-black/30 or any other
backdrop variant and replace it with the standard above.

Files to update (search for "fixed inset-0 bg-black" and replace):
  src/app/components/SavedViewsModal.tsx
  src/app/components/CreateProjectModal.tsx
  src/app/components/workspace/ProjectTeamTab.tsx
  src/app/components/workspace/GeographyTab.tsx
  src/app/components/workspace/ProductDocumentsTab.tsx
  src/app/components/claims/ClaimCreationModal.tsx
  src/app/components/claims/AdaptationModal.tsx
  src/app/components/claims/DuplicateClaimModal.tsx
  src/app/components/claims/RiskAssessmentModal.tsx
  src/app/components/claims/AddClaimModal.tsx

For each file, the modal wrapper pattern becomes:
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-night/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative z-10 bg-white rounded-xl shadow-2xl ...">
      {/* modal content */}
    </div>
  </div>

FIX 2 — REORDERABLE COLUMNS ON ALL REMAINING TABLES
────────────────────────────────────────────────────
ProjectTable.tsx, ClaimsTable.tsx and ProductsLandingPage.tsx already have 
drag-to-reorder columns. Apply the same pattern to every other table that 
is missing it:
  src/app/components/workspace/LinkedAssetsTab.tsx
  src/app/components/workspace/ProductDocumentsTab.tsx
  src/app/components/workspace/LinkedProductsTab.tsx
  src/app/components/workspace/RelatedClaimsTab.tsx

The pattern to use (copy from ClaimsTable.tsx §73–100):
  const [columnOrder, setColumnOrder] = useState(BASE_COLUMNS);
  const [draggedCol, setDraggedCol] = useState<number | null>(null);
  const handleDrop = (i: number) => { ... reorder logic ... };
  On each <th>: draggable onDragStart={() => setDraggedCol(i)}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => handleDrop(i)}
  Visual: draggedCol === i → className includes 'bg-pale opacity-60'
  GripVertical icon (w-3.5 h-3.5 text-gray-300) at start of each header cell.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXISTING APP PATTERNS — NEVER DEVIATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COLOR TOKENS (theme.css — use these class names only):
  bg-sky/text-sky/border-sky   #0066CC  CTAs, active states
  bg-night/text-night          #133062  headings, primary text
  bg-earth                     #F6F7F0  page bg, row hover
  bg-pale/text-pale            #C2E0FF  active nav bg, info tints
  bg-pebble/border-pebble      #DEDED7  borders, dividers
  bg-dark/hover:bg-dark        #004D99  CTA hover
  bg-mid                       #47A3FF  secondary accent
  bg-white                     #FFFFFF

LAYOUT PATTERNS:
  Header: bg-night h-14 fixed
  Left sidebar: w-64 bg-white border-r border-pebble
  Active nav item: bg-pale text-sky + blue dot ml-auto w-1.5 h-1.5 rounded-full bg-sky
  Cards/panels: bg-white rounded-xl border border-pebble shadow-sm
  Table header: bg-earth text-xs uppercase text-gray-500 border-b border-pebble sticky top-0
  Table row: bg-white border-b border-pebble hover:bg-earth/50 h-12
  Button primary: bg-sky text-white rounded-lg hover:bg-dark
  Button secondary: border border-pebble text-night rounded-lg hover:bg-earth
  Button destructive: bg-red-600 text-white rounded-lg hover:bg-red-700
  Modal (STANDARD): fixed inset-0 z-50 flex items-center justify-center p-4
                    backdrop: fixed inset-0 bg-night/40 backdrop-blur-sm
                    panel: relative z-10 bg-white rounded-xl shadow-2xl
  Status badges: px-2.5 py-0.5 rounded-full text-xs font-medium

LIFECYCLE BADGE COLORS for Assets:
  Proposed:  bg-blue-50 text-blue-700 border border-blue-200
  Assessed:  bg-green-50 text-green-700 border border-green-200
  Not Used:  bg-gray-100 text-gray-500 border border-gray-200

LOGGED-IN USER: Sarah Johnson | Project Lead | s.johnson@unilever.com | initials SJ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — TYPES (src/app/types.ts — APPEND ONLY, touch nothing existing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type AssetLifecycle = 'Proposed' | 'Assessed' | 'Not Used';
export type AssetSubtype =
  | 'TV Commercial' | 'Digital Banner' | 'Print Ad' | 'Packaging Artwork'
  | 'Product Video' | 'Social Media Kit' | 'Audio Ad' | 'In-Store Display'
  | 'Email Template' | 'Brochure';
export type AssetFileType = 'image' | 'video' | 'audio' | 'pdf' | 'docx' | 'other';
export type ApprovalVerdict = 'Approved' | 'Rejected' | 'Need More Info' | null;
export type ApprovalStatus = 'Pending' | 'Accepted' | 'Submitted';

export interface AssetAnchor {
  id: string;
  label: string;                // e.g. "Anchor 1"
  position: { x: number; y: number };   // % coords on rendition
  timestamp?: number;           // seconds, for video anchors
  comments: AssetComment[];
}

export interface AssetComment {
  id: string;
  anchorId?: string;            // null = asset-level comment
  author: string;
  content: string;
  createdAt: string;
  mentions: string[];
  isReadOnly?: boolean;         // true when asset = Assessed
}

export interface AssetRiskRecord {
  id: string;
  department: 'R&D' | 'Legal' | 'RA' | 'Claims Lead' | 'Marketing';
  assessedBy: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Very High' | null;
  comments: string;
  createdAt: string;
}

export interface AssetFinalRisk {
  finalRiskLevel: 'Low' | 'Medium' | 'High' | 'Very High' | null;
  otherBrandSay: boolean;
  claimsLeadSummary: string;
  legalSummary: string;
  raSummary: string;
  rdSummary: string;
  marketingFeedback: string;
  signOffDocuments: Array<{ id: string; fileName: string; uploadedBy: string; uploadedAt: string }>;
  isLocked: boolean;            // true when lifecycle = Assessed
}

export interface AssetApprover {
  id: string;
  name: string;
  department: 'Legal' | 'Regulatory' | 'Claims Lead';
  status: ApprovalStatus;
  verdict: ApprovalVerdict;
  comment: string;
  submittedAt?: string;
  dueDate: string;
}

export interface AssetApprovalWorkflow {
  id: string;
  initiatedBy: string;
  initiatedAt: string;
  approvers: AssetApprover[];
  isComplete: boolean;
  isCancelled: boolean;
  cancelReason?: string;
}

export interface AssetVersion {
  versionNumber: string;        // decimal e.g. "0.1", "1.0"
  fileName: string;
  fileType: AssetFileType;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  lifecycleStage: AssetLifecycle;
  riskRecords: AssetRiskRecord[];
  finalRisk: AssetFinalRisk;
}

export interface Asset {
  id: string;                   // system-generated AT-{N}
  name: string;
  subtype: AssetSubtype | null; // null when "Classify Later" chosen
  businessGroup: string;
  category: string;
  currentVersionNumber: string;
  versions: AssetVersion[];
  lifecycleStage: AssetLifecycle;
  isPlaceholder: boolean;       // true = no file uploaded yet
  geography: string[];
  linkedClaimIds: string[];
  linkedProjectIds: string[];
  relatedAssetIds: string[];
  anchors: AssetAnchor[];
  assetLevelComments: AssetComment[];
  approvalWorkflow: AssetApprovalWorkflow | null;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
  isFavorite?: boolean;
  lastViewedAt?: string;
  aiCandidateClaims?: Array<{
    id: string; statement: string; confidence: number; accepted: boolean | null;
  }>;
  aiRecommendedProducts?: Array<{
    id: string; name: string; context: string; accepted: boolean | null;
  }>;
  whereUsed: {
    projectIds: string[];
    claimIds: string[];
    assetIds: string[];
  };
  auditLog: Array<{
    id: string; action: string; actor: string; timestamp: string; details?: string;
  }>;
}

// Mock 8 assets spanning all subtypes/lifecycles
export const mockAssets: Asset[] = [
  {
    id: 'AT-001',
    name: 'Dove Intensive Repair TV Commercial 30s',
    subtype: 'TV Commercial',
    businessGroup: 'Beauty & Personal Care',
    category: 'Skin Care',
    currentVersionNumber: '1.0',
    versions: [{
      versionNumber: '1.0', fileName: 'dove_tv_30s_v1.mp4',
      fileType: 'video', fileSize: '42.3 MB',
      uploadedBy: 'Sarah Johnson', uploadedAt: '2026-04-20T10:00:00Z',
      lifecycleStage: 'Assessed',
      riskRecords: [
        { id: 'RR-001', department: 'Legal', assessedBy: 'James Brown',
          riskLevel: 'Low', comments: 'No legal concerns.', createdAt: '2026-04-21T09:00:00Z' },
        { id: 'RR-002', department: 'RA', assessedBy: 'Emma Williams',
          riskLevel: 'Low', comments: 'Compliant with all regulations.', createdAt: '2026-04-22T11:00:00Z' },
      ],
      finalRisk: {
        finalRiskLevel: 'Low', otherBrandSay: false,
        claimsLeadSummary: 'All claims verified.',
        legalSummary: 'No issues.', raSummary: 'Compliant.',
        rdSummary: 'Scientifically sound.', marketingFeedback: 'Approved.',
        signOffDocuments: [{ id: 'SD-001', fileName: 'legal_signoff.pdf',
          uploadedBy: 'James Brown', uploadedAt: '2026-04-22T14:00:00Z' }],
        isLocked: true,
      },
    }],
    lifecycleStage: 'Assessed',
    isPlaceholder: false,
    geography: ['UK', 'Germany', 'France'],
    linkedClaimIds: ['CLM-001', 'CLM-002'],
    linkedProjectIds: ['1'],
    relatedAssetIds: ['AT-002'],
    anchors: [
      { id: 'ANC-001', label: 'Anchor 1', position: { x: 25, y: 40 },
        comments: [{ id: 'C-001', author: 'Emma Williams',
          content: 'Hydration claim visible here — confirm substantiation link.',
          createdAt: '2026-04-21T10:30:00Z', mentions: [], isReadOnly: true }] }
    ],
    assetLevelComments: [],
    approvalWorkflow: {
      id: 'WF-001', initiatedBy: 'Sarah Johnson', initiatedAt: '2026-04-20T12:00:00Z',
      approvers: [
        { id: 'AP-001', name: 'James Brown', department: 'Legal',
          status: 'Submitted', verdict: 'Approved', comment: 'Approved.',
          submittedAt: '2026-04-21T09:00:00Z', dueDate: '2026-04-25' },
        { id: 'AP-002', name: 'Emma Williams', department: 'Regulatory',
          status: 'Submitted', verdict: 'Approved', comment: 'Compliant.',
          submittedAt: '2026-04-22T11:00:00Z', dueDate: '2026-04-25' },
        { id: 'AP-003', name: 'Michael Chen', department: 'Claims Lead',
          status: 'Submitted', verdict: 'Approved', comment: 'All good.',
          submittedAt: '2026-04-22T13:00:00Z', dueDate: '2026-04-25' },
      ],
      isComplete: true, isCancelled: false,
    },
    createdBy: 'Sarah Johnson', createdAt: '2026-04-20T09:00:00Z',
    modifiedBy: 'Sarah Johnson', modifiedAt: '2026-04-25T14:00:00Z',
    isFavorite: true,
    whereUsed: { projectIds: ['1'], claimIds: ['CLM-001', 'CLM-002'], assetIds: ['AT-002'] },
    auditLog: [
      { id: 'AL-001', action: 'Asset created', actor: 'Sarah Johnson', timestamp: '2026-04-20T09:00:00Z' },
      { id: 'AL-002', action: 'Lifecycle → Assessed', actor: 'Sarah Johnson', timestamp: '2026-04-23T10:00:00Z' },
    ],
  },
  {
    id: 'AT-002',
    name: 'Dove Repair Packaging Artwork v0.2',
    subtype: 'Packaging Artwork',
    businessGroup: 'Beauty & Personal Care', category: 'Skin Care',
    currentVersionNumber: '0.2',
    versions: [
      { versionNumber: '0.1', fileName: 'dove_pkg_v01.png', fileType: 'image',
        fileSize: '3.1 MB', uploadedBy: 'Sarah Johnson', uploadedAt: '2026-04-10T09:00:00Z',
        lifecycleStage: 'Proposed',
        riskRecords: [], finalRisk: { finalRiskLevel: null, otherBrandSay: false,
        claimsLeadSummary: '', legalSummary: '', raSummary: '', rdSummary: '',
        marketingFeedback: '', signOffDocuments: [], isLocked: false } },
      { versionNumber: '0.2', fileName: 'dove_pkg_v02.png', fileType: 'image',
        fileSize: '3.4 MB', uploadedBy: 'Sarah Johnson', uploadedAt: '2026-04-18T11:00:00Z',
        lifecycleStage: 'Proposed',
        riskRecords: [
          { id: 'RR-003', department: 'R&D', assessedBy: 'Sarah Johnson',
            riskLevel: 'Medium', comments: 'Claim wording needs clarification.', createdAt: '2026-04-19T10:00:00Z' }
        ],
        finalRisk: { finalRiskLevel: null, otherBrandSay: false,
        claimsLeadSummary: '', legalSummary: '', raSummary: '', rdSummary: '',
        marketingFeedback: '', signOffDocuments: [], isLocked: false } },
    ],
    lifecycleStage: 'Proposed', isPlaceholder: false,
    geography: ['UK'], linkedClaimIds: ['CLM-001'],
    linkedProjectIds: ['1'], relatedAssetIds: ['AT-001'],
    anchors: [], assetLevelComments: [
      { id: 'C-002', author: 'Michael Chen',
        content: 'Please verify the claim statement aligns with latest brief.',
        createdAt: '2026-04-19T09:00:00Z', mentions: ['Sarah Johnson'] }
    ],
    approvalWorkflow: null,
    createdBy: 'Sarah Johnson', createdAt: '2026-04-10T09:00:00Z',
    modifiedBy: 'Sarah Johnson', modifiedAt: '2026-04-18T11:00:00Z',
    isFavorite: false,
    whereUsed: { projectIds: ['1'], claimIds: ['CLM-001'], assetIds: ['AT-001'] },
    auditLog: [
      { id: 'AL-003', action: 'Asset created', actor: 'Sarah Johnson', timestamp: '2026-04-10T09:00:00Z' },
      { id: 'AL-004', action: 'New version 0.2 uploaded', actor: 'Sarah Johnson', timestamp: '2026-04-18T11:00:00Z' },
    ],
  },
  {
    id: 'AT-003', name: 'Lynx Africa Digital Banner Set',
    subtype: 'Digital Banner', businessGroup: 'Beauty & Personal Care', category: 'Deodorant',
    currentVersionNumber: '0.1',
    versions: [{ versionNumber: '0.1', fileName: 'lynx_banners.zip', fileType: 'image',
      fileSize: '8.7 MB', uploadedBy: 'Emma Williams', uploadedAt: '2026-04-15T14:00:00Z',
      lifecycleStage: 'Proposed',
      riskRecords: [], finalRisk: { finalRiskLevel: null, otherBrandSay: false,
      claimsLeadSummary: '', legalSummary: '', raSummary: '', rdSummary: '',
      marketingFeedback: '', signOffDocuments: [], isLocked: false } }],
    lifecycleStage: 'Proposed', isPlaceholder: false,
    geography: ['UK', 'Australia'], linkedClaimIds: [],
    linkedProjectIds: ['5'], relatedAssetIds: [],
    anchors: [], assetLevelComments: [], approvalWorkflow: null,
    createdBy: 'Emma Williams', createdAt: '2026-04-15T14:00:00Z',
    modifiedBy: 'Emma Williams', modifiedAt: '2026-04-15T14:00:00Z',
    isFavorite: false,
    whereUsed: { projectIds: ['5'], claimIds: [], assetIds: [] },
    auditLog: [{ id: 'AL-005', action: 'Asset created', actor: 'Emma Williams', timestamp: '2026-04-15T14:00:00Z' }],
  },
  {
    id: 'AT-004', name: 'Vaseline Intensive Care Print Ad',
    subtype: 'Print Ad', businessGroup: 'Beauty & Personal Care', category: 'Body Care',
    currentVersionNumber: '1.0',
    versions: [{ versionNumber: '1.0', fileName: 'vaseline_print_ad.pdf', fileType: 'pdf',
      fileSize: '5.2 MB', uploadedBy: 'David Smith', uploadedAt: '2026-03-20T09:00:00Z',
      lifecycleStage: 'Not Used',
      riskRecords: [], finalRisk: { finalRiskLevel: 'Low', otherBrandSay: false,
      claimsLeadSummary: 'Reviewed.', legalSummary: '', raSummary: '', rdSummary: '',
      marketingFeedback: '', signOffDocuments: [], isLocked: true } }],
    lifecycleStage: 'Not Used', isPlaceholder: false,
    geography: ['US'], linkedClaimIds: [],
    linkedProjectIds: [], relatedAssetIds: [],
    anchors: [], assetLevelComments: [], approvalWorkflow: null,
    createdBy: 'David Smith', createdAt: '2026-03-20T09:00:00Z',
    modifiedBy: 'David Smith', modifiedAt: '2026-04-01T10:00:00Z',
    isFavorite: false,
    whereUsed: { projectIds: [], claimIds: [], assetIds: [] },
    auditLog: [
      { id: 'AL-006', action: 'Asset created', actor: 'David Smith', timestamp: '2026-03-20T09:00:00Z' },
      { id: 'AL-007', action: 'Lifecycle → Not Used', actor: 'David Smith', timestamp: '2026-04-01T10:00:00Z', details: 'Campaign cancelled' },
    ],
  },
  {
    id: 'AT-005', name: 'Persil Social Media Kit Q2',
    subtype: 'Social Media Kit', businessGroup: 'Home Care', category: 'Laundry',
    currentVersionNumber: '0.1',
    versions: [{ versionNumber: '0.1', fileName: '', fileType: 'other',
      fileSize: '', uploadedBy: 'Lisa Anderson', uploadedAt: '2026-04-22T11:00:00Z',
      lifecycleStage: 'Proposed',
      riskRecords: [], finalRisk: { finalRiskLevel: null, otherBrandSay: false,
      claimsLeadSummary: '', legalSummary: '', raSummary: '', rdSummary: '',
      marketingFeedback: '', signOffDocuments: [], isLocked: false } }],
    lifecycleStage: 'Proposed', isPlaceholder: true,
    geography: ['Germany', 'France'], linkedClaimIds: [],
    linkedProjectIds: ['3'], relatedAssetIds: [],
    anchors: [], assetLevelComments: [], approvalWorkflow: null,
    createdBy: 'Lisa Anderson', createdAt: '2026-04-22T11:00:00Z',
    modifiedBy: 'Lisa Anderson', modifiedAt: '2026-04-22T11:00:00Z',
    isFavorite: false,
    whereUsed: { projectIds: ['3'], claimIds: [], assetIds: [] },
    auditLog: [{ id: 'AL-008', action: 'Placeholder created', actor: 'Lisa Anderson', timestamp: '2026-04-22T11:00:00Z' }],
  },
  // Add 3 more mock assets for AT-006 (Assessed, Magnum Video), 
  // AT-007 (Proposed, Knorr Email Template, isFavorite:true),
  // AT-008 (Proposed, Domestos In-Store Display, with approval workflow in progress 1/3 complete)
  // Follow exact same structure as above.
];

// Asset subtype list for dropdowns
export const ASSET_SUBTYPES: AssetSubtype[] = [
  'TV Commercial','Digital Banner','Print Ad','Packaging Artwork',
  'Product Video','Social Media Kit','Audio Ad','In-Store Display',
  'Email Template','Brochure',
];

export const ASSET_LIFECYCLE_COLORS: Record<AssetLifecycle, string> = {
  'Proposed': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Assessed': 'bg-green-50 text-green-700 border border-green-200',
  'Not Used': 'bg-gray-100 text-gray-500 border border-gray-200',
};

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — App.tsx CHANGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add state:
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetsModuleView, setAssetsModuleView] = useState<'library'|'workspace'>('library');
  const [activeAssetsLibraryView, setActiveAssetsLibraryView] = useState('All Assets');
  const [activeAssetSection, setActiveAssetSection] = useState('Asset Details');

In handleModuleChange: add
  if (module !== 'Assets') { setSelectedAsset(null); setAssetsModuleView('library'); }

In main content rendering, replace the Assets "coming soon" placeholder with:
  } else if (activeModule === 'Assets') {
    if (selectedAsset && assetsModuleView === 'workspace') {
      return <AssetWorkspace
        asset={selectedAsset}
        assets={assets}
        onBack={() => { setSelectedAsset(null); setAssetsModuleView('library'); }}
        onAssetSave={(updated) => {
          setAssets(prev => prev.map(a => a.id === updated.id ? updated : a));
          setSelectedAsset(updated);
        }}
        activeSection={activeAssetSection}
        onSectionChange={setActiveAssetSection}
      />;
    }
    return <AssetsModule
      assets={assets}
      onAssetsChange={setAssets}
      activeLibraryView={activeAssetsLibraryView}
      onLibraryViewChange={setActiveAssetsLibraryView}
      onAssetClick={(asset) => { setSelectedAsset(asset); setAssetsModuleView('workspace'); }}
    />;
  }

Pass to LeftNavigation:
  activeAssetsLibraryView={activeAssetsLibraryView}
  onAssetsLibraryViewChange={setActiveAssetsLibraryView}
  isInAssetWorkspace={activeModule === 'Assets' && !!selectedAsset}
  activeAssetSection={activeAssetSection}
  onAssetSectionChange={setActiveAssetSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — LeftNavigation.tsx ASSETS BRANCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add props to LeftNavigationProps:
  activeAssetsLibraryView?: string;
  onAssetsLibraryViewChange?: (view: string) => void;
  isInAssetWorkspace?: boolean;
  activeAssetSection?: string;
  onAssetSectionChange?: (section: string) => void;

When activeModule === 'Assets' AND isInAssetWorkspace === false:
Render sidebar with:
  Section "LIBRARY VIEWS":
    All Assets | My Assets | Favorites | Recently Viewed
    (same active item pattern as Claims left nav)
  Divider
  Section "ACTIONS":
    [+ Create Asset] button → bg-sky text-white w-full rounded-lg

When activeModule === 'Assets' AND isInAssetWorkspace === true:
Render workspace sections sidebar (same as ClaimWorkspace pattern):
  Asset Details | Rendition | Metadata | Support Strategy & Substantiation
  | Final Risk Level Summary | Risk Level Assessments
  | Related Claims & Adaptations | Where Used | Approval Workflow | Audit Log
  Show section count: "X / 10 sections" in footer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — AssetsModule.tsx  (new: src/app/components/assets/AssetsModule.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mirror ClaimsModule.tsx exactly. Layout:
  <div className="flex flex-col h-full overflow-hidden">
    PAGE HEADER (bg-white border-b border-pebble px-6 py-4 flex-shrink-0):
      Row 1: <h1>Assets</h1> + [+ Create Asset] button (bg-sky)
      Row 2: Search input + Filter dropdowns:
        Lifecycle State (multi) | Subtype (multi) | Business Group (multi) | Geography (multi)
        [Clear All] shown when any active
        Filter scope: "X assets match your filters"

    BULK ACTION BAR (shown when ≥1 selected):
      "{n} selected" + [Bulk Actions ▾] dropdown:
        → Initiate Approval Workflow | Mark Not Used | Download Selected

    TABLE AREA (flex-1 p-5 overflow-hidden):
      <AssetsTable ... />
  </div>

FILTERING LOGIC:
  activeLibraryView === 'My Assets'       → createdBy === 'Sarah Johnson'
  activeLibraryView === 'Favorites'       → isFavorite === true
  activeLibraryView === 'Recently Viewed' → sort by lastViewedAt desc
  All views apply AND logic across search + dropdown filters.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — AssetsTable.tsx  (new: src/app/components/assets/AssetsTable.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mirror ClaimsTable.tsx structure exactly including drag-to-reorder columns.

COLUMNS (in default order):
  1. Checkbox          40px
  2. Expand chevron    40px
  3. Star (favorite)   40px   — clicking toggles isFavorite, filled star = yellow-400
  4. Asset Name        260px  — clickable text opens AssetWorkspace; shows "Placeholder" badge if isPlaceholder
  5. Asset ID          90px   — AT-{N}
  6. Subtype           140px  — text or "Unclassified" in gray if null
  7. Lifecycle         120px  — colored badge using ASSET_LIFECYCLE_COLORS
  8. Version           80px   — currentVersionNumber
  9. Business Group    140px
  10. Geography        120px  — first 2 + "+N more"
  11. Created By       130px
  12. Modified On      110px  — relative date

All columns draggable via GripVertical icon. Same drag pattern as ClaimsTable.

US-M10-F09 INLINE WORKBENCH (expand chevron):
  One row open at a time. If unsaved changes: show inline warning banner (no modal).
  Sticky context header: Asset Name | Version badge | Lifecycle badge | Subtype | [Open full view →]
  
  4 accordion sub-sections (vertical, same pattern as Claims accordion update):
  Each has summary chips in collapsed row + full edit in expanded:

  SUB-SECTION 1 — Claims & Adaptations
    Icon: Link2 | Label: "Related Claims & Adaptations"
    Summary chips: "{n} claims linked" | "{n} Auto-linked"
    Expanded: table of linked claims — Claim ID | Statement | Type | Auto badge or X remove
    [+ Link Claim] button

  SUB-SECTION 2 — Risk
    Icon: Shield | Label: "Risk Level Assessments"
    Summary chips: "{n} assessments" | Latest risk level chip
    Expanded: per-department risk table (same structure as ClaimsTable Risk tab)
    [+ Add Assessment] adds editable row for logged-in user's dept

  SUB-SECTION 3 — Comments
    Icon: MessageSquare | Label: "Comments"
    Summary chips: "{n} comments" | "{n} anchors"
    Expanded: threaded comment list (asset-level) + [+ Add Comment] textarea

  SUB-SECTION 4 — History
    Icon: History | Label: "Audit Log"
    Summary chips: "{n} entries"
    Expanded: read-only log rows (action | actor | timestamp)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — AssetWorkspace.tsx  (new: src/app/components/assets/AssetWorkspace.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mirror ClaimWorkspace.tsx structure exactly.

HEADER (bg-white border-b border-pebble px-6 py-4):
  Breadcrumb: ← Assets / {asset.name truncated}
  Right: version dropdown selector | [Collaborate] button
  Row 1: asset.name (h2)
    + Lifecycle badge (ASSET_LIFECYCLE_COLORS)
    + "Placeholder" badge (bg-amber-50 text-amber-700) if isPlaceholder
    + Lifecycle action buttons (role + lifecycle gated — see below)
    + [⋮] three-dot: Reclassify | Add Version | Download | Delete
  Row 2: Asset ID (monospace badge) | Subtype | BG | Modified {relative date}

VERSION DROPDOWN in header:
  Shows all version numbers; clicking switches to that version (read-only for non-latest).
  Latest version shows "Latest" green badge.
  Non-latest: "Versioned from vX.X" badge (amber).

LIFECYCLE ACTION BUTTONS:
  From Proposed:
    [Mark as Assessed] — validates:
      ✓ isPlaceholder === false (file uploaded)
      ✓ finalRisk.finalRiskLevel !== null OR finalRisk.otherBrandSay === true
      ✓ approvalWorkflow === null OR approvalWorkflow.isComplete === true
      ✓ if finalRisk.finalRiskLevel === 'High': signOffDocuments.length > 0
      If fails: ValidationModal listing each failed check (same pattern as ClaimWorkspace)
      On success: lifecycle → Assessed; finalRisk.isLocked = true;
                  all comments.isReadOnly = true; audit entry added.
    [Mark Not Used] — confirmation modal with mandatory reason field → lifecycle = Not Used
  From Assessed:
    [Mark Not Used] — same as above
    [Initiate Approval Workflow] — opens ApprovalWorkflowModal (see Part 9)
  From Not Used: read-only; show locked banner; no action buttons except [Reclassify]

THREE-DOT MENU:
  Reclassify → opens ReclassifyModal (Part 9); disabled when Not Used
  Add Version → opens AddVersionModal (Part 9); disabled when Not Used
  Download → two-option menu: Original | Rendition; both trigger mock download toast
  Delete → opens DeleteAssetModal (Part 9); gated: blocked if Assessed OR has active links

BODY (flex-1 flex overflow-hidden):
  Main content area driven by activeSection prop.
  CollaborationDrawer same as ProjectWorkspace (reuse existing component).

SECTIONS rendered by activeSection:

── "Asset Details" ──────────────────────────────────────────────────────────
Two-column layout:
  Left — Core fields (editable when Proposed):
    Name (text input) | Subtype (read-only, link to Reclassify) | Version (read-only)
    Business Group (select from BUSINESS_GROUPS) | Category (select filtered by BG)
    Geography (multi-select chips) | Created By / Modified By (read-only)
    Lifecycle (read-only badge) | isPlaceholder toggle (read-only, changed via Upload)
  Right — Linked Projects (read-only list with external link badges)
    + Linked Claims count badge

── "Rendition" ──────────────────────────────────────────────────────────────
US-M10-F04: Asset Viewer + Anchors + Comments
  If isPlaceholder:
    Empty state with [Upload File] button (same drag-drop as creation modal).
  Else:
    Mock rendition area (gray bg with file type icon centered):
      Image → show ImageWithFallback component
      Video → gray box with Play icon + timestamp scrubber (mock, non-functional)
      PDF/Doc → gray box with FileText icon
      Audio → gray box with Music icon + play bar (mock)
    Anchor pins overlaid as numbered circles (w-6 h-6 rounded-full bg-sky text-white text-xs):
      Draggable within rendition area; clicking opens anchor comment thread panel on right.
    [+ Add Anchor] button → clicking rendition area places new pin at click position.
    Comment panel (right side, w-72, slides in):
      Shows anchor label + threaded comments for that anchor.
      [+ Reply] input with @mention support (mock: type @ to show user dropdown).
      Asset-level comments tab at bottom.
    All comments become read-only when asset.lifecycleStage === 'Assessed'.

── "Metadata" ───────────────────────────────────────────────────────────────
Extended fields in two-column form:
  Asset ID (read-only) | File Name | File Size | File Type | Upload Date
  Duplicate content check result: "No duplicates found" / "X similar assets found" badge
  [Run Duplicate Check] button → shows mock duplicate modal (lists 1–2 existing assets)

── "Support Strategy & Substantiation" ──────────────────────────────────────
Identical to ClaimWorkspace Support Strategy section:
  Support Strategy (textarea) | Classification Level (select) | Reason (input)
  Substantiation Documents table: fileName | classification dropdown | uploadedBy | date | remove
  [+ Upload Document] | [Save] button

── "Final Risk Level Summary" ────────────────────────────────────────────────
US-M10-F05: Risk & Compliance Capture
  If finalRisk.isLocked: show amber "Locked — Asset is Assessed" banner; all fields read-only.
  Two-column grid:
    Left: Final Risk Level (select Low/Medium/High/Very High) | Other/Brand Say (checkbox)
          Classification Level | Reason
    Right: Claims Lead Summary | Legal Summary | RA Summary | R&D Summary | Marketing Feedback
  Sign-Off Documents section:
    File list with thumbnails (mock gray boxes)
    Warning banner if finalRiskLevel === 'High' and signOffDocuments empty:
      "⚠ High-risk asset requires at least one sign-off document before assessment."
    [+ Upload Sign-Off Document] button
  [Save] button

── "Risk Level Assessments" ──────────────────────────────────────────────────
US-M10-F05: Department-specific risk records
  One card per department (R&D | Legal | RA | Claims Lead | Marketing):
    Card header: department name + assessedBy name
    Own card (dept matches logged-in user's role): highlighted bg-pale/30 border-sky/30
                                                   → editable
    Other cards: bg-white → read-only
    Fields per card: Risk Level (select) | Comments (textarea) | Created At (auto, read-only)
  [+ Add My Assessment] button adds a new editable card for the user's dept.

── "Related Claims & Adaptations" ────────────────────────────────────────────
US-M10-F03: Claims linkage
  Search/select bar to link claims.
  Table: Claim ID | Claim Statement | Type | Auto badge (if system-derived) | Remove (X, manual only)
  System-derived rows (from linkedClaimIds): show "Auto" badge, no X button.
  Manual rows: show X remove button.
  Info note: "System-derived geographies and adaptations are read-only."
  Side-by-side layout with asset rendition thumbnail on right (160px fixed, bg-earth rounded-lg).

── "Where Used" ──────────────────────────────────────────────────────────────
US-M10-F14: Where Used
  Three sub-sections (accordion style):
    Projects: list of project names/IDs with external link icons
    Claims:   list of claim IDs + statements
    Other Assets: list of asset names + IDs
  Each shows count badge in section header.
  Empty state per section: "Not referenced in any {type}."

── "Approval Workflow" ────────────────────────────────────────────────────────
US-M10-F08: Approval Workflow
  If no workflow: empty state with [Initiate Approval Workflow] button.
  If workflow exists:
    Progress indicator: "{completed}/{total} approvers complete"
      Thin progress bar (bg-sky, same style as HomePage lifecycle bar)
    Approver table: Name | Dept | Status | Verdict chip | Comment | Submitted At | Due Date
    Verdict chips: Approved=green | Rejected=red | Need More Info=amber | null=gray "Pending"
    [Manage Approvers] button (Workflow Owner only — Sarah Johnson):
      Opens inline edit: add row | remove row | reassign name per row
    If any approver is Rejected or Need More Info:
      Show warning banner: "Workflow has unresolved verdicts. Asset cannot be Assessed."
    Completed workflow: all rows green + "Workflow Complete" banner (green).
    Cancelled workflow: gray banner with cancel reason.

── "Audit Log" ────────────────────────────────────────────────────────────────
Read-only table. Columns: Action | Actor | Timestamp | Details
  Same card style as audit log in ProjectWorkspace.
  All entries from asset.auditLog[].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — CreateAssetModal.tsx  (new)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

US-M10-F01 + US-M10-F02: 2-step modal. Standard backdrop.
Entry points: AssetsModule [+ Create Asset] button + [+ Create Asset] in LeftNavigation.

STEP 1 — CHOOSE MODE:
  Two large option cards side by side (same size, centered):
    Card A: [Upload icon]  "Upload File"
            "Upload a file now and register the asset."
    Card B: [FileText icon] "Create Placeholder"
            "Register asset metadata now, upload file later."
  Selecting a card highlights it (border-sky bg-pale/20).
  Below: if Upload selected → drag-and-drop zone appears:
    "Drag & drop or click to upload"
    Accepted types listed: jpg, png, gif, mp4, mp3, pdf, docx
    Max size: 500 MB
    On file select: show file name + size + type icon. Remove (X) to clear.
  [Cancel] [Next →] — Next disabled until mode selected (and file chosen if Upload).

STEP 2 — METADATA:
  Full-width form in 2-column grid:
    Left column:
      Name (text input, pre-filled from fileName if upload, else empty) — MANDATORY
      Asset Subtype (typeahead select from ASSET_SUBTYPES, ordered by recent usage)
        + "Classify Later" option (clears mandatory requirement for subtype only)
      Business Group (select from BUSINESS_GROUPS) — MANDATORY
      Category (select filtered by BG — disabled until BG selected) — MANDATORY
      Version (text input, placeholder "0.1", decimal format enforced) — MANDATORY
    Right column:
      Geography (multi-select chips from REGIONS)
      Link to Project (searchable select — optional)
      Link to Claim (searchable select — optional)
      Notes (textarea — optional)

  Duplicate content check (Upload mode only):
    Runs mock check on [Next] click before showing Step 2.
    If match found: non-blocking modal "Similar assets found: [AT-001 — Dove TV Commercial]"
    [Continue Anyway] [Cancel] buttons.

  [Back] [Save Asset] buttons.
  Save blocked unless MANDATORY fields filled (except subtype if "Classify Later").
  On Save:
    Asset ID = AT-{mockAssets.length + 1}
    lifecycleStage = 'Proposed'
    isPlaceholder = (mode === 'placeholder')
    Show success toast: "Asset {name} created — ID: AT-{N}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — SPARCi AI PANEL  (inside AssetWorkspace, US-M10-F13)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add [✦ SPARCi] button to the three-dot area of the workspace header.
Clicking opens a right-side slide-in panel (w-80, bg-white border-l border-pebble):

Panel header: "✦ SPARCi AI Assist" + X close button

Section 1 — Extract Claims:
  [Extract Claims from Asset] button (bg-sky)
  On click: show loading spinner 1.5s then render mock candidates from
  asset.aiCandidateClaims[]:
    Each row: confidence badge (≥80% green, ≥50% amber, <50% gray) | statement text
              [Accept] button | [Reject] button
  [Accept All] bulk action button.
  Accepted items: green checkmark, greyed out.
  Footer note: "AI recommendations are never auto-committed."

Section 2 — Recommend Products:
  [Recommend Products] button (border border-sky text-sky)
  On click: show loading 1.5s then render mock from asset.aiRecommendedProducts[]:
    Each row: product name | context note | [Accept] | [Reject]
  Same accept/reject pattern.

If AI unavailable (mock: show when asset.id === 'AT-004'):
  Gray panel: "AI unavailable — please try again later." No error breaking the page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — SUPPORTING MODALS  (all in src/app/components/assets/)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All modals use standard backdrop: fixed inset-0 bg-night/40 backdrop-blur-sm.

ReclassifyModal.tsx — US-M10-F11:
  Fields: Target Subtype (select from ASSET_SUBTYPES)
  Auto-shows: "The following fields will be cleared: [list of subtype-specific fields]"
  Toggle: "Mark as new version" (off by default)
  If target subtype causes lifecycle impact: warning:
    "Lifecycle will be reset to Proposed. Asset Document Number will be reset."
  [Cancel] [Confirm Reclassify] — Confirm disabled until target subtype selected.
  On confirm: subtype updated; if lifecycle impact → lifecycleStage = 'Proposed';
              show banner in workspace: "Lifecycle set to Proposed; Asset Doc # reset."
              audit entry added.

AddVersionModal.tsx — US-M10-F07:
  Fields: New Version Number (decimal, must be > currentVersionNumber — enforce client-side)
          + Upload zone (same as CreateAssetModal)
  [Cancel] [Upload New Version]
  On save: new AssetVersion pushed to versions[]; currentVersionNumber updated;
           new version lifecycleStage = 'Proposed'; audit entry added.
  Toast: "Version {n} uploaded successfully."

DeleteAssetModal.tsx — US-M10-F12:
  Pre-check before opening:
    If lifecycleStage === 'Assessed': blocked — show error toast "Cannot delete an Assessed asset."
    If whereUsed has active links: blocked — modal shows "Cannot delete — asset is linked to:
      {list of projects/claims}" with [OK] only.
  Normal flow: destructive red modal.
    "This action will permanently delete {asset.name}."
    "Linked items: none" (shown dynamically)
    Reason input (mandatory)
    [Cancel] [Delete Asset] (red bg-red-600)
  On confirm: asset removed from list; success toast "Asset deleted. Archived record retained."

ApprovalWorkflowModal.tsx — US-M10-F08:
  For initiating OR managing approvers.
  Three approver rows by default (Legal | Regulatory | Claims Lead):
    Each row: Name (text input) | Department (read-only) | Due Date (date input)
    [+ Add Approver] adds empty row
    [✕] removes row (only before any verdict submitted)
  [Cancel] [Initiate Workflow] / [Save Changes]
  On save: approvalWorkflow created with status: 'Pending' for all; audit entry added.
  Toast: "Approval workflow initiated. Approvers notified."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — ENTRY POINTS FROM PROJECT & CLAIM WORKSPACES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

US-M10-F01 entry point from Project → Linked Assets tab:
  In src/app/components/workspace/LinkedAssetsTab.tsx:
    [+ Add Asset] dropdown: "Link Existing Asset" | "Create New Asset"
    "Create New Asset" → opens CreateAssetModal with projectId pre-linked.
    Table already exists; ensure columns are draggable (FIX 2 applies here).

US-M10-F01 entry point from Claim → Related Assets section:
  In src/app/components/claims/ClaimWorkspace.tsx, Related Assets section:
    [+ Add Asset] dropdown: "Link Existing Asset" | "Create New Asset"
    "Create New Asset" → opens CreateAssetModal with claimId pre-linked.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 11 — DOWNLOAD  (US-M10-F10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

On AssetsTable: multi-select → Bulk Actions → "Download Selected":
  If ≤ 50 assets: toast "Preparing zip download for {n} assets..."
  If > 50 assets: toast "Your export is being prepared. You'll receive an email when ready."

On AssetWorkspace three-dot → Download:
  Two-option dropdown: "Original File" | "Rendition"
  Both: show toast "Download link generated (expires in 5 minutes)."
  Original: only shown (not disabled) since logged-in user is Sarah Johnson (has permission).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILES TO CREATE (all new):
  src/app/components/assets/AssetsModule.tsx
  src/app/components/assets/AssetsTable.tsx
  src/app/components/assets/AssetWorkspace.tsx
  src/app/components/assets/CreateAssetModal.tsx
  src/app/components/assets/ReclassifyModal.tsx
  src/app/components/assets/AddVersionModal.tsx
  src/app/components/assets/DeleteAssetModal.tsx
  src/app/components/assets/ApprovalWorkflowModal.tsx

FILES TO MODIFY:
  src/app/App.tsx                              (PART 2)
  src/app/types.ts                             (PART 1 — append only)
  src/app/components/LeftNavigation.tsx        (PART 3)
  src/app/components/workspace/LinkedAssetsTab.tsx      (FIX 2 + PART 10)
  src/app/components/claims/ClaimWorkspace.tsx          (PART 10)
  + all files listed in FIX 1 (backdrop standardisation)

FILES TO NEVER TOUCH:
  All other existing files not listed above.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL SELF-CHECK BEFORE FINISHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Every modal backdrop = "fixed inset-0 bg-night/40 backdrop-blur-sm" — no exceptions
✓ Every table has GripVertical drag-to-reorder columns
✓ Asset always starts Proposed on creation
✓ Placeholder cannot reach Assessed without file upload
✓ Not Used assets render read-only; no new links allowed; Reclassify still available
✓ Comments are all read-only when lifecycleStage === 'Assessed'
✓ finalRisk.isLocked = true when Assessed; PATCH rejected visually (fields disabled)
✓ High-risk sign-off document gate enforced before Assessed transition
✓ Approval workflow: all 3 approvers must submit before Assessed allowed
✓ Version number must be > current (enforced client-side in AddVersionModal)
✓ Reclassification with lifecycle impact → Proposed + banner shown
✓ Delete blocked if Assessed or has active links; reason mandatory
✓ AI panel degrades gracefully (AT-004 shows "AI unavailable" state)
✓ Bulk download toast differs for ≤50 vs >50 assets
✓ CollaborationDrawer reused from existing component (no reimplementation)
✓ All color tokens from theme.css — no hardcoded hex values
✓ ASSET_LIFECYCLE_COLORS used for all lifecycle badges