// ─── User Management Data ─────────────────────────────────────────────────────
// Source of truth: Roles & Permissions Excel mapping + US-M19-001/002/003/004/005

export type RoleCode = 'AU' | 'PL' | 'CL' | 'TPL' | 'NUT' | 'SUB' | 'RA' | 'LGL' | 'BA' | 'VWR' | 'VWRE' | 'SYS';
export type FunctionArea = 'Marketing' | 'R&D' | 'RA' | 'Legal' | 'Business Admin' | 'Finance' | 'Supply Chain' | 'IT' | 'Strategy' | 'Others';

export interface Role {
  id: string;
  code: RoleCode;
  name: string;
  shortName: string;
  scope: string;
  description: string;
  userCount: number;
  createdDate: string;
  color: string;
  status: 'Active' | 'Inactive';
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  functionArea: FunctionArea;
  department: string; // Keeps display compatibility
  businessGroups: string[];
  categories: string[];
  bu: string;
  geographies: string[];
  roleCodes: RoleCode[]; // Now supports multiple roles per user
  status: 'Active' | 'Inactive';
  timeZone: string;
  notifications: {
    summaryEmail: boolean;
    inApp: boolean;
  };
  lastActive: string;
  createdBy?: string;
  createdDate?: string;
  phone?: string;
  manager?: string;
}

export type PermissionValue = 'Yes' | 'No';

export interface PermissionRow {
  id: string;
  module: string;
  object: string;
  action: string;
  label: string; // "Module > Object > Action"
}

export interface PermissionModule {
  id: string;
  label: string;
  rows: PermissionRow[];
}

export type RolePermissions = Record<string, { view: PermissionValue; readOnly: PermissionValue; edit: PermissionValue }>;

// ─── Roles (R1–R12) ────────────────────────────────────────────────

export const ROLES: Role[] = [
  { id: 'R1', code: 'AU', name: 'All Users', shortName: 'AU', scope: 'Logged-in', description: 'Browse workspace; view records; mark favorites; search; navigate', userCount: 142, createdDate: '2024-01-15', color: '#6B7589', status: 'Active' },
  { id: 'R2', code: 'PL', name: 'Project Lead', shortName: 'PL', scope: 'BG-bound / Project-team', description: 'Create & govern projects; drive lifecycle transitions; manage team; create claims & products; access Marketing Signoff', userCount: 28, createdDate: '2024-01-15', color: '#0066CC', status: 'Active' },
  { id: 'R3', code: 'CL', name: 'Claims Lead', shortName: 'CL', scope: 'BG-bound / Project-team', description: 'Full claim lifecycle; IRA; Final Risk Summary; Challenge management', userCount: 19, createdDate: '2024-01-15', color: '#004D99', status: 'Active' },
  { id: 'R4', code: 'TPL', name: 'R&D – Technical Project Lead', shortName: 'TPL', scope: 'Project-team', description: 'Support Strategy; substantiation; risk assessments; asset creation; claim creation', userCount: 11, createdDate: '2024-02-01', color: '#008090', status: 'Active' },
  { id: 'R5', code: 'NUT', name: 'R&D – Nutritionist', shortName: 'NUT', scope: 'Project-team', description: 'Support Strategy; substantiation; risk assessments (Nutritionist type)', userCount: 7, createdDate: '2024-02-01', color: '#2B911C', status: 'Active' },
  { id: 'R6', code: 'SUB', name: 'R&D – Substantiator', shortName: 'SUB', scope: 'Project-team', description: 'Support Strategy; substantiation evidence; risk assessments (Substantiator type)', userCount: 9, createdDate: '2024-02-01', color: '#8652DF', status: 'Active' },
  { id: 'R7', code: 'RA', name: 'Regulatory Affairs', shortName: 'RA', scope: 'Project-team', description: 'RA risk assessments; RA Summary; complete RA review tile', userCount: 6, createdDate: '2024-02-15', color: '#DA5700', status: 'Active' },
  { id: 'R8', code: 'LGL', name: 'Legal', shortName: 'LGL', scope: 'Project-team', description: 'Legal Summary; Final Risk Level; challenge; confidentiality; claim lifecycle', userCount: 4, createdDate: '2024-02-15', color: '#E13591', status: 'Active' },
  { id: 'R9', code: 'BA', name: 'Business Admin', shortName: 'BA', scope: 'Cross-BG', description: 'Override project/claim locks; reset lifecycle; create Format products; administer saved views; manage users & roles', userCount: 3, createdDate: '2024-01-10', color: '#133062', status: 'Active' },
  { id: 'R10', code: 'VWR', name: 'Viewer', shortName: 'VWR', scope: 'Logged-in', description: 'Read-only access across all modules; no export', userCount: 31, createdDate: '2024-03-01', color: '#6B7589', status: 'Active' },
  { id: 'R11', code: 'VWRE', name: 'Viewer with Export', shortName: 'VWRE', scope: 'Logged-in', description: 'Read-only with export capability', userCount: 14, createdDate: '2024-03-01', color: '#47A3FF', status: 'Inactive' },
  { id: 'R12', code: 'SYS', name: 'System / API User', shortName: 'SYS', scope: 'n/a', description: 'Automated: generate IDs, enforce permissions, send notifications, write audit log', userCount: 2, createdDate: '2024-01-10', color: '#CC2200', status: 'Active' },
];

export const ROLE_MAP: Record<string, Role> = Object.fromEntries(ROLES.map(r => [r.code, r]));

// ─── Mock Users ────────────────────────────────────────────────────────────────

export const FUNCTIONS: FunctionArea[] = ['Marketing', 'R&D', 'RA', 'Legal', 'Business Admin', 'Finance', 'Supply Chain', 'IT', 'Strategy', 'Others'];
export const BUSINESS_GROUPS = ['Beauty & Wellbeing', 'Personal Care', 'Home Care', 'Nutrition', 'Ice Cream'];
export const TIME_ZONES = ['GMT', 'EST', 'PST', 'CET', 'IST', 'SGT'];

export const MOCK_USERS: UserRecord[] = [
  { id: 'U001', firstName: 'Sarah', lastName: 'Johnson', email: 's.johnson@unilever.com', employeeId: 'EMP-10421', functionArea: 'Marketing', department: 'Marketing', businessGroups: ['Beauty & Wellbeing'], categories: ['Skin Care'], bu: 'BU-1', geographies: ['Global'], roleCodes: ['PL'], status: 'Active', timeZone: 'EST', notifications: { summaryEmail: true, inApp: true }, lastActive: '2026-05-19T08:30:00Z', createdBy: 'System', createdDate: '2024-01-15', manager: 'Emma Williams' },
  { id: 'U002', firstName: 'Michael', lastName: 'Chen', email: 'm.chen@unilever.com', employeeId: 'EMP-10344', functionArea: 'Marketing', department: 'Marketing', businessGroups: ['Personal Care'], categories: ['Deodorants'], bu: 'BU-2', geographies: ['Global'], roleCodes: ['CL'], status: 'Active', timeZone: 'EST', notifications: { summaryEmail: true, inApp: true }, lastActive: '2026-05-19T07:15:00Z', createdBy: 'System', createdDate: '2024-01-15', manager: 'Emma Williams' },
  { id: 'U003', firstName: 'Emma', lastName: 'Williams', email: 'e.williams@unilever.com', employeeId: 'EMP-10120', functionArea: 'Business Admin', department: 'Business Admin', businessGroups: [], categories: [], bu: 'Global', geographies: ['Global'], roleCodes: ['BA'], status: 'Active', timeZone: 'GMT', notifications: { summaryEmail: true, inApp: true }, lastActive: '2026-05-18T16:00:00Z', createdBy: 'System', createdDate: '2024-01-10', phone: '+44 20 7946 0958' },
  { id: 'U004', firstName: 'James', lastName: 'Brown', email: 'j.brown@unilever.com', employeeId: 'EMP-10567', functionArea: 'R&D', department: 'R&D', businessGroups: ['Home Care'], categories: ['Fabric Cleaning'], bu: 'BU-3', geographies: ['Europe'], roleCodes: ['TPL', 'SUB'], status: 'Active', timeZone: 'CET', notifications: { summaryEmail: false, inApp: true }, lastActive: '2026-05-19T06:45:00Z', createdBy: 'Emma Williams', createdDate: '2024-02-01', manager: 'Sarah Johnson' },
  { id: 'U005', firstName: 'Jennifer', lastName: 'Davis', email: 'j.davis@unilever.com', employeeId: 'EMP-10892', functionArea: 'R&D', department: 'R&D', businessGroups: ['Nutrition'], categories: ['Dressings'], bu: 'BU-4', geographies: ['North America'], roleCodes: ['NUT'], status: 'Active', timeZone: 'EST', notifications: { summaryEmail: true, inApp: true }, lastActive: '2026-05-17T14:20:00Z', createdBy: 'Emma Williams', createdDate: '2024-02-01', manager: 'James Brown' },
];

// ─── Permission Definitions ───────────────────────────────────────────

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'landing', label: 'Landing Page',
    rows: [
      { id: 'lp-1', module: 'Landing Page', object: 'Home', action: 'Access & View', label: 'Home › Access & View' },
      { id: 'lp-2', module: 'Landing Page', object: 'My Projects Widget', action: 'View & Navigate', label: 'My Projects Widget › View & Navigate' },
      { id: 'lp-3', module: 'Landing Page', object: 'My Assets Widget', action: 'View & Navigate', label: 'My Assets Widget › View & Navigate' },
      { id: 'lp-4', module: 'Landing Page', object: 'My Tasks Widget', action: 'View & Navigate', label: 'My Tasks Widget › View & Navigate' },
      { id: 'lp-5', module: 'Landing Page', object: 'Navigation', action: 'Click Card to Open Workspace', label: 'Navigation › Click Card to Open Workspace' },
      { id: 'lp-6', module: 'Landing Page', object: 'View All', action: 'Navigate to Module', label: 'View All › Navigate to Module' },
      { id: 'lp-7', module: 'Landing Page', object: 'Create New Project', action: 'CTA button', label: 'Create New Project (CTA button)' },
      { id: 'lp-8', module: 'Landing Page', object: 'Create New Asset', action: 'CTA button', label: 'Create New Asset (CTA button)' },
    ],
  },
  {
    id: 'projects', label: 'Projects',
    rows: [
      { id: 'pr-1', module: 'Projects', object: 'Workspace', action: 'Access, Search, Filter, Configure', label: 'Workspace › Access, Search, Filter, Configure' },
      { id: 'pr-2', module: 'Projects', object: 'Workspace', action: 'All Projects View', label: 'Workspace › All Projects View' },
      { id: 'pr-3', module: 'Projects', object: 'Workspace', action: 'My Projects View', label: 'Workspace › My Projects View' },
      { id: 'pr-4', module: 'Projects', object: 'Workspace', action: 'Favorites View', label: 'Workspace › Favorites View' },
      { id: 'pr-5', module: 'Projects', object: 'Workspace', action: 'Save / Share / Delete Own Views', label: 'Workspace › Save / Share / Delete Own Views' },
      { id: 'pr-6', module: 'Projects', object: 'Workspace', action: 'Mark / Unmark Favourite', label: 'Workspace › Mark / Unmark Favourite' },
      { id: 'pr-7', module: 'Projects', object: 'Export', action: 'Export Project List', label: 'Export › Export Project List' },
      { id: 'pr-8', module: 'Projects', object: 'Create', action: 'Create New Project (own BG)', label: 'Create › Create New Project (own BG)' },
      { id: 'pr-9', module: 'Projects', object: 'Detail', action: 'View Header & All Fields', label: 'Detail › View Header & All Fields' },
      { id: 'pr-10', module: 'Projects', object: 'Detail', action: 'Edit', label: 'Detail › Edit' },
      { id: 'pr-11', module: 'Projects', object: 'Team', action: 'Add / Remove', label: 'Team › Add / Remove' },
      { id: 'pr-12', module: 'Projects', object: 'Linked Claims', action: 'Add / Remove Claim', label: 'Linked Claims › Add / Remove Claim' },
      { id: 'pr-13', module: 'Projects', object: 'Lifecycle', action: 'Transition Draft → Substantiate', label: 'Lifecycle › Transition Draft → Substantiate' },
      { id: 'pr-14', module: 'Projects', object: 'Lifecycle', action: 'Transition Substantiate → Review & Risk', label: 'Lifecycle › Transition Substantiate → Review & Risk' },
      { id: 'pr-15', module: 'Projects', object: 'Lifecycle', action: 'Transition Review & Risk → Complete', label: 'Lifecycle › Transition Review & Risk → Complete' },
      { id: 'pr-16', module: 'Projects', object: 'Review Tiles', action: 'View Tile Status', label: 'Review Tiles › View Tile Status' },
    ],
  },
  {
    id: 'claims', label: 'Claims',
    rows: [
      { id: 'cl-1', module: 'Claims', object: 'Workspace', action: 'Access, Search, Filter, Configure', label: 'Workspace › Access, Search, Filter, Configure' },
      { id: 'cl-2', module: 'Claims', object: 'Detail', action: 'View Claim Header & Details', label: 'Detail › View Claim Header & Details' },
      { id: 'cl-3', module: 'Claims', object: 'Detail', action: 'Inline Edit (permitted fields)', label: 'Detail › Inline Edit (permitted fields)' },
      { id: 'cl-4', module: 'Claims', object: 'Create', action: 'Claim Creation', label: 'Create › Claim Creation (from project / library / product)' },
      { id: 'cl-5', module: 'Claims', object: 'Bulk', action: 'Lifecycle Change', label: 'Bulk › Lifecycle Change' },
      { id: 'cl-6', module: 'Claims', object: 'iRA', action: 'Run iRA', label: 'iRA › Run iRA (Home Care claims in Proposed)' },
      { id: 'cl-7', module: 'Claims', object: 'Risk', action: 'Manual Risk Level', label: 'Risk › Manual Risk Level' },
      { id: 'cl-8', module: 'Claims', object: 'Final Risk Summary', action: 'Marketing Risk Signoff (checkbox)', label: 'Final Risk Summary › Marketing Risk Signoff' },
      { id: 'cl-9', module: 'Claims', object: 'Challenge', action: 'Trigger Challenge', label: 'Challenge › Trigger Challenge (Assessed claims)' },
      { id: 'cl-10', module: 'Claims', object: 'Audit Log', action: 'View', label: 'Audit Log › View' },
    ]
  },
  {
    id: 'products', label: 'Products',
    rows: [
      { id: 'pd-1', module: 'Products', object: 'Workspace', action: 'Access, Search, Filter, Configure', label: 'Workspace › Access, Search, Filter, Configure' },
      { id: 'pd-2', module: 'Products', object: 'Detail', action: 'View Product Details & Hierarchy', label: 'Detail › View Product Details & Hierarchy' },
      { id: 'pd-3', module: 'Products', object: 'Create', action: 'Technology Product', label: 'Create › Technology Product' },
      { id: 'pd-4', module: 'Products', object: 'Create', action: 'Variant Product', label: 'Create › Variant Product' },
    ]
  },
  {
    id: 'assets', label: 'Assets',
    rows: [
      { id: 'as-1', module: 'Assets', object: 'Library', action: 'Access, Search, Filter, Configure', label: 'Library › Access, Search, Filter, Configure' },
      { id: 'as-2', module: 'Assets', object: 'Detail', action: 'View Asset Rendition & Metadata', label: 'Detail › View Asset Rendition & Metadata' },
      { id: 'as-3', module: 'Assets', object: 'Create', action: 'Initiate Asset Creation', label: 'Create › Initiate Asset Creation' },
      { id: 'as-4', module: 'Assets', object: 'Versioning', action: 'Create New Version', label: 'Versioning › Create New Version' },
    ]
  },
  {
    id: 'documents', label: 'Documents',
    rows: [
      { id: 'do-1', module: 'Documents', object: 'Library', action: 'View All Types', label: 'Library › View All Types' },
      { id: 'do-2', module: 'Documents', object: 'Project Documents', action: 'Upload', label: 'Project Documents › Upload' },
      { id: 'do-3', module: 'Documents', object: 'Download', action: 'Download original file', label: 'Download › Download original file' },
    ]
  }
];

// ─── Default Permission Matrix ───────────────────────────────────────────
// This stores the assigned permissions per role (id). 
// Format: Record<RoleId, Record<PermissionId, { view, readOnly, edit }>>

export const ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  // R1: All Users
  'R1': {
    'lp-1': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'lp-2': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'lp-3': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'lp-4': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'lp-5': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'lp-6': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'lp-7': { view: 'No', readOnly: 'No', edit: 'No' },
    'lp-8': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-1': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pr-2': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pr-3': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pr-4': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pr-5': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-6': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-7': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pr-8': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-9': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pr-10': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-11': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pr-12': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-13': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-14': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-15': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-16': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'cl-1': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'cl-2': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'cl-3': { view: 'No', readOnly: 'No', edit: 'No' },
    'cl-4': { view: 'No', readOnly: 'No', edit: 'No' },
    'cl-5': { view: 'No', readOnly: 'No', edit: 'No' },
    'cl-6': { view: 'No', readOnly: 'No', edit: 'No' },
    'cl-7': { view: 'No', readOnly: 'No', edit: 'No' },
    'cl-8': { view: 'No', readOnly: 'No', edit: 'No' },
    'cl-9': { view: 'No', readOnly: 'No', edit: 'No' },
    'cl-10': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'pd-1': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pd-2': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'pd-3': { view: 'No', readOnly: 'No', edit: 'No' },
    'pd-4': { view: 'No', readOnly: 'No', edit: 'No' },
    'as-1': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'as-2': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'as-3': { view: 'No', readOnly: 'No', edit: 'No' },
    'as-4': { view: 'No', readOnly: 'No', edit: 'No' },
    'do-1': { view: 'No', readOnly: 'Yes', edit: 'No' },
    'do-2': { view: 'No', readOnly: 'No', edit: 'No' },
    'do-3': { view: 'No', readOnly: 'Yes', edit: 'No' },
  },
  // R2: Project Lead
  'R2': {
    'lp-1': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'lp-2': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'lp-3': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'lp-4': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'lp-5': { view: 'No', readOnly: 'No', edit: 'No' },
    'lp-6': { view: 'No', readOnly: 'No', edit: 'No' },
    'lp-7': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'lp-8': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-1': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-2': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-3': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-4': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-5': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-6': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-7': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-8': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-9': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'pr-10': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-11': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-12': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-13': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-14': { view: 'No', readOnly: 'No', edit: 'No' },
    'pr-15': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pr-16': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'cl-1': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'cl-2': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'cl-3': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'cl-4': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'cl-5': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'cl-6': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'cl-7': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'cl-8': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'cl-9': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'cl-10': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'pd-1': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'pd-2': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'pd-3': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'pd-4': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'as-1': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'as-2': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'as-3': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'as-4': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'do-1': { view: 'Yes', readOnly: 'No', edit: 'No' },
    'do-2': { view: 'No', readOnly: 'No', edit: 'Yes' },
    'do-3': { view: 'No', readOnly: 'Yes', edit: 'No' },
  }
};

// Fill any missing roles with default empty permissions
ROLES.forEach(r => {
  if (!ROLE_PERMISSIONS[r.id]) {
    const empty: RolePermissions = {};
    PERMISSION_MODULES.forEach(m => m.rows.forEach(row => empty[row.id] = { view: 'No', readOnly: 'No', edit: 'No' }));
    ROLE_PERMISSIONS[r.id] = empty;
  } else {
    // Ensure existing roles have all rows
    PERMISSION_MODULES.forEach(m => m.rows.forEach(row => {
      if (!ROLE_PERMISSIONS[r.id][row.id]) {
        ROLE_PERMISSIONS[r.id][row.id] = { view: 'No', readOnly: 'No', edit: 'No' };
      }
    }));
  }
});


export function formatLastActive(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getUserInitials(user: UserRecord): string {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}

export function getAvatarColor(roleCode: RoleCode): string {
  const role = ROLES.find(r => r.code === roleCode);
  return role?.color || '#6B7589';
}
