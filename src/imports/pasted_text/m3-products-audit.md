M3 Products — UI implementation audit 

All 57 user stories checked against the source code in the zip. 

Implementedpresent & functionalPartialUI exists but incompleteMissingnot present at all 

Product Creation (US-M3-001 to US-M3-006) 

ID 

Requirement 

Status 

Finding 

US-M3-001 

Create product from global create button 

Partial 

"New Product" option is visible in the global Create dropdown (App.tsx line 225). However the onClick only handles "New Project" — "New Product" has no handler and opens nothing. 

US-M3-002 

Create product from within a project 

Partial 

LinkedProductsTab.tsx has both "Add Product" and "Create Product" buttons rendered. Neither has an onClick handler — both are non-functional buttons. 

US-M3-003 

Create child product from parent product page 

Partial 

"Create Child Product" button exists in ProductDetailsPage actions dropdown (line 448). The button closes the menu but no creation screen opens. 

US-M3-004 

Create product from claim creation page 

Missing 

No product creation trigger exists anywhere in the claims flow (RelatedClaimsTab, ClaimAssociationModal). No binoculars/advanced search with a Create option is present. 

US-M3-005 

Save, Save & Create, Cancel actions 

Implemented 

CreateProductModal footer has Save, "Save & Create Another", and Cancel (Back) buttons. Save is disabled until mandatory fields are filled. Save & Create Another resets the name field and keeps the modal open. 

US-M3-006 

Confirmation prompts before Save / Cancel 

Missing 

No confirmation dialog is shown before any save or cancel action in CreateProductModal. Clicking Cancel immediately dismisses the modal without a prompt. 

Product Search (US-M3-007 to US-M3-008) 

ID 

Requirement 

Status 

Finding 

US-M3-007 

Basic product search (type-ahead) 

Implemented 

Type-ahead search is implemented in CreateProductModal's parent search field (live dropdown of matching products). ProductsLandingPage also has a search input with live filtering. Both work without page navigation. 

US-M3-008 

Advanced product search (binoculars, filters, conditions) 

Missing 

No binoculars icon, no advanced search dialog, no filter-column / condition / value selectors for product selection anywhere in the codebase. 

Product Type Creation Forms (US-M3-009 to US-M3-021) 

ID 

Requirement 

Status 

Finding 

US-M3-009 

Parent info inheritance for child products 

Implemented 

selectParent() in CreateProductModal auto-populates brand, businessGroups, and categories from the selected parent. Auto-populated fields are pre-filled (though not displayed as read-only in the UI). 

US-M3-010 

Create Technology product 

Implemented 

Technology form has mandatory name, BG multi-select toggle buttons, category (enabled after BG), and optional formulation document upload button. Validation blocks save without mandatory fields. 

US-M3-011 

Create Format product 

Implemented 

Format form has mandatory brand input, BG multi-select, category (conditional on BG). Brand search is basic text — no advanced search for brand by product name. Save blocked without mandatory fields. 

US-M3-012 

Create Subrange product 

Implemented 

Parent Format search, Subrange name, BG, category, Technology 1 & 2, CBP, Tier, Target Audience all present. Optional description textarea. Save validation enforced. 

US-M3-013 

Create Variant product 

Implemented 

Subrange exists yes/no prompt changes parent search target (Subrange vs Format). Variant name, description, Technology 1 & 2, CBP, Tier, Target Audience all present. Mandatory validation enforced. 

US-M3-014 

Enable claims & regional adaptations at Variant level 

Missing 

No "Add Regional Adaptations" button or geography selection for claims at the Variant creation screen or Variant detail view. 

US-M3-015 

Bulk create Variants 

Implemented 

"Create Variants in Bulk" checkbox appears for Variant type. When checked, Add Variant adds name fields; each row has a (−) remove button. All entered variants are created on Save. 

US-M3-016 

Bulk create Local Variants (CUCs) from variant screen 

Missing 

bulkLocalVariants state is declared but the corresponding JSX (checkbox, Add Local Variant button, geography/CUC code fields) is never rendered. The UI is entirely absent. 

US-M3-017 

Auto-create CUC for geographies on local adaptation 

Missing 

No prototype-level UI for this — no indicator, banner, or auto-create confirmation dialog when local adaptations are created for multiple geographies. 

US-M3-018 

Create Local Variant (CUC) 

Implemented 

Local Variant form has parent Variant search, mandatory multi-select geography picker, optional CUC spec number with simulated PLM validation, Technology 1 & 2, and formulation document upload. 

US-M3-019 

Link Local Variant to PLM, enforce claim readiness 

Partial 

CUC Specification Number field exists with PLM validation feedback. No SKU dropdown populated from PLM, and no enforcement UI when a claim reaches Assessed state (CUC becomes mandatory behaviour absent). 

US-M3-020 

Validate CUC and CU spec numbers against PLM 

Partial 

CUC validation is implemented in CreateProductModal with green tick "Valid" / red cross "Invalid, please check" feedback and save blocking on invalid state. CU spec number validation is not present (no CU creation form exists). 

US-M3-021 

Create CU product (SKU) 

Partial 

CU type is selectable in CreateProductModal. Parent Local Variant search and geography picker are present. SKU dropdown fetched from PLM, recipe fields, and "CU created in PLM?" toggle are all missing. 

Super User / System Stories (US-M3-022 to US-M3-025) 

ID 

Requirement 

Status 

Finding 

US-M3-022 

Super User — create Business Groups 

Missing 

No Super User admin screen, no BG creation form. BGs are hardcoded in types.ts. 

US-M3-023 

Super User — create Categories 

Missing 

No Categories admin screen. Categories are hardcoded as a static lookup in types.ts. 

US-M3-024 

Super User — create Brands 

Missing 

No Brand management screen. Brands are free-text inputs without any admin management. 

US-M3-025 

Hierarchical auto-generated product nomenclature 

Implemented 

handleSave() in CreateProductModal concatenates parentName + levelName to form the final product name. A live preview ("Full product name will be: …") is shown while the user types. System-generated; user only enters the level-specific segment. 

Products Navigation & Home Views (US-M3-026 to US-M3-033) 

ID 

Requirement 

Status 

Finding 

US-M3-026 

Products home from global menu 

Implemented 

Products tab exists in NAV_ITEMS and is wired via handleModuleChange to switch the active module to 'Products', rendering ProductsModule. 

US-M3-027 

Products home — Recent Products 

Implemented 

ProductsLandingPage receives recentIds prop and filters the list to recently viewed products when activeView = 'Recent Products'. Product access is tracked in App.tsx. 

US-M3-028 

Products home — All, Recent, My, Favorite, Saved Views 

Partial 

LeftNavigation shows All Products, Recent Products, My Products, Favorite Products. All four views work. Saved Views entry exists in the nav but is not wired to any saved-views management screen for products. 

US-M3-029 

Save custom product view (Save View As) 

Missing 

No "Save View As" button anywhere in ProductsLandingPage. Column order, visible columns, and filters cannot be persisted as a named view. 

US-M3-030 

Share saved product view 

Missing 

Depends on US-M3-029 which is also missing. No sharing UI exists. 

US-M3-031 

Manage Favorite Products (star toggle) 

Implemented 

Star icon on each row in ProductsLandingPage and ProductHierarchyPage toggles favorite state. Favorites view filters correctly. State is per-user (tracked in App.tsx). 

US-M3-032 

Filtering in any view 

Partial 

Quick-filter dropdowns for Type, Lifecycle, Business Group exist with active filter chips and Clear All. Missing: condition-based filtering (equals / not equals / is blank), filter column selector, and Apply Filters button as specified. 

US-M3-033 

Collapse Products menu in nav panel 

Implemented 

isProductsExpanded state in LeftNavigation collapses/expands the Products sub-menu. Collapse does not affect the table view. State persists during session. 

Products List — Columns & Details (US-M3-034) 

ID 

Requirement 

Status 

Finding 

US-M3-034 

Key product attributes visible in list view 

Partial 

Product Name, Product ID, Product Type, Lifecycle State, No. of Claims, Created By, Created Date are all shown. Parent Product and Child Product columns are absent. No drag-and-drop column reorder and no column visibility config (add/remove columns) in the products table. 

Lifecycle & Governance (US-M3-035 to US-M3-037) 

ID 

Requirement 

Status 

Finding 

US-M3-035 

System-controlled lifecycle states 

Partial 

Lifecycle states (Created, In-use, Obsolete) exist in productData.ts and display correctly. Auto-transition rules (e.g. claim reaching Assessed → product becomes In-use) are not modelled in the prototype; states are static mock values. 

US-M3-036 

Restrict product actions based on lifecycle 

Implemented 

ProductDetailsPage checks isInUse and hides the Edit button for In-use products, showing an "In-use: Read-only" badge instead. The edit mode is unreachable for In-use products. 

US-M3-037 

Mark previous product versions as Obsolete 

Missing 

No "Mark as Obsolete" button, no version-creation workflow, and no obsolete state transition UI anywhere in the product screens. 

Product Details Page (US-M3-038 to US-M3-044) 

ID 

Requirement 

Status 

Finding 

US-M3-038 

Open Product Details page from any list 

Implemented 

Clicking any product row in ProductsLandingPage, ProductHierarchyPage, and LinkedProductsTab in a project navigates to ProductDetailsPage. All attributes shown in read-only mode by default. 

US-M3-039 

Product summary badges and left nav sections 

Partial 

Lifecycle State, Category, Product Type, and Geographies badges appear in the header. Left nav shows all required sections with counts. Clicking Available Parent Claims, Available Child Claims, Related Assets, and Related Regional/Local Adaptations shows no content — no switch case handles these sections. 

US-M3-040 

Related data in tabular format with search/filter 

Partial 

Related Claims is a full table (search, sortable columns). Related Projects renders only a count text — no table, no hyperlink to project details. Audit Log is tabular. Child/Parent Products are card grids (not tables). No search or column config on any section except Related Claims. 

US-M3-041 

Product hierarchy tree on details page 

Implemented 

Product Details section renders the full hierarchy tree (HierarchyTreeNode) with the current product branch highlighted. Expand/collapse on every node. Matches hierarchy behaviour from ProductHierarchyPage. 

US-M3-042 

Product actions dropdown and Prev/Next navigation 

Partial 

Actions dropdown has: Create Child Product, Copy Product, Copy Claims (opens modal ✅), Audit Log (switches section ✅), Cancel Product. "Edit Product" is a separate inline button, not inside the dropdown. "Delete Product" is labelled "Cancel Product". Prev/Next arrows are implemented and functional. 

US-M3-043 

Related Claims, Available Parent Claims, Available Child Claims 

Partial 

Related Claims section is complete with all required columns. Available Parent Claims and Available Child Claims appear in the left nav with counts but have no rendered content — clicking them renders nothing (missing switch cases). 

US-M3-044 

Related Projects section with tabular view 

Partial 

Related Projects section exists and renders. Content is only a count text ("2 projects using this product") with no table, no project name hyperlinks, and no clickable rows navigating to the project. 

Claims Reuse & Inheritance (US-M3-045 to US-M3-046) 

ID 

Requirement 

Status 

Finding 

US-M3-045 

Add claims from parent or child products 

Implemented 

ClaimAssociationModal (opened via "Add Claims" button) has parent/child tabs, multi-select checkboxes, and a confirm button. Default shows parent claims as required. 

US-M3-046 

Control inheritance of reused claims 

Implemented 

ClaimAssociationModal has inheritSubstantiation and inheritStrategy checkbox controls, both defaulting to true. State is tracked and would feed the onCreate call. 

Product Hierarchy Module (US-M3-047 to US-M3-051) 

ID 

Requirement 

Status 

Finding 

US-M3-047 

Product hierarchy — view and navigate 

Implemented 

ProductHierarchyPage shows full tree from Brand down. Selecting a node opens ProductDetailsPage. Expand/collapse at every level. Technology shown in brackets against each product where present. 

US-M3-048 

Product hierarchy — all brands collapsed at landing 

Implemented 

BrandSection components default to collapsed (defaultExpanded=false). All brands listed alphabetically. Recently viewed brands are surfaced with a "Recently Viewed" badge. 

US-M3-049 

Hierarchy — key product details on each node 

Implemented 

Each node shows Product Name, Product Type badge, Lifecycle State badge, and clickable counts for geographies, claims, and projects. Claims and projects counts link to the product detail page. 

US-M3-050 

Hierarchy — contextual product actions per node 

Implemented 

Each node has a hover action menu with Edit Product, Add Child Product, Copy Product, Copy Claims, Audit Log, and Cancel Product. Menu appears on hover and is per-node. 

US-M3-051 

Hierarchy — perform product actions from tree 

Partial 

Action menu UI renders for all options. However all items close the menu without opening any screen — no action is wired (no onCreate, no navigation, no modal open). The hierarchy tree itself re-renders immediately on product data change, but currently no action triggers one. 

Edit, Copy, Cancel, Audit (US-M3-052 to US-M3-057) 

ID 

Requirement 

Status 

Finding 

US-M3-052 

Edit product 

Partial 

Edit button (pencil icon) toggles isEditing state and shows an edit-mode banner with Save Changes / Discard. The attribute cards below do not become editable inputs — no form fields appear in edit mode. Visual affordance only. 

US-M3-053 

Copy an existing product 

Partial 

"Copy Product" exists in the Actions dropdown and hierarchy node menu. Neither opens the CreateProductModal prefilled with source product data. The button closes the menu with no further action. 

US-M3-054 

Copy claims to another product 

Implemented 

CopyClaimsModal has source product display, target product search (live type-ahead), scrollable claim list with Select All / Deselect All, individual checkboxes, substantiation copy checkbox, and a Continue button. 

US-M3-055 

Import claims from another product 

Missing 

No "Import Claims" option exists on ProductDetailsPage or in the hierarchy. Only Copy Claims (source → target) is implemented; the reverse flow (target selects source) is absent. 

US-M3-056 

Cancel product with confirmation modal 

Partial 

"Cancel Product" button is visible in the Actions dropdown and hierarchy node menu. No confirmation modal appears on click — the button closes the menu with no state change or prompt. 

US-M3-057 

Audit log of product 

Partial 

Audit Log section in ProductDetailsPage renders a table with field name, previous value, new value, user, and date columns populated with mock data. Read-only as required. Accessible from Actions dropdown. Not accessible from hierarchy node (action is present but unwired — see US-M3-051). 

Summary — items that still need UI work 

ID 

What to build / fix 

Type 

US-M3-001 

Wire "New Product" in global Create dropdown to open CreateProductModal 

Partial 

US-M3-002 

Wire Add Product and Create Product buttons in LinkedProductsTab 

Partial 

US-M3-003 

Wire "Create Child Product" action to open CreateProductModal with preselected type 

Partial 

US-M3-004 

Add product search + Create option inside claim association flow 

Missing 

US-M3-006 

Build confirmation modal shown before Save, Save & Create, Cancel in CreateProductModal 

Missing 

US-M3-008 

Build advanced search dialog (binoculars) with column/condition/value filters 

Missing 

US-M3-014 

Add Regional Adaptations button + geography picker at Variant level 

Missing 

US-M3-016 

Render bulk Local Variants UI (checkbox, Add Local Variant, geography rows, remove) — state exists but JSX is absent 

Missing 

US-M3-017 

Add auto-CUC creation banner/indicator when local adaptations span multiple geographies 

Missing 

US-M3-019 

Add SKU multi-select populated from PLM after CUC spec number is validated 

Partial 

US-M3-021 

Add SKU dropdown (fetched from PLM), recipe fields, and "CU created in PLM?" toggle to CU form 

Partial 

US-M3-022–024 

Super User admin screens for Business Groups, Categories, Brands 

Missing 

US-M3-028 

Wire "Saved Views" nav item in Products to a saved-views management screen 

Partial 

US-M3-029–030 

Build Save View As + Share View for Products table 

Missing 

US-M3-032 

Upgrade filter to condition-based (equals/not-equals/is blank) with Apply Filters button 

Partial 

US-M3-034 

Add Parent Product and Child Product columns; add column visibility/reorder config to products table 

Partial 

US-M3-037 

Add Mark as Obsolete option in product versioning workflow 

Missing 

US-M3-039 

Add switch cases for Available Parent Claims, Available Child Claims, Related Assets, Related Regional/Local Adaptations sections 

Partial 

US-M3-040 

Upgrade Related Projects to a full table with clickable project name hyperlinks 

Partial 

US-M3-042 

Move Edit Product into Actions dropdown; rename Cancel Product label to match spec 

Partial 

US-M3-051 

Wire all hierarchy node actions (Edit, Add Child, Copy Product, Copy Claims, Audit Log, Cancel) to their handlers 

Partial 

US-M3-052 

Make attribute cards editable inputs when isEditing is true 

Partial 

US-M3-053 

Wire Copy Product to open CreateProductModal prefilled with source product data 

Partial 

US-M3-055 

Add Import Claims option (reverse of Copy Claims — target selects source product) 

Missing 

US-M3-056 

Add confirmation modal before Cancel Product completes 

Partial 

