# Figma Make Prompts — M6, M7 & M13 User Stories
## Claims Management Platform · Unilever Design System

---

## DESIGN SYSTEM REFERENCE (Include in every prompt)

> **Paste this preamble at the top of every Figma Make prompt below:**

```
Design system — Unilever Claims Platform:
- Primary Blue (Sky): #0066CC | Dark Blue: #004D99 | Night (Text): #133062
- Mid Blue: #47A3FF | Light Blue: #85C2FF | Pale Blue: #C2E0FF
- Earth (Page BG): #F6F7F0 | Cloud (White): #FFFFFF | Pebble (Border): #DEDED7
- Water (Accent): #23E7FF
- Font: Inter / system-sans, base 14px, labels 12px, headings 16–18px semibold
- Border radius: 8px (components), 12px (cards/modals), 4px (badges/tags)
- Border: 1px solid #DEDED7
- Modal overlay: rgba(19, 48, 98, 0.45) backdrop
- Button Primary: bg #0066CC, text white, hover #004D99
- Button Secondary: border #0066CC, text #0066CC, bg white
- Button Danger: bg #D4183D, text white
- Input fields: bg white, border #DEDED7, focus border #0066CC, border-radius 8px, height 36px
- Status badges: rounded pill, 4px radius
- iRA badge: bg #E8F4FF, text #0066CC, border #85C2FF
- Risk icons: Low = filled green circle, Medium = filled amber circle, High = filled red circle, Not Allowed = red X cross, Varied = filled blue circle
- Table rows: alternating white / #F6F7F0, header bg #133062 text white
- Section panels: white card with 1px #DEDED7 border, 16px padding, border-radius 12px
- Left nav panel: white, 240px wide, items with active state bg #C2E0FF text #004D99
```

---

---

# MODULE M6 — iRA (Intelligent Risk Assessment)

---

## US-M4-61 · Enable iRA Option for Eligible Claims

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system defined above, design the 3-dot actions menu (MoreVertical icon button) on the Claim Workspace header for TWO states side by side:

STATE 1 — Home Care BG (iRA Eligible):
- Header bar (white, 64px tall, full width) showing:
  - Left: breadcrumb "← Claims" in gray
  - Center: claim title "Moisture Boost Body Lotion – Claims Top-Up" in #133062, 16px semibold
  - Right cluster: lifecycle badge "Proposed" (amber pill), "Mark as Assessed" green button, "Reject" red button, and a 3-dot (⋮) icon button
- 3-dot menu is OPEN, floating below the button as a dropdown card (white, shadow, border-radius 12px, 200px wide):
  - Menu items (14px, #133062, 40px row height, hover bg #F6F7F0):
    - 📋 Duplicate Claim
    - 🌍 Create Adaptation
    - ✏️ Edit Claim Details
    - ▶ Run iRA   ← highlighted with left blue border #0066CC and text #0066CC (ENABLED)
    - 📜 Version History
  - Divider line between standard items and Run iRA
- Small label below "Run iRA" row: "Home Care · AI Risk Assessment" in 11px #47A3FF

STATE 2 — Non-Home Care BG (iRA Hidden):
- Same header, same 3-dot dropdown open
- Menu items: Duplicate Claim, Create Adaptation, Edit Claim Details, Version History
- "Run iRA" item is ABSENT entirely — not greyed out, not shown
- Add a small annotation callout arrow on State 2 explaining: "Hidden for non-Home Care claims"

Layout: place both states side by side with a 40px gap, labelled "BG = Home Care" and "BG = Personal Care / Other" respectively. Show on a #F6F7F0 page background.
```

---

## US-M4-62 · Open iRA Modal from Claim Workspace

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the iRA modal that opens when the user clicks "Run iRA" from the Claim Workspace 3-dot menu.

SCREEN LAYOUT:
- Full page behind: Claim Workspace at 30% opacity (dimmed), with overlay rgba(19,48,98,0.45) backdrop
- Centered modal card: white, border-radius 12px, 640px wide, auto height (estimate ~520px), shadow medium

MODAL STRUCTURE:

1. MODAL HEADER (bg #133062, border-radius 12px 12px 0 0, 64px tall, horizontal padding 24px):
   - Left: icon "🤖" or sparkle icon in white, then text "iRA — Intelligent Risk Assessment" in white 16px semibold
   - Sub-line below title: Claim ID "CLM-2024-00847" in #C2E0FF 12px
   - Right: X close icon button (white, 32px circle hover)

2. CLAIM CONTEXT BANNER (bg #E8F4FF, border 1px #85C2FF, border-radius 8px, 16px margin, 16px padding):
   - Label "Claim Statement" in 11px uppercase #47A3FF
   - Value: "Our advanced moisture formula keeps skin hydrated for up to 48 hours, clinically proven." in 14px #133062 semibold
   - Small badge row: "Home Care" in blue pill, "Proposed" in amber pill, "Global" in gray pill

3. PROCESSING STATE — show a loading skeleton / spinner state:
   - Centered in modal body (200px tall space)
   - Animated spinner (blue #0066CC, 32px)
   - Text "Running iRA analysis…" in 14px #47A3FF
   - Sub-text "Evaluating claim classification, risk level and reasoning…" in 12px #888

4. FOOTER (border-top 1px #DEDED7, 16px padding, flex row right-aligned):
   - "Cancel" button (secondary style)
   - "Save to Claim" button (primary, disabled/greyed while loading)

Show the modal in the loading/processing state as the primary view. Add a small annotation: "Modal is non-navigational — no page refresh occurs".
```

---

## US-M4-63 · Display iRA Results

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the iRA modal in its RESULTS STATE — after the AI has returned structured outputs.

MODAL: 640px wide, white, border-radius 12px. Reuse the same header from US-M4-62 (dark #133062 header with claim context).

MODAL BODY — 3 result sections stacked vertically, each in a card (bg #F6F7F0, border 1px #DEDED7, border-radius 8px, 16px padding, 12px gap between sections):

SECTION 1 — Claim Classification Level (iRA):
- Section label (12px uppercase #888): "CLAIM CLASSIFICATION LEVEL (iRA)"
- Result value row:
  - Large value text: "Moderate" (16px semibold #133062)
  - Confidence badge: rounded pill bg #E8F4FF, text #0066CC, "85% confidence"
  - iRA source badge: pill bg #E8F4FF border #85C2FF text #0066CC small: "iRA"
- Thin progress bar below value (height 4px, border-radius 2px, filled #0066CC at 85%, track #DEDED7)

SECTION 2 — Final Risk Level (iRA):
- Section label: "FINAL RISK LEVEL (iRA)"
- Result value row:
  - Risk icon: filled amber circle (16px) + value text "Medium" (16px semibold #133062)
  - Confidence badge: "78% confidence" in same pill style
  - iRA badge
- Progress bar at 78%

SECTION 3 — Reasons (iRA):
- Section label: "REASONS (iRA)"
- 3 reason rows, each row (border-bottom 1px #DEDED7, 12px padding vertical):
  - Row 1: "Regulatory sensitivity" · confidence bar (4px, 82% filled green) · "82%"
  - Row 2: "Ambiguous wording" · confidence bar (74% filled amber) · "74%"
  - Row 3: "Scientific backing moderate" · confidence bar (69% filled amber) · "69%"
- Each row left-aligned reason text (14px #133062), bar in center, percentage right-aligned (12px #888)

FOOTER:
- "Cancel" button (secondary, left)
- "Save to Claim" button (primary #0066CC, right) with checkmark icon

Below the modal, show a small annotation strip: "Results are shown for review only — not auto-applied until user saves."
```

---

## US-M4-64 · User Actions in iRA Modal

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the iRA modal footer action area and show THREE states as a vertical flow (stacked, connected by arrows):

STATE A — Results Displayed (Default):
- Modal footer (border-top 1px #DEDED7, 16px padding, space-between layout):
  - Left: "Cancel" secondary button (border #DEDED7, text #133062) with label annotation "Closes modal, no data saved"
  - Right: "Save to Claim" primary button (bg #0066CC, white text, checkmark icon)
- No toast visible

STATE B — Cancel Clicked:
- Modal disappears (show faded/ghost of modal)
- Claim Workspace returns to full opacity
- Small annotation bubble: "No changes saved to claim"

STATE C — Save to Claim Clicked:
- Modal footer: "Save to Claim" button shows loading spinner (white, 16px) with text "Saving…"
- After save: modal closes
- Toast notification appears at top-right of screen:
  - Toast card (white, border-radius 8px, border-left 4px solid #22C55E, shadow, 320px wide):
    - Icon: green checkmark circle
    - Title: "iRA Results Saved" (14px semibold #133062)
    - Body: "Claim classification and risk level updated with (iRA) tag." (12px #888)
    - Auto-dismiss bar at bottom (green, animating)

Present all three states in a vertical column with connecting arrows and state labels "Default", "Cancel path", "Save path".
```

---

## US-M4-65 · Map iRA Outputs to Claim Fields

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design a split-screen view showing HOW iRA output fields map to claim workspace sections after saving.

LEFT PANEL (320px wide) — iRA Modal Summary (compact, post-save reference):
- Card labelled "iRA Results Saved" with green top border
- Three rows:
  - "Claim Classification Level" → "Moderate (85%)" with iRA badge
  - "Final Risk Level" → amber circle icon + "Medium (78%)" with iRA badge
  - "Reasons" → 3 small pills: "Regulatory sensitivity", "Ambiguous wording", "Scientific backing moderate" each with small iRA badge
- Large arrow "→ Mapped to Claim Workspace" pointing right

RIGHT PANEL (full width) — Claim Workspace Left Navigation (left panel of claim):
Show two collapsible inline sections on the left panel:

SECTION A — "Support Strategy" (expanded):
- Field: "Claim Classification Level (iRA)" with value "Moderate"
  - iRA badge (blue pill) next to value
  - Original manual field "Claim Classification Level" below it showing "—" (untouched)
- Field: "Reasons (iRA)" as tag list: pill tags "Regulatory sensitivity [iRA]", "Ambiguous wording [iRA]", "Scientific backing moderate [iRA]"
- Manual "Reasons" field below: empty "—"

SECTION B — "Final Risk Summary" (expanded):
- Field: "Final Risk Level (iRA)" with amber circle icon + "Medium"
  - iRA badge (blue pill)
  - Manual field "Final Risk Level" showing previous value "—" (untouched)

Add a legend box (top right, 180px wide card):
- "🔵 (iRA) — AI-generated value" 
- "⚫ Manual — User entered value"
- "Both coexist, manual is not overwritten"

Annotate with dashed arrows from each iRA section back to the field it populates.
```

---

## US-M4-66 · Display iRA-Tagged Fields in Claim Workspace

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Claim Workspace LEFT PANEL sections showing iRA-tagged fields with clear visual distinction.

Show the "Final Risk Summary" section and "Support Strategy" section of the claim's left navigation panel (white card, 280px wide panel, full height):

FINAL RISK SUMMARY SECTION (collapsible, expanded):
- Section header: "Final Risk Summary" (14px semibold #133062) with chevron-down icon
- Field rows (label 11px uppercase #888, value 14px #133062, 36px row height):
  
  Row 1 — Final Risk Level:
  - Label: "FINAL RISK LEVEL"
  - Manual value row: "—" (empty)
  
  Row 2 — Final Risk Level (iRA):
  - Label: "FINAL RISK LEVEL" + iRA badge pill (bg #E8F4FF, border #85C2FF, text #0066CC, 11px: "iRA", with small robot/sparkle icon)
  - Value: amber circle icon (12px) + "Medium"
  - Subtle left border accent: 3px solid #0066CC on this row
  
  Row 3 — Claim Classification Level (iRA):
  - Label: "CLAIM CLASSIFICATION LEVEL" + iRA badge
  - Value: "Moderate"
  - Same left border accent

SUPPORT STRATEGY SECTION (collapsible, expanded):
- Section header: "Support Strategy" with chevron-down

  Reasons field:
  - Label: "REASONS" + iRA badge
  - Value: tag chips in a wrapping row:
    - Chip "Regulatory sensitivity" with [iRA] superscript badge (bg #E8F4FF, small)
    - Chip "Ambiguous wording" with [iRA] badge
    - Chip "Scientific backing moderate" with [iRA] badge
  - Below: empty "Reasons (Manual)" row showing "—"

ADD a callout tooltip (arrow pointing to an iRA badge):
- "Fields tagged (iRA) are AI-generated. Manual values remain separate and editable."

Show a BEFORE/AFTER comparison: Left = panel before iRA save (all fields empty/manual), Right = panel after iRA save (iRA fields populated, manual fields unchanged).
```

---

## US-M4-67 · Ensure iRA Does Not Override Manual Inputs

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design a side-by-side comparison panel showing the NON-OVERRIDE behavior of iRA.

SCENARIO: User had previously entered a manual Final Risk Level of "High" before running iRA. iRA returns "Medium".

Show the Final Risk Summary section of the Claim Workspace left panel in two columns:

COLUMN 1 — BEFORE iRA (manual data entered):
- "Final Risk Level" field: red circle icon + "High" (manually entered, 14px #133062)
- "Final Risk Level (iRA)" field: "—" (empty)
- "Claim Classification Level" field: "Level 3 (NO GO)" (manually entered)
- "Claim Classification Level (iRA)" field: "—"
- Section footer note: "Last edited by Sarah Chen · 2h ago"

COLUMN 2 — AFTER iRA Save:
- "Final Risk Level" field: red circle icon + "High" (UNCHANGED, same manual value)
  - Small tag: "Manual" in gray pill
- "Final Risk Level (iRA)" field: amber circle icon + "Medium"
  - iRA badge (blue pill) + "(iRA)" suffix
  - Left blue border accent 3px #0066CC
- "Claim Classification Level" field: "Level 3 (NO GO)" (UNCHANGED)
  - "Manual" gray tag
- "Claim Classification Level (iRA)" field: "Moderate" with iRA badge
- Section footer: "iRA saved by System · just now"

Add a highlighted callout box between columns (yellow/amber bg #FEF9EE, border #F59E0B):
  Icon: ⚠️ shield
  "Manual values are preserved. iRA values are stored as separate fields. No overwrite occurs."

Use dashed red "X" annotation to show the attempted override that is BLOCKED.
```

---

## US-M4-68 · Restrict iRA Based on Lifecycle

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the 3-dot actions dropdown menu in TWO lifecycle states shown side by side:

STATE 1 — Lifecycle = "Proposed" (iRA ENABLED):
- Claim header bar with lifecycle badge "Proposed" (amber pill)
- 3-dot dropdown open, 200px wide white card:
  - Menu items (40px rows, 14px #133062):
    - Duplicate Claim
    - Create Adaptation
    - Edit Claim Details
    - ─ divider ─
    - ▶ Run iRA  ← ACTIVE: text #0066CC, row has left border 3px #0066CC, bg #F0F7FF on hover
    - Version History
  - Tooltip on hover of Run iRA: "Evaluate this claim with AI risk analysis"

STATE 2 — Lifecycle = "Assessed" (iRA DISABLED / HIDDEN):
- Claim header bar with lifecycle badge "Assessed" (green pill)
- 3-dot dropdown open:
  - Menu items:
    - Duplicate Claim
    - Create Adaptation
    - View History (read-only)
    - ─ divider ─
    - ▶ Run iRA  ← GREYED OUT: text #AAAAAA, cursor not-allowed, opacity 0.4
      - Tooltip below it: "iRA not available for Assessed claims"
  
- Add an annotation badge on State 2: red label "Disabled: Lifecycle = Assessed"
- Add annotation on State 1: green label "Enabled: Lifecycle ≠ Assessed"

Both states on #F6F7F0 background, labels above each column.
```

---

## US-M4-116 · Bulk iRA Run for Claims

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the BULK iRA feature across 3 screens:

SCREEN 1 — Claims Table with Bulk Selection:
- Claims table (full width, white card):
  - Column headers: ☐ checkbox | Claim ID | Claim Statement | BG | Lifecycle | Classification | Risk Level | Actions
  - Header row: bg #133062, text white, 40px tall
  - 5 data rows shown, alternating #FFFFFF / #F6F7F0:
    - Row 1: ✅ checked | CLM-847 | "Moisture Boost formula…" | Home Care | Proposed | — | — | ⋮
    - Row 2: ✅ checked | CLM-848 | "Clinically tested 48hr…" | Home Care | Proposed | — | — | ⋮
    - Row 3: ☐ unchecked | CLM-849 | "Vitamin C brightening…" | Personal Care | Proposed | — | — | ⋮ (greyed row — ineligible BG)
    - Row 4: ✅ checked | CLM-850 | "Zero parabens certified…" | Home Care | Proposed | — | — | ⋮
    - Row 5: ☐ unchecked | CLM-851 | "Dermatologist approved…" | Home Care | Assessed | — | — | ⋮ (greyed — lifecycle locked)
  
  - BULK ACTION BAR above table (appears when rows selected, bg #E8F4FF, border #85C2FF, 48px tall, 16px padding):
    - Left: "3 claims selected"
    - Center: "Run iRA for selected" button (primary #0066CC, white text, sparkle icon)
    - Right: "Clear selection" text link
  
  - Tooltip on row 3: "Not eligible: BG = Personal Care"
  - Tooltip on row 5: "Not eligible: Lifecycle = Assessed"

SCREEN 2 — Bulk iRA Results Modal:
- Modal: white, 800px wide, border-radius 12px
- Header: dark #133062, "Bulk iRA Results — 3 Claims" in white, X close button
- Claim context: "Running iRA for 3 Home Care claims in Proposed stage"
- Results table inside modal:
  - Column headers (bg #F6F7F0): Claim ID | Claim Statement | Classification (iRA) | Confidence | Risk Level (iRA) | Confidence | Reasons (iRA)
  - Row 1: CLM-847 | "Moisture Boost…" | Moderate | 85% | Medium | 78% | "Regulatory sensitivity, Ambiguous wording"
  - Row 2: CLM-848 | "Clinically tested…" | Low | 91% | Low | 88% | "Adequate substantiation"
  - Row 3: CLM-850 | "Zero parabens…" | High | 73% | High | 79% | "Not Allowed - unsubstantiated, Regulatory risk"
  - Each row: Classification shows colored badge (Moderate=amber, Low=green, High=red), Risk Level shows colored circle icon
  - iRA badge on each value cell
- Footer: "Cancel" secondary button | "Save All to Claims" primary button

SCREEN 3 — After Bulk Save (Success State):
- Claim table, all 3 rows now show populated Classification and Risk Level columns with iRA badges
- Toast at top right: "iRA results saved to 3 claims" with green checkmark
Show all 3 screens stacked vertically with connecting arrows and step labels.
```

---
---

# MODULE M7 — RISK EQUALIZER & RISK LEVEL ASSESSMENT

---

## M7-US1 · Pre-populate Context (Channels & Geography)

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Risk Level Assessment modal in its INITIAL LOAD STATE showing pre-populated context fields.

MODAL: 640px wide, white, border-radius 12px, shadow.

HEADER (bg #133062, 56px, border-radius 12px 12px 0 0):
- Left icon: shield/scales icon white
- Title: "Add Risk Level Assessment" in white 16px semibold
- Sub-label: "CLM-2024-00847 · Home Care" in #C2E0FF 12px
- Right: X close button (white circle)

MODAL BODY (24px padding):

SECTION 1 — Assessment Type (auto-mapped):
- Label: "ASSESSMENT TYPE" (11px uppercase #888)
- Dropdown (read-only/auto): showing "Claims Lead Risk Level Assessment"
- Below it: "ASSESSED BY" field — auto-filled: avatar circle (initials "SC", bg #C2E0FF) + "Sarah Chen · Claims Lead" in 14px
- Small tag: "Auto-assigned based on your role" (12px italic #888)

SECTION 2 — Marketing Channels (from claim, pre-loaded):
- Label: "MARKETING CHANNELS" (11px uppercase #888) + tooltip icon (ⓘ "Source: Claim Marketing Channels")
- Channel chip tags (multi-select style, pre-selected):
  - ✅ "Digital / Social" (blue filled chip, bg #C2E0FF, text #004D99, checkmark icon, closeable X)
  - ✅ "TV / Broadcast" (same style)
  - ✅ "In-Store / Print" (same style)
  - ⊘ "Out of Home" (greyed chip, bg #F6F7F0, text #888, no X — cannot add new)
  - ⊘ "E-commerce" (greyed, cannot add)
- Note below: "Deselect allowed · Adding new channels is disabled" (12px #888, with lock icon)

SECTION 3 — Geography (auto-derived):
- Label: "GEOGRAPHY" (11px uppercase #888)
- Show a mini table (3 cols, border 1px #DEDED7, border-radius 8px):
  | Claim Type | Value | Editable |
  | Global Claim | "Global" | 🔒 Non-editable |
  | Regional Claim | "Europe (dropdown)" | ✏️ Dropdown of countries |
  | Local Claim | "Germany" | 🔒 Non-editable |
  - Highlight row "Global Claim" as the active state with bg #E8F4FF
- Active value shown below table: "Geography: Global" in 14px semibold #133062, with 🔒 lock icon

FOOTER:
- "Cancel" secondary button
- "Next: Select Methodology" primary button with arrow icon →
```

---

## M7-US2 · Create Risk Assessment in Modal

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the FULL Risk Level Assessment creation modal (all input fields visible).

MODAL: 640px wide, white, border-radius 12px. 

HEADER: Same dark #133062 header — "Add Risk Level Assessment" + claim context.

MODAL BODY — Scrollable form, 24px padding, sections separated by 1px #DEDED7 dividers:

SECTION A — Assessment Context (pre-filled, collapsed/summary bar, bg #F6F7F0, border-radius 8px, 12px padding):
- Row: "Claims Lead Risk Level Assessment · Sarah Chen · Channels: Digital, TV · Geography: Global"
- "Edit" text link right-aligned

SECTION B — Risk Methodology (radio toggle bar, 56px tall):
- Two options as pill toggle buttons (full-width toggle, border 1px #0066CC, border-radius 8px):
  - [🤖 Auto Risk Equalizer] ← SELECTED (bg #0066CC, text white)
  - [✏️ Manual Risk Entry] (bg white, text #0066CC, border)

SECTION C — Auto Risk Equalizer (visible when Auto selected):
Three dropdown fields in a row (3-col grid, 12px gap):

  Field 1: "PROBABILITY OF GETTING A CHALLENGE" (11px label)
  - Dropdown showing options: Very Low | Low | Medium | High | Very High
  - Currently selected: "Medium" (displayed in dropdown)
  
  Field 2: "PROBABILITY OF LOSING A CHALLENGE" (11px label)
  - Dropdown: Very Low | Low | Medium | High | Very High
  - Currently: "High"
  
  Field 3: "IMPACT TO BUSINESS" (11px label)
  - Dropdown: Low | Medium | High | Critical
  - Currently: "High"

COMPUTED RESULT BAR (bg #FEF3C7, border 1px #F59E0B, border-radius 8px, 16px padding, flex row):
- Left: "RISK LEVEL (AUTO EQUALIZER)"
- Center: large badge "HIGH" (bg #FEE2E2, text #DC2626, border #F87171, 20px semibold)
- Right: filled red circle risk icon (24px)
- Note: "Computed from matrix — cannot save without this value" (12px #888)

SECTION D — Manual Risk Entry (show as collapsed/greyed alternative):
- Single dropdown "Risk Level" (disabled in this state)
- Label: "Switch to Manual mode to enable"

SECTION E — Comments (optional):
- Label: "COMMENTS (optional)" (11px uppercase)
- Textarea (4 rows, placeholder: "Add reasoning or notes for this assessment…", border #DEDED7, border-radius 8px)

FOOTER (border-top 1px #DEDED7, 16px padding):
- "Cancel" secondary button (left)
- "Save Assessment" primary button (right, bg #0066CC) — enabled since all required fields filled
```

---

## M7-US3 · Save Assessment Inline (Modal Stays Open)

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Risk Level Assessment modal IMMEDIATELY AFTER the user clicks "Save Assessment" — showing the inline persistence behavior where the modal remains open.

MODAL: 640px wide, white, border-radius 12px.
HEADER: Same dark header.

MODAL BODY — Split into two zones:

TOP ZONE — Live Summary Table (newly appeared after save):
- Section header: "Saved Assessments" (14px semibold #133062) + badge: "1 entry" (blue pill)
- Table (full width, border 1px #DEDED7, border-radius 8px, overflow hidden):
  - Header row (bg #133062, text white, 36px):
    Function | Assessed By | Risk Level | Geography | Channel | Date & Time
  - Data Row 1 (just saved, bg #E8F4FF left-border 3px #0066CC — "newly added" highlight):
    Claims Lead | Sarah Chen | 🔴 High | Global | Digital, TV | Apr 30, 2026 · 14:32
  - Row shows a subtle fade-in animation state (annotate: "Entry slides in after save")

SEPARATOR: 1px dashed #DEDED7 with center label "Add Another Assessment" (12px #888 pill)

BOTTOM ZONE — Fresh Empty Form (form has RESET after save):
- Assessment Type dropdown: cleared → "Select assessment type…" placeholder
- Assessed By: cleared → placeholder
- All methodology fields reset to empty
- Save button: disabled (grey) until fields filled again
- Small instruction text: "Form resets after each save so you can add multiple assessments" (12px italic #888)

FOOTER:
- "Cancel" secondary button (left) — with tooltip "Saved entries will be discarded if cancelled"
- "Add to Claims" primary button (right, bg #0066CC) — with arrow icon → — tooltip "Commits all saved entries to the claim"

ADD: A small green toast/banner at top of modal (not a separate toast — inline banner, 40px, bg #F0FDF4, border-bottom 1px #BBF7D0):
- ✅ "Assessment saved successfully. You can add another or click 'Add to Claims' to commit."
```

---

## M7-US4 · View Live Summary Table in Modal

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Risk Level Assessment modal showing the LIVE SUMMARY TABLE with multiple saved entries.

MODAL: 640px wide, white. Focus on the table zone.

TABLE SECTION HEADER:
- "Saved Assessments" (14px semibold #133062)
- Badge: "3 entries" (bg #C2E0FF, text #004D99, border-radius 12px, 12px padding)
- Right: "Collapse ∧" text link

SUMMARY TABLE (full width, border 1px #DEDED7, border-radius 8px):
Column headers (bg #133062, white text, 36px, 12px font):
| Function | Assessed By | Risk Level | Geography | Mktg Channel | Comments | Date & Time |

Row 1 (LATEST — highlighted bg #E8F4FF, top of table, left blue border 3px):
| Claims Lead | Sarah Chen | 🔴 HIGH (red circle + red badge) | Global | Digital, TV | "High due to regulatory exposure" | Apr 30, 2026 · 14:35 |
- Small "NEW" badge on this row (green pill)

Row 2:
| Legal | Mark Rivera | 🟡 MEDIUM (amber circle + badge) | Global | All Channels | — | Apr 30, 2026 · 14:28 |

Row 3 (OLDEST at bottom):
| RA | Priya Sharma | 🟢 LOW (green circle + badge) | Europe | TV, Print | "Substantiation adequate" | Apr 30, 2026 · 13:54 |

Row styling: alternating white / #F6F7F0, 44px row height, 12px cell padding, text 13px #133062

TABLE FOOTER (inside table, bg #F6F7F0, 36px):
- "Latest entry shown at top · 3 of 3 entries visible"

ADD annotations:
- Arrow pointing to row 1: "Latest entry appears at top"
- Arrow pointing to table: "Updates instantly on each save — no page refresh"
- Arrow pointing to "3 entries" badge: "Count updates live"
```

---

## M7-US5 · Add Multiple Assessments

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design a STORYBOARD showing the flow of adding multiple assessments in one session.

Show 4 panels arranged in a 2x2 grid (each panel 300px wide, modal at smaller scale):

PANEL 1 — First Assessment (form filled):
- Modal header (small): "Add Risk Level Assessment · CLM-847"
- Form showing: Assessment Type "Claims Lead RLA", Risk via Auto Equalizer, result: HIGH
- Save Assessment button (active, blue)
- Table section: "No entries yet" empty state (gray dashed border, 60px tall)

PANEL 2 — After First Save (form resets):
- Table shows: 1 row — Claims Lead / Sarah Chen / 🔴 HIGH / just now
- Row highlighted in blue
- Form below: RESET — all fields empty/placeholder state
- Success banner: "✅ Saved. Add another assessment or commit to claim."

PANEL 3 — Second Assessment (different function):
- Form now filled with: Assessment Type "Legal Risk Level Assessment", Assessed By "Mark Rivera · Legal", Manual Risk Entry selected, Risk Level "Medium" chosen
- Table still shows first row
- Save Assessment button active

PANEL 4 — Two Entries, Ready to Commit:
- Table shows 2 rows:
  - Row 1 (NEW): Legal / Mark Rivera / 🟡 MEDIUM / just now
  - Row 2: Claims Lead / Sarah Chen / 🔴 HIGH / 5 mins ago
- Form below: empty, reset again
- Footer: "Add to Claims" primary button (blue, active) with annotation "Commits both entries to the claim"
- Entry count badge: "2 entries"

Connect panels with arrows labeled: "User clicks Save →", "Form resets →", "Fill new assessment →", "Save again →"
Show all on #F6F7F0 background with panel labels "Step 1–4".
```

---

## M7-US6 · Final Commit to Claim

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the "Add to Claims" final commit flow in 3 states:

STATE 1 — Modal with "Add to Claims" button ready:
- Modal footer (full width, border-top 1px #DEDED7, 64px tall, space-between):
  - Left: "Cancel" secondary button + small warning tooltip "Unsaved entries will be lost if you cancel"
  - Center: entry count badge "3 assessments ready to commit" (bg #C2E0FF, text #004D99)
  - Right: "Add to Claims →" primary button (bg #0066CC, white, 140px wide, bold)
    - Below button: "This will finalize all saved entries" (10px gray)

STATE 2 — If Modal Closed Without Action (Prompt Dialog):
- Smaller confirmation dialog (320px, centered on top of dimmed modal):
  - Warning icon ⚠️
  - Title: "Leave without saving?" (16px semibold #133062)
  - Body: "You have 3 unsaved assessments. These will not be added to the claim." (14px #666)
  - Buttons: "Keep editing" (secondary, left) | "Discard & Close" (danger red, right)

STATE 3 — After "Add to Claims" Clicked (Success):
- Modal closed
- Claim Workspace left panel — "Risk Level Assessments" inline section now expanded showing:
  - Section header: "Risk Level Assessments" + count badge "3" (blue)
  - Table with 3 rows committed:
    - Claims Lead · Sarah Chen · 🔴 HIGH · Global · Digital, TV
    - Legal · Mark Rivera · 🟡 MEDIUM · Global · All Channels
    - RA · Priya Sharma · 🟢 LOW · Europe · TV, Print
  - Section footer: "Committed Apr 30, 2026 · 14:40"
- Top-right toast: "3 risk assessments added to CLM-847" ✅

Show 3 states vertically with arrows and labels "Ready", "Abandon path", "Success path".
```

---

## M7-US7 · Restrict Channel Editing

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Marketing Channels field inside the Risk Level Assessment modal showing the RESTRICTED EDITING behavior.

Show a focused close-up of just the "Marketing Channels" section of the modal form (full modal width, 240px tall section):

SECTION HEADER (flex row, space-between):
- Left: "MARKETING CHANNELS" label (11px uppercase #888) + ⓘ tooltip icon
- Right: info pill "From claim · read-only additions" (12px, bg #F6F7F0, text #888)

CHANNEL CHIPS AREA (flex wrap, gap 8px, min-height 80px, border 1px #DEDED7, border-radius 8px, 16px padding):
Pre-loaded chips from claim:
- ✅ "Digital / Social" (active chip: bg #C2E0FF, text #004D99, 14px, ✕ button — CAN DESELECT)
- ✅ "TV / Broadcast" (active chip: same style, ✕ button)
- ✅ "In-Store / Print" (active chip, ✕ button)

Greyed out / unavailable chips:
- ⊘ "Out of Home" (bg #F6F7F0, text #AAAAAA, no X, cursor not-allowed, tooltip: "Not on claim")
- ⊘ "E-commerce" (same grey style, tooltip)
- ⊘ "+ Add channel" button (greyed out, locked icon, tooltip: "You can only deselect channels. New channels must be added on the claim.")

VALIDATION NOTE (below chips area, flex row, warning style):
- ⚠️ icon (amber) + "At least one channel must remain selected" (12px #92400E)
- Shows when only 1 chip is left and user hovers the X button (highlight that X in red with tooltip "Cannot remove last channel")

DESELECTED STATE (show alongside — 200px column):
- "TV / Broadcast" chip shown as deselected but still visible:
  - bg #F6F7F0, text #888, line-through styling, no ✕ button, strikethrough
  - Small label: "Deselected" (10px gray pill)
  - Original active chips: only "Digital / Social" + "In-Store / Print" remain active

Add callout annotation: 
- Green arrow to ✕ buttons: "Deselect allowed"
- Red cross to + Add button: "Add new: DISABLED"
```

---

## M7-US8 · Geography Auto-Control

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Geography field in the Risk Level Assessment modal showing 4 claim-type-based STATES in a 2x2 grid.

Each state is a card (280px wide, border 1px #DEDED7, border-radius 12px, 16px padding) showing the Geography section:

CARD 1 — Global Claim:
- Header chip: "Global Claim" (blue pill)
- Geography label (11px uppercase #888)
- Value field (read-only input style, bg #F6F7F0, border 1px #DEDED7, border-radius 8px, 36px):
  - "🌍 Global" with lock icon 🔒 on right
- Below: "Auto-set · Non-editable" (11px gray italic)
- Lock icon annotation: "Derived from claim type"

CARD 2 — Regional Claim:
- Header chip: "Regional Claim" (purple pill)
- Geography label
- Value: Dropdown (active, editable): "Europe" selected from dropdown
  - Dropdown options visible: Europe / Asia Pacific / North America / Latin America / Middle East
- Below the dropdown: secondary multi-select of countries: "Germany, France, Netherlands" (small chips, removable)
- "Select region or mapped countries" (11px gray)
- No lock icon — EDITABLE

CARD 3 — Local Claim:
- Header chip: "Local Claim" (green pill)
- Geography field read-only: "🏳 Germany" with lock icon
- Below: "Derived from local variant product · Non-editable" (11px gray)

CARD 4 — Local Adaptation SKU:
- Header chip: "Local Adaptation SKU" (amber pill)
- Geography field read-only: "🏳 Brazil" with lock icon
- Below: "Derived from local variant · Non-editable" (11px gray)

ADD a reference table BELOW the grid (full width, 3 cols, compact):
| Claim Type | Behavior | Editable |
| Global | Set = Global | 🔒 No |
| Regional | Set = Region + country dropdown | ✅ Yes |
| Local | Set = Country of local variant | 🔒 No |
| Local Adaptation SKU | Set = Country of local variant | 🔒 No |

Place all on #F6F7F0 background, cards in 2×2 grid with gap 16px.
```

---

## M7-US9 · Lock After Assessment

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design a BEFORE/AFTER comparison of the Risk Level Assessments section on the Claim Workspace.

Show two full-width panels stacked vertically with a divider:

PANEL 1 — EDITABLE STATE (Lifecycle = Proposed):
- Section header bar (white card, border 1px #DEDED7, border-radius 12px):
  - Left: "Risk Level Assessments" (16px semibold #133062) + count badge "2"
  - Right: "+ Add Risk Level Assessment" button (bg #0066CC, white, 14px)
  - Lifecycle badge: "Proposed" (amber pill)
- Assessments table (2 rows):
  - Row 1: Claims Lead | Sarah Chen | 🔴 HIGH | Global | with ✏️ edit icon + 🗑️ delete icon in action column
  - Row 2: Legal | Mark Rivera | 🟡 MEDIUM | Global | with ✏️ + 🗑️ icons
- Table footer: "Click edit to modify · Delete to remove"

DIVIDER: Arrow pointing down with label "Claim moves to → Assessed"

PANEL 2 — LOCKED STATE (Lifecycle = Assessed):
- Section header bar:
  - Left: "Risk Level Assessments" + count badge "2"
  - Right: "+ Add Risk Level Assessment" button GREYED OUT (bg #DEDED7, text #888, cursor not-allowed, lock icon added)
  - Lifecycle badge: "Assessed" (green pill) + 🔒 lock badge alongside it (red outline, "Locked")
- Same assessments table (2 rows) but:
  - All rows: read-only styling (slightly lower opacity text)
  - ✏️ edit icon: HIDDEN
  - 🗑️ delete icon: HIDDEN
  - Row replaced with just: data + "View" button (outline style, read-only) on far right
- Table footer: "Read-only — claim is in Assessed stage" (italic, lock icon, #888)
- Overlay hint bar (top of section, 32px, bg #FEF9EE, border-bottom 1px #F59E0B, text #92400E):
  - "🔒 Risk assessments are locked. Rollback lifecycle to edit."

Use annotation arrows on Panel 2 pointing to locked areas.
```

---

## M7-US10 · Validate Inputs

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Risk Level Assessment modal in a VALIDATION ERROR STATE — when the user clicks "Save Assessment" with missing required fields.

MODAL: 640px wide, full form visible.

VALIDATION ERROR BANNER (appears at top of modal body, below header):
- Alert bar (bg #FEE2E2, border 1px #FCA5A5, border-radius 8px, 16px padding, flex row):
  - ❌ icon (red)
  - "Please complete all required fields before saving." (14px #DC2626 semibold)

FORM FIELDS IN ERROR STATE:

Assessment Type dropdown:
- Border: 2px solid #DC2626 (red)
- Below: error message "Assessment type is required" (12px #DC2626, with ❌ icon prefix)
- Field bg: #FEF2F2

Auto Risk Equalizer — 3 fields:
- "Probability of Getting a Challenge": 2px red border + error "Required" (12px red below)
- "Probability of Losing a Challenge": empty, red border + "Required"
- "Impact to Business": empty, red border + "Required"

COMPUTED RESULT (blocked):
- Result bar shows: bg #F6F7F0, text #888: "Risk level cannot be computed — fill all 3 fields above"
- "Cannot save without computed value" note in red

MARKETING CHANNELS (channel deselection edge case):
- Show "At least one channel must remain selected" error (amber, ⚠️ icon) — shown when all chips removed

SAVE BUTTON:
- "Save Assessment" button: DISABLED state (bg #DEDED7, text #888, cursor not-allowed)
- Below button: "Complete required fields to enable save" (11px gray)

FOOTER: 
- Cancel button remains active (secondary)
- Save button greyed/disabled

Show a secondary VALID STATE alongside (right column, 240px) for contrast — all fields filled, no errors, Save button active blue.
```

---
---

# MODULE M13 — FINAL RISK SUMMARY

---

## M13-US1 · View Final Risk Summary

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the "Final Risk Summary" section as it appears in the Claim Workspace LEFT PANEL.

Show the full left panel (280px wide, full height, white, left border 1px #DEDED7) with this section expanded:

LEFT PANEL NAVIGATION:
- Claim title at top (abbreviated): "CLM-847 · Moisture Boost…" (12px, gray)
- Nav items list (each 36px, 12px left padding, icons + labels, active item bg #C2E0FF text #004D99):
  - Claim Details
  - Support Strategy
  - Risk Level Assessments
  - ► Final Risk Summary  ← ACTIVE (blue bg, blue text, bold)
  - Marketing Channels
  - Substantiation
  - Linked Projects

FINAL RISK SUMMARY SECTION (below nav, in main content area — white card, border 1px #DEDED7, border-radius 12px, 24px padding):

Section header (flex, space-between):
- Left: "Final Risk Summary" (18px semibold #133062)
- Right: lifecycle badge "Proposed" (amber pill) + "Edit" pencil icon button (blue)

FIELDS GRID (2-column layout, label 11px uppercase #888, value 14px #133062, 40px row height):

Row 1: FINAL RISK LEVEL | 🟡 Medium (amber circle + text) [+ iRA badge if applicable]
Row 2: CLAIM CLASSIFICATION LEVEL | Level 2 (ASK)
Row 3: REASONS | chip tags: "Regulatory sensitivity", "Ambiguous wording"
Row 4: CLAIMS FORUM SUMMARY | "Claim requires additional legal review before proceeding." (14px, multi-line text)
Row 5: LEGAL SUMMARY | "No current legal challenge identified. Monitor."
Row 6: RA SUMMARY | "Regulatory framework supports claim with caveats."
Row 7: R&D SUMMARY | "Scientific backing at 74% confidence level."
Row 8: MARKETING FEEDBACK | "Marketing aligned pending final risk sign-off."
Row 9: MARKETING RISK SIGNOFF | ✅ Checkbox checked + "Confirmed by: James Liu · Apr 29, 2026"

Section footer (border-top 1px #DEDED7, 40px, flex row):
- Left: "Last edited by Sarah Chen · 1h ago" (12px gray)
- Right: "Save" button (primary, #0066CC)

Show ALSO a READ-ONLY version alongside (same section but lifecycle = "Assessed"):
- All fields without edit icons
- "Edit" button hidden
- Lock icon 🔒 in section header next to "Assessed" badge
- All inputs styled as plain text (no borders)
```

---

## M13-US2 · Set Final Risk Level

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Final Risk Level field in the Final Risk Summary section showing the SELECTION INTERACTION and all picklist options.

Show a focused panel (400px wide card) of just the Final Risk Level field interaction:

FIELD HEADER:
- "FINAL RISK LEVEL" label (11px uppercase #888)
- Sub-label: "Editable by Claims Lead and Legal only" (10px italic #888, lock icon)

PICKLIST DROPDOWN (open state, white dropdown card, 280px wide, border 1px #DEDED7, border-radius 8px, shadow):
Dropdown options (each 44px tall, 16px padding, hover bg #F6F7F0):

Option 1: ●  LOW
- Large filled green circle (16px) + "Low" text (14px #133062)
- Description: "Claim is safe to proceed" (11px #888)
- [Selected state: bg #F0FDF4, border-left 3px green]

Option 2: ● MEDIUM ← CURRENTLY SELECTED
- Amber circle + "Medium" text
- Description: "Proceed with caution"
- [Selected: bg #FEF9EE, border-left 3px amber, checkmark ✓ on right]

Option 3: ● HIGH
- Red circle + "High" text
- Description: "Significant risk — legal/RA review required"
- [Hover state shown]

Option 4: ✕ NOT ALLOWED
- Red X cross icon (16px) + "Not Allowed" text
- Description: "Claim cannot proceed"

Option 5: 🔵 VARIED / CHANNEL DEPENDENT
- Blue filled circle + "Varied / Channel Dependent" text
- Description: "Risk differs by marketing channel"

SELECTED VALUE DISPLAY (above the dropdown, showing current field state):
- Input field (36px, border 1px #0066CC focused, border-radius 8px):
  - Amber circle icon (left) + "Medium" + dropdown chevron (right)

AFTER SELECTION ANIMATION (show alongside, 160px panel):
- Field shows: amber circle + "Medium"
- Risk icon in section header INSTANTLY UPDATES (show arrow annotation: "Icon updates in real time")
- Section header: "Final Risk Summary" + amber circle icon (16px) next to title

Add role restriction note below field:
"⚠️ Only Claims Lead and Legal can modify this field. Other roles see this as read-only."
Show same field in read-only state for a different user (gray border, no dropdown, lock icon).
```

---

## M13-US3 · Auto Display Risk Icon

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design a RISK ICON SYSTEM reference panel showing all 5 risk level states and where the icon appears across the UI.

MAIN REFERENCE CARD (full width, white, border-radius 12px, 24px padding):

Title: "Risk Icon System — Auto-Generated from Risk Level" (16px semibold #133062)
Sub: "Icons are system-controlled and update instantly. Cannot be manually edited."

ICON TABLE (5 rows, each 56px tall, 3 columns):

| Risk Level | Icon | Example Display |
|---|---|---|
| Low | ● (filled green circle, 20px, #22C55E) | "Low" — green circle + "Low" text in green badge |
| Medium | ● (filled amber circle, 20px, #F59E0B) | "Medium" — amber circle + amber badge |
| High | ● (filled red circle, 20px, #DC2626) | "High" — red circle + red badge |
| Not Allowed | ✕ (red X cross, 20px, thick strokes) | "Not Allowed" — red X + red badge |
| Varied / Channel Dependent | ● (filled blue circle, 20px, #0066CC) | "Varied" — blue circle + blue badge |

Each row: left col = icon (centered, 40px wide), middle col = risk level name (14px bold), right col = badge preview (pill badge in matching color).

USAGE CONTEXT PANEL (below table, 3 smaller panels side by side):

Panel A — In Claims Table:
- Mini table row: CLM-847 | … | 🔴 HIGH | Proposed
- Annotation: "Icon in table cell"

Panel B — In Claim Header:
- Mini header bar: "Moisture Boost…" (claim title) | [🟡] Medium | Assessed
- Annotation: "Icon in claim header badge"

Panel C — In Final Risk Summary Section:
- Mini section showing "FINAL RISK LEVEL" label + large ● amber circle + "Medium"
- Annotation: "Icon in left panel section"

SYSTEM RULE CALLOUT (bottom, bg #FEF2F2, border 1px #FCA5A5, border-radius 8px, 16px padding):
"🔒 Icons are fully system-controlled. They cannot be selected, edited, or overridden by any user."
```

---

## M13-US4 · Set Claim Classification

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Claim Classification Level field in the Final Risk Summary section.

Show a FOCUSED FIELD PANEL (360px wide) for the Claim Classification Level:

FIELD LABEL ROW:
- "CLAIM CLASSIFICATION LEVEL" (11px uppercase #888)
- Right: "Claims Lead only" tag (12px, bg #FEF3C7, text #92400E, border-radius 4px, 🔒 icon)

CLASSIFICATION PICKER — 3 option buttons in a row (full-width toggle group):
Each button (flex: 1, 56px tall, border 1px #DEDED7, cursor pointer):

Button 1 — "Level 1 (GO)":
- Top: large "1" numeral (24px, green #22C55E)
- Bottom: "GO" label (12px semibold green)
- Hover/Active state: bg #F0FDF4, border 2px #22C55E
- [Not selected: white bg]

Button 2 — "Level 2 (ASK)":
- Top: "2" numeral (24px, amber #F59E0B)
- Bottom: "ASK" label (amber)
- [SELECTED state]: bg #FEF9EE, border 2px #F59E0B, checkmark top-right corner
- Note: "Requires justification" (10px gray, shows when selected)

Button 3 — "Level 3 (NO GO)":
- Top: "3" numeral (24px, red #DC2626)
- Bottom: "NO GO" label (red)
- Hover: bg #FEF2F2, border 2px red

SELECTED VALUE DISPLAY (below buttons, in a summary row):
- "Classification: Level 2 (ASK)" — amber badge pill (20px, semibold)
- "Mandatory before moving to Assessed" (12px gray, ⚠️ icon)

ROLE RESTRICTION PANEL (below, bg #FEF9EE, border-radius 8px, 16px padding):
Two columns side by side:
- Left: "Claims Lead view" — field is EDITABLE (normal styling, active buttons)
- Right: "Other roles view" — field is READ-ONLY: buttons greyed, cursor not-allowed, gray lock overlay, "Read only — Claims Lead only"

Annotation arrow: "Only Claims Lead can change this value"
```

---

## M13-US5 · Add Reasons

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Reasons multi-select field in the Final Risk Summary section.

Show TWO STATES side by side:

STATE 1 — Risk Level = Medium (Reasons OPTIONAL):
- Field label: "REASONS" (11px uppercase #888) + "(Optional for Medium)" (10px gray italic)
- Multi-select chip area (min-height 80px, border 1px #DEDED7, border-radius 8px, 16px padding, flex wrap):
  - Selected chips (removable, bg #C2E0FF, text #004D99, border none, ✕ icon):
    - "Ambiguous wording ✕"
    - "Consumer perception risk ✕"
  - "+ Add reason" button (dashed border #0066CC, text #0066CC, 14px, border-radius 20px, 8px padding)
- Dropdown (open, 280px wide, white card, shadow) showing picklist options:
  - ○ Regulatory sensitivity
  - ○ Ambiguous wording ← (already selected, checkmark ✓, greyed out)
  - ○ Scientific backing moderate
  - ○ Consumer perception risk ← (already selected, greyed)
  - ○ Market withdrawal risk
  - ○ Competitor challenge
  - ○ Substantiation gap
- Footer: "Select one or more reasons"

STATE 2 — Risk Level = High (Reasons MANDATORY):
- Field label: "REASONS *" (asterisk red, mandatory) + "Required for High & Not Allowed" (10px red ⚠️)
- Chip area: EMPTY (no chips selected yet)
  - Red border 2px on the area
  - Error text below: "At least one reason must be selected for High risk level" (12px #DC2626)
- "+ Add reason" button: red dashed border (mandatory indicator)
- Same dropdown open
- Save button in footer: DISABLED until at least 1 reason selected

ADD: Mandatory logic callout box (between the two states):
"Mandatory conditions:
✅ Required: Risk = High
✅ Required: Risk = Not Allowed
○ Optional: Risk = Low, Medium, Varied"
```

---

## M13-US6 · Add Functional Summaries

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Functional Summaries section of Final Risk Summary showing ROLE-BASED EDITING with 4 summary fields.

SUMMARY FIELDS SECTION (white card, full width):

Section header: "Functional Summaries" (16px semibold #133062) + "Role-based editing" info tag

Show each summary field as a stacked form block (label + textarea, 16px gap between blocks):

FIELD 1 — Claims Forum Summary:
- Label: "CLAIMS FORUM SUMMARY" (11px uppercase #888) + "Claims Lead" owner chip (bg #C2E0FF, text #004D99, 10px)
- Textarea (4 rows, active/editable, border 1px #0066CC focused):
  "Claim reviewed in Claims Forum. Moderate risk identified due to wording precision issues. Recommend Level 2 classification."
- Right side: avatar circle "SC" (bg #C2E0FF, 24px) + "Sarah Chen" (12px) + "Edited 30m ago" (10px gray)

FIELD 2 — Legal Summary:
- Label: "LEGAL SUMMARY" + owner chips: "Legal" (green chip) + "Claims Lead" (blue chip) — "Either can edit"
- Textarea (editable): "No active legal challenge at this time. Framework review pending."
- Avatar: "MR" + "Mark Rivera · Legal"

FIELD 3 — RA Summary:
- Label: "RA SUMMARY" + chips: "RA" (purple chip) + "Claims Lead" (blue)
- Textarea (editable): "Regulatory framework permits claim in EU markets with required caveats."
- Avatar: "PS" + "Priya Sharma · RA"

FIELD 4 — R&D Summary:
- Label: "R&D SUMMARY" + chips: "R&D Users" (teal chip) + "Claims Lead" (blue)
- Textarea (editable): "Scientific evidence supports 48-hour efficacy claim at 74% confidence."
- Avatar: "AK" + "Anika Kumar · R&D"

FIELD 5 — Marketing Feedback:
- Label: "MARKETING FEEDBACK" + chips: "Project Lead" (orange chip) + "Claims Lead" (blue)
- Textarea: "Marketing team aligned. Recommends emphasizing 'clinically tested' qualifier."
- Avatar: "JL" + "James Liu · Project Lead"

RIGHT PANEL (show alongside, 200px wide card):
Role permission summary table:
| Summary Field | Can Edit |
|---|---|
| Claims Forum | Claims Lead |
| Legal | Legal, Claims Lead |
| RA Summary | RA, Claims Lead |
| R&D Summary | R&D Users, Claims Lead |
| Marketing | Project Lead, Claims Lead |

Note at bottom: "Claims Lead has override access to all fields."
Show a "READ-ONLY" state for a field where the current user doesn't have edit access (grayed textarea, no border, cursor default).
```

---

## M13-US7 · Add Marketing Feedback

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Marketing Feedback field in the Final Risk Summary section showing role-based access.

Show TWO COLUMN COMPARISON (each 300px wide):

COLUMN 1 — Project Lead View (CAN EDIT):
- Field label: "MARKETING FEEDBACK" (11px uppercase #888)
- Owner tag: "Project Lead / Claims Lead" (blue chip)
- Textarea (4 rows, active, border 1px #DEDED7, focus border #0066CC, border-radius 8px, 16px padding):
  Current value: "Marketing team is aligned with the risk assessment. Recommend proceeding with 'clinically tested' qualifier prominently featured in all digital channels."
- Character counter bottom-right: "248 / 1000" (10px gray)
- Below textarea: avatar "JL" + "James Liu · Project Lead" + "Last edited: Apr 30, 2026 · 11:30"
- Save inline button (small, secondary style): "Save feedback"

COLUMN 2 — Claims Analyst View (READ-ONLY for this field):
- Same field label
- Same owner tag shown for context
- Textarea: DISABLED state (bg #F6F7F0, border 1px #DEDED7, no cursor, slightly dimmed text)
  Same content shown as plain read-only text
- Lock overlay badge top-right of textarea: 🔒 "Read only" (gray, 11px)
- Below: "Editable by Project Lead and Claims Lead only" (11px gray, lock icon)
- No save button shown

ADD: A small tooltip visible on Column 2's lock badge:
"You need Project Lead or Claims Lead role to edit Marketing Feedback."

Show on a white page, column labels: "Project Lead · Claims Lead" / "Other Roles (Read only)".
```

---

## M13-US8 · Provide Marketing Signoff

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the Marketing Risk Signoff field showing all interaction states.

Show a SIGNOFF FIELD PANEL (full width, 400px tall) with 3 states in sequence:

STATE 1 — Unsigned (Default):
- Field label: "MARKETING RISK SIGNOFF" (11px uppercase #888)
- Role tag: "Project Lead / Claims Lead" (blue chip)
- Checkbox area (48px tall, border 1px #DEDED7, border-radius 8px, 16px padding, flex row, space-between):
  - Left: Large checkbox (20px, unchecked/empty, border #DEDED7) + "I confirm marketing alignment and accept the final risk level" (14px #133062)
  - Right: "Project Lead or Claims Lead sign-off required" (12px #888 italic)
- Status badge below: "⭕ Awaiting signoff" (gray, outline pill)

STATE 2 — Signed (Checked):
- Checkbox: ✅ checked (bg #0066CC, white checkmark, border #0066CC)
- Checkbox text: same, but text color turns #0066CC (matches checked color)
- Status badge: "✅ Signed off" (bg #F0FDF4, text #16A34A, border #BBF7D0, green pill)
- Signature details row (bg #F0FDF4, border-radius 8px, 12px padding):
  - Avatar "JL" (green bg) + "James Liu · Project Lead" + "Signed: Apr 30, 2026 · 14:47"
  - Right: "Remove signoff" text link (small, red, for Project Lead / Claims Lead only)

STATE 3 — Read-Only (other roles):
- Checkbox: checked but grayed/disabled (bg #F6F7F0, gray checkmark, border #DEDED7)
- "Signed off by James Liu · Apr 30, 2026" (12px gray, read-only label)
- Lock icon 🔒 in top-right of area
- No "Remove signoff" link visible

ROLE RESTRICTION BAR (below all states, full width, bg #FEF3C7, border-radius 8px, 16px padding):
- "⚠️ Only Project Lead and Claims Lead can check or uncheck this signoff."

Show all 3 states vertically with labels "Unsigned", "Signed", "Other role (read-only)".
```

---

## M13-US9 · Save Final Risk Summary

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the SAVE FLOW for the Final Risk Summary section showing validation and success.

Show 4 states as a vertical flow with arrows:

STATE 1 — Ready to Save (all fields filled):
- Final Risk Summary section (white card, full width):
  - All fields populated: Risk Level "High", Classification "Level 3 (NO GO)", Reasons 2 chips, all summaries filled, Signoff checked
  - Section footer (border-top 1px #DEDED7, 56px, flex row):
    - Left: "Last autosave: 5 min ago" (12px gray, cloud icon)
    - Right: "Save" primary button (bg #0066CC, white, 120px wide, "💾 Save" with save icon)
  - No validation errors visible

STATE 2 — Saving (button clicked):
- "Save" button: loading state (bg #004D99, white spinner 16px, text "Saving…")
- Section fields: subtle pulse/loading opacity 0.7
- Saving indicator: small banner below header "Saving changes…" (bg #E8F4FF, text #0066CC, thin bar)

STATE 3 — Validation Error (missing required field):
- "Final Risk Level" field: red border 2px + error below: "Final Risk Level is required before saving" (12px red)
- "Claim Classification Level" field: red border + error
- Error banner at top of section (bg #FEE2E2, border #FCA5A5, border-radius 8px):
  "❌ Complete all required fields: Final Risk Level, Claim Classification Level"
- "Save" button: disabled (gray)

STATE 4 — Saved Successfully:
- Top-right toast notification (white card, border-left 4px #22C55E, shadow, 320px):
  - "✅ Final Risk Summary saved" (14px semibold)
  - "Data persisted · Audit trail updated · Apr 30, 2026 · 14:52" (12px gray)
  - Auto-dismiss timer bar (green, shrinking)
- Section: normal state, all fields unchanged
- Audit trail entry added at bottom of section (small, collapsible):
  "📋 Changed by Sarah Chen · Apr 30, 2026 · 14:52 · Fields: Final Risk Level, Reasons"

Show all 4 states vertically, connected with arrows labeled "User clicks Save →", "Validation fails →", "Validation passes → Saving →", "Saved ✅"
```

---

## M13-US10 · Lock After Assessment

**Figma Make Prompt:**

```
Using the Unilever Claims Platform design system, design the COMPLETE Final Risk Summary section in its LOCKED / READ-ONLY state after claim moves to "Assessed" lifecycle.

Show the full section card (white, border-radius 12px, 24px padding) in locked state:

SECTION HEADER (flex row, space-between):
- Left: "Final Risk Summary" (18px semibold #133062) + "Assessed" badge (bg #F0FDF4, text #16A34A, green pill, 12px)
- Right: 🔒 "Locked" badge (bg #FEF2F2, text #DC2626, border 1px #FCA5A5, border-radius 4px, 11px) — NO edit button

LOCK NOTICE BAR (full width, bg #FEF3C7, border 1px #F59E0B, border-radius 8px, 12px padding, below header):
- ⚠️ icon + "This section is locked. The claim has been moved to Assessed stage. To make changes, roll back the lifecycle." (13px #92400E)
- "Learn about lifecycle rollback →" text link (12px #0066CC)

ALL FIELDS (read-only styling — no borders, no edit icons, plain text display):
Field rows (label 10px uppercase #888, value 14px #133062):
- FINAL RISK LEVEL | ● High (red circle icon) | NO edit icon
- CLAIM CLASSIFICATION LEVEL | Level 3 (NO GO) | NO edit
- REASONS | Chip tags: "Regulatory sensitivity", "Ambiguous wording" — chips have no ✕ remove button, no hover state
- CLAIMS FORUM SUMMARY | "Claim requires additional legal review…" (plain text, no textarea border)
- LEGAL SUMMARY | Plain text
- RA SUMMARY | Plain text
- R&D SUMMARY | Plain text
- MARKETING FEEDBACK | Plain text
- MARKETING RISK SIGNOFF | ✅ checked checkbox (disabled, no interaction) + "Signed by James Liu · Apr 29, 2026"

Each text area: bg #F6F7F0 (muted), no border, border-radius 8px, cursor default (not text cursor)

SECTION FOOTER:
- "Locked on: Apr 30, 2026 · 15:00 · When claim moved to Assessed" (12px gray, lock icon)
- NO save button — footer only shows audit info
- "View audit trail →" text link (12px #0066CC)

Add small annotation callouts:
- Arrow to checked signoff: "Cannot uncheck — locked"  
- Arrow to risk level: "Read-only — no dropdown"
- Arrow to reasons chips: "Cannot remove — locked"

Show a COMPARISON STRIP at bottom (small, 2-col, 200px each):
- "Before Assessed" column: pencil icons visible, borders active, Save button shown
- "After Assessed" column: everything locked, no edit controls, no Save button
```

---

---

## MASTER SCREEN FLOW DIAGRAM

**Figma Make Prompt (Final — Full Journey Map):**

```
Using the Unilever Claims Platform design system, design a SCREEN FLOW MAP connecting M6, M7, and M13 as a user journey.

Show a horizontal flow (left to right) with 3 swim lanes:

SWIM LANE 1 — M6: iRA Execution:
Screens (small thumbnails, 160px wide each, connected by arrows):
1. Claim Workspace → 3-dot menu → Run iRA
2. iRA Modal opens (loading)
3. iRA Modal results (Classification + Risk + Reasons + confidence %)
4. User clicks "Save to Claim"
5. Fields updated with (iRA) tags in left panel

SWIM LANE 2 — M7: Risk Level Assessment:
1. Claim left panel → "+ Add Risk Level Assessment"
2. Modal opens with pre-populated context
3. User fills form (Auto Equalizer or Manual)
4. Saved — table updates inline
5. Multiple assessments added
6. "Add to Claims" → committed to claim

SWIM LANE 3 — M13: Final Risk Summary:
1. Left panel → Final Risk Summary section
2. Claims Lead sets Final Risk Level (icon auto-updates)
3. Classification + Reasons selected
4. Functional summaries filled by respective roles
5. Marketing Signoff checked
6. Save → lifecycle becomes eligible for "Assessed"
7. Mark as Assessed → all sections lock

CONNECTIONS between lanes:
- Arrow from M6 (iRA saved) → M13: "iRA populates Initial Risk & Classification (iRA fields)"
- Arrow from M7 (assessments committed) → M13: "Risk Assessment inputs inform Final Risk Level decision"
- Arrow from M13 (Save complete, required fields met) → Claim Header: "Enables 'Mark as Assessed' lifecycle transition"

Design as a clean flowchart on #F6F7F0 background, with lane headers (blue #0066CC labels), thumbnail screens connected by arrows, and dotted lines for cross-lane dependencies.
```