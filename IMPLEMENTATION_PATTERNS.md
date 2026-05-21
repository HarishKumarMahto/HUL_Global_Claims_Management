# Implementation Pattern Reference Guide

Quick lookup for implementing screen-based components vs modals in this codebase.

---

## Pattern 1: Modal Component

### Use When:
- Creating a single entity (project, asset, claim)
- Quick selection/confirmation needed
- Operation takes < 2 minutes
- Doesn't need full application context

### Template

**File:** `src/app/components/[Feature]/Create[Entity]Modal.tsx`

```typescript
import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (entity: Omit<Entity, 'id'>) => void;
  // Validation data
  existingNames?: string[];
}

export default function CreateEntityModal({
  isOpen,
  onClose,
  onCreate,
  existingNames = [],
}: CreateEntityModalProps) {
  const [formData, setFormData] = useState({ /* fields */ });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  if (!isOpen) return null;
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    // Add validations here
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = () => {
    if (!validate()) return;
    onCreate(formData);
    handleClose();
  };
  
  const handleClose = () => {
    setFormData({ /* reset */ });
    setErrors({});
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-bold text-night">Create New Entity</h2>
          <button onClick={handleClose} className="p-2 hover:bg-earth rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Form fields here */}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex gap-3 justify-end flex-shrink-0">
          <button onClick={handleClose} className="px-4 py-2 border border-pebble rounded-lg hover:bg-earth">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-sky text-white rounded-lg hover:bg-sky/90">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Real Example
See: [CreateProjectModal](src/app/components/CreateProjectModal.tsx) (lines 1-50 for structure)

---

## Pattern 2: Screen-Based Workspace

### Use When:
- Multi-step workflows (3+ steps)
- Rich content editing
- Multiple views/sections needed
- Users need full application context
- Complex state management

### Template

**File:** `src/app/components/[Feature]/[Entity]Workspace.tsx`

```typescript
import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export type EntitySection = 
  | 'Details'
  | 'Relationships' 
  | 'Assessments'
  | 'Audit Log';

const ORDERED_SECTIONS: { id: EntitySection; label: string }[] = [
  { id: 'Details', label: 'Details' },
  { id: 'Relationships', label: 'Relationships' },
  { id: 'Assessments', label: 'Assessments' },
  { id: 'Audit Log', label: 'Audit Log' },
];

interface EntityWorkspaceProps {
  entity: Entity;
  entities: Entity[];  // For navigation (prev/next)
  onBack: () => void;
  onEntitySave: (entity: Entity) => void;
  activeSection: EntitySection;
  onSectionChange: (section: EntitySection) => void;
  // Cross-module navigation
  onNavigateToProject?: (projectId: string) => void;
  onNavigateToClaim?: (claimId: string) => void;
  onEntitySelect?: (entity: Entity) => void; // Jump to another in list
}

export default function EntityWorkspace({
  entity,
  entities,
  onBack,
  onEntitySave,
  activeSection,
  onSectionChange,
  onNavigateToProject,
  onNavigateToClaim,
  onEntitySelect,
}: EntityWorkspaceProps) {
  const [isFavorite, setIsFavorite] = useState(entity.isFavorite);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const sectionRefs = useRef<Record<EntitySection, HTMLDivElement | null>>({});
  const isNavigatingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Scroll to section when activeSection changes
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
  
  // Update activeSection as user scrolls
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isNavigatingRef.current) return;
    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();
    const triggerLine = containerRect.top + containerRect.height * 0.3;
    
    for (const section of ORDERED_SECTIONS) {
      const el = sectionRefs.current[section.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= triggerLine && rect.bottom > triggerLine) {
          if (activeSection !== section.id) {
            onSectionChange(section.id);
          }
          break;
        }
      }
    }
  };
  
  const currentIndex = entities.findIndex(e => e.id === entity.id);
  const totalEntities = entities.length;
  
  const handlePrev = () => {
    if (currentIndex > 0 && onEntitySelect) {
      onEntitySelect(entities[currentIndex - 1]);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < totalEntities - 1 && onEntitySelect) {
      onEntitySelect(entities[currentIndex + 1]);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-earth rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-night">{entity.name}</h1>
            <p className="text-sm text-gray-500">{entity.id}</p>
          </div>
        </div>
        
        {/* Nav and actions */}
        <div className="flex items-center gap-4">
          <button onClick={handlePrev} disabled={currentIndex === 0} className="p-2 hover:bg-earth rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">{currentIndex + 1} of {totalEntities}</span>
          <button onClick={handleNext} disabled={currentIndex === totalEntities - 1} className="p-2 hover:bg-earth rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 gap-4 min-h-0">
        
        {/* Left Sidebar Navigation */}
        <nav className="w-56 bg-gray-50 border-r border-pebble flex-shrink-0 py-4 px-2">
          {ORDERED_SECTIONS.map(section => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-sky text-white'
                  : 'text-gray-700 hover:bg-earth'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
        
        {/* Main Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
          <div className="max-w-6xl mx-auto px-6 py-4 space-y-8">
            
            {/* Details Section */}
            <div ref={el => sectionRefs.current['Details'] = el}>
              <h2 className="text-xl font-bold text-night mb-4">Details</h2>
              {/* Content here */}
            </div>
            
            {/* Relationships Section */}
            <div ref={el => sectionRefs.current['Relationships'] = el}>
              <h2 className="text-xl font-bold text-night mb-4">Relationships</h2>
              {/* Content here */}
            </div>
            
            {/* Assessments Section */}
            <div ref={el => sectionRefs.current['Assessments'] = el}>
              <h2 className="text-xl font-bold text-night mb-4">Assessments</h2>
              {/* Content here */}
            </div>
            
            {/* Audit Log Section */}
            <div ref={el => sectionRefs.current['Audit Log'] = el}>
              <h2 className="text-xl font-bold text-night mb-4">Audit Log</h2>
              {/* Content here */}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Real Examples
- [AssetWorkspace](src/app/components/assets/AssetWorkspace.tsx) (lines 1-50 for structure)
- [ClaimWorkspace](src/app/components/claims/ClaimWorkspace.tsx) (lines 1-50 for structure)
- [DocumentWorkspace](src/app/components/documents/DocumentWorkspace.tsx) (lines 1-50 for structure)

---

## Pattern 3: Module Orchestrator

### Use When:
- Managing multiple views (list, hierarchy, detail)
- Coordinating state across screens and modals
- Passing external control to parent component
- Enabling saved views / filters / sorting

### Template

**File:** `src/app/components/[Feature]/[Entity]Module.tsx`

```typescript
import { useState } from 'react';
import type { Entity } from '../types';
import EntityLandingPage from './EntityLandingPage';
import EntityDetailsPage from './EntityDetailsPage';
import CreateEntityModal from './CreateEntityModal';
import SavedViewsPanel from './SavedViewsPanel';

export type EntityModuleView = 'landing' | 'hierarchy' | 'detail';

interface Props {
  // View control (from parent)
  activeEntityView: EntityModuleView;
  onViewChange: (view: EntityModuleView) => void;
  
  // Selection control (from parent)
  selectedEntity: Entity | null;
  onEntitySelect: (e: Entity | null) => void;
  
  // List view settings
  activeListView: string;
  onListViewChange: (view: string) => void;
  
  // Detail view section nav
  activeEntitySection: string;
  onEntitySectionChange: (s: string) => void;
  
  // Modal triggers (from parent)
  showCreateModal?: boolean;
  onCloseCreateModal?: () => void;
  
  // Saved views (can be local or external)
  savedViews?: SavedView[];
  onSavedViewsChange?: (views: SavedView[]) => void;
  appliedView?: SavedView | null;
  onApplyView?: (view: SavedView) => void;
  
  // External search
  externalSearchQuery?: string;
}

export default function EntityModule({
  activeEntityView, onViewChange,
  selectedEntity, onEntitySelect,
  activeListView, onListViewChange,
  activeEntitySection, onEntitySectionChange,
  showCreateModal = false, onCloseCreateModal,
  savedViews: propsSavedViews,
  onSavedViewsChange: propsOnSavedViewsChange,
  appliedView: propsAppliedView,
  onApplyView: propsOnApplyView,
  externalSearchQuery,
}: Props) {
  // Internal state
  const [entities, setEntities] = useState<Entity[]>(initialEntities);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentIds, setRecentIds] = useState<string[]>([]);
  
  // Local modal state (unless controlled externally)
  const [localCreateModal, setLocalCreateModal] = useState(false);
  const [localCreateType, setLocalCreateType] = useState<EntityType | undefined>();
  
  // Local saved views (unless controlled externally)
  const [localSavedViews, setLocalSavedViews] = useState<SavedView[]>([]);
  const [localAppliedView, setLocalAppliedView] = useState<SavedView | null>(null);
  
  // Dual-mode pattern: prefer external props, fall back to local state
  const savedViews = propsSavedViews !== undefined ? propsSavedViews : localSavedViews;
  const setSavedViews = propsOnSavedViewsChange !== undefined ? propsOnSavedViewsChange : setLocalSavedViews;
  
  const appliedView = propsAppliedView !== undefined ? propsAppliedView : localAppliedView;
  const setAppliedView = propsOnApplyView !== undefined ? propsOnApplyView : setLocalAppliedView;
  
  const isCreateOpen = showCreateModal || localCreateModal;
  
  const handleCloseCreate = () => {
    setLocalCreateModal(false);
    setLocalCreateType(undefined);
    onCloseCreateModal?.();
  };
  
  const handleOpenCreate = (type?: EntityType) => {
    const actualType = typeof type === 'string' ? type : undefined;
    setLocalCreateType(actualType);
    setLocalCreateModal(true);
  };
  
  const handleEntityClick = (e: Entity, editMode: boolean = false) => {
    setEntities(prev => prev.map(item => item.id === e.id ? e : item));
    onEntitySelect(e);
    onViewChange('detail');
    onEntitySectionChange('Details');
    setRecentIds(prev => [e.id, ...prev.filter(id => id !== e.id)].slice(0, 10));
  };
  
  const handleFavoriteToggle = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  
  const handleBack = () => {
    onEntitySelect(null);
    onViewChange('landing');
  };
  
  const handleCreateEntity = (newEntity: Omit<Entity, 'id'>) => {
    const id = `entity-${Date.now()}`;
    const full: Entity = { ...newEntity, id };
    setEntities(prev => [full, ...prev]);
    handleCloseCreate();
    handleEntityClick(full);
  };
  
  // Render detail view
  if (activeEntityView === 'detail' && selectedEntity) {
    return (
      <>
        <EntityDetailsPage
          entity={selectedEntity}
          allEntities={entities}
          onBack={handleBack}
          onEntityChange={handleEntityClick}
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites}
          activeSection={activeEntitySection}
          onSectionChange={onEntitySectionChange}
        />
        {isCreateOpen && (
          <CreateEntityModal
            isOpen={isCreateOpen}
            onClose={handleCloseCreate}
            onCreate={handleCreateEntity}
            preselectedType={localCreateType}
          />
        )}
      </>
    );
  }
  
  // Render list view (default)
  return (
    <>
      <EntityLandingPage
        entities={entities}
        activeView={activeListView}
        favorites={favorites}
        recentIds={recentIds}
        onEntityClick={handleEntityClick}
        onFavoriteToggle={handleFavoriteToggle}
        onCreateEntity={handleOpenCreate}
        onViewHierarchy={() => onViewChange('hierarchy')}
        appliedView={appliedView}
        onApplyView={(view) => {
          setAppliedView(view);
          onViewChange('landing');
        }}
        externalSearchQuery={externalSearchQuery}
      />
      {isCreateOpen && (
        <CreateEntityModal
          isOpen={isCreateOpen}
          onClose={handleCloseCreate}
          onCreate={handleCreateEntity}
          preselectedType={localCreateType}
        />
      )}
    </>
  );
}
```

### Real Examples
- [ProductsModule](src/app/components/products/ProductsModule.tsx) (complete dual-mode pattern)
- [ClaimsModule](src/app/components/claims/ClaimsModule.tsx)

---

## Pattern 4: Data Structure Template

### Use When:
- Creating new entity types
- Managing complex relationships
- Tracking versions / lifecycle
- Recording audit trails

### Template

```typescript
export interface Entity {
  // Identity
  id: string;
  entityId: string;  // Human-readable ID
  
  // Core data
  name: string;
  description?: string;
  type: EntityType;
  
  // Relationships
  parentId?: string;
  childCount: number;
  relatedProjectIds: string[];
  relatedClaimIds: string[];
  
  // Lifecycle
  lifecycleStage: 'Draft' | 'Active' | 'Obsolete' | 'Cancelled';
  status: string;
  
  // Metadata
  businessGroup: string;
  geography?: string | string[];
  createdBy: string;
  createdDate: string;
  lastModified: string;
  isFavorite?: boolean;
  
  // Versioning
  versionNumber?: string;
  versions?: Array<{
    versionNumber: number;
    createdAt: string;
    createdBy: string;
  }>;
  
  // Audit
  auditLog?: AuditEntry[];
  
  // Extended
  [key: string]: any;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  beforeValue?: string;
  afterValue?: string;
  details?: string;
}
```

### Real Examples
- [Claim interface](src/app/types.ts#L843) — Complex with versions, risk assessments, inheritance
- [ProductItem interface](src/app/components/products/productData.ts#L1) — Hierarchical with parent/child relationships
- [Asset interface](src/app/types.ts) — Lifecycle-based with approval workflows

---

## Quick Decision Tree

```
┌─ What are you building?
│
├─ Need to CREATE one thing?
│  └─ → Use MODAL Pattern
│     (CreateProjectModal, CreateAssetModal)
│
├─ Need to VIEW/EDIT with multiple sections?
│  └─ → Use SCREEN Pattern
│     (AssetWorkspace, ClaimWorkspace)
│
├─ Need to MANAGE list + detail + modals?
│  └─ → Use MODULE Pattern
│     (ProductsModule, ClaimsModule)
│
└─ Creating a new data type?
   └─ → Use DATA STRUCTURE Pattern
      (Add to types.ts)
```

---

## CSS Class Reference

All components use these Tailwind utilities:

| Purpose | Classes |
|---------|---------|
| **Modal Container** | `fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50` |
| **Modal Box** | `bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col` |
| **Screen Container** | `flex flex-col h-screen bg-white` |
| **Sidebar Nav** | `w-56 bg-gray-50 border-r border-pebble flex-shrink-0` |
| **Active Button** | `bg-sky text-white rounded-lg` |
| **Inactive Button** | `text-gray-700 hover:bg-earth` |
| **Scrollable** | `flex-1 overflow-y-auto` |
| **Section** | `space-y-8 max-w-6xl mx-auto px-6 py-4` |
| **Header** | `px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0` |

---

## Common Props Pattern

**All workspace components share:**
```typescript
interface WorkspaceProps {
  // Entity
  entity: T;
  entities: T[];  // for nav
  
  // Navigation
  onBack: () => void;
  onEntitySelect?: (e: T) => void;
  
  // Editing
  onEntitySave: (e: T) => void;
  
  // Sections
  activeSection: string;
  onSectionChange: (s: string) => void;
  
  // Cross-module
  onNavigateToProject?: (id: string) => void;
  onNavigateToClaim?: (id: string) => void;
  onNavigateToAsset?: (id: string) => void;
}
```

**All module components share:**
```typescript
interface ModuleProps {
  // View control
  activeModuleView: ModuleView;
  onViewChange: (view: ModuleView) => void;
  
  // Selection
  selectedEntity: T | null;
  onEntitySelect: (e: T | null) => void;
  
  // Section nav (when in detail)
  activeSection: string;
  onSectionChange: (s: string) => void;
  
  // Modal triggers
  showCreateModal?: boolean;
  onCloseCreateModal?: () => void;
  
  // Saved views
  savedViews?: SavedView[];
  onSavedViewsChange?: (views: SavedView[]) => void;
  
  // External search
  externalSearchQuery?: string;
}
```

---

## Testing Checklist

When implementing a new component:

- [ ] Modal: Does it open/close correctly?
- [ ] Modal: Can users press Escape to close?
- [ ] Modal: Does form reset on close?
- [ ] Screen: Does back button work?
- [ ] Screen: Do sections scroll-to correctly?
- [ ] Screen: Are prev/next buttons enabled/disabled correctly?
- [ ] Module: Does view switching work (landing → detail → hierarchy)?
- [ ] Module: Do external props override local state?
- [ ] Module: Does favorite toggle work?
- [ ] Module: Can users apply saved views?
