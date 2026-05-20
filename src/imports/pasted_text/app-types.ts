You are adding the M4 Claims Module to an EXISTING React + TypeScript + TailwindCSS application. 
Do NOT rebuild the app. Add only what is described below. Match the existing codebase exactly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXISTING APP CONTEXT — READ THIS FIRST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TECH STACK: React, TypeScript, TailwindCSS, lucide-react icons, shadcn/ui components

COLOR TOKENS (already defined, use these class names exactly):
  bg-sky / text-sky / border-sky       → #0066CC (primary blue, CTAs, active states)
  bg-night / text-night                → #133062 (headings, primary text)
  bg-earth / text-earth                → #F6F7F0 (page background, hover states)
  bg-pale / text-pale                  → #C2E0FF (active nav bg, info highlights)
  bg-pebble / border-pebble            → #DEDED7 (borders, dividers)
  bg-dark / hover:bg-dark              → #004D99 (hover on CTAs)
  bg-mid                               → #47A3FF
  bg-white                             → #FFFFFF (card/panel backgrounds)

DESIGN PATTERNS TO REPLICATE EXACTLY:
  - Header height: 56px, bg-night, fixed
  - Left sidebar: w-64, bg-white, border-r border-pebble
  - Active nav item: bg-pale text-sky, blue dot on right (w-1.5 h-1.5 rounded-full bg-sky)
  - Inactive nav item: text-gray-600 hover:bg-earth hover:text-night
  - Section labels: uppercase, text-xs, text-gray-500, tracking-wide
  - Buttons primary: bg-sky text-white rounded-lg hover:bg-dark
  - Buttons secondary: border border-pebble text-night rounded-lg hover:bg-earth
  - Table header: bg-earth text-xs uppercase text-gray-500 border-b border-pebble
  - Table row: bg-white border-b border-pebble hover:bg-earth/50
  - Badge/pill status: small rounded-full px-2.5 py-0.5 text-xs
  - Modal: fixed inset-0 bg-black/40, centered white panel rounded-xl shadow-2xl
  - Page background: bg-earth (#F6F7F0)
  - All panels/cards: bg-white rounded-xl border border-pebble shadow-sm

EXISTING FILE STRUCTURE (do not modify these unless instructed):
  src/app/App.tsx                         ← add Claims module routing here
  src/app/types.ts                        ← add Claim types here
  src/app/components/LeftNavigation.tsx   ← add Claims nav branch here
  src/app/components/products/ProductsModule.tsx  ← reference for module structure

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — TYPES (src/app/types.ts — APPEND ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Append the following types. Do not modify existing types.

export type ClaimType = 'Global' | 'Regional' | 'Local' | 'Local SKU';

export type ClaimLifecycle =
  | 'Proposed' | 'Assessed' | 'Locally Assessed' | 'Assessed via Inheritance'
  | 'Rejected' | 'Challenged' | 'Withdrawn' | 'Not Pursued'
  | 'Cancelled' | 'Obsolete' | 'Expired';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High' | null;

export type ClaimUserRole = 'Claims Lead' | 'Legal' | 'RA' | 'R&D' | 'TPM' | 'Nutritionist' | 'Substantiator' | 'Project Lead' | 'Viewer';

export interface ClaimVersion {
  versionNumber: number;          // e.g. 1, 2, 3
  isLatest: boolean;
  globalStatement: string;
  localStatement: string;
  backtranslation?: string;
  createdAt: string;
  createdBy: string;
}

export interface SubstantiationDoc {
  id: string;
  fileName: string;
  classification: string;        // mandatory if uploaded; blocks Assessed transition if empty
  uploadedAt: string;
  uploadedBy: string;
  inUse?: boolean;               // true after claim reaches Assessed
}

export interface RiskAssessmentRecord {
  id: string;
  functionDept: 'R&D' | 'RA' | 'Legal';   // auto from user dept
  assessedBy: string;            // auto from logged-in user
  riskLevel: RiskLevel;
  comments: string;
  geography?: string;            // mandatory for non-Global claims
  dateTime: string;              // auto
  source?: 'Parent';             // set when appended from parent claim
}

export interface ClaimInheritance {
  parentClaimId: string;
  parentClaimVersion: number;
  inheritedAt: string;
  inheritedBy: string;
  appendLog: Array<{ parentClaimId: string; version: number; appendedAt: string; appendedBy: string }>;
}

export interface Claim {
  id: string;                    // system-generated, immutable
  claimType: ClaimType;
  parentClaimId?: string;        // null only for Global claims
  versions: ClaimVersion[];      // ordered oldest→newest
  currentVersion: number;        // index into versions[]
  order?: number;                // derived from latest project
  lifecycleStage: ClaimLifecycle;
  marketingChannels: string[];
  finalRiskLevel: RiskLevel;
  finalRiskIcon?: string;
  productName: string;
  productId: string;
  restrictedUse: boolean;
  restrictedUseComment?: string;
  claimIdentifier?: string;
  claimCategory?: string;
  geography?: string;            // hidden for Global claims
  relatedProjectIds: string[];
  challenged: boolean;           // true once ever set to Challenged
  copiedFromClaimId?: string;
  supportStrategy: string;
  substantiationDocs: SubstantiationDoc[];
  finalRiskSummary: {
    claimClassificationLevel?: string;
    reason?: string;
    claimsForumSummary?: string;
    legalSummary?: string;
    raSummary?: string;
    rdSummary?: string;
    marketingFeedback?: string;
    marketingRiskSignoff: boolean;
    iRAOutput?: string;
    inheritanceTrace?: string;   // e.g. "Inherited from Global Claim CLM-001"
  };
  riskAssessments: RiskAssessmentRecord[];
  linkedAssets: Array<{ id: string; name: string; type: string; lifecycleState: string; assetNumber: string }>;
  inheritance?: ClaimInheritance;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  qualifier?: string;
  cucCode?: string;              // required on Related product for Assessed transition
  expiryDate?: string;           // auto-triggers Expired lifecycle
}

// Left nav view type for Claims module
export type ClaimBaseView = 'Global Claims' | 'Regional Adaptations' | 'Local Adaptations' | 'Local Adaptations SKU';
export type ClaimWorkView = 'Support Strategy & Substantiation' | 'Risk Level Assessments' | 'Final Risk Summary';
export type ClaimsModuleView = 'table' | 'workspace';

// Mock claims data — 8 sample claims
export const CLAIM_LIFECYCLE_COLORS: Record<ClaimLifecycle, string> = {
  'Proposed':                  'bg-gray-100 text-gray-600 border border-gray-200',
  'Assessed':                  'bg-green-50 text-green-700 border border-green-200',
  'Locally Assessed':          'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Assessed via Inheritance':  'bg-teal-50 text-teal-700 border border-teal-200',
  'Rejected':                  'bg-red-50 text-red-600 border border-red-200',
  'Challenged':                'bg-amber-50 text-amber-700 border border-amber-200',
  'Withdrawn':                 'bg-gray-100 text-gray-500 border border-gray-200',
  'Not Pursued':               'bg-gray-100 text-gray-400 border border-gray-200',
  'Cancelled':                 'bg-red-50 text-red-400 border border-red-100',
  'Obsolete':                  'bg-gray-100 text-gray-400 border border-gray-200',
  'Expired':                   'bg-orange-50 text-orange-600 border border-orange-200',
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  'Low':       'text-green-600 bg-green-50',
  'Medium':    'text-amber-600 bg-amber-50',
  'High':      'text-orange-600 bg-orange-50',
  'Very High': 'text-red-600 bg-red-50',
};

export const MARKETING_CHANNELS = ['TV', 'Digital', 'Social Media', 'Print', 'In-store', 'Packaging', 'E-commerce'];
export const CLAIM_CATEGORIES = ['Functional', 'Sensorial', 'Emotional', 'Comparative', 'Environmental', 'Health'];
export const CLAIM_IDENTIFIERS = ['CID-001', 'CID-002', 'CID-003', 'CID-004', 'CID-005'];
export const CLASSIFICATION_LEVELS = ['Level 1 – Low Risk', 'Level 2 – Medium Risk', 'Level 3 – High Risk'];
export const FUNCTION_DEPTS: Array<'R&D' | 'RA' | 'Legal'> = ['R&D', 'RA', 'Legal'];

export const mockClaims: Claim[] = [
  // Create 8 realistic mock claims spanning all 4 types,
  // different lifecycle stages, some with supportStrategy, riskAssessments, docs.
  // Include at least: 3 Global, 2 Regional, 2 Local, 1 Local SKU
  // Use Unilever products: Dove, Hellmann's, Persil, Vaseline, Lynx
];

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — LEFT NAVIGATION (LeftNavigation.tsx — ADD Claims branch)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add a new branch in LeftNavigation when activeModule === 'Claims'.

Props to add to LeftNavigationProps interface:
  activeClaimsBaseView?: ClaimBaseView;
  onClaimsBaseViewChange?: (view: ClaimBaseView) => void;
  activeClaimsWorkView?: ClaimWorkView | null;
  onClaimsWorkViewChange?: (view: ClaimWorkView | null) => void;
  isInClaimsWorkspace?: boolean;
  activeClaimsWorkspaceSection?: string;
  onClaimsWorkspaceSectionChange?: (section: string) => void;

Render when activeModule === 'Claims' AND isInClaimsWorkspace === false:

<aside className="w-64 bg-white border-r border-pebble flex flex-col flex-shrink-0">
  <div className="p-3 flex-1 overflow-y-auto">

    {/* Section label */}
    <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wide">Base Views</div>

    {/* 4 claim type sections, each individually expandable */}
    {/* Each section: header button with ChevronDown/ChevronRight + section label */}
    {/* Under each when expanded: Recents item, Favorites item */}
    {/* Active item: bg-pale text-sky, blue dot right */}
    {/* Clicking a base view header selects it as the active dataset */}
    {['Global Claims','Regional Adaptations','Local Adaptations','Local Adaptations SKU'].map(view => (
      <CollapsibleClaimSection
        key={view}
        label={view}
        isActive={activeClaimsBaseView === view}
        onSelect={() => onClaimsBaseViewChange(view)}
      />
    ))}

    {/* Divider */}
    <div className="my-3 border-t border-pebble" />

    {/* Work Views */}
    <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wide">Views</div>
    {['Support Strategy & Substantiation','Risk Level Assessments','Final Risk Summary'].map(view => {
      const isActive = activeClaimsWorkView === view;
      return (
        <button key={view}
          onClick={() => onClaimsWorkViewChange(isActive ? null : view)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive ? 'bg-pale text-sky' : 'text-gray-600 hover:bg-earth hover:text-night'}`}
        >
          {/* appropriate lucide icon per view */}
          <span style={{fontWeight: isActive ? 500 : 400}}>{view}</span>
          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky" />}
        </button>
      );
    })}
  </div>
</aside>

Render when activeModule === 'Claims' AND isInClaimsWorkspace === true:
  Same workspace-style sidebar as Project Workspace, with sections:
  - Claim Details (default)
  - Support Strategy & Substantiation
  - Final Risk Summary
  - Risk Level Assessments
  - Related Assets
  Show section count: "X / 5 sections" in footer.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — App.tsx CHANGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The 'Claims' nav item already exists in NAV_ITEMS. Add these state variables:

  const [activeClaimsBaseView, setActiveClaimsBaseView] = useState<ClaimBaseView>('Global Claims');
  const [activeClaimsWorkView, setActiveClaimsWorkView] = useState<ClaimWorkView | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [claimsModuleView, setClaimsModuleView] = useState<ClaimsModuleView>('table');
  const [activeClaimsWorkspaceSection, setActiveClaimsWorkspaceSection] = useState('Claim Details');
  const [claims, setClaims] = useState<Claim[]>(mockClaims);

In the <main> rendering block, add alongside the Products branch:
  } else if (activeModule === 'Claims') {
    if (selectedClaim && claimsModuleView === 'workspace') {
      return <ClaimWorkspace
        claim={selectedClaim}
        claims={claims}
        onBack={() => { setSelectedClaim(null); setClaimsModuleView('table'); }}
        onClaimSave={(updated) => setClaims(prev => prev.map(c => c.id === updated.id ? updated : c))}
        activeSection={activeClaimsWorkspaceSection}
        onSectionChange={setActiveClaimsWorkspaceSection}
      />;
    }
    return <ClaimsModule
      claims={claims}
      onClaimsChange={setClaims}
      activeBaseView={activeClaimsBaseView}
      onBaseViewChange={setActiveClaimsBaseView}
      activeWorkView={activeClaimsWorkView}
      onClaimClick={(claim) => { setSelectedClaim(claim); setClaimsModuleView('workspace'); }}
    />;
  }

Pass new Claims props to LeftNavigation:
  activeClaimsBaseView={activeClaimsBaseView}
  onClaimsBaseViewChange={setActiveClaimsBaseView}
  activeClaimsWorkView={activeClaimsWorkView}
  onClaimsWorkViewChange={setActiveClaimsWorkView}
  isInClaimsWorkspace={activeModule === 'Claims' && !!selectedClaim}
  activeClaimsWorkspaceSection={activeClaimsWorkspaceSection}
  onClaimsWorkspaceSectionChange={setActiveClaimsWorkspaceSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — ClaimsModule.tsx  (new file: src/app/components/claims/ClaimsModule.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the claims table page. Mirror the Projects module page layout exactly.

LAYOUT:
  <div className="flex flex-col h-full overflow-hidden">
    {/* Page Header */}
    <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
      {/* Row 1: Title + Create button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-night">Claims</h1>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark">
          <Plus className="w-4 h-4" /> Create Claim
        </button>
      </div>

      {/* Row 2: Search + Filters toolbar */}
      {/* Search input: same style as Projects */}
      {/* Quick Filter dropdowns: Lifecycle Stage | Final Risk Level | Marketing Channels | Claim Category */}
      {/* [Configure Filters] icon button */}
      {/* [Clear All] when any filter active */}
      {/* Filter scope indicator when filters active: */}
      {/*   <span>"Filters applied across all claims · {n} claims match"</span> */}
    </div>

    {/* Bulk action bar — appears above table when ≥1 checkbox selected */}
    {selectedIds.length > 0 && (
      <div className="bg-pale border-b border-sky/20 px-6 py-2 flex items-center gap-3 flex-shrink-0">
        <span className="text-sm text-sky font-medium">{selectedIds.length} selected</span>
        <div className="relative">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-sky text-sky rounded-lg text-sm hover:bg-sky hover:text-white">
            <MoreHorizontal className="w-4 h-4" /> Bulk Actions <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {/* Dropdown: Create Adaptations | Substantiate Claims | Change Claim Lifecycle | Run iRA */}
        </div>
        <button onClick={() => setSelectedIds([])} className="ml-auto text-xs text-gray-500 hover:text-night">Clear selection</button>
      </div>
    )}

    {/* Table Area */}
    <div className="flex-1 p-5 overflow-hidden">
      <ClaimsTable
        claims={filteredClaims}
        activeWorkView={activeWorkView}
        selectedIds={selectedIds}
        onSelectId={toggleSelect}
        onSelectAll={toggleSelectAll}
        onClaimClick={onClaimClick}
      />
    </div>
  </div>

FILTERING LOGIC:
  - Filter claims by activeBaseView:
      'Global Claims' → claimType === 'Global'
      'Regional Adaptations' → claimType === 'Regional'
      'Local Adaptations' → claimType === 'Local'
      'Local Adaptations SKU' → claimType === 'Local SKU'
  - Apply AND logic across: search query, lifecycleStage filter, riskLevel filter, marketingChannels filter, claimCategory filter
  - Filters apply to ENTIRE dataset within active base view

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — ClaimsTable.tsx  (new file: src/app/components/claims/ClaimsTable.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scrollable table. Same structural pattern as ProjectTable.tsx.

COLUMNS (fixed order, same for all views):
  1. Checkbox (40px)
  2. Expand chevron (40px)
  3. Claim Statement (280px) — clickable → opens ClaimWorkspace
     Shows Global Statement for Global claims, Local Statement for others
     If claim.challenged === true: show amber "⚑ Challenged" flag badge
     If claim.lifecycleStage === 'Expired': show orange "Expired" flag
  4. Version (80px) — "v{n}" + "Latest" green badge on latest
  5. Order (60px)
  6. Lifecycle Stage (140px) — colored pill using CLAIM_LIFECYCLE_COLORS
  7. Marketing Channels (160px) — comma-separated tags, max 2 shown + "+N more"
  8. Final Risk Level (120px) — colored text + icon dot using RISK_LEVEL_COLORS
  9. Product Name (160px)
  10. Restricted Use (80px) — checkbox icon (read-only)
  11. Claim Identifier (120px)
  12. Claim Category (120px)
  13. Geography (120px) — hidden for Global Claims base view
  14. Related Projects (140px) — count badge + hover to see list

TABLE HEADER: bg-earth, text-xs text-gray-500 uppercase, border-b border-pebble, sticky top-0
ROWS: bg-white border-b border-pebble, hover:bg-earth/50, h-12
SELECTED ROW: bg-pale/30

INLINE EXPANDED WORKBENCH (US-M4-008 to US-M4-019):
When chevron clicked, render a full-width panel below that row. Only one row open at a time.
If a row has unsaved changes and user clicks another expand: show warning modal.

Expanded panel structure:
  <div className="border-b border-pebble bg-white">
    {/* Sticky context header */}
    <div className="sticky top-0 bg-white border-b border-pebble px-6 py-3 flex items-center gap-4 z-10">
      <span className="font-medium text-night text-sm">{primaryStatement}</span>
      <span className="text-xs text-gray-400">v{version}</span>
      <span className={`px-2.5 py-0.5 rounded-full text-xs ${CLAIM_LIFECYCLE_COLORS[claim.lifecycleStage]}`}>{claim.lifecycleStage}</span>
      <span className="text-xs text-gray-500">{claim.productName}</span>
      <span className="ml-auto text-xs text-sky cursor-pointer hover:underline" onClick={openFullWorkspace}>Open full view →</span>
    </div>

    {/* Tabs */}
    {/* 3 tabs, default controlled by activeWorkView prop */}
    {/* TAB 1: Support Strategy & Substantiation */}
    {/* TAB 2: Final Risk Summary */}
    {/* TAB 3: Risk Level Assessment Records */}
    {/* Tab content area scrollable, max-h-64 */}
  </div>

TAB 1 CONTENT — Support Strategy & Substantiation:
  - Support Strategy: <textarea> rich text, editable, auto-save on blur
  - Claim Classification Level: <select> from CLASSIFICATION_LEVELS
  - Reasons: <input>
  - Substantiation Evidence Documents: file list with classification dropdown per file + Upload button
  - Related Assets: asset list with Add/Remove
  - [Save] button
  Editable by: Claims Lead, TPM, Nutritionist, Substantiator
  Post-Assessed: all read-only

TAB 2 CONTENT — Final Risk Summary:
  Fields: Final Risk Level (select) | Risk Icon | Claim Classification Level | Reason | Claims Forum Summary | Legal Summary | RA Summary | R&D Summary | Marketing Feedback | Marketing Risk Signoff (checkbox) | iRA Output (if available)
  Inheritance trace shown if present: "Inherited from [Parent Claim ID]"
  [Save] button. Post-Assessed: read-only.

TAB 3 CONTENT — Risk Level Assessment Records:
  Multi-row table. Columns: Function | Assessed By | Risk Level | Comments | Geography | Date & Time | (Edit action for own rows)
  [+ Add Assessment] → adds new editable row with Function/AssessedBy/DateTime auto-populated
  All rows visible. User can only edit their own rows.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — ClaimWorkspace.tsx  (new file: src/app/components/claims/ClaimWorkspace.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full-page workspace. Identical structural pattern to ProjectWorkspace.tsx.

LAYOUT:
  <div className="flex flex-col h-full bg-earth overflow-hidden">
    {/* Header */}
    {/* Left nav already handled by LeftNavigation.tsx Claims workspace branch */}
    <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between mb-3">
        {/* Breadcrumb: ← Claims / {statement truncated} */}
        {/* Right: record nav prev/next | [Collaborate] button */}
      </div>
      <div className="flex items-start gap-3">
        {/* Favorite star */}
        <div className="flex-1 min-w-0">
          {/* Row 1: Primary statement (h2) */}
          {/*   + lifecycle action buttons based on role + current stage */}
          {/*   + [⋮] three-dot menu: Duplicate Claim | Edit & Create New Version | Create Adaptation | Run iRA */}
          {/* Row 2: Summary strip */}
          {/*   Lifecycle badge | Risk badge | BG tag | Category tag | Marketing Channels tags */}
          {/* Row 3: Claim ID | Version badge ("v2 · Latest") | Challenged flag if challenged===true */}
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="flex-1 flex overflow-hidden">
      {/* Main content area — driven by activeSection */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === 'Claim Details' && <ClaimDetailsSection claim={claim} onSave={onClaimSave} />}
        {activeSection === 'Support Strategy & Substantiation' && <SupportStrategySection claim={claim} onSave={onClaimSave} />}
        {activeSection === 'Final Risk Summary' && <FinalRiskSummarySection claim={claim} onSave={onClaimSave} />}
        {activeSection === 'Risk Level Assessments' && <RiskAssessmentsSection claim={claim} onSave={onClaimSave} />}
        {activeSection === 'Related Assets' && <RelatedAssetsSection claim={claim} onSave={onClaimSave} />}
      </div>

      {/* Version History side panel (toggled by history icon) */}
      {/* Collaboration Drawer (same as ProjectWorkspace CollaborationDrawer) */}
    </div>
  </div>

CLAIM DETAILS SECTION fields:
  Left column — Claim Fields:
    Global Statement (textarea, editable only in new version flow)
    Local Statement (textarea, editable only in new version flow)
    Backtranslation (textarea, optional, only if entered)
    Version (read-only)
    Order (number input)
    Lifecycle Stage (read-only pill)
    Marketing Channels (multi-select tags)
    Final Risk Level + icon (driven from Final Risk Summary)
    Product Name (read-only link)
    Restricted Use (checkbox)
    Restricted Use Comment (text, shown only if restricted)
    Claim Identifier (select from CLAIM_IDENTIFIERS)
    Claim Category (select from CLAIM_CATEGORIES)
    Geography (hidden for Global claims)
    Related Projects (linked tags)
    Challenged: Yes/No (read-only field, shown always)
    Copied From (shown only if copiedFromClaimId exists): "Copied from {id}"

  Right column — Product Details (all read-only):
    Product Name | Product Hierarchy | Business Group | Category
    Technology Linkage | Consumer Benefit Platform | Target Audience

LIFECYCLE ACTION BUTTONS in header:
  Show contextually based on claim.lifecycleStage + user role.
  Use role = 'Claims Lead' as default logged-in user role.

  From Proposed:
    [Mark as Assessed] — Claims Lead, Legal
      Validation before allowing:
        ✓ supportStrategy not empty
        ✓ finalRiskSummary.level not null
        ✓ marketingChannels.length > 0
        ✓ all substantiationDocs have classification set
        ✓ cucCode present on claim
      If fails: show ValidationModal listing each failed check
      On success: lifecycle → Assessed, product shows "In Use", docs show "In Use"
    [Reject] — Claims Lead → modal with mandatory reason input → lifecycle = Rejected
    [Not Pursued] — Claims Lead → modal with mandatory reason → lifecycle = Not Pursued
    [Cancel] — Claims Lead → lifecycle = Cancelled (no validation)

  From Assessed:
    [Challenge] — Claims Lead → modal with mandatory reason → lifecycle = Challenged
      Sets claim.challenged = true permanently
      Sends notifications to: Project Lead, Claims Lead, Legal

  From Challenged:
    [Return to Assessed] — Claims Lead or Legal → modal confirm → lifecycle = Assessed
    [Withdraw] — Claims Lead → modal with mandatory reason → lifecycle = Withdrawn

  From Rejected:
    [Return to Proposed] — Claims Lead → lifecycle = Proposed

  From Withdrawn / Obsolete / Not Pursued:
    [Mark Obsolete] — Claims Lead → modal with mandatory reason → lifecycle = Obsolete

  Lifecycle Expired:
    Read-only. Auto-set based on expiryDate. Shows banner: "This claim has expired."

REASON CAPTURE MODAL (shared, used for Reject/Challenge/Withdraw/Obsolete/Not Pursued):
  Title: "Confirm — {action}"
  Textarea: "Reason (required)" — save blocked if empty
  Buttons: [Cancel] [Confirm]

THREE-DOT MENU actions:
  1. Duplicate Claim → opens DuplicateClaimModal (see Step 8)
     Available for all lifecycle EXCEPT: Cancelled, Withdrawn, Obsolete, Expired
  2. Edit & Create New Version → opens new version flow (see Step 9)
     Available EXCEPT: Cancelled, Assessed, Withdrawn, Obsolete, Expired
  3. Create Adaptation → opens AdaptationModal (see Step 10)
     Available EXCEPT: Cancelled, Obsolete, Expired
  4. Run iRA → shows "iRA integration coming in M6" toast. No further logic.

VERSION HISTORY PANEL:
  Toggle via history icon (History lucide icon) in workspace header area.
  Side panel w-64, lists all versions newest first:
    v3 (Latest) — normal text
    v2 — text-gray-400
    v1 — text-gray-400
  Clicking any version: show read-only preview below with Global Statement + Local Statement.
  Only the latest version is interactive/editable.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 7 — ClaimCreationModal.tsx  (new file)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2-step modal. Opens from [Create Claim] button.

STEP 1 — INPUT:
  Modal: fixed overlay, white panel, max-w-3xl, two-column layout

  LEFT PANEL (w-72):
    Claim Type: radio group — Global | Regional | Local | Local SKU
    Product: searchable multi-select
      Global/Regional → suggest Variants
      Local → suggest Local Variants (+ Create: needs parent Variant + geography)
      Local SKU → suggest Local Variant SKUs (+ Create: needs parent Local Variant + SKU)
      Non-blocking duplicate warning if same statement+product already exists
    Geography: multi-select
      Disabled + greyed out for Global
      Mandatory for Regional / Local / Local SKU
    Language: select (for primary statement)
    Statement display note:
      Global: "Global Statement is primary. Local Statement is greyed out."
      Others: "Local Statement is primary."
    Backtranslation: toggle switch (optional, always in English)

  RIGHT PANEL (flex-1):
    Large textarea: placeholder "Paste multiple statements — one per line"
    Upload button: "Upload file" → parse and populate textarea
    [Extract Statements] button → splits textarea by newline into statement list

  Footer buttons: [Cancel] [Next →]

STEP 2 — TABBED WORKBENCH:
  Replaces Step 1 content in same modal (do not close and re-open).
  Generate tabs as: [ProductName – Geography] for each Product×Geography combination
  Global claims: tabs by Product only (no geography suffix)
  First tab selected by default.

  Each tab contains:
    Table with columns: Order | Global Statement | Local Statement | Qualifier | Marketing Channels | Actions
    If backtranslation toggle was ON: add Backtranslation column
    Global Statement: editable for Global claims, read-only grey for others
    Local Statement: editable, primary for non-Global
    Qualifier: text input
    Marketing Channels: multi-select tags
    Order: number, drag handle (GripVertical icon) for drag-to-reorder WITHIN TAB ONLY
    Actions: [+] add row below | [−] delete row (min 1 row enforced)

  Tab-level buttons:
    [Translate All]: auto-fills Local Statement based on geography (mock translation)
    [Save] (this tab): marks tab with green ✓ "Saved" indicator. User stays in modal.
    [Save All]: validates all tabs. If any incomplete: prompt "Save completed tabs only?" (Yes/No)
    [Save with Same Order]: prompt to pick reference tab → apply its row order to all other tabs. Warn if row count mismatch.
    [Cancel]: confirm "Unsaved changes will be lost" → close modal

  On Save: generate Claim IDs:
    Global: CLM-{3-digit sequential}
    Regional/Local: CLM-{parentId}-{country-code}
    Local SKU: CLM-{parentId}-{country-code}-{SKU}
  Auto-create missing parent claims if standalone Regional/Local/SKU created.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 8 — DuplicateClaimModal.tsx  (new file)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2-step modal triggered from three-dot menu → "Duplicate Claim".

STEP 1 — SELECT TARGET:
  Source Claim (read-only): Claim ID + primary statement
  Target Product (mandatory multi-select with Create option)
  Copy options (checkboxes, all checked by default):
    ☑ Support Strategy
    ☑ Substantiation Documents
    ☑ Risk Assessment Records
    ☑ Final Risk Summary
  Buttons: [Cancel] [Next →]

STEP 2 — TABBED WORKBENCH (same UI as ClaimCreationModal Step 2):
  Pre-populated from source claim data.
  Tabs: [ProductA – Geography] etc.
  Each tab: statement table pre-filled, editable, same row actions.
  New claim ID generated (never reuses source ID).
  New claim lifecycle always starts at 'Proposed'.
  Saved claim stores copiedFromClaimId = source claim id.
  In claim details: shows "Copied from CLM-XXX".

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 9 — New Version Flow (inside ClaimWorkspace)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Triggered from three-dot → "Edit & Create New Version".

Behavior:
  - Creates a copy of the current claim with versionNumber + 1
  - Previous version becomes fully read-only (greyed out in version history)
  - New version: only Global Statement + Local Statement are editable
  - All other fields: visually greyed out / disabled (opacity-50, pointer-events-none)
  - Version badge shows: "v{n} · Draft" until saved, then "v{n} · Latest"
  - [Save New Version] button: enabled only if statement has changed. On save: new version becomes active, previous locked.
  - New version lifecycle starts at 'Proposed'.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 10 — AdaptationModal.tsx  (new file)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Multi-step modal from three-dot → "Create Adaptation".

STEP 1 — SELECT TYPE:
  Available options depend on source claim type:
    Global → Regional Adaptation | Local Adaptation | Local Adaptation SKU
    Regional → Local Adaptation | Local Adaptation SKU
    Local → Local Adaptation SKU
  Radio group. [Cancel] [Next →]

STEP 2 — SELECT PRODUCTS:
  System fetches child products based on adaptation type:
    Regional → Variants
    Local → Local Variants
    Local SKU → Local Variant SKUs
  Multi-select list: Product Name | Type | Geography
  If no child products found: show "No child products found. Select geography to auto-create."
    → Geography select (mandatory) → system will auto-create required product node
  [Back] [Cancel] [Next →]

STEP 3 — TABBED WORKBENCH (same as creation flow):
  Pre-populated from parent claim:
    Global Statement (reference, read-only for RA/LA/SKU)
    Local Statement (editable — this is what gets adapted)
    Qualifier, Marketing Channels pre-filled
  User can: edit local statement, reorder, add/delete rows
  Save creates adaptation claims Related to parent.
  Adaptation IDs:
    Regional: CLM-{parentId}-{region}
    Local: CLM-{parentId}-{country}
    Local SKU: CLM-{parentId}-{country}-{SKU}
  New adaptation lifecycle: Proposed (unless parent is Assessed, in which case prompt:
    "Inherit lifecycle from parent? [Yes – Assessed via Inheritance] [No – Start as Proposed]")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 11 — BULK ACTIONS  (inside ClaimsModule.tsx)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When ≥1 claim selected, show bulk action bar with three-dot dropdown:

Option 1: Create Adaptations
  Sub-options enabled based on selected claim types:
    Global selected → Create Regional / Create Local / Create Local SKU
    Regional selected → Create Local / Create Local SKU
    Local selected → Create Local SKU
    Mixed incompatible types → disabled with tooltip explaining reason
  Opens AdaptationModal (same as Step 10) in bulk mode.

Option 2: Substantiate Claims
  Opens BulkSubstantiationModal:
    Upload documents (shared across all selected claims)
    Classification mandatory per uploaded doc
    [Apply to All Selected] saves to all claims
    If any claim already Assessed: docs are appended, not blocked

Option 3: Change Claim Lifecycle
  Opens BulkLifecycleModal:
    Radio options: Assessed | Not Pursued | Rejected | Cancelled | Proposed | Challenged | Withdrawn | Obsolete
    Only valid transitions enabled (invalid = disabled + tooltip)
    Mandatory reason field shown for: Rejected, Challenged, Withdrawn, Obsolete, Not Pursued
    Validation for Assessed: same rules as individual (Support Strategy, Risk Level, Channels, doc classification)
    All-or-nothing: if ANY selected claim fails validation → entire bulk action blocked → show error list per claim
    On confirm: all claims updated, audit log entries created for each

Option 4: Run iRA
  Show toast: "iRA integration will be available in M6" — no further logic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 12 — INHERITANCE NOTIFICATIONS (mock)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When a parent claim's supportStrategy, substantiationDocs, finalRiskSummary, or riskAssessments change:
  - Simulate notification by adding a toast: "Child claims of {claimId} have been notified of parent updates"
  - In child claim workspace: show a dismissable banner:
    "Parent claim {parentClaimId} was updated. [Append Changes] [Ignore]"
  - On [Append Changes]:
    - Support Strategy: append below existing with divider "Appended from {parentClaimId}"
    - Substantiation docs: add parent docs to list (skip duplicates by filename)
    - Final Risk Summary: append parent summaries alongside child
    - Risk Assessments: add parent records as new rows tagged source='Parent'
    - Audit entry recorded
  - On [Ignore]: dismiss banner, no changes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL NOTES FOR FIGMA MAKE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FILE PLACEMENT — create all new files inside:
     src/app/components/claims/
   Do not modify any file outside of:
     src/app/App.tsx
     src/app/types.ts
     src/app/components/LeftNavigation.tsx

2. MOCK DATA — populate mockClaims[] with 8 realistic Unilever claims.
   Include variety: mix of lifecycle stages, risk levels, claim types.
   At least 2 claims with substantiationDocs and riskAssessments filled.
   At least 1 claim with challenged=true and copiedFromClaimId set.

3. SHARED COMPONENTS — reuse existing:
   - CollaborationDrawer (same as ProjectWorkspace)
   - All /ui/* components (Button, Dialog, Tabs, Checkbox, Select, etc.)
   - Popover for dropdowns (same pattern as App.tsx FilterDropdown)

4. DO NOT change or re-implement:
   - ProjectTable, ProjectWorkspace, ProductsModule, or any existing workspace tabs
   - The global header, logo, notification bell, user avatar

5. STATE IS LOCAL — no external store. Use useState / prop-drilling exactly as done in App.tsx today.

6. LUCIDE ICONS to use:
   FileText (claims nav), Scale (risk), Shield (RA), CheckCircle (assessed),
   AlertTriangle (challenged/warning), Flag (challenged indicator),
   Clock (expiry/pending), GitBranch (hierarchy/adaptation),
   Copy (duplicate), History (version history), MoreHorizontal (three-dot),
   GripVertical (drag handle), Layers (workspace label)