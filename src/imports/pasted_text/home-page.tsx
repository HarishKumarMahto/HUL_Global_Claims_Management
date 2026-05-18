You are adding a Home (Landing Page) module to an EXISTING React + TypeScript + TailwindCSS 
application. Do NOT rebuild or modify any existing module. Add only what is described below.
Match the existing codebase patterns exactly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXISTING APP CONTEXT — READ BEFORE WRITING ANY CODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOGGED-IN USER (hardcoded for mock purposes):
  name: "Sarah Johnson"
  role: "Project Lead"
  email: "s.johnson@unilever.com"
  initials: "SJ"
  → "My" data = projects where projectLead === 'Sarah Johnson'
                  OR claimsLead === 'Sarah Johnson'

TECH STACK: React, TypeScript, TailwindCSS, lucide-react icons

COLOR TOKENS (use these class names only — already defined in theme.css):
  bg-sky / text-sky / border-sky       → #0066CC  (primary, CTAs, active)
  bg-night / text-night                → #133062  (headings, primary text)
  bg-earth                             → #F6F7F0  (page bg, hover)
  bg-pale / text-pale                  → #C2E0FF  (active nav, highlights)
  bg-pebble / border-pebble            → #DEDED7  (borders, dividers)
  bg-dark / hover:bg-dark              → #004D99  (hover on CTAs)
  bg-mid                               → #47A3FF
  bg-white                             → #FFFFFF

EXISTING DESIGN PATTERNS — REPLICATE EXACTLY:
  Header: bg-night, h-14 (56px), fixed at top
  Left sidebar: w-64, bg-white, border-r border-pebble
  Active nav item: bg-pale text-sky + blue dot (w-1.5 h-1.5 bg-sky rounded-full) on right
  Inactive nav item: text-gray-600 hover:bg-earth
  Section labels: text-xs uppercase text-gray-500 tracking-wide px-3 py-2
  Button primary: bg-sky text-white rounded-lg hover:bg-dark
  Button secondary: border border-pebble text-night rounded-lg hover:bg-earth
  Cards: bg-white rounded-xl border border-pebble shadow-sm
  Page background: bg-earth
  Modal: fixed inset-0 bg-black/40, white panel rounded-xl shadow-2xl

EXISTING NAV_ITEMS in App.tsx (id values used in handleModuleChange):
  'Dashboard' | 'Projects' | 'Claims' | 'Products' | 'Assets' | 'Reports'

EXISTING STATE in App.tsx that Home page can read:
  projects: Project[]           → from initialProjects, filtered by Sarah Johnson
  claims: Claim[]               → from mockClaims
  setActiveModule(module)       → for navigation from cards
  setActiveView(view)           → for "My Projects" deep link
  setSelectedProject(project)   → for project card click

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER STORIES — FULL SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

US1 — Access Home from Top Panel
US2 — View My Projects
US3 — View My Assets
US4 — View My Tasks
US5 — View Recent Activities
US6 — Activity Display Logic
US7 — Navigation from Cards and Lists
US8 — Empty State Handling
US10 — Personalization
US11 — Setup Access
US12 — Record Limitation Enforcement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — UPDATE App.tsx TOP NAV (US1 + US11)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the existing NAV_ITEMS array with:

const NAV_ITEMS = [
  { id: 'Home',         label: 'Home',         icon: <Home className="w-4 h-4" /> },
  { id: 'Projects',     label: 'Projects',     icon: <FolderKanban className="w-4 h-4" /> },
  { id: 'Products',     label: 'Products',     icon: <Package className="w-4 h-4" /> },
  { id: 'Claims',       label: 'Claims',       icon: <FileText className="w-4 h-4" /> },
  { id: 'Assets',       label: 'Assets',       icon: <Paperclip className="w-4 h-4" /> },
  { id: 'Documents',    label: 'Documents',    icon: <BookOpen className="w-4 h-4" /> },
  { id: 'Reports',      label: 'Reports',      icon: <BarChart3 className="w-4 h-4" /> },
  { id: 'OtherReports', label: 'Other Reports',icon: <BarChart2 className="w-4 h-4" /> },
];

Import these lucide icons: Home, BookOpen, BarChart2 (in addition to existing imports).

Add a Settings/Setup icon button to the right-side header actions area
(beside Help icon, before Notifications):
  <button
    onClick={() => handleModuleChange('Setup')}
    className="p-2 text-pale hover:text-white hover:bg-white/10 rounded-lg transition-colors"
    title="Setup"
  >
    <Settings className="w-5 h-5" />
  </button>
Settings icon already imported. Add 'Setup' handling in handleModuleChange switch.

US1 BEHAVIOR:
  - 'Home' is the DEFAULT active module on app load.
    Change: const [activeModule, setActiveModule] = useState('Home');
  - Clicking 'Home' nav item when already on Home: calls handleModuleChange('Home')
    which reloads/re-renders the HomePage component (no special logic needed beyond
    the existing setState pattern).
  - Active tab highlighted: existing bg-sky text-white style on the active nav item.

US11 BEHAVIOR:
  - Setup icon visible in top panel right-side actions.
  - Click opens a placeholder: handleModuleChange('Setup') navigates to 'Setup' module.
  - In the main content area, 'Setup' renders the existing "coming soon" placeholder.
  - No role-based hiding required in the UI (access control is backend).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — UPDATE LeftNavigation.tsx (US1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When activeModule === 'Home': render a minimal left sidebar showing
only a greeting/persona section. No nav items needed for Home.

  <aside className="w-64 bg-white border-r border-pebble flex flex-col flex-shrink-0">
    <div className="p-5 border-b border-pebble">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-sky text-white flex items-center
                        justify-center text-sm font-semibold">SJ</div>
        <div>
          <p className="text-sm font-medium text-night">Sarah Johnson</p>
          <p className="text-xs text-gray-500">Project Lead</p>
        </div>
      </div>
    </div>
    <div className="p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Quick Access</p>
      {[
        { label: 'My Projects',    module: 'Projects',  view: 'My Projects' },
        { label: 'My Claims',      module: 'Claims',    view: null },
        { label: 'My Assets',      module: 'Assets',    view: null },
        { label: 'My Tasks',       module: null,        view: null },
      ].map(item => (
        <button key={item.label}
          onClick={() => item.module && onModuleChange(item.module, item.view)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     text-gray-600 hover:bg-earth hover:text-night transition-colors">
          {item.label}
        </button>
      ))}
    </div>
  </aside>

Add onModuleChange prop to LeftNavigationProps:
  onModuleChange?: (module: string, view?: string | null) => void;

Pass it from App.tsx:
  onModuleChange={(module, view) => {
    handleModuleChange(module);
    if (view) setActiveView(view);
  }}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 3 — NEW TYPES (src/app/types.ts — APPEND ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Append these types. Do NOT modify existing types.

// ── Home Page Types ──────────────────────────────────

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Overdue' | 'Due Today' | 'Upcoming' | 'Completed';
export type ActivityType =
  | 'lifecycle_update'
  | 'risk_assessment_added'
  | 'final_risk_updated'
  | 'substantiation_updated';

export interface HomeTask {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  dueDate: string;         // ISO date string
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;      // user name
}

export interface HomeAsset {
  id: string;
  assetNumber: string;
  name: string;
  type: string;             // e.g. 'Video' | 'Artwork' | 'Packaging'
  lifecycleState: string;   // e.g. 'In Production' | 'Approved' | 'On Hold'
  projectName: string;
  lastUpdated: string;      // ISO date string
  createdBy: string;
  workflowParticipants: string[];  // user names
}

export interface HomeActivity {
  id: string;
  type: ActivityType;
  projectId: string;
  projectName: string;
  description: string;      // human-readable, e.g. "Lifecycle updated to Substantiate"
  actor: string;            // user name who triggered it
  timestamp: string;        // ISO datetime string
}

// ── Mock Data (US10, US12 — personalized to Sarah Johnson) ───────────────────

export const CURRENT_USER = 'Sarah Johnson';

// Tasks: 8 total (to test the max-6 limit), all assigned to Sarah Johnson
export const mockHomeTasks: HomeTask[] = [
  {
    id: 'TSK-001',
    title: 'Complete FTC pre-clearance review',
    description: 'Review and sign off on FTC pre-clearance for US claim #5',
    projectId: '5',
    projectName: 'Lynx Africa Anniversary Claims',
    dueDate: '2026-04-28',
    priority: 'High',
    status: 'Overdue',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'TSK-002',
    title: 'Update Support Strategy for Global Claim #3',
    description: 'Fill missing support strategy before transitioning to Substantiate',
    projectId: '1',
    projectName: 'Dove Intensive Repair Claims Project',
    dueDate: '2026-05-02',
    priority: 'High',
    status: 'Due Today',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'TSK-003',
    title: 'Approve packaging artwork for Vaseline',
    description: 'Final artwork approval needed before print production',
    projectId: '8',
    projectName: 'Vaseline Intensive Care Reformulation',
    dueDate: '2026-05-05',
    priority: 'Medium',
    status: 'Upcoming',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'TSK-004',
    title: 'Submit RA review for Dove claims',
    description: 'Regulatory Affairs review submission for 3 claims',
    projectId: '1',
    projectName: 'Dove Intensive Repair Claims Project',
    dueDate: '2026-05-07',
    priority: 'Medium',
    status: 'Upcoming',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'TSK-005',
    title: 'Review substantiation evidence docs',
    description: 'Classify and review 4 uploaded substantiation documents',
    projectId: '6',
    projectName: 'Domestos Bleach Power Claims',
    dueDate: '2026-05-10',
    priority: 'Low',
    status: 'Upcoming',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'TSK-006',
    title: 'Transition Magnum project to Assessment Complete',
    description: 'All claims assessed — trigger lifecycle transition',
    projectId: '7',
    projectName: 'Magnum Pleasure Store Premium Claims',
    dueDate: '2026-05-12',
    priority: 'Low',
    status: 'Upcoming',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'TSK-007',
    title: 'Coordinate with Legal on TRESemmé claim challenge',
    description: 'Follow up on challenged claim with James Brown',
    projectId: '4',
    projectName: 'TRESemmé Keratin Smooth Launch',
    dueDate: '2026-05-15',
    priority: 'Medium',
    status: 'Upcoming',
    assignedTo: 'Sarah Johnson',
  },
  {
    id: 'TSK-008',
    title: 'Prepare Knorr claims substantiation pack',
    description: 'Compile evidence pack for plant-based range review',
    projectId: '12',
    projectName: 'Knorr Plant-Based Range Claims',
    dueDate: '2026-05-20',
    priority: 'Low',
    status: 'Upcoming',
    assignedTo: 'Sarah Johnson',
  },
];

// Assets: 8 total (to test max-6 limit)
// Personalized: createdBy or workflowParticipants includes 'Sarah Johnson'
export const mockHomeAssets: HomeAsset[] = [
  {
    id: 'AST-001',
    assetNumber: 'DV-TV-001',
    name: 'TV Commercial 30s — Dove Intensive Repair',
    type: 'Video',
    lifecycleState: 'In Production',
    projectName: 'Dove Intensive Repair Claims Project',
    lastUpdated: '2026-04-25',
    createdBy: 'Sarah Johnson',
    workflowParticipants: ['Sarah Johnson', 'Emma Williams'],
  },
  {
    id: 'AST-002',
    assetNumber: 'DV-PKG-002',
    name: 'Product Packaging Design — Dove Repair',
    type: 'Artwork',
    lifecycleState: 'Approved',
    projectName: 'Dove Intensive Repair Claims Project',
    lastUpdated: '2026-04-23',
    createdBy: 'Emma Williams',
    workflowParticipants: ['Sarah Johnson', 'Emma Williams', 'Michael Chen'],
  },
  {
    id: 'AST-003',
    assetNumber: 'LX-DIG-003',
    name: 'Digital Banner Set — Lynx Africa 30th',
    type: 'Digital',
    lifecycleState: 'Under Review',
    projectName: 'Lynx Africa Anniversary Claims',
    lastUpdated: '2026-04-22',
    createdBy: 'Sarah Johnson',
    workflowParticipants: ['Sarah Johnson', 'James Brown'],
  },
  {
    id: 'AST-004',
    assetNumber: 'VS-PKG-FR-400',
    name: '400ml Bottle Label — Vaseline',
    type: 'Packaging',
    lifecycleState: 'Approved',
    projectName: 'Vaseline Intensive Care Reformulation',
    lastUpdated: '2026-04-20',
    createdBy: 'Michael Chen',
    workflowParticipants: ['Sarah Johnson', 'Michael Chen'],
  },
  {
    id: 'AST-005',
    assetNumber: 'PS-PRN-001',
    name: 'Print Ad Campaign — Persil Deep Clean',
    type: 'Artwork',
    lifecycleState: 'On Hold',
    projectName: 'Persil Deep Clean Efficacy Claims',
    lastUpdated: '2026-04-18',
    createdBy: 'Sarah Johnson',
    workflowParticipants: ['Sarah Johnson'],
  },
  {
    id: 'AST-006',
    assetNumber: 'MG-VID-006',
    name: 'Product Video — Magnum Premium',
    type: 'Video',
    lifecycleState: 'In Production',
    projectName: 'Magnum Pleasure Store Premium Claims',
    lastUpdated: '2026-04-17',
    createdBy: 'Lisa Anderson',
    workflowParticipants: ['Sarah Johnson', 'Lisa Anderson'],
  },
  {
    id: 'AST-007',
    assetNumber: 'KN-DIG-007',
    name: 'Social Media Kit — Knorr Plant-Based',
    type: 'Digital',
    lifecycleState: 'Draft',
    projectName: 'Knorr Plant-Based Range Claims',
    lastUpdated: '2026-04-15',
    createdBy: 'Sarah Johnson',
    workflowParticipants: ['Sarah Johnson', 'David Smith'],
  },
  {
    id: 'AST-008',
    assetNumber: 'DM-PKG-008',
    name: 'Packaging Sleeve — Domestos Power',
    type: 'Packaging',
    lifecycleState: 'Under Review',
    projectName: 'Domestos Bleach Power Claims',
    lastUpdated: '2026-04-14',
    createdBy: 'Emma Williams',
    workflowParticipants: ['Sarah Johnson', 'Emma Williams', 'James Brown'],
  },
];

// Activities: 8 total (to test max-6 limit)
// Only allowed types: lifecycle_update | risk_assessment_added |
//                     final_risk_updated | substantiation_updated
// Only for projects where Sarah Johnson is projectLead or claimsLead
export const mockHomeActivities: HomeActivity[] = [
  {
    id: 'ACT-001',
    type: 'lifecycle_update',
    projectId: '1',
    projectName: 'Dove Intensive Repair Claims Project',
    description: 'Lifecycle stage updated to Substantiate',
    actor: 'Sarah Johnson',
    timestamp: '2026-04-25T14:32:00Z',
  },
  {
    id: 'ACT-002',
    type: 'risk_assessment_added',
    projectId: '1',
    projectName: 'Dove Intensive Repair Claims Project',
    description: 'New RA risk assessment added for Global Claim #3',
    actor: 'Emma Williams',
    timestamp: '2026-04-25T11:15:00Z',
  },
  {
    id: 'ACT-003',
    type: 'final_risk_updated',
    projectId: '5',
    projectName: 'Lynx Africa Anniversary Claims',
    description: 'Final risk level updated to Medium for Claim #2',
    actor: 'James Brown',
    timestamp: '2026-04-24T16:45:00Z',
  },
  {
    id: 'ACT-004',
    type: 'substantiation_updated',
    projectId: '1',
    projectName: 'Dove Intensive Repair Claims Project',
    description: 'Substantiation evidence doc uploaded and classified',
    actor: 'Michael Chen',
    timestamp: '2026-04-24T10:00:00Z',
  },
  {
    id: 'ACT-005',
    type: 'lifecycle_update',
    projectId: '6',
    projectName: 'Domestos Bleach Power Claims',
    description: 'Lifecycle stage updated to Review & Risk Assessment',
    actor: 'Sarah Johnson',
    timestamp: '2026-04-23T09:20:00Z',
  },
  {
    id: 'ACT-006',
    type: 'risk_assessment_added',
    projectId: '5',
    projectName: 'Lynx Africa Anniversary Claims',
    description: 'Legal assessment added for Local Claim — UK market',
    actor: 'James Brown',
    timestamp: '2026-04-22T14:10:00Z',
  },
  {
    id: 'ACT-007',
    type: 'final_risk_updated',
    projectId: '1',
    projectName: 'Dove Intensive Repair Claims Project',
    description: 'Final risk summary updated — Claims Forum note added',
    actor: 'Sarah Johnson',
    timestamp: '2026-04-21T11:00:00Z',
  },
  {
    id: 'ACT-008',
    type: 'substantiation_updated',
    projectId: '6',
    projectName: 'Domestos Bleach Power Claims',
    description: 'Support strategy updated for 2 claims',
    actor: 'Emma Williams',
    timestamp: '2026-04-20T16:30:00Z',
  },
];

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 4 — NEW FILE: src/app/components/home/HomePage.tsx
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create this file. It is the entire Home module rendered in <main>.

Props interface:
  interface HomePageProps {
    projects: Project[];
    onProjectClick: (project: Project) => void;
    onViewAllProjects: () => void;   // → sets module to Projects, view to 'My Projects'
    onViewAllAssets: () => void;     // → sets module to Assets
    onViewAllTasks: () => void;      // → sets module to Projects (tasks live in project)
    onViewAllActivities: () => void; // → sets module to Projects
  }

LAYOUT OVERVIEW:
  <div className="flex-1 overflow-y-auto bg-earth">
    {/* Page header */}
    <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
      <h1 className="text-night">Good morning, Sarah 👋</h1>
      <p className="text-sm text-gray-500 mt-1">
        Here's what's happening across your projects today.
      </p>
    </div>

    {/* Content grid */}
    <div className="p-6 space-y-6">
      <ProjectsSection ... />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AssetsSection ... />
        <TasksSection ... />
      </div>
      <ActivitiesSection ... />
    </div>
  </div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
US2 — PROJECTS SECTION (Layer 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILTERING (US10, US12):
  const myProjects = projects
    .filter(p => p.projectLead === 'Sarah Johnson' || p.claimsLead === 'Sarah Johnson')
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 6);  // MAX 6 — enforced here, no excess records loaded into UI

SECTION HEADER:
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-pale rounded-lg">
        <FolderKanban className="w-4 h-4 text-sky" />
      </div>
      <div>
        <h2 className="text-night text-base font-semibold">My Projects</h2>
        <p className="text-xs text-gray-500">{totalProjects} projects total</p>
      </div>
    </div>
    {totalProjects > 6 && (
      <button onClick={onViewAllProjects}
        className="text-sm text-sky hover:underline font-medium">
        View All
      </button>
    )}
  </div>
  where totalProjects = projects.filter(p =>
    p.projectLead === 'Sarah Johnson' || p.claimsLead === 'Sarah Johnson').length

CARD GRID: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4

EACH PROJECT CARD (US7 — click navigates to Project Workspace):
  <div
    onClick={() => onProjectClick(project)}
    className="bg-white rounded-xl border border-pebble p-4 cursor-pointer
               hover:border-sky/40 hover:shadow-md transition-all group"
  >
    {/* Row 1: Project name + Status badge */}
    <div className="flex items-start justify-between gap-2 mb-3">
      <h3 className="text-sm font-medium text-night leading-snug group-hover:text-sky
                     transition-colors line-clamp-2">
        {project.name}
      </h3>
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0
                        ${STATUS_BADGE_STYLES[project.status] || 'bg-gray-100 text-gray-500'}`}>
        {project.status}
      </span>
    </div>

    {/* Row 2: Project ID + Business Group */}
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs text-gray-500 font-mono">{project.projectId}</span>
      <span className="text-xs text-gray-400">·</span>
      <span className="text-xs bg-pale text-sky px-2 py-0.5 rounded">
        {project.businessGroup}
      </span>
    </div>

    {/* Row 3: Lifecycle stage progress bar */}
    {/* Show lifecycle stage as a small progress indicator */}
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">Lifecycle</span>
        <span className="text-xs text-sky font-medium">{project.lifecycleStage}</span>
      </div>
      {/* Thin progress bar — width based on LIFECYCLE_STAGES index */}
      <div className="h-1.5 bg-earth rounded-full overflow-hidden">
        <div
          className="h-full bg-sky rounded-full transition-all"
          style={{ width: `${getLifecyclePercent(project.lifecycleStage)}%` }}
        />
      </div>
    </div>

    {/* Row 4: Footer meta */}
    <div className="flex items-center justify-between text-xs text-gray-400">
      <span>Last updated {formatRelativeDate(project.lastUpdated)}</span>
      <span>{project.region}</span>
    </div>
  </div>

Helper: STATUS_BADGE_STYLES matches existing ProjectWorkspace STATUS_STYLES:
  const STATUS_BADGE_STYLES: Record<string, string> = {
    'Draft':               'bg-gray-100 text-gray-600 border border-gray-200',
    'In Progress':         'bg-blue-50 text-blue-700 border border-blue-200',
    'Under Review':        'bg-amber-50 text-amber-700 border border-amber-200',
    'Assessment Complete': 'bg-purple-50 text-purple-700 border border-purple-200',
    'Completed':           'bg-green-50 text-green-700 border border-green-200',
    'Archived':            'bg-gray-100 text-gray-500 border border-gray-200',
    'Cancelled':           'bg-red-50 text-red-600 border border-red-200',
  };

Helper: getLifecyclePercent maps LIFECYCLE_STAGES to percentage:
  LIFECYCLE_STAGES = ['Draft','Substantiate','Review & Risk Assessment','Assessment Complete','Complete']
  Draft=10, Substantiate=30, Review & Risk Assessment=55, Assessment Complete=80, Complete=100

Helper: formatRelativeDate(dateStr) → "2 days ago" / "Today" / "Yesterday" etc.

US8 EMPTY STATE for My Projects:
  If myProjects.length === 0:
  <div className="bg-white rounded-xl border border-pebble p-12 text-center">
    <div className="w-12 h-12 bg-earth rounded-xl flex items-center justify-center mx-auto mb-3">
      <FolderKanban className="w-6 h-6 text-gray-300" />
    </div>
    <p className="text-sm font-medium text-night mb-1">No projects available</p>
    <p className="text-xs text-gray-400">
      You haven't been assigned to any projects yet.
    </p>
  </div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
US3 — MY ASSETS SECTION (Layer 2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILTERING (US10, US12):
  import { mockHomeAssets, CURRENT_USER } from '../../types';

  const myAssets = mockHomeAssets
    .filter(a =>
      a.createdBy === CURRENT_USER ||
      a.workflowParticipants.includes(CURRENT_USER)
    )
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 6);  // MAX 6

SECTION HEADER: Same pattern as My Projects, using:
  icon: <Paperclip className="w-4 h-4 text-sky" />
  title: "My Assets"
  subtitle: "{total} assets total"
  Button: "View All" → calls onViewAllAssets() when total > 6

ASSET LIST (vertical, not cards — more compact):
  <div className="bg-white rounded-xl border border-pebble divide-y divide-pebble">
    {myAssets.map(asset => (
      <div key={asset.id}
        className="flex items-center gap-4 px-4 py-3 hover:bg-earth/50
                   cursor-pointer transition-colors group"
        onClick={() => onViewAllAssets()}   // US7: navigates to Assets module
      >
        {/* Asset type icon */}
        <div className="w-8 h-8 rounded-lg bg-earth flex items-center justify-center flex-shrink-0">
          {getAssetTypeIcon(asset.type)}   {/* Film/Image/Package/FileText */}
        </div>

        {/* Asset info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-night truncate group-hover:text-sky
                        transition-colors">
            {asset.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{asset.projectName}</p>
        </div>

        {/* Lifecycle state badge */}
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0
                          ${getAssetStateStyle(asset.lifecycleState)}`}>
          {asset.lifecycleState}
        </span>

        {/* Last updated */}
        <span className="text-xs text-gray-400 flex-shrink-0 hidden lg:block">
          {formatRelativeDate(asset.lastUpdated)}
        </span>
      </div>
    ))}
  </div>

Helper: getAssetTypeIcon(type):
  'Video'     → <Film className="w-4 h-4 text-sky" />
  'Artwork'   → <ImageIcon className="w-4 h-4 text-purple-500" />
  'Packaging' → <Package className="w-4 h-4 text-amber-500" />
  default     → <FileText className="w-4 h-4 text-gray-400" />

Helper: getAssetStateStyle(state):
  'Approved'      → 'bg-green-50 text-green-700 border border-green-200'
  'In Production' → 'bg-blue-50 text-blue-700 border border-blue-200'
  'Under Review'  → 'bg-amber-50 text-amber-700 border border-amber-200'
  'On Hold'       → 'bg-gray-100 text-gray-500 border border-gray-200'
  default         → 'bg-earth text-gray-600 border border-pebble'

US8 EMPTY STATE for My Assets:
  If myAssets.length === 0:
  <div className="bg-white rounded-xl border border-pebble p-12 text-center">
    <p className="text-sm font-medium text-night mb-1">No assets available</p>
    <p className="text-xs text-gray-400">
      You are not part of any asset workflows yet.
    </p>
  </div>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
US4 — MY TASKS SECTION (Layer 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILTERING (US10, US12):
  import { mockHomeTasks, CURRENT_USER } from '../../types';

  const myTasks = mockHomeTasks
    .filter(t => t.assignedTo === CURRENT_USER)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())  // earliest first
    .slice(0, 6);  // MAX 6

SECTION HEADER: Same pattern:
  icon: <CheckSquare className="w-4 h-4 text-sky" /> (import CheckSquare from lucide)
  title: "My Tasks"
  subtitle: "{total} tasks assigned"
  Button: "View All Tasks" → calls onViewAllTasks() when total > 6

TASK LIST (vertical, compact rows):
  <div className="bg-white rounded-xl border border-pebble divide-y divide-pebble">
    {myTasks.map(task => (
      <div key={task.id}
        className="flex items-center gap-4 px-4 py-3 hover:bg-earth/50
                   cursor-pointer transition-colors group"
        onClick={() => onProjectClick(projectFromId(task.projectId))}  // US7
      >
        {/* Priority dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityDotStyle(task.priority)}`} />

        {/* Task info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-night truncate group-hover:text-sky
                        transition-colors">
            {task.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{task.projectName}</p>
        </div>

        {/* Due date + Status */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                            ${getTaskStatusStyle(task.status)}`}>
            {task.status}
          </span>
          <span className="text-xs text-gray-400">
            Due {formatDate(task.dueDate)}
          </span>
        </div>
      </div>
    ))}
  </div>

Helper: getPriorityDotStyle(priority):
  'High'   → 'bg-red-500'
  'Medium' → 'bg-amber-400'
  'Low'    → 'bg-gray-300'

Helper: getTaskStatusStyle(status):
  'Overdue'   → 'bg-red-50 text-red-600 border border-red-200'
  'Due Today' → 'bg-amber-50 text-amber-700 border border-amber-200'
  'Upcoming'  → 'bg-blue-50 text-blue-700 border border-blue-200'
  'Completed' → 'bg-green-50 text-green-700 border border-green-200'

US7 — Task click: find project by task.projectId from props.projects array, then call
  onProjectClick(matchingProject) to open Project Workspace.
  If no matching project found: call onViewAllProjects() as fallback.

US8 EMPTY STATE for My Tasks:
  <p className="text-sm font-medium text-night mb-1">No tasks assigned</p>
  <p className="text-xs text-gray-400">You have no pending tasks at the moment.</p>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
US5 + US6 — RECENT ACTIVITIES SECTION (Layer 4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FILTERING (US6, US10, US12):
  import { mockHomeActivities, CURRENT_USER, initialProjects } from '../../types';

  // Get project IDs where Sarah Johnson is involved
  const myProjectIds = new Set(
    initialProjects
      .filter(p => p.projectLead === CURRENT_USER || p.claimsLead === CURRENT_USER)
      .map(p => p.id)
  );

  const myActivities = mockHomeActivities
    .filter(a => myProjectIds.has(a.projectId))
    // US6: Only these 4 activity types are allowed — no other noise
    .filter(a => [
      'lifecycle_update',
      'risk_assessment_added',
      'final_risk_updated',
      'substantiation_updated',
    ].includes(a.type))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);  // MAX 6

SECTION HEADER:
  icon: <Activity className="w-4 h-4 text-sky" /> (import Activity from lucide)
  title: "Recent Activities"
  subtitle: "Latest updates across your projects"
  Button: "View All Activities" → calls onViewAllActivities() when
    mockHomeActivities.filter(a => myProjectIds.has(a.projectId)).length > 6

ACTIVITY FEED (timeline-style, horizontal rule between items):
  <div className="bg-white rounded-xl border border-pebble divide-y divide-pebble">
    {myActivities.map(activity => (
      <div key={activity.id}
        className="flex items-start gap-4 px-4 py-3 hover:bg-earth/50
                   cursor-pointer transition-colors"
        onClick={() => onActivityClick(activity)}   // US7
      >
        {/* Activity type icon in colored circle */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                         flex-shrink-0 mt-0.5 ${getActivityIconStyle(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>

        {/* Activity content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-night">
            <span className="font-medium">{activity.actor}</span>
            {' '}{activity.description}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-sky">{activity.projectName}</span>
            <span className="text-xs text-gray-400">
              · {formatRelativeTimestamp(activity.timestamp)}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>

US7 — Activity click (onActivityClick):
  Find matching project from props.projects by activity.projectId, call onProjectClick.
  If not found: call onViewAllProjects() as fallback.

Helper: getActivityIcon(type) returns lucide icon element (w-4 h-4 text-white):
  'lifecycle_update'        → <RefreshCw />
  'risk_assessment_added'   → <Shield />
  'final_risk_updated'      → <AlertTriangle />
  'substantiation_updated'  → <FileText />

Helper: getActivityIconStyle(type) returns bg color class:
  'lifecycle_update'        → 'bg-sky'
  'risk_assessment_added'   → 'bg-purple-500'
  'final_risk_updated'      → 'bg-amber-500'
  'substantiation_updated'  → 'bg-green-600'

Helper: formatRelativeTimestamp(iso) → "10 minutes ago" / "2 hours ago" / "Yesterday" / "Apr 23"

US8 EMPTY STATE for Activities:
  <p className="text-sm font-medium text-night mb-1">No recent activity</p>
  <p className="text-xs text-gray-400">
    No updates yet from your projects.
  </p>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 5 — UPDATE App.tsx RENDERING (US1, US7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Import: import HomePage from './components/home/HomePage';

In the <main> rendering block, add as the FIRST condition
(above the selectedProject check and all other module checks):

  {activeModule === 'Home' ? (
    <HomePage
      projects={projects}
      onProjectClick={(project) => {
        handleProjectClick(project);
        setActiveModule('Projects');  // switch module to Projects to show workspace
      }}
      onViewAllProjects={() => {
        handleModuleChange('Projects');
        setActiveView('My Projects');
      }}
      onViewAllAssets={() => handleModuleChange('Assets')}
      onViewAllTasks={() => handleModuleChange('Projects')}
      onViewAllActivities={() => handleModuleChange('Projects')}
    />
  ) : selectedProject ? (
    // ... rest of existing conditions unchanged

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 6 — SECTION WRAPPER COMPONENT (reusable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a reusable SectionWrapper component inside HomePage.tsx
(not a separate file) for DRY section headers:

  function SectionWrapper({
    icon,
    title,
    subtitle,
    total,
    limit = 6,
    viewAllLabel = 'View All',
    onViewAll,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    total: number;
    limit?: number;
    viewAllLabel?: string;
    onViewAll: () => void;
    children: React.ReactNode;
  }) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pale rounded-lg">{icon}</div>
            <div>
              <h2 className="text-base font-semibold text-night">{title}</h2>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>
          {total > limit && (
            <button
              onClick={onViewAll}
              className="text-sm text-sky hover:underline font-medium transition-colors"
            >
              {viewAllLabel}
            </button>
          )}
        </div>
        {children}
      </div>
    );
  }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FILES TO CREATE:
  src/app/components/home/HomePage.tsx     ← NEW (entire Home module UI)

FILES TO MODIFY (minimally):
  src/app/App.tsx                          ← NAV_ITEMS + default module + rendering
  src/app/types.ts                         ← Append HomeTask, HomeAsset, HomeActivity + mocks
  src/app/components/LeftNavigation.tsx    ← Home branch + onModuleChange prop

FILES TO LEAVE UNCHANGED:
  Everything else — all existing modules, workspace components, claims, products

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL VALIDATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After implementation, verify:
  ✓ US1:  'Home' is first in NAV_ITEMS and is the default activeModule on load.
           Clicking Home when already on Home re-renders the page (no error).
           All 8 nav items present: Home, Projects, Products, Claims, Assets,
           Documents, Reports, Other Reports.
           Setup icon visible in header right actions.
  ✓ US2:  My Projects shows max 6 cards. "View All" appears if total > 6.
           Cards sorted by lastUpdated descending. Clicking card opens workspace.
  ✓ US3:  My Assets shows max 6 rows. "View All" if total > 6.
           Filtered to Sarah Johnson as creator or workflow participant.
           Sorted by lastUpdated descending.
  ✓ US4:  My Tasks shows max 6 rows. "View All Tasks" if total > 6.
           Filtered to assignedTo === 'Sarah Johnson'.
           Sorted by dueDate ascending (most urgent first).
  ✓ US5:  Recent Activities shows max 6 rows. "View All Activities" if total > 6.
           Sorted by timestamp descending.
  ✓ US6:  Only 4 activity types shown: lifecycle_update, risk_assessment_added,
           final_risk_updated, substantiation_updated. No other types.
           Only for projects where Sarah Johnson is projectLead or claimsLead.
  ✓ US7:  Project card click → opens Project Workspace.
           Asset row click → navigates to Assets module.
           Task row click → opens related Project Workspace.
           Activity row click → opens related Project Workspace.
  ✓ US8:  Empty states render correctly for all 4 sections when data is empty.
           Each empty state has appropriate icon + message.
  ✓ US10: All 4 sections filter strictly to current user (Sarah Johnson).
           No data from other users shown in any section.
  ✓ US11: Setup icon in header right actions. Clicking navigates to Setup module.
  ✓ US12: Hard limit of 6 enforced via .slice(0, 6) in each section's filter logic.
           Slice happens AFTER sort. "View All" button shows when total exceeds limit.