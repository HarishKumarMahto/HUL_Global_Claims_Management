# Scrollable Project Table - Workspace Exploration Findings

## Executive Summary

The codebase demonstrates a clear architectural pattern distinguishing **modal components** (transactional) from **screen-based components** (immersive workspaces). The `ClaimCreationModal` currently violates this pattern and should be converted to a screen-based design.

---

## 1. ClaimCreationModal Implementation Analysis

### Current Structure
**File:** `src/app/components/claims/ClaimCreationModal.tsx`

**Current Implementation:**
- ❌ Implemented as a **modal** (using `fixed inset-0 bg-black/40 backdrop-blur-md`)
- Multi-step form (2+ steps) with complex state management
- Props: `isOpen`, `onClose`, `onCreate`, `initialStep`

**Issues with Modal Approach:**
- Complex multi-step workflows are cramped in modals
- Hard to manage workspace context while in modal
- Limited scrolling area for content-heavy steps
- Doesn't follow the immersive screen pattern used elsewhere

**Why It Should Be Screen-Based:**
1. **Multi-step complexity** — Claims creation involves 4+ tabs (Create, Available Product Claims, Copy Claims, Localize) with heavy state
2. **Rich content** — Translation dictionaries, claim tables, geography selections
3. **Long workflows** — Users need to see context while filling forms
4. **Comparison patterns** — Needs side-by-side views (parent claims vs new claims)

---

## 2. Modal Pattern vs Screen-Based Pattern

### Modal Pattern (Transactional)
**Used for:** Quick create/edit operations with limited scope

**Examples:**
- [CreateProjectModal](src/app/components/CreateProjectModal.tsx) — Create project in < 1 minute
- [CreateAssetModal](src/app/components/assets/CreateAssetModal.tsx) — Upload or placeholder asset
- [ClaimAssociationModal](src/app/components/products/ClaimAssociationModal.tsx) — Link claims to products

**Structure:**
```typescript
// Modal Props Pattern
interface CreateProjectModalProps {
  isOpen: boolean;                                    // Modal open/close control
  onClose: () => void;                                // Close callback
  onCreateProject: (project: Omit<Project, 'id'>) => void;  // Save callback
  existingProjectNames: string[];                     // Validation data
}
```

**Markup Pattern:**
```tsx
return (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[80vh]">
      {/* Header with close button */}
      {/* Form content */}
      {/* Footer actions */}
    </div>
  </div>
);
```

**Characteristics:**
- ✅ Overlay with backdrop blur
- ✅ Centered container with max-width
- ✅ Modal header with close button (X)
- ✅ Single responsibility (create ONE thing)
- ✅ Used for onboarding/quick workflows

---

### Screen-Based Pattern (Immersive Workspace)
**Used for:** Complex workflows with multiple views, navigation, and rich context

**Examples:**
- [AssetWorkspace](src/app/components/assets/AssetWorkspace.tsx) — Asset details + risk + approval workflow
- [ClaimWorkspace](src/app/components/claims/ClaimWorkspace.tsx) — Claim details + support strategy + risk assessments
- [DocumentWorkspace](src/app/components/documents/DocumentWorkspace.tsx) — Document viewer + versions + comments
- [ProductDetailsPage](src/app/components/products/ProductDetailsPage.tsx) — Product details + parent/child products + claims

**Structure:**
```typescript
// Screen-Based Props Pattern
interface AssetWorkspaceProps {
  asset: Asset;                                       // Primary object
  assets: Asset[];                                    // List context (for navigation)
  onBack: () => void;                                 // Go back to list
  onAssetSave: (asset: Asset) => void;               // Save changes
  activeSection: string;                              // Section navigation
  onSectionChange: (section: string) => void;        // Switch sections
  onNavigateToProject?: (projectId: string) => void; // Cross-module navigation
  onNavigateToClaim?: (claimId: string) => void;     // Cross-module navigation
  onAssetSelect?: (asset: Asset) => void;            // Jump to another item in list
}
```

**Markup Pattern:**
```tsx
return (
  <div className="flex flex-col h-screen">
    {/* Header with back button, title, and actions */}
    <div className="flex flex-1 gap-4">
      {/* Left nav with sections */}
      <nav className="w-56 bg-gray-50 border-r">
        {SECTIONS.map(section => (
          <button onClick={() => onSectionChange(section.id)}>
            {section.label}
          </button>
        ))}
      </nav>
      
      {/* Main scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        {/* Multiple sections with refs for scroll-to-section */}
        <div ref={el => (sectionRefs.current['Asset Details'] = el)}>
          {/* Rich content, modals, nested editors */}
        </div>
        {/* More sections... */}
      </div>
    </div>
  </div>
);
```

**Characteristics:**
- ✅ Full-screen immersive view
- ✅ Left nav with section buttons
- ✅ Back button to return to list
- ✅ Active section highlighting
- ✅ Smooth scroll-to-section navigation
- ✅ Contains nested modals (details within workspace)
- ✅ Cross-module navigation (claim → product → project)

---

## 3. CreateProjectModal Deep Dive

**File:** `src/app/components/CreateProjectModal.tsx`

### Flow
1. **Open Condition:** Modal opens when `isOpen === true`
2. **Form Fields:**
   - Project name (text, required, duplicate check)
   - Description (text)
   - Business group (select, required)
   - Category (multi-select, dependent on business group)
   - Type (select)
   - Scope (select)
   - Region (multi-select, optional)
   - Start/Launch/Evaluation dates
   - External reference (Innoflex OR BLG project name)

3. **Validation:**
```typescript
const validate = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.name.trim()) newErrors.name = 'Project name is required';
  if (!formData.businessGroup) newErrors.businessGroup = 'Business group is required';
  if (formData.businessGroup && formData.category.length === 0) 
    newErrors.category = 'At least one Category is required';
  // ... more validations
  return Object.keys(newErrors).length === 0 && !isDuplicateName;
};
```

4. **Actions:**
   - Save (close modal)
   - Save & Create Another (keep modal open, reset form)
   - Close

5. **State Sync:**
   - Category options filtered by selected business group
   - Evaluation date auto-calculated as start date + 5 days
   - Team members auto-generated via `generateTeamMembersForProject()`

---

## 4. ProductsModule State Management Pattern

**File:** `src/app/components/products/ProductsModule.tsx`

### Architecture
```typescript
type ProductModuleView = 'landing' | 'hierarchy' | 'detail';

// Props from parent (ProjectWorkspace)
const ProductsModule = ({
  activeProductView,          // 'landing' | 'hierarchy' | 'detail'
  selectedProduct,            // ProductItem | null
  activeProductSection,       // 'Product Details' | 'Parent Products' | etc.
  showCreateModal,           // external trigger for create modal
  showSavedViewsPanel,       // external trigger for saved views
  savedViews,                // synced across module
  appliedView,               // current filter/column configuration
  externalSearchQuery,       // search from left nav
}: Props)
```

### Internal State
```typescript
const [products, setProducts] = useState<ProductItem[]>(initialProducts);
const [favorites, setFavorites] = useState<Set<string>>(new Set([...]));
const [recentIds, setRecentIds] = useState<string[]>([...]);
const [localCreateModal, setLocalCreateModal] = useState(false);
const [localCreateType, setLocalCreateType] = useState<ProductType | undefined>();
const [localSavedViews, setLocalSavedViews] = useState<ProductSavedView[]>([]);
const [productEditMode, setProductEditMode] = useState(false);
const [localAppliedView, setLocalAppliedView] = useState<ProductSavedView | null>(null);
```

### View Switching Logic
```typescript
if (activeProductView === 'detail' && selectedProduct) {
  return <ProductDetailsPage ... />;
} else if (activeProductView === 'hierarchy') {
  return <ProductHierarchyPage ... />;
} else {
  return <ProductsLandingPage ... />;
}
```

### Key Handlers
```typescript
const handleProductClick = (p: ProductItem, editMode: boolean = false) => {
  setProducts(prev => prev.map(item => item.id === p.id ? p : item));
  onProductSelect(p);           // Signal to parent
  onViewChange('detail');       // Switch to detail view
  onProductSectionChange('Product Details');
  setProductEditMode(editMode);
  setRecentIds(prev => [p.id, ...prev.filter(id => id !== p.id)].slice(0, 10));
};

const handleCreateProduct = (newProduct: Omit<ProductItem, 'id' | ...>) => {
  const full: ProductItem = { ...newProduct, id: `prod-${Date.now()}`, ... };
  setProducts(prev => [full, ...prev]);
  handleCloseCreate();
  handleProductClick(full);  // Switch to detail view
};
```

### Props Sync Pattern
```typescript
// Synced props (dual-mode: local or external)
const savedViews = propsSavedViews !== undefined ? propsSavedViews : localSavedViews;
const setSavedViews = propsOnSavedViewsChange !== undefined ? propsOnSavedViewsChange : setLocalSavedViews;

const appliedView = propsAppliedView !== undefined ? propsAppliedView : localAppliedView;
const setAppliedView = propsOnApplyView !== undefined ? propsOnApplyView : setLocalAppliedView;
```

This allows **external control from parent** (ProjectWorkspace) while maintaining **local defaults** if props are undefined.

---

## 5. Screen-Based Form Component Examples

### AssetWorkspace Sections
```typescript
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
```

### Scroll-to-Section Pattern
```typescript
useEffect(() => {
  if (isNavigatingRef.current) return;
  const el = sectionRefs.current[activeSection];
  if (el) {
    isNavigatingRef.current = true;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    scrollTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 800);
  }
}, [activeSection]);
```

**Why this pattern?**
- Users can navigate between sections via buttons OR scroll
- Active section updates in real-time as user scrolls
- Smooth animations prevent jarring jumps
- Rich context visible (left nav + content)

---

## 6. Types & Data Structures

### Claim Structure
```typescript
export interface Claim {
  id: string;
  claimType: ClaimType;                    // 'Global' | 'Regional' | 'Local'
  parentClaimId?: string;
  versions: ClaimVersion[];                // Version history
  currentVersion: number;
  lifecycleStage: ClaimLifecycle;          // 'Proposed' | 'Assessed' | ... 
  marketingChannels: string[];             // ['TV', 'Digital', ...]
  finalRiskLevel: RiskLevel;               // 'Low' | 'Medium' | 'High' | 'Very High'
  productName: string;
  productId: string;
  supportStrategy: string;                 // Rich text/markdown
  substantiationDocs: SubstantiationDoc[]; // Linked evidence
  finalRiskSummary: {                      // Complex assessment
    claimClassificationLevel?: string;     // Level 1 (GO) | Level 2 (ASK) | Level 3 (NO GO)
    reasons?: string[];
    legalSummary?: string;
    raSummary?: string;
    rdSummary?: string;
    iRAOutput?: string;
    iRAClassificationConfidence?: number;
    iRARiskConfidence?: number;
  };
  riskAssessments: RiskAssessmentRecord[]; // Department-level assessments
  linkedAssets: Array<{ id; name; type; lifecycleState }>;
  inheritance?: ClaimInheritance;          // Track copied/inherited claims
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  auditLog?: AuditEntry[];                 // F01 audit trail
}
```

### Product Hierarchy
```typescript
export type ProductType = 'Technology' | 'Format' | 'Subrange' | 'Variant' | 'Local Variant' | 'SKU';

// Hierarchy structure:
// Technology (contextual metadata)
//   ↓
// Format (parent product under brand)
//   ↓
// Subrange (grouping of variants)
//   ↓
// Variant (global definition)
//   ↓
// Local Variant (geography-specific)
//   ↓
// SKU (consumer unit)
```

**Each ProductItem has:**
- `parentId` / `parentName` — Link to parent
- `childCount` — Number of children
- `claimsCount` — Linked claims
- `projectsCount` — Linked projects
- `geographies: string[]` — Applicable geographies
- `versionNumber`, `versionedFrom`, `productVersions` — Versioning support

---

## 7. Key Differences: Modal vs Screen-Based

| Aspect | Modal | Screen-Based |
|--------|-------|--------------|
| **Overlay** | Yes (`fixed inset-0 bg-black/40`) | No (full viewport) |
| **Navigation** | Close button (X) | Back button + section nav |
| **Use Cases** | Quick create, select, confirm | Complex workflows, rich editing |
| **Content** | Limited (max-h-[80vh]) | Unlimited (scrollable) |
| **Sections** | Single form | Multiple sections (8+) |
| **Context** | Isolated | Full application context visible |
| **State** | Transactional (save/close) | Persistent (active section) |
| **Examples** | CreateProjectModal, CreateAssetModal | AssetWorkspace, ClaimWorkspace |
| **Modals Inside** | ❌ None (distraction) | ✅ Yes (modals within workspace) |

---

## 8. Navigation & Module Flow

### Typical Flow: ProjectWorkspace
```
ProjectWorkspace (parent)
├── LeftNavigation
│   ├── Search (externalSearchQuery)
│   └── Module selector (projects, claims, assets, documents, products)
│
└── [Active Module] (one of below)
    ├── ProjectsModule
    │   ├── ProjectTable (list view)
    │   └── [ProjectDetailsPage] (detail view)
    │
    ├── ClaimsModule
    │   ├── ClaimsTable (list view)
    │   └── [ClaimWorkspace] (detail view)
    │       ├── Support Strategy Editor
    │       ├── Risk Assessments
    │       └── [Nested Modals]
    │           ├── DuplicateClaimModal
    │           ├── RiskAssessmentModal
    │           └── UploadDocumentModal
    │
    ├── AssetsModule
    │   ├── AssetsTable (list view)
    │   └── [AssetWorkspace] (detail view)
    │       └── [Nested Modals]
    │           ├── DownloadAssetModal
    │           ├── LifecycleTransitionModal
    │           └── ApprovalWorkflowModal
    │
    ├── DocumentsModule
    │   ├── DocumentsTable (list view)
    │   └── [DocumentWorkspace] (detail view)
    │       ├── Document Viewer
    │       └── [Nested Modals]
    │           ├── DocumentVersionModal
    │           └── CancelDocumentModal
    │
    └── ProductsModule
        ├── ProductsLandingPage (list view)
        ├── ProductDetailsPage (detail view)
        │   ├── Product Details Editor
        │   ├── Parent Products
        │   ├── Child Products
        │   └── Related Claims
        ├── ProductHierarchyPage (hierarchy view)
        └── [Nested Modals]
            ├── CreateProductModal
            ├── LinkProductModal
            └── ClaimAssociationModal
```

---

## 9. ClaimCreationModal Refactor Plan

### Should Become: ClaimCreationWorkspace (Screen-Based)

**New Structure:**
```typescript
interface ClaimCreationWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (claims: Claim[]) => void;
  projectId: string;
  initialStep?: number;
}

// Sections instead of modal
const SECTIONS = [
  { id: 'Select Product', label: 'Select Product' },
  { id: 'Create Claims', label: 'Create/Copy Claims' },
  { id: 'Configure', label: 'Configure Settings' },
  { id: 'Review', label: 'Review & Submit' },
];
```

**Benefits:**
- ✅ Full-width workspace for multi-step workflows
- ✅ Visible context (product details, existing claims)
- ✅ Better for drag-drop (claims reordering)
- ✅ Translation tables side-by-side
- ✅ Consistent with ClaimWorkspace UX

---

## 10. Summary Table: Component Mapping

| Component | Type | Purpose | File |
|-----------|------|---------|------|
| ProjectTable | Modal | Quick project lookup | ProjectTable.tsx |
| CreateProjectModal | **Modal** | Create new project | CreateProjectModal.tsx |
| ClaimCreationModal | **Modal** | ⚠️ Should be Screen | ClaimCreationModal.tsx |
| ClaimWorkspace | **Screen** | Edit claim details | ClaimWorkspace.tsx |
| AssetWorkspace | **Screen** | Edit asset details | AssetWorkspace.tsx |
| DocumentWorkspace | **Screen** | View/edit document | DocumentWorkspace.tsx |
| ProductDetailsPage | **Screen** | View product hierarchy | ProductDetailsPage.tsx |
| ProductsLandingPage | **List** | Browse products | ProductsLandingPage.tsx |
| ClaimsModule | **Orchestrator** | Switch views + state | ClaimsModule.tsx |
| ProductsModule | **Orchestrator** | Switch views + state | ProductsModule.tsx |

---

## Files Structure Reference

```
src/app/
├── components/
│   ├── claims/
│   │   ├── ClaimCreationModal.tsx       ← NEEDS REFACTOR
│   │   ├── ClaimWorkspace.tsx           ← Reference for screen-based
│   │   ├── ClaimsModule.tsx             ← Orchestrator
│   │   ├── ClaimsTable.tsx
│   │   ├── RiskAssessmentModal.tsx
│   │   └── ...
│   ├── products/
│   │   ├── ProductsModule.tsx           ← Reference for module pattern
│   │   ├── ProductDetailsPage.tsx       ← Reference for screen-based
│   │   ├── ProductsLandingPage.tsx      ← Reference for list view
│   │   ├── CreateProductModal.tsx       ← Reference for modal pattern
│   │   └── productData.ts               ← Data structures
│   ├── assets/
│   │   ├── AssetWorkspace.tsx           ← Reference for screen-based
│   │   ├── CreateAssetModal.tsx         ← Reference for modal pattern
│   │   └── AssetsModule.tsx
│   ├── documents/
│   │   ├── DocumentWorkspace.tsx        ← Reference for screen-based
│   │   └── DocumentsModule.tsx
│   ├── CreateProjectModal.tsx           ← Reference for modal pattern
│   └── ...
├── types.ts                              ← Data structures (Project, Claim, Asset, etc.)
└── App.tsx                               ← Main entry point
```

---

## Key Takeaways

1. **ClaimCreationModal violates UX patterns** — Multi-step workflows should be screens, not modals
2. **Three component types exist:**
   - **Modal Components** — Transactional (create, select, confirm)
   - **Screen Components** — Immersive (workspace with sections)
   - **Module/Orchestrators** — Manage state and navigation between views
3. **Module pattern provides flexibility:**
   - Local state when props undefined
   - External control when props provided
   - Enables reuse in different contexts
4. **Scroll-to-section pattern** improves UX
   - Users can navigate via nav OR scroll
   - Active section updates in real-time
5. **Claim data is complex** — Versions, risk assessments, substantiation, inheritance tracking
6. **Product hierarchy is deep** — 6 levels (Technology → Format → Subrange → Variant → Local → SKU)
