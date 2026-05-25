// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// M16 — Documents Library: Data Types, Constants & Mock Data
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type DocumentType = 'Substantiation Evidence' | 'Formulation Document' | 'Project Document';

export type SELifecycle = 'Draft' | 'In Use' | 'Expired' | 'Cancelled';
export type FormulationLifecycle = 'Created' | 'In Use' | 'Withdrawn' | 'Obsolete' | 'Cancelled';
export type ProjectDocLifecycle = 'In Use' | 'Cancelled';
export type DocumentLifecycle = SELifecycle | FormulationLifecycle | ProjectDocLifecycle;

// ─── Substantiation Evidence Subtype Picklist ─────────────────────────────
export const SE_SUBTYPES = [
  'Appraisal Test',
  'Capture Supplier Literature/Certification',
  'Claims Test',
  'Clinical Reports',
  'Consumer Study',
  'Formulation Reference',
  'Government Agency Report',
  'Internal Supply Chain Certification',
  'IPG Approval',
  'Laboratory Test',
  'Monograph',
  'Other',
  'Other Regulatory Report',
  'Other Say Demo Guidelines',
  'Packaging Reference',
  'Partnership Agreement',
  'Product Appraisal Report',
  'Research Institute Letter',
  'Scientific Literature',
  'Sign Off',
  'Specialized Approval',
  'Statement Testimonials',
  'Survey',
  'Trademark Approval',
] as const;

export type SESubtype = typeof SE_SUBTYPES[number];

// ─── Document Comment ─────────────────────────────────────────────────────
export interface DocumentComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  isReadOnly?: boolean;
}

// ─── Document Version ─────────────────────────────────────────────────────
export interface DocumentVersion {
  versionNumber: string;       // e.g. "0.1", "0.2", "1.0"
  versionedFrom?: string;      // previous version number reference
  lifecycleState: DocumentLifecycle;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileType?: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ─── Core Document Record ─────────────────────────────────────────────────
export interface DocumentRecord {
  id: string;
  documentType: DocumentType;
  name: string;
  description?: string;
  currentVersion: string;
  versions: DocumentVersion[];
  lifecycleState: DocumentLifecycle;
  createdBy: string;
  createdDate: string;
  modifiedDate: string;
  validToDate?: string;
  geography: string[];
  isArchived?: boolean;
  archivedDate?: string;
  cancelReason?: string;
  comments: DocumentComment[];

  // ─── Substantiation Evidence ─────────────────────────────────────
  subtype?: SESubtype;
  linkedClaimIds?: string[];
  linkedAssetIds?: string[];
  relatedProductIds?: string[];   // system-derived from claims + assets

  // ─── Formulation Document ─────────────────────────────────────────
  cucSpecNumber?: string;
  linkedProductIds?: string[];
  businessGroup?: string;
  category?: string;
  brand?: string;
  format?: string;
  documentNumber?: string;
  tabLink?: string;
  relatedProjectIds?: string[];
  version?: string;               // decimal version like "0.1"

  // ─── Project Document ─────────────────────────────────────────────
  linkedProjectIds?: string[];
}

// ─── Lifecycle Engine Utilities ───────────────────────────────────────────

export function evaluateSELifecycle(doc: DocumentRecord): SELifecycle {
  if (doc.lifecycleState === 'Cancelled') return 'Cancelled';
  if (doc.validToDate && new Date(doc.validToDate) < new Date()) return 'Expired';
  if ((doc.linkedClaimIds?.length ?? 0) > 0 || (doc.linkedAssetIds?.length ?? 0) > 0) return 'In Use';
  return 'Draft';
}

export function evaluateFormulationLifecycle(
  doc: DocumentRecord,
  linkedProductLifecycles: string[]
): FormulationLifecycle {
  if (
    doc.lifecycleState === 'Cancelled' ||
    doc.lifecycleState === 'Obsolete' ||
    doc.lifecycleState === 'Withdrawn'
  ) {
    return doc.lifecycleState as FormulationLifecycle;
  }
  if (linkedProductLifecycles.some(l => l === 'In Use' || l === 'In-use')) return 'In Use';
  return 'Created';
}

export function isDocumentReadOnly(doc: DocumentRecord): boolean {
  const readOnlyStates: DocumentLifecycle[] = ['Cancelled', 'Expired', 'Obsolete', 'Withdrawn'];
  return readOnlyStates.includes(doc.lifecycleState) || !!doc.isArchived;
}

export function canCreateNewVersion(doc: DocumentRecord): boolean {
  const blockedStates: DocumentLifecycle[] = ['Cancelled', 'Obsolete'];
  return !blockedStates.includes(doc.lifecycleState);
}

export function incrementVersion(currentVersion: string): string {
  const parts = currentVersion.split('.');
  if (parts.length === 2) {
    const minor = parseInt(parts[1], 10);
    return `${parts[0]}.${minor + 1}`;
  }
  return '0.2';
}

// ─── Mock Data ────────────────────────────────────────────────────────────

export const initialDocuments: DocumentRecord[] = [
  // ── Substantiation Evidence ──────────────────────────────────────────────
  {
    id: 'DOC-SE-001',
    documentType: 'Substantiation Evidence',
    name: 'Dove Intensive Repair Clinical Study Report',
    description: 'Phase III clinical study validating 48h skin hydration claims for Dove Intensive Repair moisturizer range.',
    currentVersion: '0.1',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'In Use',
        fileName: 'dove_clinical_study_v0.1.pdf',
        fileSizeBytes: 2450000,
        fileType: 'PDF',
        uploadedAt: '2026-03-10T09:00:00Z',
        uploadedBy: 'Sarah Johnson',
      },
    ],
    lifecycleState: 'In Use',
    createdBy: 'Sarah Johnson',
    createdDate: '2026-03-10T09:00:00Z',
    modifiedDate: '2026-04-01T14:30:00Z',
    validToDate: '2027-03-10',
    geography: ['Global', 'EMEA'],
    subtype: 'Clinical Reports',
    linkedClaimIds: ['CLM-001', 'CLM-002'],
    linkedAssetIds: ['AT-001'],
    relatedProductIds: ['PROD-001'],
    comments: [
      {
        id: 'c1',
        author: 'Michael Chen',
        content: 'Results look solid. Ready for regulatory review.',
        timestamp: '2026-04-02T10:15:00Z',
      },
    ],
  },
  {
    id: 'DOC-SE-002',
    documentType: 'Substantiation Evidence',
    name: 'Persil Stain Removal Laboratory Test Results',
    description: 'Independent lab test confirming 99.9% stain removal efficacy on standard test panels.',
    currentVersion: '0.2',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'Obsolete',
        fileName: 'persil_lab_v0.1.pdf',
        fileSizeBytes: 1800000,
        fileType: 'PDF',
        uploadedAt: '2025-10-15T08:00:00Z',
        uploadedBy: 'Lisa Anderson',
      },
      {
        versionNumber: '0.2',
        versionedFrom: '0.1',
        lifecycleState: 'In Use',
        fileName: 'persil_lab_v0.2.pdf',
        fileSizeBytes: 1950000,
        fileType: 'PDF',
        uploadedAt: '2026-01-20T11:00:00Z',
        uploadedBy: 'Lisa Anderson',
      },
    ],
    lifecycleState: 'In Use',
    createdBy: 'Lisa Anderson',
    createdDate: '2025-10-15T08:00:00Z',
    modifiedDate: '2026-01-20T11:00:00Z',
    validToDate: '2027-01-20',
    geography: ['EMEA', 'Global'],
    subtype: 'Laboratory Test',
    linkedClaimIds: ['CLM-003'],
    linkedAssetIds: [],
    relatedProductIds: ['PROD-002'],
    comments: [],
  },
  {
    id: 'DOC-SE-003',
    documentType: 'Substantiation Evidence',
    name: 'Hellmann\'s Consumer Preference Study',
    description: 'Consumer panel study confirming taste superiority claims vs. leading competitors in North American market.',
    currentVersion: '0.1',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'Draft',
        fileName: 'hellmanns_consumer_study_v0.1.pdf',
        fileSizeBytes: 3200000,
        fileType: 'PDF',
        uploadedAt: '2026-04-18T10:00:00Z',
        uploadedBy: 'David Smith',
      },
    ],
    lifecycleState: 'Draft',
    createdBy: 'David Smith',
    createdDate: '2026-04-18T10:00:00Z',
    modifiedDate: '2026-04-18T10:00:00Z',
    validToDate: '2027-04-18',
    geography: ['North America'],
    subtype: 'Consumer Study',
    linkedClaimIds: [],
    linkedAssetIds: [],
    relatedProductIds: [],
    comments: [],
  },
  {
    id: 'DOC-SE-004',
    documentType: 'Substantiation Evidence',
    name: 'TRESemmé Keratin Smooth IPG Approval',
    description: 'IPG sign-off for LATAM keratin smooth product claims.',
    currentVersion: '0.1',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'Expired',
        fileName: 'tresemme_ipg_approval_v0.1.pdf',
        fileSizeBytes: 540000,
        fileType: 'PDF',
        uploadedAt: '2025-05-01T08:00:00Z',
        uploadedBy: 'Robert Taylor',
      },
    ],
    lifecycleState: 'Expired',
    createdBy: 'Robert Taylor',
    createdDate: '2025-05-01T08:00:00Z',
    modifiedDate: '2025-05-01T08:00:00Z',
    validToDate: '2026-01-01',
    geography: ['LATAM'],
    subtype: 'IPG Approval',
    linkedClaimIds: ['CLM-004'],
    linkedAssetIds: [],
    relatedProductIds: ['PROD-003'],
    comments: [],
  },
  {
    id: 'DOC-SE-005',
    documentType: 'Substantiation Evidence',
    name: 'Lynx Africa Scent Longevity Survey',
    description: 'Consumer survey confirming 72h longevity scent claim. Cancelled due to methodology concerns.',
    currentVersion: '0.1',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'Cancelled',
        fileName: 'lynx_survey_v0.1.pdf',
        fileSizeBytes: 890000,
        fileType: 'PDF',
        uploadedAt: '2026-02-20T09:30:00Z',
        uploadedBy: 'Amanda Wilson',
      },
    ],
    lifecycleState: 'Cancelled',
    cancelReason: 'Survey methodology did not meet required statistical significance thresholds.',
    createdBy: 'Amanda Wilson',
    createdDate: '2026-02-20T09:30:00Z',
    modifiedDate: '2026-03-15T12:00:00Z',
    geography: ['EMEA'],
    subtype: 'Survey',
    linkedClaimIds: [],
    linkedAssetIds: [],
    relatedProductIds: [],
    comments: [],
  },

  // ── Formulation Documents ─────────────────────────────────────────────────
  {
    id: 'DOC-FD-001',
    documentType: 'Formulation Document',
    name: 'Dove Intensive Repair Formulation Spec v0.1',
    description: 'Master formulation specification for Dove Intensive Repair moisturizer (all variants).',
    currentVersion: '0.1',
    version: '0.1',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'In Use',
        fileName: 'dove_ir_formulation_v0.1.pdf',
        fileSizeBytes: 4100000,
        fileType: 'PDF',
        uploadedAt: '2026-01-20T09:00:00Z',
        uploadedBy: 'Sarah Johnson',
      },
    ],
    lifecycleState: 'In Use',
    createdBy: 'Sarah Johnson',
    createdDate: '2026-01-20T09:00:00Z',
    modifiedDate: '2026-04-10T16:00:00Z',
    validToDate: '2028-01-20',
    geography: ['Global'],
    businessGroup: 'Beauty & Wellbeing',
    category: 'Skin Care',
    brand: 'Dove',
    documentNumber: 'FD-2026-001',
    cucSpecNumber: 'CUC-DOVE-IR-2026',
    linkedProductIds: ['PROD-001'],
    relatedProjectIds: ['1'],
    comments: [],
  },
  {
    id: 'DOC-FD-002',
    documentType: 'Formulation Document',
    name: 'Persil Deep Clean Formulation Spec',
    description: 'Formulation documentation for Persil Deep Clean concentrated powder detergent.',
    currentVersion: '0.3',
    version: '0.3',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'Obsolete',
        fileName: 'persil_dc_formulation_v0.1.pdf',
        fileSizeBytes: 3500000,
        fileType: 'PDF',
        uploadedAt: '2025-08-05T08:00:00Z',
        uploadedBy: 'Lisa Anderson',
      },
      {
        versionNumber: '0.2',
        versionedFrom: '0.1',
        lifecycleState: 'Obsolete',
        fileName: 'persil_dc_formulation_v0.2.pdf',
        fileSizeBytes: 3600000,
        fileType: 'PDF',
        uploadedAt: '2025-11-10T10:00:00Z',
        uploadedBy: 'Lisa Anderson',
      },
      {
        versionNumber: '0.3',
        versionedFrom: '0.2',
        lifecycleState: 'Created',
        fileName: 'persil_dc_formulation_v0.3.pdf',
        fileSizeBytes: 3750000,
        fileType: 'PDF',
        uploadedAt: '2026-02-15T09:00:00Z',
        uploadedBy: 'Lisa Anderson',
      },
    ],
    lifecycleState: 'Created',
    createdBy: 'Lisa Anderson',
    createdDate: '2025-08-05T08:00:00Z',
    modifiedDate: '2026-02-15T09:00:00Z',
    validToDate: '2028-08-05',
    geography: ['EMEA', 'Global'],
    businessGroup: 'Home Care',
    category: 'Fabric Care',
    brand: 'Persil',
    documentNumber: 'FD-2025-002',
    cucSpecNumber: 'CUC-PERSIL-DC-2025',
    linkedProductIds: ['PROD-002'],
    relatedProjectIds: ['3'],
    comments: [],
  },
  {
    id: 'DOC-FD-003',
    documentType: 'Formulation Document',
    name: 'Vaseline Intensive Care Microbiome Formula',
    description: 'New microbiome-friendly reformulation spec for Vaseline Intensive Care range.',
    currentVersion: '0.1',
    version: '0.1',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'Created',
        fileName: 'vaseline_ic_microbiome_v0.1.pdf',
        fileSizeBytes: 5200000,
        fileType: 'PDF',
        uploadedAt: '2026-03-05T11:00:00Z',
        uploadedBy: 'Matthew Jackson',
      },
    ],
    lifecycleState: 'Created',
    createdBy: 'Matthew Jackson',
    createdDate: '2026-03-05T11:00:00Z',
    modifiedDate: '2026-03-05T11:00:00Z',
    validToDate: '2028-03-05',
    geography: ['Global'],
    businessGroup: 'Beauty & Wellbeing',
    category: 'Skin Care',
    brand: 'Vaseline',
    documentNumber: 'FD-2026-003',
    linkedProductIds: [],
    relatedProjectIds: ['8'],
    comments: [],
  },
  {
    id: 'DOC-FD-004',
    documentType: 'Formulation Document',
    name: 'Domestos Bleach Power Formulation — Withdrawn',
    description: 'Withdrawn formulation spec after EU Biocidal Products Regulation update required full resubmission.',
    currentVersion: '0.1',
    version: '0.1',
    versions: [
      {
        versionNumber: '0.1',
        lifecycleState: 'Withdrawn',
        fileName: 'domestos_bleach_formulation_v0.1.pdf',
        fileSizeBytes: 2800000,
        fileType: 'PDF',
        uploadedAt: '2025-12-10T08:00:00Z',
        uploadedBy: 'Christopher Lee',
      },
    ],
    lifecycleState: 'Withdrawn',
    createdBy: 'Christopher Lee',
    createdDate: '2025-12-10T08:00:00Z',
    modifiedDate: '2026-02-28T15:00:00Z',
    geography: ['EMEA'],
    businessGroup: 'Home Care',
    category: 'Home Hygiene',
    brand: 'Domestos',
    documentNumber: 'FD-2025-004',
    linkedProductIds: [],
    relatedProjectIds: ['6'],
    comments: [],
  },

  // ── Project Documents ─────────────────────────────────────────────────────
  {
    id: 'DOC-PD-001',
    documentType: 'Project Document',
    name: 'Dove IR Project Charter',
    description: 'Official project charter outlining scope, deliverables, timeline and team for the Dove Intensive Repair Claims Project.',
    currentVersion: '1.0',
    versions: [
      {
        versionNumber: '1.0',
        lifecycleState: 'In Use',
        fileName: 'dove_ir_project_charter.docx',
        fileSizeBytes: 245000,
        fileType: 'DOCX',
        uploadedAt: '2026-01-16T09:30:00Z',
        uploadedBy: 'Sarah Johnson',
      },
    ],
    lifecycleState: 'In Use',
    createdBy: 'Sarah Johnson',
    createdDate: '2026-01-16T09:30:00Z',
    modifiedDate: '2026-01-16T09:30:00Z',
    geography: ['Global'],
    linkedProjectIds: ['1'],
    comments: [
      {
        id: 'c2',
        author: 'Michael Chen',
        content: 'Charter approved by all leads on 15-Jan.',
        timestamp: '2026-01-16T10:00:00Z',
      },
    ],
  },
  {
    id: 'DOC-PD-002',
    documentType: 'Project Document',
    name: 'Persil Deep Clean Risk Assessment Summary',
    description: 'Compiled risk assessment documentation for the Persil Deep Clean Efficacy Claims project.',
    currentVersion: '1.0',
    versions: [
      {
        versionNumber: '1.0',
        lifecycleState: 'In Use',
        fileName: 'persil_risk_summary.pdf',
        fileSizeBytes: 1200000,
        fileType: 'PDF',
        uploadedAt: '2026-03-20T14:00:00Z',
        uploadedBy: 'James Brown',
      },
    ],
    lifecycleState: 'In Use',
    createdBy: 'James Brown',
    createdDate: '2026-03-20T14:00:00Z',
    modifiedDate: '2026-03-20T14:00:00Z',
    geography: ['EMEA', 'Global'],
    linkedProjectIds: ['3'],
    comments: [],
  },
  {
    id: 'DOC-PD-003',
    documentType: 'Project Document',
    name: 'TRESemmé LATAM Launch Briefing Deck',
    description: 'Marketing briefing presentation for TRESemmé Keratin Smooth LATAM launch. Removed from project after strategy pivot.',
    currentVersion: '1.0',
    versions: [
      {
        versionNumber: '1.0',
        lifecycleState: 'Cancelled',
        fileName: 'tresemme_latam_brief.pptx',
        fileSizeBytes: 8500000,
        fileType: 'PPTX',
        uploadedAt: '2026-03-10T10:00:00Z',
        uploadedBy: 'Robert Taylor',
      },
    ],
    lifecycleState: 'Cancelled',
    cancelReason: 'Document removed after strategic pivot to digital-only launch approach.',
    createdBy: 'Robert Taylor',
    createdDate: '2026-03-10T10:00:00Z',
    modifiedDate: '2026-04-05T12:00:00Z',
    geography: ['LATAM'],
    linkedProjectIds: [],
    comments: [],
  },
];
