Restyle the entire application UI to match the Unilever Brand Guidelines (May 2025) — visual look and feel only. Do not change any functionality, routing, data, or component logic.
 
━━━ COLOUR TOKENS ━━━
 
Replace all existing colour values with the following Unilever primary palette:
 
  --brand-sky:        #0066CC   (Primary — was 'sky' in current code)
  --brand-sky-mid:    #47A3FF   (Hover / secondary actions)
  --brand-sky-light:  #85C2FF   (Sky Light — selected states, chips)
  --brand-sky-pale:   #C2E0FF   (Sky Pale — table row hover, info bg)
  --brand-night:      #133062   (Dark navy — nav bar, sidebar, headings)
  --brand-dark:       #004D99   (Sky Dark — active nav, pressed CTAs)
  --brand-earth:      #F6F7F0   (Warm off-white — page background)
  --brand-cloud:      #FFFFFF   (White — card, modal, table surface)
  --brand-pebble:     #DEDED7   (Cool grey — borders, dividers)
  --brand-water:      #23E7FF   (Cyan accent — progress, highlights)
  --brand-night-text: #133062   (Body text on light bg)
 
Highlight accents (use sparingly for status/tags only):
  --brand-lilac:      #8652DF
  --brand-aqua:       #008090
  --brand-clover:     #2B911C
  --brand-sorbet:     #DA5700
  --brand-rose:       #E13591
 
━━━ BACKGROUND & SURFACE ━━━
 
  Page / app shell background → --brand-earth (#F6F7F0)
  Top navigation bar → --brand-night (#133062) with white text and icons
  Left / side navigation → --brand-night (#133062), active item highlight → --brand-sky (#0066CC) left border + --brand-sky-pale (#C2E0FF) bg
  Section / module header bar → --brand-sky (#0066CC) with white text
  Cards and panels → --brand-cloud (#FFFFFF) surface, 1px --brand-pebble (#DEDED7) border, 8px border-radius
  Table header row → --brand-earth (#F6F7F0) background, --brand-night-text text, 0.5px --brand-pebble bottom border
  Table row hover → --brand-sky-pale (#C2E0FF) background
  Table selected row → --brand-sky-light (#85C2FF) background at 30% opacity
  Modal overlay → rgba(19, 48, 98, 0.45) — based on --brand-night
  Sidebar expanded row / drawer → --brand-earth (#F6F7F0)
 
━━━ TYPOGRAPHY ━━━
 
  Primary font: "Unilever Desire", then fallback to "Inter", "Helvetica Neue", sans-serif
  Body text: 14px, weight 400, colour --brand-night-text (#133062)
  Page headings (h1): 22px, weight 700, --brand-night
  Section headings (h2): 18px, weight 700, --brand-night
  Sub-headings / labels: 13px, weight 600, --brand-night
  Muted / secondary text: #6B7589
  Table cell text: 13px, weight 400, #133062
  Link text: --brand-sky (#0066CC), no underline by default, underline on hover
  All headings and body copy: left-aligned
 
━━━ INTERACTIVE ELEMENTS ━━━
 
Primary button:
  Background → --brand-sky (#0066CC)
  Text → white
  Hover → --brand-dark (#004D99)
  Border-radius → 8px
  Height → 36px
  Font → 13px, weight 600
 
Secondary / ghost button:
  Background → transparent
  Border → 1px --brand-sky
  Text → --brand-sky
  Hover → --brand-sky-pale background
 
Destructive button:
  Background → #CC2200
  Text → white
 
Disabled state (all buttons):
  Opacity → 0.4, cursor not-allowed
 
Input fields, selects, textareas:
  Border → 1px --brand-pebble (#DEDED7)
  Background → --brand-cloud (#FFFFFF)
  Focus ring → 2px --brand-sky (#0066CC)
  Border-radius → 6px
  Height → 36px (inputs and selects)
  Text → --brand-night-text
 
Checkboxes and radio buttons:
  Checked fill → --brand-sky (#0066CC)
  Border → --brand-pebble
 
Toggles (on state):
  Background → --brand-sky (#0066CC)
 
Tabs (active):
  Bottom border → 2px --brand-sky, text --brand-sky, weight 600
  Inactive: text #6B7589
 
━━━ STATUS / LIFECYCLE PILLS ━━━
 
All pills: border-radius 999px, font-size 11px, font-weight 600, NO gradient
 
  Proposed / Draft:       bg #E8EFF8, text #133062
  Assessed / Approved:    bg #E6F4EC, text #1A6B35
  In Progress / Active:   bg #E6F1FF, text #0066CC
  Challenged / Warning:   bg #FFF4E0, text #8A5A00
  Rejected / Error:       bg #FDECEA, text #CC2200
  Withdrawn / Inactive:   bg #F0F0EC, text #6B7589
  Obsolete / Expired:     bg #EDEDED, text #999999
 
Remove all gradient fills from pills and lifecycle badges — use flat fills only.
 
━━━ NAVIGATION ━━━
 
Top nav bar:
  Background → --brand-night (#133062)
  Height → 56px
  Logo / wordmark area → white "Unilever" wordmark or white "U" icon outline
  Icons (bell, settings, avatar) → white at 80% opacity, 100% on hover
 
Left / side nav:
  Background → --brand-night (#133062)
  Width → 240px expanded, 60px collapsed
  Section header labels → white, uppercase, 10px, letter-spacing 0.1em
  Nav item text → white at 75% opacity
  Nav item hover → white at 100%, bg rgba(255,255,255,0.08)
  Nav item active (current page) → bg --brand-sky (#0066CC), white text, left border 3px --brand-water (#23E7FF)
  Sub-nav indent → 16px left padding
  Chevron icons → white at 60%
 
━━━ DATA TABLE ━━━
 
  Header → background #F6F7F0, text #6B7589, font-size 11px, uppercase, letter-spacing 0.06em
  Body rows → background white, 1px #DEDED7 bottom border
  Hover → background #EBF3FF
  Selected → background #D6E8FF
  Sorted column header → text #0066CC, sort icon #0066CC
  Pagination bar → background #F6F7F0, border-top 1px #DEDED7
  Pagination button active page → background #0066CC, text white, border-radius 6px
  Column resize handle → background #0066CC on hover
 
━━━ CARDS & PANELS ━━━
 
  Border → 0.5px #DEDED7
  Border-radius → 12px
  Shadow → none (no drop shadows anywhere)
  Card header (coloured) → background --brand-sky (#0066CC), text white
  Section dividers inside cards → 0.5px #DEDED7
  Metric / stat cards → background #F6F7F0, no border, border-radius 8px
 
━━━ AURORA ACCENT (optional decorative only) ━━━
 
On hero/header areas only, a soft radial glow may be applied in one corner using three colours at very low opacity (max 15%): Sky (#0066CC), Lilac (#8652DF), Water (#23E7FF). This is purely decorative and must never fill the entire area — only a corner bloom. Do NOT apply aurora to cards, tables, buttons, or any functional UI area.
 
━━━ THINGS TO AVOID (per Unilever guidelines) ━━━
 
  ✗ No colour gradients on UI elements (buttons, pills, nav, cards)
  ✗ No bright highlight colours (Lilac, Rose, Aqua, Clover, Sorbet) in primary UI — status tags only
  ✗ No dark backgrounds on content areas — Night colour (#133062) only for nav and headings
  ✗ No drop shadows on cards or modals
  ✗ No ALL CAPS text except for small label categories (10px, letter-spacing 0.08em)
  ✗ Do not mix highlight colours from different palette families in the same view
  ✗ No coloured gradients applied to logos or the "U" icon
 
━━━ SCOPE ━━━
 
Apply these changes uniformly across ALL screens:
  - Home / Dashboard
  - Projects module (table, workspace, details)
  - Claims module (table, workspace, lifecycle, assessments)
  - Assets module (table, workspace)
  - Left navigation and top navigation bar
  - All modals, drawers, side panels
  - All form inputs, buttons, selects
  - Filter panels and search bars
  - Pagination components
  - Empty states
  - Notification toasts and banners
  - Audit/activity log entries
 
Do NOT change: component structure, prop interfaces, routing, data fetching, business logic, or any functional behaviour.