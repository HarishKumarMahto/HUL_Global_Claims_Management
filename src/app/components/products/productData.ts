export type ProductType = 'Technology' | 'Range' | 'Subrange' | 'Format' | 'Variant' | 'Local Product' | 'SKU';
export type LifecycleState = 'Created' | 'In-use' | 'Obsolete' | 'Cancelled';

export interface ProductVersionRef {
  productId: string;       // product record id
  name: string;            // level-specific product name
  versionNumber: string;   // e.g. 'v1', 'v2'
}

export interface ProductItem {
  id: string;
  productId: string;
  name: string;
  levelName: string;
  type: ProductType;
  lifecycleState: LifecycleState;
  parentId: string | null;
  parentName: string | null;
  childCount: number;
  claimsCount: number;
  projectsCount: number;
  geographyCount: number;
  geographies: string[];
  category: string;
  businessGroup: string;
  brand: string;
  technology1?: string;
  technology2?: string;
  tier?: string;
  targetAudience?: string;
  consumerBenefitPlatform?: string;
  description?: string;
  cucSpecNumber?: string;
  createdBy: string;
  createdDate: string;
  lastModified: string;
  isFavorite?: boolean;
  // Versioning fields
  versionNumber?: string;          // e.g. 'v1', 'v2'
  versionedFrom?: ProductVersionRef; // source product this was versioned from
  productVersions?: ProductVersionRef[]; // list of versions created from this product
}

export const PRODUCT_TYPES: ProductType[] = [
  'Technology', 'Range', 'Subrange', 'Format', 'Variant', 'Local Product', 'SKU'
];

export const LIFECYCLE_STATES: LifecycleState[] = ['Created', 'In-use', 'Obsolete', 'Cancelled'];

export const PRODUCT_TYPE_META: Record<ProductType, { icon: string; color: string; bg: string; description: string }> = {
  'Technology': { icon: '⚗️', color: '#6B21A8', bg: '#F3E8FF', description: 'Contextual metadata linked to products' },
  'Range': { icon: '🧭', color: '#7C3AED', bg: '#EDE9FE', description: 'Top-level product range under a brand' },
  'Subrange': { icon: '🗂️', color: '#0369A1', bg: '#E0F2FE', description: 'Grouping of formats within a range' },
  'Format': { icon: '📦', color: '#1D4ED8', bg: '#DBEAFE', description: 'Product format within a subrange or range' },
  'Variant': { icon: '🔬', color: '#047857', bg: '#D1FAE5', description: 'Global product definition before localisation' },
  'Local Product': { icon: '🌍', color: '#B45309', bg: '#FEF3C7', description: 'Localised product for specific geographies' },
  'SKU': { icon: '🏷️', color: '#9F1239', bg: '#FFE4E6', description: 'Consumer unit (SKU) level product' },
};

export const initialProducts: ProductItem[] = [
  // ── TECHNOLOGIES ──────────────────────────────────────────────────────────
  {
    id: 'tech-1',
    productId: 'PROD-2026-001',
    name: 'MicroMoisture Technology',
    levelName: 'MicroMoisture Technology',
    type: 'Technology',
    lifecycleState: 'In-use',
    parentId: null,
    parentName: null,
    childCount: 0,
    claimsCount: 4,
    projectsCount: 2,
    geographyCount: 0,
    geographies: [],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    description: 'Proprietary micro-droplet moisturisation technology for 24hr hydration.',
    createdBy: 'Sarah Johnson',
    createdDate: '2025-06-10',
    lastModified: '2026-03-15',
    isFavorite: true,
  },
  {
    id: 'tech-2',
    productId: 'PROD-2026-002',
    name: 'Keratin Complex Technology',
    levelName: 'Keratin Complex Technology',
    type: 'Technology',
    lifecycleState: 'In-use',
    parentId: null,
    parentName: null,
    childCount: 0,
    claimsCount: 6,
    projectsCount: 1,
    geographyCount: 0,
    geographies: [],
    category: 'Hair Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'TRESemmé',
    description: 'Advanced keratin-infused smoothing and frizz-control complex.',
    createdBy: 'Michael Chen',
    createdDate: '2025-07-20',
    lastModified: '2026-02-10',
    isFavorite: false,
  },

  // ── DOVE BODY WASH HIERARCHY (Range ▸ Subrange ▸ Format ▸ Variant ▸ Local Product ▸ SKU) ──
  {
    id: 'rng-1',
    productId: 'PROD-2026-003',
    name: 'Dove Body Wash',
    levelName: 'Body Wash',
    type: 'Range',
    lifecycleState: 'In-use',
    parentId: null,
    parentName: null,
    childCount: 2,
    claimsCount: 18,
    projectsCount: 4,
    geographyCount: 5,
    geographies: ['Global'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    description: 'Dove body wash range encompassing all subranges, formats and variants.',
    createdBy: 'Sarah Johnson',
    createdDate: '2024-01-15',
    lastModified: '2026-04-20',
    isFavorite: true,
  },
  {
    id: 'sub-1',
    productId: 'PROD-2026-004',
    name: 'Dove Body Wash Intensive Repair',
    levelName: 'Intensive Repair',
    type: 'Subrange',
    lifecycleState: 'In-use',
    parentId: 'rng-1',
    parentName: 'Dove Body Wash',
    childCount: 1,
    claimsCount: 12,
    projectsCount: 3,
    geographyCount: 4,
    geographies: ['Global', 'EMEA', 'North America', 'APAC'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    technology1: 'MicroMoisture Technology',
    consumerBenefitPlatform: 'Intensive Moisturisation',
    tier: 'Premium',
    description: 'Intensively restores skin moisture for visibly smoother skin.',
    createdBy: 'Sarah Johnson',
    createdDate: '2024-03-01',
    lastModified: '2026-04-15',
    isFavorite: false,
  },
  {
    id: 'fmt-1',
    productId: 'PROD-2026-005',
    name: 'Dove Body Wash Intensive Repair Cream',
    levelName: 'Cream',
    type: 'Format',
    lifecycleState: 'In-use',
    parentId: 'sub-1',
    parentName: 'Dove Body Wash Intensive Repair',
    childCount: 2,
    claimsCount: 10,
    projectsCount: 2,
    geographyCount: 4,
    geographies: ['Global', 'EMEA', 'North America', 'APAC'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    technology1: 'MicroMoisture Technology',
    description: 'Cream-format intensive repair body wash.',
    createdBy: 'Sarah Johnson',
    createdDate: '2024-03-20',
    lastModified: '2026-04-15',
    isFavorite: true,
  },
  {
    id: 'var-1',
    productId: 'PROD-2026-006',
    name: 'Dove Body Wash Intensive Repair Cream Regular',
    levelName: 'Regular',
    type: 'Variant',
    lifecycleState: 'In-use',
    parentId: 'fmt-1',
    parentName: 'Dove Body Wash Intensive Repair Cream',
    childCount: 2,
    claimsCount: 8,
    projectsCount: 2,
    geographyCount: 3,
    geographies: ['Global', 'EMEA', 'North America'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    technology1: 'MicroMoisture Technology',
    tier: 'Standard',
    targetAudience: 'Adults 25–45',
    consumerBenefitPlatform: 'Intensive Moisturisation',
    description: 'Regular intensive repair body wash with MicroMoisture technology.',
    createdBy: 'Sarah Johnson',
    createdDate: '2024-04-10',
    lastModified: '2026-04-10',
    isFavorite: true,
  },
  {
    id: 'lv-1',
    productId: 'PROD-2026-007',
    name: 'Dove Body Wash Intensive Repair Cream Regular UK',
    levelName: 'UK',
    type: 'Local Product',
    lifecycleState: 'In-use',
    parentId: 'var-1',
    parentName: 'Dove Body Wash Intensive Repair Cream Regular',
    childCount: 2,
    claimsCount: 6,
    projectsCount: 1,
    geographyCount: 1,
    geographies: ['United Kingdom'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    cucSpecNumber: 'CUC-DVB-IR-UK-001',
    description: 'UK market localisation of Dove Body Wash Intensive Repair Cream Regular.',
    createdBy: 'Emma Williams',
    createdDate: '2024-05-15',
    lastModified: '2026-03-20',
    isFavorite: false,
  },
  {
    id: 'cu-1',
    productId: 'PROD-2026-008',
    name: 'Dove Body Wash Intensive Repair Cream Regular UK 250ml',
    levelName: '250ml',
    type: 'SKU',
    lifecycleState: 'In-use',
    parentId: 'lv-1',
    parentName: 'Dove Body Wash Intensive Repair Cream Regular UK',
    childCount: 0,
    claimsCount: 4,
    projectsCount: 1,
    geographyCount: 1,
    geographies: ['United Kingdom'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    cucSpecNumber: 'CUC-DVB-IR-UK-001',
    description: '250ml SKU for UK market.',
    createdBy: 'Emma Williams',
    createdDate: '2024-06-01',
    lastModified: '2026-02-28',
    isFavorite: false,
  },
  {
    id: 'cu-2',
    productId: 'PROD-2026-009',
    name: 'Dove Body Wash Intensive Repair Cream Regular UK 400ml',
    levelName: '400ml',
    type: 'SKU',
    lifecycleState: 'In-use',
    parentId: 'lv-1',
    parentName: 'Dove Body Wash Intensive Repair Cream Regular UK',
    childCount: 0,
    claimsCount: 4,
    projectsCount: 1,
    geographyCount: 1,
    geographies: ['United Kingdom'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    cucSpecNumber: 'CUC-DVB-IR-UK-001',
    description: '400ml SKU for UK market.',
    createdBy: 'Emma Williams',
    createdDate: '2024-06-01',
    lastModified: '2026-02-28',
    isFavorite: false,
  },
  {
    id: 'lv-2',
    productId: 'PROD-2026-010',
    name: 'Dove Body Wash Intensive Repair Cream Regular US',
    levelName: 'US',
    type: 'Local Product',
    lifecycleState: 'In-use',
    parentId: 'var-1',
    parentName: 'Dove Body Wash Intensive Repair Cream Regular',
    childCount: 0,
    claimsCount: 5,
    projectsCount: 1,
    geographyCount: 1,
    geographies: ['United States'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    cucSpecNumber: 'CUC-DVB-IR-US-001',
    description: 'US market localisation of Dove Body Wash Intensive Repair Cream Regular.',
    createdBy: 'David Smith',
    createdDate: '2024-05-20',
    lastModified: '2026-03-10',
    isFavorite: false,
  },
  {
    id: 'var-2',
    productId: 'PROD-2026-011',
    name: 'Dove Body Wash Intensive Repair Cream Sensitive',
    levelName: 'Sensitive',
    type: 'Variant',
    lifecycleState: 'Created',
    parentId: 'fmt-1',
    parentName: 'Dove Body Wash Intensive Repair Cream',
    childCount: 0,
    claimsCount: 3,
    projectsCount: 1,
    geographyCount: 2,
    geographies: ['EMEA', 'North America'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    technology1: 'MicroMoisture Technology',
    tier: 'Standard',
    targetAudience: 'Sensitive skin 25–55',
    description: 'Sensitive skin formulation with gentle MicroMoisture technology.',
    createdBy: 'Sarah Johnson',
    createdDate: '2025-11-01',
    lastModified: '2026-04-01',
    isFavorite: false,
  },
  {
    id: 'sub-2',
    productId: 'PROD-2026-012',
    name: 'Dove Body Wash Deep Moisture',
    levelName: 'Deep Moisture',
    type: 'Subrange',
    lifecycleState: 'In-use',
    parentId: 'rng-1',
    parentName: 'Dove Body Wash',
    childCount: 1,
    claimsCount: 9,
    projectsCount: 2,
    geographyCount: 3,
    geographies: ['Global', 'EMEA', 'LATAM'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    technology1: 'MicroMoisture Technology',
    consumerBenefitPlatform: 'Deep Hydration',
    tier: 'Core',
    createdBy: 'Lisa Anderson',
    createdDate: '2024-02-10',
    lastModified: '2026-03-25',
    isFavorite: false,
  },
  {
    id: 'fmt-2',
    productId: 'PROD-2026-013',
    name: 'Dove Body Wash Deep Moisture Gel',
    levelName: 'Gel',
    type: 'Format',
    lifecycleState: 'In-use',
    parentId: 'sub-2',
    parentName: 'Dove Body Wash Deep Moisture',
    childCount: 1,
    claimsCount: 7,
    projectsCount: 2,
    geographyCount: 3,
    geographies: ['EMEA', 'LATAM', 'APAC'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    technology1: 'MicroMoisture Technology',
    description: 'Gel-format deep moisture body wash.',
    createdBy: 'Lisa Anderson',
    createdDate: '2024-03-05',
    lastModified: '2026-04-05',
    isFavorite: false,
  },
  {
    id: 'var-3',
    productId: 'PROD-2026-014',
    name: 'Dove Body Wash Deep Moisture Gel Classic',
    levelName: 'Classic',
    type: 'Variant',
    lifecycleState: 'In-use',
    parentId: 'fmt-2',
    parentName: 'Dove Body Wash Deep Moisture Gel',
    childCount: 0,
    claimsCount: 7,
    projectsCount: 2,
    geographyCount: 3,
    geographies: ['EMEA', 'LATAM', 'APAC'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    technology1: 'MicroMoisture Technology',
    tier: 'Core',
    targetAudience: 'Adults 25–60',
    createdBy: 'Lisa Anderson',
    createdDate: '2024-04-05',
    lastModified: '2026-04-05',
    isFavorite: false,
  },
  {
    id: 'rng-2',
    productId: 'PROD-2026-015',
    name: 'Dove Bar Soap',
    levelName: 'Bar Soap',
    type: 'Range',
    lifecycleState: 'In-use',
    parentId: null,
    parentName: null,
    childCount: 0,
    claimsCount: 11,
    projectsCount: 2,
    geographyCount: 6,
    geographies: ['Global'],
    category: 'Skin Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'Dove',
    createdBy: 'Robert Taylor',
    createdDate: '2023-08-15',
    lastModified: '2026-01-20',
    isFavorite: false,
  },

  // ── TRESemmé HIERARCHY ────────────────────────────────────────────────────
  {
    id: 'rng-3',
    productId: 'PROD-2026-016',
    name: 'TRESemmé Keratin Smooth',
    levelName: 'Keratin Smooth',
    type: 'Range',
    lifecycleState: 'In-use',
    parentId: null,
    parentName: null,
    childCount: 1,
    claimsCount: 14,
    projectsCount: 3,
    geographyCount: 4,
    geographies: ['Global', 'LATAM', 'North America', 'APAC'],
    category: 'Hair Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'TRESemmé',
    technology1: 'Keratin Complex Technology',
    createdBy: 'Jennifer Davis',
    createdDate: '2024-01-20',
    lastModified: '2026-04-18',
    isFavorite: true,
  },
  {
    id: 'sub-3',
    productId: 'PROD-2026-017',
    name: 'TRESemmé Keratin Smooth Intense',
    levelName: 'Intense',
    type: 'Subrange',
    lifecycleState: 'In-use',
    parentId: 'rng-3',
    parentName: 'TRESemmé Keratin Smooth',
    childCount: 1,
    claimsCount: 10,
    projectsCount: 2,
    geographyCount: 3,
    geographies: ['North America', 'LATAM', 'APAC'],
    category: 'Hair Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'TRESemmé',
    technology1: 'Keratin Complex Technology',
    tier: 'Premium',
    targetAudience: 'Women 20–45 with frizzy/curly hair',
    createdBy: 'Jennifer Davis',
    createdDate: '2024-03-15',
    lastModified: '2026-03-30',
    isFavorite: false,
  },
  {
    id: 'fmt-3',
    productId: 'PROD-2026-018',
    name: 'TRESemmé Keratin Smooth Intense Shampoo',
    levelName: 'Shampoo',
    type: 'Format',
    lifecycleState: 'In-use',
    parentId: 'sub-3',
    parentName: 'TRESemmé Keratin Smooth Intense',
    childCount: 1,
    claimsCount: 6,
    projectsCount: 1,
    geographyCount: 2,
    geographies: ['LATAM', 'North America'],
    category: 'Hair Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'TRESemmé',
    technology1: 'Keratin Complex Technology',
    createdBy: 'Jennifer Davis',
    createdDate: '2024-04-01',
    lastModified: '2026-04-20',
    isFavorite: false,
  },
  {
    id: 'var-4',
    productId: 'PROD-2026-019',
    name: 'TRESemmé Keratin Smooth Intense Shampoo Classic',
    levelName: 'Classic',
    type: 'Variant',
    lifecycleState: 'Created',
    parentId: 'fmt-3',
    parentName: 'TRESemmé Keratin Smooth Intense Shampoo',
    childCount: 0,
    claimsCount: 5,
    projectsCount: 1,
    geographyCount: 2,
    geographies: ['LATAM', 'North America'],
    category: 'Hair Care',
    businessGroup: 'Beauty & Wellbeing',
    brand: 'TRESemmé',
    technology1: 'Keratin Complex Technology',
    tier: 'Premium',
    targetAudience: 'Women 20–45',
    createdBy: 'Jennifer Davis',
    createdDate: '2025-03-01',
    lastModified: '2026-04-22',
    isFavorite: false,
  },

  // ── PERSIL HIERARCHY ──────────────────────────────────────────────────────
  {
    id: 'rng-4',
    productId: 'PROD-2026-020',
    name: 'Persil Laundry',
    levelName: 'Laundry',
    type: 'Range',
    lifecycleState: 'In-use',
    parentId: null,
    parentName: null,
    childCount: 2,
    claimsCount: 16,
    projectsCount: 3,
    geographyCount: 4,
    geographies: ['EMEA', 'South Asia'],
    category: 'Fabric Care',
    businessGroup: 'Home Care',
    brand: 'Persil',
    createdBy: 'James Brown',
    createdDate: '2023-05-10',
    lastModified: '2026-04-12',
    isFavorite: false,
  },
  {
    id: 'sub-4',
    productId: 'PROD-2026-021',
    name: 'Persil Laundry Bio',
    levelName: 'Bio',
    type: 'Subrange',
    lifecycleState: 'In-use',
    parentId: 'rng-4',
    parentName: 'Persil Laundry',
    childCount: 1,
    claimsCount: 10,
    projectsCount: 2,
    geographyCount: 3,
    geographies: ['United Kingdom', 'Germany', 'France'],
    category: 'Fabric Care',
    businessGroup: 'Home Care',
    brand: 'Persil',
    tier: 'Core',
    consumerBenefitPlatform: 'Stain Removal',
    createdBy: 'James Brown',
    createdDate: '2023-08-01',
    lastModified: '2026-03-28',
    isFavorite: false,
  },
  {
    id: 'fmt-4',
    productId: 'PROD-2026-022',
    name: 'Persil Laundry Bio Liquid',
    levelName: 'Liquid',
    type: 'Format',
    lifecycleState: 'In-use',
    parentId: 'sub-4',
    parentName: 'Persil Laundry Bio',
    childCount: 1,
    claimsCount: 6,
    projectsCount: 1,
    geographyCount: 1,
    geographies: ['United Kingdom'],
    category: 'Fabric Care',
    businessGroup: 'Home Care',
    brand: 'Persil',
    tier: 'Core',
    createdBy: 'James Brown',
    createdDate: '2023-08-20',
    lastModified: '2026-03-25',
    isFavorite: false,
  },
  {
    id: 'var-5',
    productId: 'PROD-2026-023',
    name: 'Persil Laundry Bio Liquid Regular',
    levelName: 'Regular',
    type: 'Variant',
    lifecycleState: 'Obsolete',
    parentId: 'fmt-4',
    parentName: 'Persil Laundry Bio Liquid',
    childCount: 0,
    claimsCount: 4,
    projectsCount: 0,
    geographyCount: 1,
    geographies: ['United Kingdom'],
    category: 'Fabric Care',
    businessGroup: 'Home Care',
    brand: 'Persil',
    createdBy: 'James Brown',
    createdDate: '2023-09-01',
    lastModified: '2025-12-01',
    isFavorite: false,
  },
  {
    id: 'sub-5',
    productId: 'PROD-2026-024',
    name: 'Persil Laundry Non-Bio',
    levelName: 'Non-Bio',
    type: 'Subrange',
    lifecycleState: 'In-use',
    parentId: 'rng-4',
    parentName: 'Persil Laundry',
    childCount: 1,
    claimsCount: 8,
    projectsCount: 2,
    geographyCount: 2,
    geographies: ['United Kingdom', 'Ireland'],
    category: 'Fabric Care',
    businessGroup: 'Home Care',
    brand: 'Persil',
    tier: 'Core',
    consumerBenefitPlatform: 'Gentle Care',
    createdBy: 'James Brown',
    createdDate: '2023-08-15',
    lastModified: '2026-03-20',
    isFavorite: false,
  },
  {
    id: 'fmt-5',
    productId: 'PROD-2026-025',
    name: 'Persil Laundry Non-Bio Powder',
    levelName: 'Powder',
    type: 'Format',
    lifecycleState: 'In-use',
    parentId: 'sub-5',
    parentName: 'Persil Laundry Non-Bio',
    childCount: 0,
    claimsCount: 5,
    projectsCount: 1,
    geographyCount: 2,
    geographies: ['United Kingdom', 'Ireland'],
    category: 'Fabric Care',
    businessGroup: 'Home Care',
    brand: 'Persil',
    tier: 'Core',
    createdBy: 'James Brown',
    createdDate: '2023-09-10',
    lastModified: '2026-03-15',
    isFavorite: false,
  },
];

// ── HIERARCHY TREE HELPERS ────────────────────────────────────────────────────

export interface HierarchyBrand {
  brandName: string;
  /** Top-level nodes for the brand (Ranges, or Subranges/Formats created directly under the brand). */
  roots: HierarchyNode[];
}

export interface HierarchyNode {
  product: ProductItem;
  children: HierarchyNode[];
  isExpanded?: boolean;
}

export function buildHierarchyTree(products: ProductItem[]): HierarchyBrand[] {
  const productMap = new Map<string, ProductItem>();
  products.forEach(p => productMap.set(p.id, p));

  const childrenMap = new Map<string, ProductItem[]>();
  products.forEach(p => {
    if (p.parentId) {
      const siblings = childrenMap.get(p.parentId) || [];
      siblings.push(p);
      childrenMap.set(p.parentId, siblings);
    }
  });

  function buildNode(product: ProductItem): HierarchyNode {
    const children = (childrenMap.get(product.id) || []).map(buildNode);
    return { product, children, isExpanded: false };
  }

  // Top-level nodes are any parentless, non-Technology product (Range, or a
  // Subrange/Format created directly under a brand).
  const rootProducts = products.filter(p => !p.parentId && p.type !== 'Technology');
  const brandMap = new Map<string, ProductItem[]>();
  rootProducts.forEach(f => {
    const list = brandMap.get(f.brand) || [];
    list.push(f);
    brandMap.set(f.brand, list);
  });

  // Also include Technologies
  const technologies = products.filter(p => p.type === 'Technology');
  const techBrand: HierarchyBrand | null = technologies.length > 0
    ? { brandName: '⚗️ Technologies', roots: technologies.map(t => ({ product: t, children: [], isExpanded: false })) }
    : null;

  const brands: HierarchyBrand[] = Array.from(brandMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([brandName, roots]) => ({
      brandName,
      roots: roots.map(buildNode),
    }));

  if (techBrand) brands.push(techBrand);
  return brands;
}

// Lifecycle badge colors
export function getLifecycleBadgeStyle(state: LifecycleState): { bg: string; text: string; dot: string } {
  switch (state) {
    case 'Created':   return { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' };
    case 'In-use':    return { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' };
    case 'Obsolete':  return { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' };
    case 'Cancelled': return { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' };
  }
}

export function getProductTypeColor(type: ProductType): string {
  return PRODUCT_TYPE_META[type]?.color ?? '#6B7280';
}
export function getProductTypeBg(type: ProductType): string {
  return PRODUCT_TYPE_META[type]?.bg ?? '#F3F4F6';
}

// ── BRAND HELPERS ──────────────────────────────────────────────────────────────
export const BRAND_SUGGESTIONS = [
  'Dove', 'TRESemmé', 'Persil', 'Vaseline', "Hellmann's",
  'Domestos', 'Simple', 'Comfort', 'Sunsilk', 'Knorr',
];

/**
 * Derive the Business Group & Category for a brand. Brand sits at the top of the
 * hierarchy, so BG/Category are auto-populated from it during product creation.
 */
export function getBrandClassification(brand: string): { businessGroup: string; category: string } {
  const b = brand.toLowerCase();
  if (b.includes('dove') || b.includes('vaseline') || b.includes('simple')) {
    return { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' };
  }
  if (b.includes('tresemm') || b.includes('sunsilk')) {
    return { businessGroup: 'Beauty & Wellbeing', category: 'Hair Care' };
  }
  if (b.includes('persil') || b.includes('comfort')) {
    return { businessGroup: 'Home Care', category: 'Fabric Care' };
  }
  if (b.includes('domestos')) {
    return { businessGroup: 'Home Care', category: 'Home Hygiene' };
  }
  if (b.includes('hellmann') || b.includes('knorr')) {
    return { businessGroup: 'Foods', category: 'Condiments' };
  }
  return { businessGroup: 'Beauty & Wellbeing', category: 'Skin Care' };
}
