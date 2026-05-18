Continue the existing Claims Management design by adding **Module 3 – Products Hierarchy Management** using the same Unilever enterprise design system, typography, spacing, colors, shadows, radius, and component behavior already established in previous modules.

Create a complete responsive desktop-first Figma prototype for this module with modern premium corporate UX, highly polished interactions, and production-ready layout consistency.

## OVERALL DESIGN GOAL

Build a sophisticated **Product Master Management workspace** that allows users to create, manage, navigate, and govern products across hierarchy levels:

Brand → Format → Subrange → Variant → Local Variant (CUC) → CU (SKU)

Technology exists as contextual metadata, not hierarchy level.

Maintain consistency with previously created Claims Management modules.

---

## SCREENS TO ADD

## 1. PRODUCTS LANDING PAGE

Create a powerful data workspace page.

### Header Section

* Title: Products
* Subtitle: Manage enterprise product hierarchy and master data
* Global search bar
* Create Product primary CTA button
* Export button
* View selector dropdown

### Left Navigation Panel

Accordion style:

* Recent Products
* My Products
* Favorite Products
* Saved Views
* Product Hierarchy

### Main Grid/Table

Columns:

* Product Name
* Product ID
* Product Type
* Lifecycle State
* Parent Product
* Child Count
* Claims Count
* Projects Count
* Created By
* Created Date

Features:

* Sorting
* Column filter chips
* Rearrange columns
* Sticky header
* Row hover state
* Star icon favorite toggle
* Row click opens Product Details

### Lifecycle Badge Colors

* Created = light blue
* In-use = green
* Obsolete = grey
* Cancelled = red

---

## 2. CREATE PRODUCT FLOW (MULTI STEP MODAL / PAGE)

Create premium form wizard with progress stepper.

### Step 1: Select Product Type

Cards for:

* Technology
* Format
* Subrange
* Variant
* Local Variant (CUC)
* CU (SKU)

### Step 2: Product Details Form

Dynamic fields based on type.

Examples:

#### Technology

* Technology Name
* Business Group multi-select
* Category multi-select
* Attach Formulation Document

#### Variant

* Parent Format/Subrange search
* Variant Name
* Description
* Technology 1 / Technology 2
* Consumer Benefit Platform
* Tier
* Target Audience

#### Local Variant

* Parent Variant search
* Geography multi-select
* CUC Spec Number
* SKU list from PLM

#### CU

* Parent Local Variant
* Geography
* SKU Dropdown
* Recipe Notes

### Footer Actions

* Cancel
* Save Draft
* Save
* Save & Create Another

---

## 3. PRODUCT DETAILS PAGE

Create enterprise detail workspace.

### Header

* Product Name
* Product ID chip
* Favorite star
* Action dropdown
* Previous / Next arrows

### Summary Badges

* Lifecycle
* Category
* Product Type
* Geography
* Claims Count

### Left Context Navigation

Sections:

* Product Details
* Parent Products
* Available Parent Claims
* Child Products
* Available Child Claims
* Related Claims
* Related Assets
* Related Regional / Local Adaptations
* Related Projects
* Audit Log

### Main Content Area

Default tab:

#### Product Attributes Card Grid

Well spaced label/value cards

#### Hierarchy Tree Below

Current branch highlighted.

---

## 4. PRODUCT HIERARCHY PAGE

Create visually stunning tree explorer page.

### Layout

Split screen:

#### Left Panel

Search hierarchy
Filter by Brand / Category / Lifecycle

#### Main Tree Area

Collapsible node tree:

Brand
└── Format
  └── Subrange
    └── Variant
      └── Local Variant
        └── CU

### Node Design

Each node card shows:

* Product Name
* Product Type badge
* Lifecycle badge
* Claims count
* Projects count
* Geography count
* Hover quick actions menu

Current selected node highlighted with blue glow.

---

## 5. CLAIM ASSOCIATION MODAL

Used from product details.

### Two Panel Modal

Left = Available Parent/Child Claims
Right = Selected Claims

Each row:

* Checkbox
* Claim text
* Lifecycle badge
* Risk icon
* Support strategy

Bottom options:

* Inherit Substantiation
* Inherit Support Strategy

Buttons:

* Cancel
* Add Claims

---

## 6. COPY PRODUCT / COPY CLAIMS MODAL

### Copy Product

Prefill all values except product name.

### Copy Claims

Source Product vs Target Product top compare layout.

Claims selection table:

* Select all
* Search
* Filter
* Continue

---

## 7. AUDIT LOG PAGE / DRAWER

Timeline + table hybrid design.

Columns:

* Field Name
* Old Value
* New Value
* Changed By
* Date Time

Filters:

* User
* Date Range
* Field

---

## COMPONENT DESIGN SYSTEM

Use same existing theme:

* Clean white surfaces
* Light blue greys background
* Navy text
* Unilever blue accents
* Soft shadows
* Rounded corners 12px
* Premium spacing system
* Professional enterprise typography

### Buttons

Primary = Blue filled
Secondary = White outlined
Danger = Red outlined

### Inputs

Modern enterprise style with subtle borders, hover, focus glow.

---

## MICRO INTERACTIONS

Include prototypes:

* Row click → details page
* Create button opens wizard
* Expand hierarchy nodes
* Hover actions appear
* Filters animate open
* Modal transitions smooth
* Success toast after save

---

## RESPONSIVE FRAMES

Create:

* 1440 desktop primary
* 1280 laptop
* Tablet adaptive version

---

## FIGMA ORGANIZATION

Pages:

1. Products Landing
2. Product Create
3. Product Details
4. Hierarchy Explorer
5. Modals
6. Components

Use Auto Layout everywhere.
Use reusable components and variants.
Use constraints properly.

---

## VISUAL QUALITY TARGET

Make it look like a real Fortune 500 SaaS product (Salesforce + SAP + Microsoft quality), not template-like.

Use realistic sample data and polished spacing.

Ensure consistency with previously created Claims Management module designs.
