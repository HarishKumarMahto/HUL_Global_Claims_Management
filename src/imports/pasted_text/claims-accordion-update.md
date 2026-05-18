This is a follow-up change to the inline expanded claim workbench we built in the previous prompt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHANGE: Replace horizontal tabs with vertical accordion sections
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WHAT TO CHANGE:
In ClaimsTable.tsx, inside the inline expanded workbench panel (the full-width area
that renders below an expanded claim row), replace the current 3-tab horizontal
layout with a vertical stacked accordion layout.

WHAT TO KEEP UNCHANGED:
- The sticky context header (Claim Name, Version, Lifecycle Status, Product Name,
  Final Risk Level) stays exactly as-is above the sections.
- All field content, edit behavior, save logic, and role restrictions are unchanged.
- Everything else in the app is unchanged.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NEW LAYOUT — Vertical Accordion Sections
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Replace the tab strip and tab panels with this structure:

<div className="divide-y divide-pebble">
  <AccordionSection ... />  {/* Support Strategy & Substantiation */}
  <AccordionSection ... />  {/* Final Risk Summary */}
  <AccordionSection ... />  {/* Risk Level Assessments */}
</div>

Each AccordionSection has TWO states: collapsed (summary row) and expanded (full detail).
Only one section can be expanded at a time. Expanding one collapses the others.
All three start collapsed by default.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACCORDION SECTION STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Each section renders like this:

┌─────────────────────────────────────────────────────────────────────────────┐
│  ▶  Support Strategy & Substantiation    [summary chips]      ⌄ chevron    │  ← COLLAPSED ROW (always visible)
└─────────────────────────────────────────────────────────────────────────────┘
     ↓ on click, chevron rotates 180°, full detail expands below
┌─────────────────────────────────────────────────────────────────────────────┐
│  [full editable content area]                                               │  ← EXPANDED DETAIL
└─────────────────────────────────────────────────────────────────────────────┘

COLLAPSED ROW styling:
  - height: h-12 (48px), bg-white, px-6
  - flex items-center gap-4
  - Left: section icon (lucide) + section label (text-sm font-medium text-night)
  - Middle: 2–3 summary chips (read-only, compact, described per section below)
  - Right: ChevronDown icon (w-4 h-4 text-gray-400), rotates to ChevronUp when expanded
  - Hover state: bg-earth cursor-pointer
  - Entire row is clickable (toggle expand/collapse)

EXPANDED DETAIL styling:
  - bg-earth/40 (slightly tinted background to visually separate from row)
  - border-t border-pebble
  - px-6 py-4
  - max-h-72, overflow-y-auto (scrollable if content is tall)
  - Renders the SAME content that was previously inside the tab panel

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1: Support Strategy & Substantiation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Icon: FileText (lucide)
Label: "Support Strategy & Substantiation"

SUMMARY CHIPS (shown in collapsed row, middle area):
  Chip 1 — Support Strategy status:
    If claim.supportStrategy is non-empty:
      green chip: ✓ "Strategy defined"
    Else:
      gray chip: "No strategy"
  Chip 2 — Substantiation docs:
    If claim.substantiationDocs.length > 0:
      blue chip: "{n} doc{s} attached"
      If any doc has no classification: amber chip: "⚠ {n} unclassified"
    Else:
      gray chip: "No documents"

EXPANDED DETAIL CONTENT (unchanged from before):
  - Support Strategy: textarea (rich text, editable, inline auto-save on blur)
  - Claim Classification Level: select dropdown
  - Reasons: text input
  - Substantiation Evidence Documents:
      File list table: filename | classification dropdown | uploaded by | date | remove
      [+ Upload Document] button
  - [Save] button (bg-sky text-white)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2: Final Risk Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Icon: Shield (lucide)
Label: "Final Risk Summary"

SUMMARY CHIPS (shown in collapsed row):
  Chip 1 — Final Risk Level:
    If claim.finalRiskLevel is set:
      Colored chip using RISK_LEVEL_COLORS: e.g. amber chip "Medium"
    Else:
      gray chip: "Risk not set"
  Chip 2 — Classification Level:
    If claim.finalRiskSummary.claimClassificationLevel is set:
      blue chip: "{classificationLevel}"
    Else:
      gray chip: "Not classified"
  Chip 3 — Marketing signoff:
    If claim.finalRiskSummary.marketingRiskSignoff === true:
      green chip: ✓ "Mktg signed off"
    Else:
      gray chip: "Mktg pending"

EXPANDED DETAIL CONTENT (unchanged from before):
  Two-column grid (gap-4):
    Left column:
      - Final Risk Level: select from ['Low','Medium','High','Very High']
      - Claim Classification Level: select from CLASSIFICATION_LEVELS
      - Reason: text input
      - iRA Output: textarea (shown only if iRAOutput is set)
    Right column:
      - Claims Forum Summary: textarea
      - Legal Summary: textarea
      - RA Summary: textarea
      - R&D Summary: textarea
      - Marketing Feedback: textarea
      - Marketing Risk Signoff: checkbox
  If inheritance trace exists: show info banner above grid:
    "ℹ Inherited from {parentClaimId}" — bg-pale text-sky text-xs px-3 py-2 rounded-lg
  [Save] button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3: Risk Level Assessments
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Icon: Scale (lucide) — or use ClipboardList if Scale not available
Label: "Risk Level Assessments"

SUMMARY CHIPS (shown in collapsed row):
  Chip 1 — Record count:
    If claim.riskAssessments.length > 0:
      blue chip: "{n} assessment{s}"
    Else:
      gray chip: "No assessments"
  Chip 2 — Functions covered:
    Derive unique list of functionDept values from all records.
    If any: gray chip showing them joined: e.g. "R&D · Legal"
    Else: nothing
  Chip 3 — Latest entry date:
    If records exist: gray chip "Last: {most recent dateTime formatted as M/D/YYYY}"

EXPANDED DETAIL CONTENT (unchanged from before):
  Table with sticky header row:
    Columns: FUNCTION | ASSESSED BY | RISK LEVEL | COMMENTS | GEOGRAPHY | DATE
    Column widths: 100 | 160 | 110 | flex-1 | 120 | 100
    Header: text-xs uppercase text-gray-500 bg-earth border-b border-pebble

  Each record row (border-b border-pebble py-2.5 px-4 text-sm):
    - Function: text-night font-medium
    - Assessed By: text-gray-600
    - Risk Level: colored chip using RISK_LEVEL_COLORS (small, rounded-full)
    - Comments: text-gray-600 truncate (full text on hover via title attribute)
    - Geography: text-gray-500 (show "—" if empty)
    - Date: text-gray-400
    - If record.source === 'Parent': show small "From parent" badge (bg-earth text-gray-400 text-xs)

  [+ Add Assessment] button below table:
    bg-sky text-white px-3 py-1.5 text-sm rounded-lg
    Clicking adds a new EDITABLE inline row at the bottom of the table:
      - Function: auto-populated from user role (R&D / RA / Legal), read-only
      - Assessed By: auto-populated from logged-in user name, read-only
      - Risk Level: select dropdown (required)
      - Comments: text input (required)
      - Geography: text input (optional for Global, mandatory for others)
      - Date & Time: auto-populated, read-only
      - Actions: [✓ Save row] [✗ Cancel row] inline icon buttons

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY CHIP COMPONENT (reusable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a small reusable SummaryChip component:

function SummaryChip({
  label,
  variant = 'gray'
}: {
  label: string;
  variant?: 'gray' | 'green' | 'blue' | 'amber' | 'red';
}) {
  const styles = {
    gray:  'bg-earth text-gray-500 border border-pebble',
    green: 'bg-green-50 text-green-700 border border-green-200',
    blue:  'bg-pale text-sky border border-sky/20',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    red:   'bg-red-50 text-red-600 border border-red-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${styles[variant]}`}>
      {label}
    </span>
  );
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEHAVIOR RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Only one section expanded at a time. Clicking an already-open section collapses it.
2. The activeWorkView prop from the left panel (Support Strategy & Substantiation /
   Risk Level Assessments / Final Risk Summary) should auto-expand the matching
   section when the row first opens — same logic as before, just applied to accordion
   instead of tabs.
3. Unsaved changes warning: if a section has unsaved changes and the user clicks
   a different section to expand it, show a small inline warning banner inside the
   currently-open section:
   "You have unsaved changes. [Save now] [Discard & continue]"
   Do NOT use a modal for this — inline banner only.
4. ChevronDown icon rotates 180deg (transition-transform duration-200) when expanded.
5. The entire collapsed row height stays h-12 regardless of chip count — chips wrap
   with overflow-x-auto if too many, never push the row taller.
6. Section labels are left-aligned. Chips are left-aligned in the middle flex area.
   Chevron is always pinned to the far right (ml-auto).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DO NOT CHANGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- The sticky context header above the sections (Claim Name, Version, Status, Product,
  Risk Level) — leave exactly as-is.
- All field content, validation logic, save handlers, role-based editability rules.
- ClaimWorkspace.tsx (full page view) — this change only affects the INLINE expanded
  workbench inside ClaimsTable.tsx.
- Every other file in the codebase.