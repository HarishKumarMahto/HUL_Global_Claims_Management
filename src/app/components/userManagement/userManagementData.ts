// ─── User Management Data ─────────────────────────────────────────────────────
// Source of truth: Roles & Permissions Excel mapping

export type RoleCode = 'AU' | 'PL' | 'CL' | 'TPL' | 'NUT' | 'SUB' | 'RA' | 'LGL' | 'BA' | 'VWR' | 'VWRE' | 'SYS';

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
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  department: string;
  roleCode: RoleCode;
  status: 'Active' | 'Inactive';
  lastActive: string;
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
  view: PermissionValue;
  readOnly: PermissionValue;
  edit: PermissionValue;
}

export interface PermissionModule {
  id: string;
  label: string;
  rows: PermissionRow[];
}

// ─── Roles (R1–R12 from Excel) ────────────────────────────────────────────────

export const ROLES: Role[] = [
  {
    id: 'R1', code: 'AU', name: 'All Users', shortName: 'AU',
    scope: 'Logged-in',
    description: 'Browse workspace; view records; mark favorites; search; navigate',
    userCount: 142, createdDate: '2024-01-15', color: '#6B7589',
  },
  {
    id: 'R2', code: 'PL', name: 'Project Lead', shortName: 'PL',
    scope: 'BG-bound / Project-team',
    description: 'Create & govern projects; drive lifecycle transitions; manage team; create claims & products; access Marketing Signoff',
    userCount: 28, createdDate: '2024-01-15', color: '#0066CC',
  },
  {
    id: 'R3', code: 'CL', name: 'Claims Lead', shortName: 'CL',
    scope: 'BG-bound / Project-team',
    description: 'Full claim lifecycle; IRA; Final Risk Summary; Challenge management',
    userCount: 19, createdDate: '2024-01-15', color: '#004D99',
  },
  {
    id: 'R4', code: 'TPL', name: 'R&D – Technical Project Lead', shortName: 'TPL',
    scope: 'Project-team',
    description: 'Support Strategy; substantiation; risk assessments; asset creation; claim creation',
    userCount: 11, createdDate: '2024-02-01', color: '#008090',
  },
  {
    id: 'R5', code: 'NUT', name: 'R&D – Nutritionist', shortName: 'NUT',
    scope: 'Project-team',
    description: 'Support Strategy; substantiation; risk assessments (Nutritionist type)',
    userCount: 7, createdDate: '2024-02-01', color: '#2B911C',
  },
  {
    id: 'R6', code: 'SUB', name: 'R&D – Substantiator', shortName: 'SUB',
    scope: 'Project-team',
    description: 'Support Strategy; substantiation evidence; risk assessments (Substantiator type)',
    userCount: 9, createdDate: '2024-02-01', color: '#8652DF',
  },
  {
    id: 'R7', code: 'RA', name: 'Regulatory Affairs', shortName: 'RA',
    scope: 'Project-team',
    description: 'RA risk assessments; RA Summary; complete RA review tile',
    userCount: 6, createdDate: '2024-02-15', color: '#DA5700',
  },
  {
    id: 'R8', code: 'LGL', name: 'Legal', shortName: 'LGL',
    scope: 'Project-team',
    description: 'Legal Summary; Final Risk Level; challenge; confidentiality; claim lifecycle',
    userCount: 4, createdDate: '2024-02-15', color: '#E13591',
  },
  {
    id: 'R9', code: 'BA', name: 'Business Admin', shortName: 'BA',
    scope: 'Cross-BG',
    description: 'Override project/claim locks; reset lifecycle; create Format products; administer saved views; manage users & roles',
    userCount: 3, createdDate: '2024-01-10', color: '#133062',
  },
  {
    id: 'R10', code: 'VWR', name: 'Viewer', shortName: 'VWR',
    scope: 'Logged-in',
    description: 'Read-only access across all modules; no export',
    userCount: 31, createdDate: '2024-03-01', color: '#6B7589',
  },
  {
    id: 'R11', code: 'VWRE', name: 'Viewer with Export', shortName: 'VWRE',
    scope: 'Logged-in',
    description: 'Read-only with export capability',
    userCount: 14, createdDate: '2024-03-01', color: '#47A3FF',
  },
  {
    id: 'R12', code: 'SYS', name: 'System / API User', shortName: 'SYS',
    scope: 'n/a',
    description: 'Automated: generate IDs, enforce permissions, send notifications, write audit log, PLM integration',
    userCount: 2, createdDate: '2024-01-10', color: '#CC2200',
  },
];

export const ROLE_MAP: Record<string, Role> = Object.fromEntries(ROLES.map(r => [r.code, r]));

// ─── Mock Users ────────────────────────────────────────────────────────────────

export const DEPARTMENTS = [
  'Marketing', 'R&D', 'Regulatory Affairs', 'Legal', 'Business Admin',
  'Finance', 'Supply Chain', 'IT', 'HR', 'Strategy',
];

export const MOCK_USERS: UserRecord[] = [
  { id: 'U001', firstName: 'Sarah', lastName: 'Johnson', email: 's.johnson@unilever.com', employeeId: 'EMP-10421', department: 'Marketing', roleCode: 'PL', status: 'Active', lastActive: '2026-05-19T08:30:00Z', manager: 'Emma Williams' },
  { id: 'U002', firstName: 'Michael', lastName: 'Chen', email: 'm.chen@unilever.com', employeeId: 'EMP-10344', department: 'Marketing', roleCode: 'CL', status: 'Active', lastActive: '2026-05-19T07:15:00Z', manager: 'Emma Williams' },
  { id: 'U003', firstName: 'Emma', lastName: 'Williams', email: 'e.williams@unilever.com', employeeId: 'EMP-10120', department: 'Business Admin', roleCode: 'BA', status: 'Active', lastActive: '2026-05-18T16:00:00Z', phone: '+44 20 7946 0958' },
  { id: 'U004', firstName: 'James', lastName: 'Brown', email: 'j.brown@unilever.com', employeeId: 'EMP-10567', department: 'R&D', roleCode: 'TPL', status: 'Active', lastActive: '2026-05-19T06:45:00Z', manager: 'Sarah Johnson' },
  { id: 'U005', firstName: 'Jennifer', lastName: 'Davis', email: 'j.davis@unilever.com', employeeId: 'EMP-10892', department: 'R&D', roleCode: 'NUT', status: 'Active', lastActive: '2026-05-17T14:20:00Z', manager: 'James Brown' },
  { id: 'U006', firstName: 'David', lastName: 'Martinez', email: 'd.martinez@unilever.com', employeeId: 'EMP-11023', department: 'R&D', roleCode: 'SUB', status: 'Active', lastActive: '2026-05-19T09:00:00Z', manager: 'James Brown' },
  { id: 'U007', firstName: 'Lisa', lastName: 'Anderson', email: 'l.anderson@unilever.com', employeeId: 'EMP-11156', department: 'Regulatory Affairs', roleCode: 'RA', status: 'Active', lastActive: '2026-05-16T11:30:00Z', manager: 'Emma Williams' },
  { id: 'U008', firstName: 'Robert', lastName: 'Taylor', email: 'r.taylor@unilever.com', employeeId: 'EMP-11289', department: 'Legal', roleCode: 'LGL', status: 'Active', lastActive: '2026-05-15T10:00:00Z', manager: 'Emma Williams' },
  { id: 'U009', firstName: 'Patricia', lastName: 'Thomas', email: 'p.thomas@unilever.com', employeeId: 'EMP-11422', department: 'Finance', roleCode: 'VWR', status: 'Active', lastActive: '2026-05-14T09:15:00Z' },
  { id: 'U010', firstName: 'Christopher', lastName: 'Jackson', email: 'c.jackson@unilever.com', employeeId: 'EMP-11555', department: 'Supply Chain', roleCode: 'VWRE', status: 'Active', lastActive: '2026-05-13T15:45:00Z' },
  { id: 'U011', firstName: 'Linda', lastName: 'White', email: 'l.white@unilever.com', employeeId: 'EMP-11688', department: 'Marketing', roleCode: 'AU', status: 'Inactive', lastActive: '2026-04-30T12:00:00Z', manager: 'Sarah Johnson' },
  { id: 'U012', firstName: 'Mark', lastName: 'Harris', email: 'm.harris@unilever.com', employeeId: 'EMP-11821', department: 'IT', roleCode: 'SYS', status: 'Active', lastActive: '2026-05-19T00:00:00Z' },
  { id: 'U013', firstName: 'Barbara', lastName: 'Clark', email: 'b.clark@unilever.com', employeeId: 'EMP-11954', department: 'Strategy', roleCode: 'PL', status: 'Active', lastActive: '2026-05-18T17:30:00Z', manager: 'Emma Williams' },
  { id: 'U014', firstName: 'William', lastName: 'Lewis', email: 'w.lewis@unilever.com', employeeId: 'EMP-12087', department: 'R&D', roleCode: 'CL', status: 'Inactive', lastActive: '2026-05-10T08:00:00Z', manager: 'Sarah Johnson' },
  { id: 'U015', firstName: 'Dorothy', lastName: 'Lee', email: 'd.lee@unilever.com', employeeId: 'EMP-12220', department: 'Regulatory Affairs', roleCode: 'RA', status: 'Active', lastActive: '2026-05-19T10:00:00Z', manager: 'Emma Williams' },
];

// ─── Permission Matrix (from Excel) ───────────────────────────────────────────
// view = standalone VIEW column; readOnly = YES in READ-ONLY col; edit = YES in EDIT col

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: 'landing', label: 'Landing Page',
    rows: [
      { id: 'lp-1', module: 'Landing Page', object: 'Home', action: 'Access & View', label: 'Home › Access & View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'lp-2', module: 'Landing Page', object: 'My Projects Widget', action: 'View Cards', label: 'My Projects Widget › View Cards', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'lp-3', module: 'Landing Page', object: 'My Assets Widget', action: 'View Cards', label: 'My Assets Widget › View Cards', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'lp-4', module: 'Landing Page', object: 'My Taste Widget', action: 'View Cards', label: 'My Taste Widget › View Cards', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'lp-5', module: 'Landing Page', object: 'Navigation', action: 'Click Card to Open Workspace', label: 'Navigation › Click Card to Open Workspace', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'lp-6', module: 'Landing Page', object: 'View All', action: 'Navigate to Module', label: 'View All › Navigate to Module', view: 'No', readOnly: 'Yes', edit: 'No' },
    ],
  },
  {
    id: 'projects', label: 'Projects',
    rows: [
      { id: 'pr-1', module: 'Projects', object: 'Workspace', action: 'Access & Browse', label: 'Workspace › Access & Browse', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-2', module: 'Projects', object: 'Workspace', action: 'All Projects View', label: 'Workspace › All Projects View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-3', module: 'Projects', object: 'Workspace', action: 'My Projects View', label: 'Workspace › My Projects View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-4', module: 'Projects', object: 'Workspace', action: 'Recent Projects View', label: 'Workspace › Recent Projects View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-5', module: 'Projects', object: 'Workspace', action: 'Favorites View', label: 'Workspace › Favorites View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-6', module: 'Projects', object: 'Workspace', action: 'Shared Views (recipient)', label: 'Workspace › Shared Views (recipient)', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-7', module: 'Projects', object: 'Workspace', action: 'Column Configure', label: 'Workspace › Column Configure', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-8', module: 'Projects', object: 'Workspace', action: 'Global Search', label: 'Workspace › Global Search', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-9', module: 'Projects', object: 'Workspace', action: 'Column Filters', label: 'Workspace › Column Filters', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-10', module: 'Projects', object: 'Workspace', action: 'Quick Filters (apply)', label: 'Workspace › Quick Filters (apply)', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-11', module: 'Projects', object: 'Workspace', action: 'Mark / Unmark Favorite', label: 'Workspace › Mark / Unmark Favorite', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'pr-12', module: 'Projects', object: 'Workspace', action: 'Save Personal View', label: 'Workspace › Save Personal View', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'pr-13', module: 'Projects', object: 'Workspace', action: 'Share View (own held)', label: 'Workspace › Share View (own held)', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'pr-14', module: 'Projects', object: 'Workspace', action: 'Rename Own Saved View', label: 'Workspace › Rename Own Saved View', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'pr-15', module: 'Projects', object: 'Workspace', action: 'Delete Own Saved View', label: 'Workspace › Delete Own Saved View', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'pr-16', module: 'Projects', object: 'Detail', action: 'Open Project Workspace', label: 'Detail › Open Project Workspace', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-17', module: 'Projects', object: 'Detail', action: 'View Project Header & Fields', label: 'Detail › View Project Header & Fields', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-18', module: 'Projects', object: 'Detail', action: 'View Lifecycle Stage & Tracker', label: 'Detail › View Lifecycle Stage & Tracker', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-19', module: 'Projects', object: 'Detail', action: 'View Comments & Tasks', label: 'Detail › View Comments & Tasks', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-20', module: 'Projects', object: 'Detail', action: 'Add Comment / @Mention', label: 'Detail › Add Comment / @Mention', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'pr-21', module: 'Projects', object: 'Review Tile', action: 'View Tile Status', label: 'Review Tile › View Tile Status', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pr-22', module: 'Projects', object: 'Audit Log', action: 'View (no three-dot)', label: 'Audit Log › View', view: 'Yes', readOnly: 'No', edit: 'No' },
      { id: 'pr-23', module: 'Projects', object: 'Export', action: 'Export Project Data', label: 'Export › Export Project Data', view: 'Yes', readOnly: 'No', edit: 'No' },
    ],
  },
  {
    id: 'claims', label: 'Claims',
    rows: [
      { id: 'cl-1', module: 'Claims', object: 'Workspace', action: 'Access & Browse', label: 'Workspace › Access & Browse', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-2', module: 'Claims', object: 'Workspace', action: 'Global Search & Filters', label: 'Workspace › Global Search & Filters', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-3', module: 'Claims', object: 'Workspace', action: 'Quick Filters (apply)', label: 'Workspace › Quick Filters (apply)', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-4', module: 'Claims', object: 'Workspace', action: 'Custom Views (saved by others)', label: 'Workspace › Custom Views (saved by others)', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-5', module: 'Claims', object: 'Workspace', action: 'Mark / Unmark Favorite', label: 'Workspace › Mark / Unmark Favorite', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'cl-6', module: 'Claims', object: 'Inline Workbench', action: 'Expand / Collapse Row', label: 'Inline Workbench › Expand / Collapse Row', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-7', module: 'Claims', object: 'Inline Workbench', action: 'View Tabs (Comments/Substantiation/Risk)', label: 'Inline Workbench › View Tabs', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-8', module: 'Claims', object: 'Full Workspace', action: 'Open Individual Claim', label: 'Full Workspace › Open Individual Claim', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-9', module: 'Claims', object: 'Full Workspace', action: 'View Claim Header & Summary', label: 'Full Workspace › View Claim Header & Summary', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-10', module: 'Claims', object: 'Full Workspace', action: 'View Claim Details Fields', label: 'Full Workspace › View Claim Details Fields', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-11', module: 'Claims', object: 'Final Risk Summary', action: 'View (all fields)', label: 'Final Risk Summary › View (all fields)', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-12', module: 'Claims', object: 'Risk Assessments', action: 'View Records', label: 'Risk Assessments › View Records', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-13', module: 'Claims', object: 'Related Assets', action: 'View', label: 'Related Assets › View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'cl-14', module: 'Claims', object: 'Audit Log', action: 'View Records', label: 'Audit Log › View Records', view: 'No', readOnly: 'Yes', edit: 'No' },
    ],
  },
  {
    id: 'products', label: 'Products',
    rows: [
      { id: 'pd-1', module: 'Products', object: 'Workspace', action: 'Access & Browse', label: 'Workspace › Access & Browse', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pd-2', module: 'Products', object: 'Workspace', action: 'Search (Basic & Advanced)', label: 'Workspace › Search (Basic & Advanced)', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pd-3', module: 'Products', object: 'Workspace', action: 'Column Filters & Quick Filters', label: 'Workspace › Column Filters & Quick Filters', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pd-4', module: 'Products', object: 'Workspace', action: 'Mark / Unmark Favorites', label: 'Workspace › Mark / Unmark Favorites', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'pd-5', module: 'Products', object: 'Detail Page', action: 'View Product Details', label: 'Detail Page › View Product Details', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pd-6', module: 'Products', object: 'Hierarchy Tree', action: 'View', label: 'Hierarchy Tree › View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pd-7', module: 'Products', object: 'Claims (linked)', action: 'View', label: 'Claims (linked) › View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'pd-8', module: 'Products', object: 'Audit Log', action: 'View', label: 'Audit Log › View', view: 'Yes', readOnly: 'No', edit: 'No' },
    ],
  },
  {
    id: 'assets', label: 'Assets',
    rows: [
      { id: 'as-1', module: 'Assets', object: 'Library', action: 'Access & Browse', label: 'Library › Access & Browse', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'as-2', module: 'Assets', object: 'Library', action: 'All Assets View', label: 'Library › All Assets View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'as-3', module: 'Assets', object: 'Library', action: 'My Assets View', label: 'Library › My Assets View', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'as-4', module: 'Assets', object: 'Library', action: 'Recently Viewed', label: 'Library › Recently Viewed', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'as-5', module: 'Assets', object: 'Library', action: 'Search & Filter', label: 'Library › Search & Filter', view: 'No', readOnly: 'Yes', edit: 'No' },
      { id: 'as-6', module: 'Assets', object: 'Library', action: 'Mark / Unmark Favourite', label: 'Library › Mark / Unmark Favourite', view: 'No', readOnly: 'No', edit: 'Yes' },
      { id: 'as-7', module: 'Assets', object: 'Detail', action: 'View Asset (rendition, metadata)', label: 'Detail › View Asset (rendition, metadata)', view: 'No', readOnly: 'Yes', edit: 'No' },
    ],
  },
];

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
