export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'rejected';
  avatar: string;
  joinedDate?: string;
  teamId: 'rd' | 'ra' | 'legal';
}

export interface Project {
  id: string;
  name: string;
  projectId: string;
  type: string;
  businessGroup: string;
  category: string;
  scope: string;
  description: string;
  region: string;
  projectLead: string;
  claimsLead: string;
  status: string;
  lifecycleStage: string;
  lastUpdated: string;
  startDate: string;
  launchDate: string;
  evaluationDate: string;
  externalRef: string;
  isFavorite?: boolean;
  finalRiskLevel?: 'Low' | 'Medium' | 'High' | 'Very High' | null;
  projectCreator?: string;
  clonedFrom?: string;
  copiedFromProjectId?: string;
  copiedFromProjectName?: string;
  isSubscribedToSourceChanges?: boolean;
  confidentialRestrictions?: boolean;
  teamMembers?: TeamMember[];
  cancelReasonCategory?: string;
  cancelReasonText?: string;
  isArchived?: boolean;
  archivedDate?: string;
}

export const isProjectArchived = (project: Project): boolean => {
  if (project.isArchived) return true;
  if (!project.lastUpdated) return false;
  const lastUpdate = new Date(project.lastUpdated).getTime();
  if (isNaN(lastUpdate)) return false;
  const elapsed = Date.now() - lastUpdate;
  if (project.status === 'Cancelled') {
    // 90 days
    return elapsed > 90 * 24 * 60 * 60 * 1000;
  }
  // 3 calendar years
  return elapsed > 3 * 365 * 24 * 60 * 60 * 1000;
};


export interface TableState {
  sortColumn: string | null;
  sortDirection: 'asc' | 'desc' | null;
  currentPage: number;
  columnOrder: ColumnConfig[];
  columnWidths: Record<string, number>;
}

export interface ColumnConfig {
  id: string;
  label: string;
  sortKey?: string;
  width: number;
  visible?: boolean;
}

export const LIFECYCLE_STAGES = [
  'Draft',
  'Substantiate',
  'Review & Risk Assessment',
  'Complete'
];

export type UserRole = 'Project Creator' | 'Claims Lead' | 'Viewer' | 'TPM' | 'Nutritionist' | 'Substantiator' | 'Legal' | 'Regulatory';

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  fromStage?: string;
  toStage?: string;
  details?: string;
  // F06 — field-level audit for Support Strategy changes
  field?: string;          // e.g. 'supportStrategy'
  beforeValue?: string;    // prior content (immutable once written)
  afterValue?: string;     // new content
  surface?: string;        // 'inline' | 'detail' | 'workspace'
}

export type NotificationTeam = 'Claims Lead' | 'TPM' | 'Nutritionist' | 'Substantiator' | 'Legal' | 'Regulatory' | 'Project Team';

export const STAGE_TRANSITION_NOTIFICATIONS: Record<string, NotificationTeam[]> = {
  'Substantiate': ['Claims Lead', 'TPM', 'Nutritionist', 'Substantiator'],
  'Draft': ['Claims Lead', 'TPM'],
  'Review & Risk Assessment': ['Legal', 'Regulatory'],
  'Complete': ['Project Team'],
};

// Mock per-project claim/asset stats for validation
export interface ProjectStats {
  globalClaimsCount: number;
  localClaimsCount: number;
  assetsCount: number;
  allClaimsAssessed: boolean;
  claimsWithMissingSupportStrategy: string[];
}

export const MOCK_PROJECT_STATS: Record<string, ProjectStats> = {
  '1': { globalClaimsCount: 3, localClaimsCount: 2, assetsCount: 4, allClaimsAssessed: false, claimsWithMissingSupportStrategy: [] },
  '2': { globalClaimsCount: 2, localClaimsCount: 1, assetsCount: 2, allClaimsAssessed: false, claimsWithMissingSupportStrategy: ['Claim #3 – #1 Dermatologist recommended'] },
  '3': { globalClaimsCount: 4, localClaimsCount: 3, assetsCount: 6, allClaimsAssessed: true, claimsWithMissingSupportStrategy: [] },
  '4': { globalClaimsCount: 0, localClaimsCount: 0, assetsCount: 0, allClaimsAssessed: false, claimsWithMissingSupportStrategy: [] },
  '5': { globalClaimsCount: 1, localClaimsCount: 1, assetsCount: 2, allClaimsAssessed: false, claimsWithMissingSupportStrategy: ['Claim #2 – Longlasting scent claim'] },
  '6': { globalClaimsCount: 2, localClaimsCount: 2, assetsCount: 3, allClaimsAssessed: false, claimsWithMissingSupportStrategy: [] },
  '7': { globalClaimsCount: 3, localClaimsCount: 2, assetsCount: 5, allClaimsAssessed: true, claimsWithMissingSupportStrategy: [] },
  '8': { globalClaimsCount: 2, localClaimsCount: 1, assetsCount: 3, allClaimsAssessed: false, claimsWithMissingSupportStrategy: [] },
  '9': { globalClaimsCount: 0, localClaimsCount: 0, assetsCount: 0, allClaimsAssessed: false, claimsWithMissingSupportStrategy: [] },
  '10': { globalClaimsCount: 0, localClaimsCount: 0, assetsCount: 0, allClaimsAssessed: false, claimsWithMissingSupportStrategy: [] },
  '11': { globalClaimsCount: 2, localClaimsCount: 1, assetsCount: 3, allClaimsAssessed: true, claimsWithMissingSupportStrategy: [] },
  '12': { globalClaimsCount: 2, localClaimsCount: 1, assetsCount: 2, allClaimsAssessed: false, claimsWithMissingSupportStrategy: [] },
};

export const BUSINESS_GROUPS = [
  'Beauty & Wellbeing',
  'Home Care',
  'Personal Care',
  'Foods',
  'One UL'
];

export const CATEGORIES: Record<string, string[]> = {
  'Beauty & Wellbeing': ['Skin Care', 'Hair Care', 'Deodorants', 'Oral Care', 'Baby & Child'],
  'Home Care': ['Fabric Care', 'Home Hygiene', 'Surface Care'],
  'Personal Care': ['Deodorants', 'Oral Care', 'Body Wash', 'Soap'],
  'Foods': ['Condiments', 'Ice Cream', 'Tea & Beverages', 'Nutrition'],
  'One UL': ['Cross-BG', 'Digital Assets', 'Universal Support']
};

export const PROJECT_TYPES = [
  'Innovation',
  'Renovation',
  'Marketing Campaign',
  'Regulatory Compliance',
  'Rollout',
  'Reformulation'
];

export const PROJECT_SCOPES = ['Global', 'Regional', 'Local'];

export const REGIONS = ['Global', 'EMEA', 'North America', 'LATAM', 'APAC', 'South Asia'];

export const STATUS_OPTIONS = ['Draft', 'In Progress', 'Under Review', 'Assessment Complete', 'Completed', 'Archived', 'Cancelled'];

export const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Dove Intensive Repair Claims Project',
    projectId: 'PRJ-2026-001',
    type: 'Innovation',
    businessGroup: 'Beauty & Wellbeing',
    category: 'Skin Care',
    scope: 'Global',
    description: 'Claims substantiation for Dove Intensive Repair moisturizing range. Focus on clinically proven hydration claims and skin health benefits.',
    region: 'Global',
    projectLead: 'Sarah Johnson',
    claimsLead: 'Michael Chen',
    status: 'In Progress',
    lifecycleStage: 'Substantiate',
    lastUpdated: '2026-04-25',
    startDate: '2026-01-15',
    launchDate: '2026-09-01',
    evaluationDate: '2026-07-15',
    externalRef: 'UL-DOVE-2026-IR',
    finalRiskLevel: 'Low',
    projectCreator: 'Sarah Johnson'
  },
  {
    id: '2',
    name: 'Hellmann\'s Real Mayonnaise Campaign',
    projectId: 'PRJ-2026-002',
    type: 'Marketing Campaign',
    businessGroup: 'Foods',
    category: 'Condiments',
    scope: 'Regional',
    description: 'Marketing claims review for the Hellmann\'s Real campaign. Validating "made with real ingredients" and taste superiority claims.',
    region: 'North America',
    projectLead: 'David Smith',
    claimsLead: 'Emma Williams',
    status: 'Under Review',
    lifecycleStage: 'Review & Risk Assessment',
    lastUpdated: '2026-04-24',
    startDate: '2026-02-01',
    launchDate: '2026-08-15',
    evaluationDate: '2026-06-30',
    externalRef: 'UL-HLMN-2026-NA',
    finalRiskLevel: 'Medium',
    projectCreator: 'David Smith'
  },
  {
    id: '3',
    name: 'Persil Deep Clean Efficacy Claims',
    projectId: 'PRJ-2026-003',
    type: 'Renovation',
    businessGroup: 'Home Care',
    category: 'Fabric Care',
    scope: 'Global',
    description: 'Scientific substantiation for Persil Deep Clean formulation. Includes stain removal efficacy, whiteness, and fabric care claims.',
    region: 'EMEA',
    projectLead: 'Lisa Anderson',
    claimsLead: 'James Brown',
    status: 'Completed',
    lifecycleStage: 'Complete',
    lastUpdated: '2026-04-23',
    startDate: '2025-10-01',
    launchDate: '2026-03-15',
    evaluationDate: '2026-02-28',
    externalRef: 'UL-PRS-2025-GBL',
    finalRiskLevel: 'Low',
    projectCreator: 'Lisa Anderson'
  },
  {
    id: '4',
    name: 'TRESemmé Keratin Smooth Launch',
    projectId: 'PRJ-2026-004',
    type: 'Innovation',
    businessGroup: 'Beauty & Wellbeing',
    category: 'Hair Care',
    scope: 'Regional',
    description: 'Claims package for TRESemmé Keratin Smooth new product launch. Smoothness, frizz-control and 48hr hold claims.',
    region: 'LATAM',
    projectLead: 'Robert Taylor',
    claimsLead: 'Jennifer Davis',
    status: 'In Progress',
    lifecycleStage: 'Draft',
    lastUpdated: '2026-04-22',
    startDate: '2026-03-01',
    launchDate: '2026-11-01',
    evaluationDate: '2026-09-15',
    externalRef: 'UL-TRES-2026-LA',
    finalRiskLevel: null,
    projectCreator: 'Robert Taylor'
  },
  {
    id: '5',
    name: 'Lynx Africa Anniversary Claims',
    projectId: 'PRJ-2026-005',
    type: 'Marketing Campaign',
    businessGroup: 'Personal Care',
    category: 'Deodorants',
    scope: 'Local',
    description: '30th anniversary edition of Lynx Africa. Claims validation for longlasting scent and appeal claims for UK market.',
    region: 'EMEA',
    projectLead: 'Amanda Wilson',
    claimsLead: 'Thomas Moore',
    status: 'In Progress',
    lifecycleStage: 'Substantiate',
    lastUpdated: '2026-04-21',
    startDate: '2026-02-15',
    launchDate: '2026-07-01',
    evaluationDate: '2026-05-30',
    externalRef: 'UL-LNX-2026-UK',
    finalRiskLevel: 'High',
    projectCreator: 'Amanda Wilson'
  },
  {
    id: '6',
    name: 'Domestos Bleach Power Claims',
    projectId: 'PRJ-2026-006',
    type: 'Regulatory Compliance',
    businessGroup: 'Home Care',
    category: 'Home Hygiene',
    scope: 'Regional',
    description: 'Regulatory compliance review for Domestos bleach kill-claims. Updated claims to meet EU Biocidal Products Regulation requirements.',
    region: 'EMEA',
    projectLead: 'Christopher Lee',
    claimsLead: 'Patricia Martinez',
    status: 'In Progress',
    lifecycleStage: 'Review & Risk Assessment',
    lastUpdated: '2026-04-20',
    startDate: '2026-01-01',
    launchDate: '2026-06-01',
    evaluationDate: '2026-04-30',
    externalRef: 'UL-DOM-2026-EU',
    finalRiskLevel: 'Medium',
    projectCreator: 'Christopher Lee'
  },
  {
    id: '7',
    name: 'Magnum Pleasure Store Premium Claims',
    projectId: 'PRJ-2026-007',
    type: 'Innovation',
    businessGroup: 'Foods',
    category: 'Ice Cream',
    scope: 'Global',
    description: 'Premium positioning claims for Magnum Pleasure Store customization experience. Quality ingredient and indulgence claims.',
    region: 'Global',
    projectLead: 'Daniel Garcia',
    claimsLead: 'Nancy Rodriguez',
    status: 'Under Review',
    lifecycleStage: 'Review & Risk Assessment',
    lastUpdated: '2026-04-19',
    startDate: '2025-11-01',
    launchDate: '2026-05-15',
    evaluationDate: '2026-04-01',
    externalRef: 'UL-MGN-2026-GBL',
    finalRiskLevel: 'Low',
    projectCreator: 'Daniel Garcia'
  },
  {
    id: '8',
    name: 'Vaseline Intensive Care Reformulation',
    projectId: 'PRJ-2026-008',
    type: 'Reformulation',
    businessGroup: 'Beauty & Wellbeing',
    category: 'Skin Care',
    scope: 'Global',
    description: 'Claims update for Vaseline Intensive Care reformulation with new microbiome-friendly formula. Skin restoration and protection claims.',
    region: 'Global',
    projectLead: 'Matthew Jackson',
    claimsLead: 'Karen White',
    status: 'In Progress',
    lifecycleStage: 'Substantiate',
    lastUpdated: '2026-04-18',
    startDate: '2026-02-01',
    launchDate: '2026-10-01',
    evaluationDate: '2026-08-15',
    externalRef: 'UL-VAS-2026-GBL',
    finalRiskLevel: null,
    projectCreator: 'Matthew Jackson'
  },
  {
    id: '9',
    name: 'Lipton Green Tea Health Claims',
    projectId: 'PRJ-2026-009',
    type: 'Regulatory Compliance',
    businessGroup: 'Foods',
    category: 'Tea & Beverages',
    scope: 'Regional',
    description: 'Health benefit claims review for Lipton Green Tea range. Antioxidant and wellness claims substantiation per APAC regulations.',
    region: 'APAC',
    projectLead: 'Sarah Johnson',
    claimsLead: 'Michael Chen',
    status: 'Draft',
    lifecycleStage: 'Draft',
    lastUpdated: '2026-04-17',
    startDate: '2026-04-01',
    launchDate: '2026-12-01',
    evaluationDate: '2026-10-15',
    externalRef: 'UL-LIP-2026-APAC',
    finalRiskLevel: null,
    projectCreator: 'Sarah Johnson'
  },
  {
    id: '10',
    name: 'Comfort Fabric Softener Rollout',
    projectId: 'PRJ-2026-010',
    type: 'Rollout',
    businessGroup: 'Home Care',
    category: 'Fabric Care',
    scope: 'Regional',
    description: 'Rollout of Comfort Pure sensitive fabric softener to South Asian markets. Adapting claims from EU to local regulatory framework.',
    region: 'South Asia',
    projectLead: 'Jennifer Davis',
    claimsLead: 'James Brown',
    status: 'Draft',
    lifecycleStage: 'Draft',
    lastUpdated: '2026-04-16',
    startDate: '2026-04-15',
    launchDate: '2026-12-15',
    evaluationDate: '2026-11-01',
    externalRef: 'UL-CMF-2026-SA',
    finalRiskLevel: null,
    projectCreator: 'Jennifer Davis'
  },
  {
    id: '11',
    name: 'Simple Kind to Skin Launch',
    projectId: 'PRJ-2026-011',
    type: 'Innovation',
    businessGroup: 'Beauty & Wellbeing',
    category: 'Skin Care',
    scope: 'Regional',
    description: 'New product launch claims for Simple Kind to Skin range. Dermatologist tested, no harsh chemicals, suitable for sensitive skin.',
    region: 'North America',
    projectLead: 'Emma Williams',
    claimsLead: 'Thomas Moore',
    status: 'Completed',
    lifecycleStage: 'Complete',
    lastUpdated: '2026-04-15',
    startDate: '2025-09-01',
    launchDate: '2026-04-30',
    evaluationDate: '2026-03-15',
    externalRef: 'UL-SMP-2026-NA',
    finalRiskLevel: 'Low',
    projectCreator: 'Emma Williams'
  },
  {
    id: '12',
    name: 'Knorr Plant-Based Range Claims',
    projectId: 'PRJ-2026-012',
    type: 'Innovation',
    businessGroup: 'Foods',
    category: 'Nutrition',
    scope: 'Global',
    description: 'Plant-based nutrition claims for new Knorr range. Protein content, sustainability, and taste equivalence claims.',
    region: 'Global',
    projectLead: 'Robert Taylor',
    claimsLead: 'Nancy Rodriguez',
    status: 'In Progress',
    lifecycleStage: 'Substantiate',
    lastUpdated: '2026-04-14',
    startDate: '2026-01-20',
    launchDate: '2026-09-15',
    evaluationDate: '2026-07-30',
    externalRef: 'UL-KNR-2026-GBL',
    finalRiskLevel: 'High',
    projectCreator: 'Robert Taylor'
  },
  {
    id: '13',
    name: 'Rexona Advanced Protection Cancellation',
    projectId: 'PRJ-2025-013',
    type: 'Renovation',
    businessGroup: 'Beauty & Wellbeing',
    category: 'Deodorants',
    scope: 'Global',
    description: 'Cancelled project due to strategic realignment and budget constraints.',
    region: 'Global',
    projectLead: 'Sarah Johnson',
    claimsLead: 'Michael Chen',
    status: 'Cancelled',
    lifecycleStage: 'Draft',
    lastUpdated: '2025-06-10',
    startDate: '2025-01-10',
    launchDate: '2025-12-01',
    evaluationDate: '2025-05-01',
    externalRef: 'UL-REX-2025-CANC',
    finalRiskLevel: null,
    projectCreator: 'Sarah Johnson',
    cancelReasonCategory: 'Strategic Realignment',
    cancelReasonText: 'Project cancelled due to portfolio reprioritization and shifts in regional marketing focus.'
  },
  {
    id: '14',
    name: 'Sunsilk Natural Glow Archival',
    projectId: 'PRJ-2022-014',
    type: 'Innovation',
    businessGroup: 'Beauty & Wellbeing',
    category: 'Hair Care',
    scope: 'Regional',
    description: 'Archived legacy project inactive for over 3 calendar years.',
    region: 'APAC',
    projectLead: 'Sarah Johnson',
    claimsLead: 'Michael Chen',
    status: 'Archived',
    lifecycleStage: 'Complete',
    lastUpdated: '2022-03-15',
    startDate: '2021-06-01',
    launchDate: '2022-01-01',
    evaluationDate: '2021-11-15',
    externalRef: 'UL-SSK-2022-ARCH',
    finalRiskLevel: 'Low',
    projectCreator: 'Sarah Johnson',
    isArchived: true,
    archivedDate: '2025-03-15'
  }
];

export function generateTeamMembersForProject(
  businessGroup: string,
  geographies: string[],
  projectLead: string
): TeamMember[] {
  const members: TeamMember[] = [];
  let memberIdCounter = 1;
  const nextId = () => `auto-m-${memberIdCounter++}`;

  // 1. Add the Project Lead/Creator as an active member
  const leadInitials = projectLead.split(' ').map(n => n[0]).join('').toUpperCase() || 'PL';
  const leadEmail = `${projectLead.toLowerCase().replace(/\s+/g, '.')}@unilever.com`;

  // Determine lead team and role
  let leadTeamId: 'rd' | 'ra' | 'legal' = 'rd';
  let leadRole = 'Project Lead';
  
  if (['Michael Chen', 'Emma Williams', 'Lisa Park', 'Karen White', 'Matthew Jackson', 'Christopher Lee'].includes(projectLead)) {
    leadTeamId = 'ra';
  } else if (['Robert Taylor', 'Patricia Martinez', 'Thomas Moore', 'Daniel Garcia'].includes(projectLead)) {
    leadTeamId = 'legal';
  }

  members.push({
    id: nextId(),
    name: projectLead,
    email: leadEmail,
    role: leadRole,
    status: 'active',
    avatar: leadInitials,
    joinedDate: new Date().toISOString().split('T')[0],
    teamId: leadTeamId
  });

  const addedEmails = new Set<string>([leadEmail]);

  const addUniqueMember = (m: Omit<TeamMember, 'id'>) => {
    if (!addedEmails.has(m.email)) {
      addedEmails.add(m.email);
      members.push({
        id: nextId(),
        ...m
      });
    }
  };

  // 2. Business Group based auto-population
  if (businessGroup === 'Beauty & Wellbeing') {
    addUniqueMember({
      name: 'Dr. Priya Sharma',
      email: 'p.sharma@unilever.com',
      role: 'R&D Skin Specialist',
      status: 'active',
      avatar: 'PS',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'rd'
    });
    addUniqueMember({
      name: 'Emma Williams',
      email: 'e.williams@unilever.com',
      role: 'Regulatory Affairs Manager',
      status: 'active',
      avatar: 'EW',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'ra'
    });
    addUniqueMember({
      name: 'Robert Taylor',
      email: 'r.taylor@unilever.com',
      role: 'Legal Counsel',
      status: 'active',
      avatar: 'RT',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'legal'
    });
  } else if (businessGroup === 'Foods') {
    addUniqueMember({
      name: 'Nancy Rodriguez',
      email: 'n.rodriguez@unilever.com',
      role: 'R&D Nutritionist',
      status: 'active',
      avatar: 'NR',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'rd'
    });
    addUniqueMember({
      name: 'Michael Chen',
      email: 'm.chen@unilever.com',
      role: 'Claims Lead',
      status: 'active',
      avatar: 'MC',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'ra'
    });
    addUniqueMember({
      name: 'Patricia Martinez',
      email: 'p.martinez@unilever.com',
      role: 'IP Attorney',
      status: 'active',
      avatar: 'PM',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'legal'
    });
  } else if (businessGroup === 'Home Care') {
    addUniqueMember({
      name: 'Jennifer Davis',
      email: 'j.davis@unilever.com',
      role: 'Senior R&D Developer',
      status: 'active',
      avatar: 'JD',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'rd'
    });
    addUniqueMember({
      name: 'Karen White',
      email: 'k.white@unilever.com',
      role: 'RA Expert',
      status: 'active',
      avatar: 'KW',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'ra'
    });
    addUniqueMember({
      name: 'Thomas Moore',
      email: 't.moore@unilever.com',
      role: 'IP Counsel',
      status: 'active',
      avatar: 'TM',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'legal'
    });
  } else if (businessGroup === 'Personal Care') {
    addUniqueMember({
      name: 'Alex Turner',
      email: 'a.turner@unilever.com',
      role: 'Research Associate',
      status: 'active',
      avatar: 'AT',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'rd'
    });
    addUniqueMember({
      name: 'Matthew Jackson',
      email: 'm.jackson@unilever.com',
      role: 'RA Lead',
      status: 'active',
      avatar: 'MJ',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'ra'
    });
    addUniqueMember({
      name: 'Daniel Garcia',
      email: 'd.garcia@unilever.com',
      role: 'Legal Specialist',
      status: 'active',
      avatar: 'DG',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'legal'
    });
  } else {
    addUniqueMember({
      name: 'Dr. Sarah Johnson',
      email: 's.johnson@unilever.com',
      role: 'Global R&D Director',
      status: 'active',
      avatar: 'SJ',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'rd'
    });
    addUniqueMember({
      name: 'Lisa Park',
      email: 'l.park@unilever.com',
      role: 'Regulatory Specialist',
      status: 'active',
      avatar: 'LP',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'ra'
    });
    addUniqueMember({
      name: 'Robert Taylor',
      email: 'r.taylor@unilever.com',
      role: 'Legal Counsel',
      status: 'active',
      avatar: 'RT',
      joinedDate: new Date().toISOString().split('T')[0],
      teamId: 'legal'
    });
  }

  // 3. Geography based auto-population
  geographies.forEach((geo) => {
    const cleanGeo = geo.trim();
    if (cleanGeo === 'EMEA') {
      addUniqueMember({
        name: 'Christopher Lee',
        email: 'c.lee@unilever.com',
        role: 'EMEA RA Coordinator',
        status: 'pending',
        avatar: 'CL',
        teamId: 'ra'
      });
      addUniqueMember({
        name: 'Thomas Moore',
        email: 't.moore@unilever.com',
        role: 'EMEA Compliance Counsel',
        status: 'active',
        avatar: 'TM',
        joinedDate: new Date().toISOString().split('T')[0],
        teamId: 'legal'
      });
    } else if (cleanGeo === 'North America') {
      addUniqueMember({
        name: 'Karen White',
        email: 'k.white@unilever.com',
        role: 'NA Regulatory Lead',
        status: 'active',
        avatar: 'KW',
        joinedDate: new Date().toISOString().split('T')[0],
        teamId: 'ra'
      });
      addUniqueMember({
        name: 'Robert Taylor',
        email: 'r.taylor@unilever.com',
        role: 'NA IP Counsel',
        status: 'pending',
        avatar: 'RT',
        teamId: 'legal'
      });
    } else if (cleanGeo === 'LATAM') {
      addUniqueMember({
        name: 'Daniel Garcia',
        email: 'd.garcia@unilever.com',
        role: 'LATAM Legal Associate',
        status: 'active',
        avatar: 'DG',
        joinedDate: new Date().toISOString().split('T')[0],
        teamId: 'legal'
      });
      addUniqueMember({
        name: 'Jennifer Davis',
        email: 'j.davis@unilever.com',
        role: 'LATAM Developer',
        status: 'pending',
        avatar: 'JD',
        teamId: 'rd'
      });
    } else if (cleanGeo === 'APAC') {
      addUniqueMember({
        name: 'James Liu',
        email: 'j.liu@unilever.com',
        role: 'APAC Lab Analyst',
        status: 'active',
        avatar: 'JL',
        joinedDate: new Date().toISOString().split('T')[0],
        teamId: 'rd'
      });
      addUniqueMember({
        name: 'Michael Chen',
        email: 'm.chen@unilever.com',
        role: 'APAC Claims Lead',
        status: 'pending',
        avatar: 'MC',
        teamId: 'ra'
      });
    } else if (cleanGeo === 'South Asia') {
      addUniqueMember({
        name: 'Dr. Priya Sharma',
        email: 'p.sharma@unilever.com',
        role: 'SA R&D Lead',
        status: 'active',
        avatar: 'PS',
        joinedDate: new Date().toISOString().split('T')[0],
        teamId: 'rd'
      });
      addUniqueMember({
        name: 'Matthew Jackson',
        email: 'm.jackson@unilever.com',
        role: 'SA RA Lead',
        status: 'pending',
        avatar: 'MJ',
        teamId: 'ra'
      });
    } else if (cleanGeo === 'Global') {
      addUniqueMember({
        name: 'Dr. Sarah Johnson',
        email: 's.johnson@unilever.com',
        role: 'Global R&D Director',
        status: 'active',
        avatar: 'SJ',
        joinedDate: new Date().toISOString().split('T')[0],
        teamId: 'rd'
      });
      addUniqueMember({
        name: 'Emma Williams',
        email: 'e.williams@unilever.com',
        role: 'Global Regulatory Manager',
        status: 'pending',
        avatar: 'EW',
        teamId: 'ra'
      });
    }
  });

  return members;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLAIMS MODULE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ClaimType = 'Global' | 'Regional' | 'Local' | 'Local SKU';

export type ClaimLifecycle =
  | 'Proposed' | 'Assessed' | 'Locally Assessed' | 'Assessed via Inheritance'
  | 'Rejected' | 'Challenged' | 'Withdrawn' | 'Not Pursued'
  | 'Cancelled' | 'Obsolete' | 'Expired';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High' | 'Not Allowed' | 'Varied / Channel Dependent' | null;

export type ClaimUserRole = 'Claims Lead' | 'Legal' | 'RA' | 'R&D' | 'TPM' | 'Nutritionist' | 'Substantiator' | 'Project Creator' | 'Viewer';

export interface ClaimVersion {
  versionNumber: number;
  isLatest: boolean;
  globalStatement: string;
  localStatement: string;
  backtranslation?: string;
  createdAt: string;
  createdBy: string;
  isFavorite?: boolean;
}

export interface SubstantiationDoc {
  id: string;
  fileName: string;
  classification: string;
  uploadedAt: string;
  uploadedBy: string;
  inUse?: boolean;
}

export interface RiskAssessmentRecord {
  id: string;
  functionDept: string;
  assessmentType?: string;
  marketingChannels?: string[];
  assessedBy: string;
  riskLevel: RiskLevel;
  comments: string;
  geography?: string | string[];
  dateTime: string;
  source?: 'Parent';
  isRemoved?: boolean;
}

export interface ClaimInheritance {
  parentClaimId: string;
  parentClaimVersion: number;
  inheritedAt: string;
  inheritedBy: string;
  appendLog: Array<{ parentClaimId: string; version: number; appendedAt: string; appendedBy: string }>;
}

export interface Claim {
  id: string;
  claimType: ClaimType;
  parentClaimId?: string;
  versions: ClaimVersion[];
  currentVersion: number;
  order?: number;
  lifecycleStage: ClaimLifecycle;
  marketingChannels: string[];
  finalRiskLevel: RiskLevel;
  finalRiskLevelIRA?: string;
  finalRiskIcon?: string;
  productName: string;
  productId: string;
  businessGroup?: string;
  restrictedUse: boolean;
  restrictedUseComment?: string;
  claimIdentifier?: string;
  claimCategory?: string;
  geography?: string;
  relatedProjectIds: string[];
  challenged: boolean;
  copiedFromClaimId?: string;
  supportStrategy: string;
  substantiationDocs: SubstantiationDoc[];
  finalRiskSummary: {
    claimClassificationLevel?: string;
    claimClassificationLevelIRA?: string;
    reasons?: string[];
    reason?: string;
    reasonIRA?: string;
    claimsForumSummary?: string;
    legalSummary?: string;
    raSummary?: string;
    rdSummary?: string;
    marketingFeedback?: string;
    marketingRiskSignoff: boolean;
    iRAOutput?: string;
    iRAClassificationConfidence?: number;
    iRARiskConfidence?: number;
    iRAReasons?: Array<{ reason: string; confidence: number }>;
    inheritanceTrace?: string;
  };
  riskAssessments: RiskAssessmentRecord[];
  linkedAssets: Array<{ id: string; name: string; type: string; lifecycleState: string; assetNumber: string }>;
  inheritance?: ClaimInheritance;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  qualifier?: string;
  cucCode?: string;
  expiryDate?: string;
  // F01 — last-modified metadata for Support Strategy
  supportStrategyLastModifiedBy?: string;
  supportStrategyLastModifiedAt?: string;
  auditLog?: AuditEntry[];
}

export type ClaimBaseView = 'Global Claims' | 'Regional Claims' | 'Local Claims' | 'SKU Claims';
export type ClaimWorkView = 'Support Strategy & Substantiation' | 'Risk Level Assessments' | 'Final Risk Summary';
export type ClaimsModuleView = 'table' | 'workspace';

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
  'Low':                      'text-green-700 bg-green-50 border border-green-200',
  'Medium':                   'text-amber-700 bg-amber-50 border border-amber-200',
  'High':                     'text-orange-700 bg-orange-50 border border-orange-200',
  'Very High':                'text-red-700 bg-red-50 border border-red-200',
  'Not Allowed':              'text-red-800 bg-red-100 border border-red-300',
  'Varied / Channel Dependent': 'text-blue-700 bg-blue-50 border border-blue-200',
};

/** Filled circle icon color per risk level (Tailwind bg class) */
export const RISK_LEVEL_ICON_COLOR: Record<string, string> = {
  'Low':                        'bg-green-500',
  'Medium':                     'bg-amber-500',
  'High':                       'bg-red-500',
  'Very High':                  'bg-red-700',
  'Not Allowed':                'bg-red-600',
  'Varied / Channel Dependent': 'bg-blue-500',
};

export const MARKETING_CHANNELS = ['TV', 'Digital', 'Social Media', 'Print', 'In-store', 'Packaging', 'E-commerce'];
export const CLAIM_CATEGORIES = ['Functional', 'Sensorial', 'Emotional', 'Comparative', 'Environmental', 'Health'];
export const CLAIM_IDENTIFIERS = ['CID-001', 'CID-002', 'CID-003', 'CID-004', 'CID-005'];

/** Spec-aligned classification levels (GO / ASK / NO GO) */
export const CLASSIFICATION_LEVELS = ['Level 1 (GO)', 'Level 2 (ASK)', 'Level 3 (NO GO)'];

/** Final Risk Level picklist (spec M13) */
export const FINAL_RISK_LEVEL_OPTIONS: NonNullable<RiskLevel>[] = [
  'Low', 'Medium', 'High', 'Not Allowed', 'Varied / Channel Dependent'
];

/** Predefined reasons picklist for Final Risk Summary (M13 US5) */
export const REASONS_PICKLIST = [
  'Regulatory sensitivity',
  'Ambiguous wording',
  'Scientific backing moderate',
  'Competitor challenge risk',
  'Market-specific restriction',
  'Lack of clinical data',
  'Environmental impact concern',
  'Label compliance issue',
  'Consumer perception risk',
  'Substantiation not available',
];

/** Assessment type options for Risk Equalizer modal (M7 Step 2) */
export const ASSESSMENT_TYPES = [
  'Claims Lead Risk Level Assessment',
  'Legal Risk Level Assessment',
  'Nutritionist Risk Level Assessment',
  'Project Lead Risk Level Assessment',
  'Regulatory Risk Level Assessment',
  'Substantiator Risk Level Assessment',
  'TPM Risk Level Assessment',
];

export const FUNCTION_DEPTS: Array<'R&D' | 'RA' | 'Legal'> = ['R&D', 'RA', 'Legal'];

export const mockClaims: Claim[] = [
  // Global Claim 1 - Dove (Assessed, full data)
  {
    id: 'CLM-001',
    claimType: 'Global',
    versions: [
      {
        versionNumber: 1,
        isLatest: false,
        globalStatement: 'Moisturizes skin',
        localStatement: 'Moisturizes skin',
        createdAt: '2025-12-01T09:00:00Z',
        createdBy: 'Sarah Johnson'
      },
      {
        versionNumber: 2,
        isLatest: false,
        globalStatement: 'Provides deep moisture for 24 hours',
        localStatement: 'Provides deep moisture for 24 hours',
        createdAt: '2026-01-10T09:00:00Z',
        createdBy: 'Sarah Johnson'
      },
      {
        versionNumber: 3,
        isLatest: true,
        globalStatement: 'Clinically proven to provide deep moisture for 24 hours',
        localStatement: 'Clinically proven to provide deep moisture for 24 hours',
        createdAt: '2026-01-20T09:00:00Z',
        createdBy: 'Sarah Johnson'
      }
    ],
    currentVersion: 2,
    order: 1,
    lifecycleStage: 'Assessed',
    marketingChannels: ['TV', 'Digital', 'Packaging'],
    finalRiskLevel: 'Low',
    finalRiskIcon: '✓',
    productName: 'Dove Intensive Repair Lotion',
    productId: 'PRD-VAR-001',
    restrictedUse: false,
    claimIdentifier: 'CID-001',
    claimCategory: 'Functional',
    relatedProjectIds: ['1'],
    challenged: false,
    supportStrategy: 'Clinical study conducted with 150 participants over 4 weeks, measuring skin hydration levels using corneometer readings. Results showed statistically significant improvement in skin moisture retention at 24-hour mark compared to untreated control.',
    substantiationDocs: [
      {
        id: 'DOC-001',
        fileName: 'Dove_Clinical_Study_Hydration_2025.pdf',
        classification: 'Level 1 – Low Risk',
        uploadedAt: '2026-01-22T14:30:00Z',
        uploadedBy: 'Michael Chen',
        inUse: true
      },
      {
        id: 'DOC-002',
        fileName: 'Statistical_Analysis_Report.pdf',
        classification: 'Level 1 – Low Risk',
        uploadedAt: '2026-01-23T10:15:00Z',
        uploadedBy: 'Michael Chen',
        inUse: true
      }
    ],
    finalRiskSummary: {
      claimClassificationLevel: 'Level 1 – Low Risk',
      reason: 'Robust clinical evidence with statistically significant results',
      claimsForumSummary: 'Approved based on strong clinical substantiation',
      legalSummary: 'No legal concerns. Claim is compliant with advertising standards.',
      raSummary: 'Regulatory compliant across all target markets',
      rdSummary: 'Clinical protocol meets industry standards for hydration claims',
      marketingFeedback: 'Strong differentiator for the product range',
      marketingRiskSignoff: true,
      iRAOutput: 'Low risk - proceed with claim'
    },
    riskAssessments: [
      {
        id: 'RA-001',
        functionDept: 'R&D',
        assessedBy: 'Dr. Emma Williams',
        riskLevel: 'Low',
        comments: 'Clinical data is robust and methodology is sound',
        dateTime: '2026-01-25T11:00:00Z'
      },
      {
        id: 'RA-002',
        functionDept: 'Legal',
        assessedBy: 'James Brown',
        riskLevel: 'Low',
        comments: 'No legal concerns identified',
        dateTime: '2026-01-26T09:30:00Z'
      }
    ],
    linkedAssets: [
      { id: 'AST-001', name: 'TV Commercial 30s', type: 'Video', lifecycleState: 'In Production', assetNumber: 'DV-TV-001' },
      { id: 'AST-002', name: 'Product Packaging Design', type: 'Artwork', lifecycleState: 'Approved', assetNumber: 'DV-PKG-002' }
    ],
    isFavorite: true,
    createdAt: '2026-01-20T09:00:00Z',
    updatedAt: '2026-02-15T16:45:00Z',
    cucCode: 'CUC-DOVE-IR-001'
  },

  // Global Claim 2 - Hellmann's (Proposed)
  {
    id: 'CLM-002',
    claimType: 'Global',
    versions: [
      {
        versionNumber: 1,
        isLatest: true,
        globalStatement: 'Made with 100% cage-free eggs',
        localStatement: 'Made with 100% cage-free eggs',
        createdAt: '2026-02-10T10:30:00Z',
        createdBy: 'David Smith'
      }
    ],
    currentVersion: 0,
    order: 1,
    lifecycleStage: 'Proposed',
    marketingChannels: ['Digital', 'Social Media', 'Packaging'],
    finalRiskLevel: 'Medium',
    productName: 'Hellmann\'s Real Mayonnaise',
    productId: 'PRD-VAR-005',
    restrictedUse: false,
    claimIdentifier: 'CID-002',
    claimCategory: 'Environmental',
    relatedProjectIds: ['2'],
    challenged: false,
    supportStrategy: 'Supply chain documentation and third-party certification for cage-free egg sourcing across all production facilities.',
    substantiationDocs: [
      {
        id: 'DOC-010',
        fileName: 'Cage_Free_Certification_2026.pdf',
        classification: '',
        uploadedAt: '2026-02-12T15:00:00Z',
        uploadedBy: 'Emma Williams'
      }
    ],
    finalRiskSummary: {
      claimClassificationLevel: 'Level 2 – Medium Risk',
      reason: 'Requires ongoing verification of supply chain compliance',
      marketingRiskSignoff: false
    },
    riskAssessments: [],
    linkedAssets: [],
    createdAt: '2026-02-10T10:30:00Z',
    updatedAt: '2026-02-15T11:20:00Z'
  },

  // Global Claim 3 - Persil (Challenged)
  {
    id: 'CLM-003',
    claimType: 'Global',
    versions: [
      {
        versionNumber: 1,
        isLatest: true,
        globalStatement: 'Removes 99% of stains in just one wash',
        localStatement: 'Removes 99% of stains in just one wash',
        createdAt: '2025-11-05T08:00:00Z',
        createdBy: 'Lisa Anderson'
      }
    ],
    currentVersion: 0,
    order: 1,
    lifecycleStage: 'Challenged',
    marketingChannels: ['TV', 'Print', 'In-store'],
    finalRiskLevel: 'High',
    productName: 'Persil Deep Clean Powder',
    productId: 'PRD-VAR-010',
    restrictedUse: true,
    restrictedUseComment: 'Must include disclaimer about stain types tested',
    claimIdentifier: 'CID-003',
    claimCategory: 'Functional',
    relatedProjectIds: ['3'],
    challenged: true,
    copiedFromClaimId: 'CLM-999',
    supportStrategy: 'Laboratory testing on 15 common household stains using standardized test protocols. Results show 99% removal rate on specified stain set.',
    substantiationDocs: [
      {
        id: 'DOC-020',
        fileName: 'Persil_Stain_Removal_Study.pdf',
        classification: 'Level 3 – High Risk',
        uploadedAt: '2025-11-10T13:45:00Z',
        uploadedBy: 'James Brown',
        inUse: true
      }
    ],
    finalRiskSummary: {
      claimClassificationLevel: 'Level 3 – High Risk',
      reason: 'Challenged by competitor for lack of clarity on stain types',
      legalSummary: 'Under review. Competitor raised concerns about ambiguous claim scope.',
      marketingFeedback: 'Strong commercial impact but requires careful qualification',
      marketingRiskSignoff: false
    },
    riskAssessments: [
      {
        id: 'RA-010',
        functionDept: 'Legal',
        assessedBy: 'Patricia Martinez',
        riskLevel: 'High',
        comments: 'Claim specificity needs improvement to address competitor challenge',
        dateTime: '2025-12-01T14:00:00Z'
      }
    ],
    linkedAssets: [
      { id: 'AST-010', name: 'Print Ad Campaign', type: 'Artwork', lifecycleState: 'On Hold', assetNumber: 'PS-PRN-001' }
    ],
    createdAt: '2025-11-05T08:00:00Z',
    updatedAt: '2026-01-15T10:30:00Z',
    cucCode: 'CUC-PERSIL-DC-001'
  },

  // Regional Claim 1 - Vaseline (Assessed via Inheritance)
  {
    id: 'CLM-004-EMEA',
    claimType: 'Regional',
    parentClaimId: 'CLM-004',
    versions: [
      {
        versionNumber: 1,
        isLatest: true,
        globalStatement: 'Restores dry skin to its natural healthy glow',
        localStatement: 'Restores dry skin to its natural healthy glow',
        createdAt: '2026-02-20T12:00:00Z',
        createdBy: 'Matthew Jackson'
      }
    ],
    currentVersion: 0,
    order: 1,
    lifecycleStage: 'Assessed via Inheritance',
    marketingChannels: ['Digital', 'Print', 'Packaging'],
    finalRiskLevel: 'Low',
    productName: 'Vaseline Intensive Care Lotion',
    productId: 'PRD-VAR-015',
    restrictedUse: false,
    claimCategory: 'Functional',
    geography: 'EMEA',
    relatedProjectIds: ['8'],
    challenged: false,
    supportStrategy: 'Inherited from global claim. Regional consumer perception study conducted across 5 EMEA markets confirming claim resonance.',
    substantiationDocs: [],
    finalRiskSummary: {
      claimClassificationLevel: 'Level 1 – Low Risk',
      inheritanceTrace: 'Inherited from Global Claim CLM-004',
      marketingRiskSignoff: true
    },
    riskAssessments: [],
    linkedAssets: [],
    inheritance: {
      parentClaimId: 'CLM-004',
      parentClaimVersion: 1,
      inheritedAt: '2026-02-20T12:00:00Z',
      inheritedBy: 'Matthew Jackson',
      appendLog: []
    },
    createdAt: '2026-02-20T12:00:00Z',
    updatedAt: '2026-02-20T12:00:00Z',
    cucCode: 'CUC-VAS-IC-002'
  },

  // Regional Claim 2 - Lynx (Proposed)
  {
    id: 'CLM-005-UK',
    claimType: 'Regional',
    parentClaimId: 'CLM-005',
    versions: [
      {
        versionNumber: 1,
        isLatest: true,
        globalStatement: '48-hour fresh scent protection',
        localStatement: '48-hour fresh scent protection',
        backtranslation: '48-hour fresh scent protection',
        createdAt: '2026-03-01T09:15:00Z',
        createdBy: 'Thomas Moore'
      }
    ],
    currentVersion: 0,
    lifecycleStage: 'Proposed',
    marketingChannels: ['TV', 'Digital', 'Social Media'],
    finalRiskLevel: null,
    productName: 'Lynx Africa Body Spray',
    productId: 'PRD-VAR-020',
    restrictedUse: false,
    claimCategory: 'Sensorial',
    geography: 'UK',
    relatedProjectIds: ['5'],
    challenged: false,
    supportStrategy: '',
    substantiationDocs: [],
    finalRiskSummary: {
      marketingRiskSignoff: false
    },
    riskAssessments: [],
    linkedAssets: [],
    createdAt: '2026-03-01T09:15:00Z',
    updatedAt: '2026-03-05T14:20:00Z'
  },

  // Local Claim 1 - Dove France (Locally Assessed)
  {
    id: 'CLM-001-FR',
    claimType: 'Local',
    parentClaimId: 'CLM-001',
    versions: [
      {
        versionNumber: 1,
        isLatest: true,
        globalStatement: 'Clinically proven to provide deep moisture for 24 hours',
        localStatement: 'Hydratation profonde cliniquement prouvée pendant 24 heures',
        backtranslation: 'Deep hydration clinically proven for 24 hours',
        createdAt: '2026-02-05T10:00:00Z',
        createdBy: 'Marie Dubois'
      }
    ],
    currentVersion: 0,
    order: 1,
    lifecycleStage: 'Locally Assessed',
    marketingChannels: ['TV', 'Digital', 'Print'],
    finalRiskLevel: 'Low',
    productName: 'Dove Intensive Repair Lotion',
    productId: 'PRD-LV-001-FR',
    restrictedUse: false,
    claimCategory: 'Functional',
    geography: 'France',
    relatedProjectIds: ['1'],
    challenged: false,
    supportStrategy: 'Adapted from global claim CLM-001. French translation validated by local regulatory team. Local market consumer research confirms message clarity.',
    substantiationDocs: [
      {
        id: 'DOC-030',
        fileName: 'French_Translation_Validation.pdf',
        classification: 'Level 1 – Low Risk',
        uploadedAt: '2026-02-06T11:30:00Z',
        uploadedBy: 'Marie Dubois',
        inUse: true
      }
    ],
    finalRiskSummary: {
      claimClassificationLevel: 'Level 1 – Low Risk',
      legalSummary: 'Compliant with French advertising regulations',
      marketingRiskSignoff: true
    },
    riskAssessments: [
      {
        id: 'RA-020',
        functionDept: 'RA',
        assessedBy: 'Pierre Laurent',
        riskLevel: 'Low',
        comments: 'Translation is accurate and compliant with local requirements',
        geography: 'France',
        dateTime: '2026-02-07T09:00:00Z'
      }
    ],
    linkedAssets: [],
    inheritance: {
      parentClaimId: 'CLM-001',
      parentClaimVersion: 1,
      inheritedAt: '2026-02-05T10:00:00Z',
      inheritedBy: 'Marie Dubois',
      appendLog: []
    },
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-10T15:45:00Z',
    cucCode: 'CUC-DOVE-IR-FR-001'
  },

  // Local Claim 2 - Hellmann's Brazil (Rejected)
  {
    id: 'CLM-002-BR',
    claimType: 'Local',
    parentClaimId: 'CLM-002',
    versions: [
      {
        versionNumber: 1,
        isLatest: true,
        globalStatement: 'Made with 100% cage-free eggs',
        localStatement: 'Feito com 100% de ovos de galinhas livres',
        backtranslation: 'Made with 100% free-range eggs',
        createdAt: '2026-03-10T11:00:00Z',
        createdBy: 'Carlos Silva'
      }
    ],
    currentVersion: 0,
    lifecycleStage: 'Rejected',
    marketingChannels: ['Digital', 'Packaging'],
    finalRiskLevel: 'High',
    productName: 'Hellmann\'s Real Mayonnaise',
    productId: 'PRD-LV-005-BR',
    restrictedUse: false,
    claimCategory: 'Environmental',
    geography: 'Brazil',
    relatedProjectIds: ['2'],
    challenged: false,
    supportStrategy: 'Local supply chain assessment for Brazil market',
    substantiationDocs: [],
    finalRiskSummary: {
      claimClassificationLevel: 'Level 3 – High Risk',
      reason: 'Supply chain verification incomplete for Brazil market',
      legalSummary: 'Cannot substantiate cage-free claim for Brazilian production facilities at this time',
      marketingRiskSignoff: false
    },
    riskAssessments: [
      {
        id: 'RA-030',
        functionDept: 'Legal',
        assessedBy: 'Ana Costa',
        riskLevel: 'High',
        comments: 'Insufficient evidence to support claim in Brazil',
        geography: 'Brazil',
        dateTime: '2026-03-15T14:30:00Z'
      }
    ],
    linkedAssets: [],
    createdAt: '2026-03-10T11:00:00Z',
    updatedAt: '2026-03-20T10:15:00Z'
  },

  // Local SKU Claim 1 - Dove 400ml (Assessed)
  {
    id: 'CLM-001-FR-400ML',
    claimType: 'Local SKU',
    parentClaimId: 'CLM-001-FR',
    versions: [
      {
        versionNumber: 1,
        isLatest: true,
        globalStatement: 'Clinically proven to provide deep moisture for 24 hours',
        localStatement: 'Hydratation profonde cliniquement prouvée pendant 24 heures - Format familial 400ml',
        backtranslation: 'Deep hydration clinically proven for 24 hours - Family size 400ml',
        createdAt: '2026-03-25T13:30:00Z',
        createdBy: 'Marie Dubois'
      }
    ],
    currentVersion: 0,
    order: 1,
    lifecycleStage: 'Assessed',
    marketingChannels: ['Packaging', 'E-commerce'],
    finalRiskLevel: 'Low',
    productName: 'Dove Intensive Repair Lotion 400ml',
    productId: 'PRD-SKU-001-FR-400',
    restrictedUse: false,
    claimCategory: 'Functional',
    geography: 'France',
    relatedProjectIds: ['1'],
    challenged: false,
    qualifier: 'Family size format',
    supportStrategy: 'Inherited from local claim CLM-001-FR with SKU-specific qualifier added for 400ml family size format.',
    substantiationDocs: [],
    finalRiskSummary: {
      claimClassificationLevel: 'Level 1 – Low Risk',
      inheritanceTrace: 'Inherited from Local Claim CLM-001-FR',
      marketingRiskSignoff: true
    },
    riskAssessments: [],
    linkedAssets: [
      { id: 'AST-040', name: '400ml Bottle Label', type: 'Packaging', lifecycleState: 'Approved', assetNumber: 'DV-PKG-FR-400' }
    ],
    inheritance: {
      parentClaimId: 'CLM-001-FR',
      parentClaimVersion: 1,
      inheritedAt: '2026-03-25T13:30:00Z',
      inheritedBy: 'Marie Dubois',
      appendLog: []
    },
    isFavorite: false,
    createdAt: '2026-03-25T13:30:00Z',
    updatedAt: '2026-04-01T09:00:00Z',
    cucCode: 'CUC-DOVE-IR-FR-400'
  }
];

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
  taskType?: 'project' | 'asset';  // to differentiate icon in My Tasks
}

export interface HomeAsset {
  id: string;
  assetNumber: string;
  name: string;
  type: string;             // e.g. 'Video' | 'Artwork' | 'Packaging'
  subtype: string;          // e.g. 'TV Commercial' | 'Digital Banner'
  lifecycleState: string;   // e.g. 'In Production' | 'Approved' | 'On Hold'
  projectName: string;
  businessGroup: string;
  categories: string[];
  fileType: string;         // e.g. 'Video', 'PDF', 'Image', 'PPT'
  lastUpdated: string;      // ISO date string
  createdBy: string;
  workflowParticipants: string[];  // user names
  versionNumber?: string;   // e.g. '1.0', '0.2'
  finalRiskLevel?: 'Low' | 'Medium' | 'High' | 'Very High' | null;
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

// ── Mock Data (personalized to Sarah Johnson) ───────────────────

export const CURRENT_USER = 'Sarah Johnson';
export const CURRENT_USER_ROLE: UserRole = 'Claims Lead';

// Roles permitted to edit Support Strategy (US-M5.1-F02)
// Per spec: Claims Lead, R&D TPL (mapped to 'TPM' in UserRole), R&D Nutritionist, R&D Substantiator
export const SUPPORT_STRATEGY_EDIT_ROLES: UserRole[] = ['Claims Lead', 'Substantiator', 'Nutritionist', 'TPM'];
// 'TPM' is the UserRole value for R&D TPL. 'TPL' is kept as a fallback string for legacy data.
export const canEditSupportStrategy = (role: UserRole): boolean =>
  SUPPORT_STRATEGY_EDIT_ROLES.includes(role) || (role as string) === 'TPL';

export const canCopyExtendedAssetData = (role: UserRole): boolean =>
  // Marketing/Project Lead can only copy claims. Claims Lead/R&D can copy all.
  !['Project Creator', 'Viewer'].includes(role);

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
    taskType: 'project',
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
    taskType: 'project',
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
    taskType: 'asset',
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
    taskType: 'project',
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
    taskType: 'project',
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
    taskType: 'project',
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
    taskType: 'asset',
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
    taskType: 'project',
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
    subtype: 'TV Commercial',
    lifecycleState: 'In Production',
    projectName: 'Dove Intensive Repair Claims Project',
    businessGroup: 'Beauty & Personal Care',
    categories: ['Skin Care', 'Hair Care'],
    fileType: 'Video',
    lastUpdated: '2026-04-25',
    createdBy: 'Sarah Johnson',
    workflowParticipants: ['Sarah Johnson', 'Emma Williams'],
    versionNumber: '1.0',
    finalRiskLevel: 'Low',
  },
  {
    id: 'AST-002',
    assetNumber: 'DV-PKG-002',
    name: 'Product Packaging Design — Dove Repair',
    type: 'Artwork',
    subtype: 'Packaging Artwork',
    lifecycleState: 'Approved',
    projectName: 'Dove Intensive Repair Claims Project',
    businessGroup: 'Beauty & Personal Care',
    categories: ['Skin Care'],
    fileType: 'Image',
    lastUpdated: '2026-04-23',
    createdBy: 'Emma Williams',
    workflowParticipants: ['Sarah Johnson', 'Emma Williams', 'Michael Chen'],
    versionNumber: '0.2',
    finalRiskLevel: 'Low',
  },
  {
    id: 'AST-003',
    assetNumber: 'LX-DIG-003',
    name: 'Digital Banner Set — Lynx Africa 30th',
    type: 'Digital',
    subtype: 'Digital Banner',
    lifecycleState: 'Under Review',
    projectName: 'Lynx Africa Anniversary Claims',
    businessGroup: 'Beauty & Personal Care',
    categories: ['Deodorants'],
    fileType: 'Image',
    lastUpdated: '2026-04-22',
    createdBy: 'Sarah Johnson',
    workflowParticipants: ['Sarah Johnson', 'James Brown'],
    versionNumber: '0.1',
    finalRiskLevel: null,
  },
  {
    id: 'AST-004',
    assetNumber: 'VS-PKG-FR-400',
    name: '400ml Bottle Label — Vaseline',
    type: 'Packaging',
    subtype: 'Packaging Artwork',
    lifecycleState: 'Approved',
    projectName: 'Vaseline Intensive Care Reformulation',
    businessGroup: 'Beauty & Personal Care',
    categories: ['Skin Care'],
    fileType: 'PDF',
    lastUpdated: '2026-04-20',
    createdBy: 'Michael Chen',
    workflowParticipants: ['Sarah Johnson', 'Michael Chen'],
    versionNumber: '1.0',
    finalRiskLevel: 'Medium',
  },
  {
    id: 'AST-005',
    assetNumber: 'PS-PRN-001',
    name: 'Print Ad Campaign — Persil Deep Clean',
    type: 'Artwork',
    subtype: 'Print Ad',
    lifecycleState: 'On Hold',
    projectName: 'Persil Deep Clean Efficacy Claims',
    businessGroup: 'Home Care',
    categories: ['Fabric Care'],
    fileType: 'Image',
    lastUpdated: '2026-04-18',
    createdBy: 'Sarah Johnson',
    workflowParticipants: ['Sarah Johnson'],
    versionNumber: '0.3',
    finalRiskLevel: 'High',
  },
  {
    id: 'AST-006',
    assetNumber: 'MG-VID-006',
    name: 'Product Video — Magnum Premium',
    type: 'Video',
    subtype: 'Product Video',
    lifecycleState: 'In Production',
    projectName: 'Magnum Pleasure Store Premium Claims',
    businessGroup: 'Foods & Refreshment',
    categories: ['Ice Cream'],
    fileType: 'Video',
    lastUpdated: '2026-04-17',
    createdBy: 'Lisa Anderson',
    workflowParticipants: ['Sarah Johnson', 'Lisa Anderson'],
    versionNumber: '0.2',
    finalRiskLevel: null,
  },
  {
    id: 'AST-007',
    assetNumber: 'KN-DIG-007',
    name: 'Social Media Kit — Knorr Plant-Based',
    type: 'Digital',
    subtype: 'Social Media Kit',
    lifecycleState: 'Draft',
    projectName: 'Knorr Plant-Based Range Claims',
    businessGroup: 'Foods & Refreshment',
    categories: ['Nutrition'],
    fileType: 'PPT',
    lastUpdated: '2026-04-15',
    createdBy: 'Sarah Johnson',
    workflowParticipants: ['Sarah Johnson', 'David Smith'],
    versionNumber: '0.1',
    finalRiskLevel: null,
  },
  {
    id: 'AST-008',
    assetNumber: 'DM-PKG-008',
    name: 'Packaging Sleeve — Domestos Power',
    type: 'Packaging',
    subtype: 'Packaging Artwork',
    lifecycleState: 'Under Review',
    projectName: 'Domestos Bleach Power Claims',
    businessGroup: 'Home Care',
    categories: ['Home Hygiene'],
    fileType: 'PDF',
    lastUpdated: '2026-04-14',
    createdBy: 'Emma Williams',
    workflowParticipants: ['Sarah Johnson', 'Emma Williams', 'James Brown'],
    versionNumber: '1.0',
    finalRiskLevel: 'Low',
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
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// M10 ASSETS MODULE TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  isFavorite?: boolean;
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
  otherBrandSay?: boolean;
  consumerBenefitPlatform?: string[];
  substantiationEvidence?: string[];
  whereUsed: {
    projectIds: string[];
    claimIds: string[];
    assetIds: string[];
  };
  auditLog: Array<{
    id: string; action: string; actor: string; timestamp: string; details?: string;
  }>;
  copiedFromAssetId?: string;
  supportStrategy?: string;
}

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
  {
    id: 'AT-006', name: 'Magnum Premium Product Video',
    subtype: 'Product Video', businessGroup: 'Foods & Refreshment', category: 'Ice Cream',
    currentVersionNumber: '1.0',
    versions: [{ versionNumber: '1.0', fileName: 'magnum_premium_v1.mp4', fileType: 'video',
      fileSize: '125.7 MB', uploadedBy: 'Lisa Anderson', uploadedAt: '2026-03-15T10:00:00Z',
      lifecycleStage: 'Assessed',
      riskRecords: [
        { id: 'RR-004', department: 'Legal', assessedBy: 'James Brown',
          riskLevel: 'Low', comments: 'Premium positioning verified.', createdAt: '2026-03-16T09:00:00Z' },
        { id: 'RR-005', department: 'Claims Lead', assessedBy: 'Michael Chen',
          riskLevel: 'Low', comments: 'Claims substantiated.', createdAt: '2026-03-17T11:00:00Z' },
      ],
      finalRisk: {
        finalRiskLevel: 'Low', otherBrandSay: false,
        claimsLeadSummary: 'All premium claims verified.',
        legalSummary: 'Approved.', raSummary: 'Compliant.',
        rdSummary: 'Formulation confirmed.', marketingFeedback: 'Ready for launch.',
        signOffDocuments: [],
        isLocked: true,
      },
    }],
    lifecycleStage: 'Assessed', isPlaceholder: false,
    geography: ['UK', 'France', 'Germany', 'Spain'],
    linkedClaimIds: ['CLM-015'], linkedProjectIds: ['8'], relatedAssetIds: [],
    anchors: [], assetLevelComments: [], approvalWorkflow: null,
    createdBy: 'Lisa Anderson', createdAt: '2026-03-15T10:00:00Z',
    modifiedBy: 'Lisa Anderson', modifiedAt: '2026-03-20T14:00:00Z',
    isFavorite: false, lastViewedAt: '2026-04-28T09:30:00Z',
    whereUsed: { projectIds: ['8'], claimIds: ['CLM-015'], assetIds: [] },
    auditLog: [
      { id: 'AL-009', action: 'Asset created', actor: 'Lisa Anderson', timestamp: '2026-03-15T10:00:00Z' },
      { id: 'AL-010', action: 'Lifecycle → Assessed', actor: 'Lisa Anderson', timestamp: '2026-03-20T14:00:00Z' },
    ],
  },
  {
    id: 'AT-007', name: 'Knorr Plant-Based Email Template',
    subtype: 'Email Template', businessGroup: 'Foods & Refreshment', category: 'Sauces & Dressings',
    currentVersionNumber: '0.1',
    versions: [{ versionNumber: '0.1', fileName: 'knorr_email_template.html', fileType: 'other',
      fileSize: '42 KB', uploadedBy: 'Sarah Johnson', uploadedAt: '2026-04-25T13:00:00Z',
      lifecycleStage: 'Proposed',
      riskRecords: [],
      finalRisk: { finalRiskLevel: null, otherBrandSay: false,
        claimsLeadSummary: '', legalSummary: '', raSummary: '', rdSummary: '',
        marketingFeedback: '', signOffDocuments: [], isLocked: false },
    }],
    lifecycleStage: 'Proposed', isPlaceholder: false,
    geography: ['UK', 'Netherlands'], linkedClaimIds: ['CLM-020'],
    linkedProjectIds: ['7'], relatedAssetIds: [],
    anchors: [], assetLevelComments: [
      { id: 'C-003', author: 'Sarah Johnson',
        content: 'Need to review vegan claim wording with RA before launch.',
        createdAt: '2026-04-25T14:00:00Z', mentions: ['Emma Williams'] }
    ],
    approvalWorkflow: null,
    createdBy: 'Sarah Johnson', createdAt: '2026-04-25T13:00:00Z',
    modifiedBy: 'Sarah Johnson', modifiedAt: '2026-04-25T14:00:00Z',
    isFavorite: true, lastViewedAt: '2026-04-29T10:15:00Z',
    whereUsed: { projectIds: ['7'], claimIds: ['CLM-020'], assetIds: [] },
    auditLog: [
      { id: 'AL-011', action: 'Asset created', actor: 'Sarah Johnson', timestamp: '2026-04-25T13:00:00Z' },
    ],
  },
  {
    id: 'AT-008', name: 'Domestos In-Store Display',
    subtype: 'In-Store Display', businessGroup: 'Home Care', category: 'Household Cleaning',
    currentVersionNumber: '0.3',
    versions: [{ versionNumber: '0.3', fileName: 'domestos_instore_v03.pdf', fileType: 'pdf',
      fileSize: '12.5 MB', uploadedBy: 'Emma Williams', uploadedAt: '2026-04-28T09:00:00Z',
      lifecycleStage: 'Proposed',
      riskRecords: [
        { id: 'RR-006', department: 'RA', assessedBy: 'Emma Williams',
          riskLevel: 'Medium', comments: 'Efficacy claim needs additional testing data.', createdAt: '2026-04-28T11:00:00Z' },
      ],
      finalRisk: { finalRiskLevel: null, otherBrandSay: false,
        claimsLeadSummary: '', legalSummary: '', raSummary: '',
        rdSummary: '', marketingFeedback: '', signOffDocuments: [], isLocked: false },
    }],
    lifecycleStage: 'Proposed', isPlaceholder: false,
    geography: ['UK'], linkedClaimIds: ['CLM-025'], linkedProjectIds: ['6'],
    relatedAssetIds: [],
    anchors: [], assetLevelComments: [],
    approvalWorkflow: {
      id: 'WF-002', initiatedBy: 'Emma Williams', initiatedAt: '2026-04-28T12:00:00Z',
      approvers: [
        { id: 'AP-004', name: 'James Brown', department: 'Legal',
          status: 'Submitted', verdict: 'Approved', comment: 'Legal review complete.',
          submittedAt: '2026-04-29T09:00:00Z', dueDate: '2026-05-02' },
        { id: 'AP-005', name: 'Emma Williams', department: 'Regulatory',
          status: 'Pending', verdict: null, comment: '',
          dueDate: '2026-05-02' },
        { id: 'AP-006', name: 'Michael Chen', department: 'Claims Lead',
          status: 'Pending', verdict: null, comment: '',
          dueDate: '2026-05-02' },
      ],
      isComplete: false, isCancelled: false,
    },
    createdBy: 'Emma Williams', createdAt: '2026-04-26T10:00:00Z',
    modifiedBy: 'Emma Williams', modifiedAt: '2026-04-28T12:00:00Z',
    isFavorite: false, lastViewedAt: '2026-04-29T14:20:00Z',
    whereUsed: { projectIds: ['6'], claimIds: ['CLM-025'], assetIds: [] },
    auditLog: [
      { id: 'AL-012', action: 'Asset created', actor: 'Emma Williams', timestamp: '2026-04-26T10:00:00Z' },
      { id: 'AL-013', action: 'New version 0.3 uploaded', actor: 'Emma Williams', timestamp: '2026-04-28T09:00:00Z' },
      { id: 'AL-014', action: 'Approval workflow initiated', actor: 'Emma Williams', timestamp: '2026-04-28T12:00:00Z' },
    ],
  },
];

export const CONSUMER_BENEFIT_PLATFORMS: Record<string, string[]> = {
  'Beauty & Wellbeing_Hair Care': ['Healthy Hair', 'Scalp Care', 'Color Protection', 'Damage Repair', 'Volume & Bounce'],
  'Beauty & Wellbeing_Skin Care': ['Anti-Aging', 'Deep Hydration', 'Acne Control', 'Skin Brightening', 'Sun Protection'],
  'Personal Care_Skin Cleansing': ['Deep Clean', 'Antibacterial', 'Moisturizing', 'Gentle Care'],
  'Personal Care_Oral Care': ['Cavity Protection', 'Teeth Whitening', 'Fresh Breath', 'Gum Health'],
  'Personal Care_Deodorants': ['48h Protection', 'Invisible/No Stains', 'Fresh Fragrance', 'Sensitive Skin'],
  'Home Care_Fabric Cleaning': ['Stain Removal', 'Color Care', 'Fabric Softness', 'Long-lasting Fragrance'],
  'Home Care_Home & Hygiene': ['99.9% Germ Kill', 'Surface Shine', 'Odor Elimination'],
  'Nutrition_Scratch Cooking Aids': ['Authentic Taste', 'Rich Flavor', 'Natural Ingredients'],
  'Nutrition_Dressings': ['Low Fat', 'Rich Creaminess', 'Vegan Friendly'],
  'Ice Cream_Ice Cream': ['Indulgence', 'Low Calorie', 'Dairy Free', 'Rich Chocolate'],
};

export const MOCK_SUBSTANTIATION_EVIDENCE = [
  'Clinical Study Report 2024-A',
  'Consumer Panel Results (n=500)',
  'In-Vitro Lab Test 403-B',
  'Dermatological Safety Assessment',
  'Competitor Benchmarking Study',
  'Ingredient Efficacy Dossier',
  'Other Say Demo Guidelines',
];