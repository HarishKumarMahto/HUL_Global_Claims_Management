Create a complete enterprise-grade desktop web application UI for a Claims Management Platform for Unilever using the provided user stories and uploaded color palette as the primary source of truth. Use the uploaded palette exactly for branding, primary actions, states, backgrounds, and accents.

Design a modern, premium, scalable B2B SaaS product with clean enterprise usability. The application should feel like a blend of Salesforce, Atlassian Jira, SAP Fiori, Microsoft Dynamics, and Notion precision, but customized for Unilever brand standards.

Global Design Direction
Desktop-first responsive web app
Clean white / light neutral backgrounds
Strong visual hierarchy
High information density without clutter
Professional, trustworthy, executive-ready
Efficient for daily power users
Minimal but polished styling
Rounded corners (8px–12px)
Subtle shadows
Accessible contrast
Consistent spacing system (8px grid)
Use Auto Layout everywhere
Reusable component system
Build Full Product Structure

Generate the complete app with these screens, flows, and reusable components:

1. Global App Shell

Create a reusable application shell used across all screens:

Top Horizontal Navbar (64px height)

Include:

Unilever logo on left
Product name text: Claims Management
Main navigation item: Projects (active state)
Global search
Notification bell icon
Create dropdown button
Help icon
User profile avatar with dropdown
Left Vertical Sidebar (260px width)

Contextual navigation with sections:

When on Projects module:

Recent Projects
My Projects
Favorites
Saved Views

When inside Project Workspace:

Project Details
Project Team
Geography
Linked Products
Related Claims
Linked Assets

Use hover, active, collapsed states.

2. Projects Landing Page (Main Data Grid Screen)

Design the central primary workspace screen.

Workspace Header
Page title: Projects
Current dataset dropdown (All Projects / My Projects / Favorites / Saved Views)
Toolbar Row

Include:

Search projects input
Quick filter dropdowns:
Business Group
Category
Project Scope
Project Stage
Geography
Create Project primary button
Projects Table (Hero component)

Enterprise grid with sticky header.

Columns:

Favorite star
Project Name
Project ID
Project Type
Business Group
Region
Project Lead
Claims Lead
Status
Last Updated
Actions menu

Include:

Sorting states
Filter icons
Row hover
Selected row
Status badges
Pagination footer
Column settings menu
Empty state
Loading state
3. Create Project Modal

Large centered modal form.

Fields:

Project Name
Project Description
Business Group
Category
Project Type
Project Scope
External Reference
Start Date
Target Evaluation Date
Target Launch Date

Footer buttons:

Cancel
Save
Save + Create

Include validation / duplicate warning state.

4. Project Workspace Screen

When clicking a project row, open full workspace page.

Header Section

Include:

Favorite star
Project Name
Project ID
Business Group
Category
Project Type
Project Scope
Prev / Next project navigation
Record counter (4 of 18)
Actions dropdown
Lifecycle Tracker Ribbon

Horizontal progress stages:

Draft
Substantiate
Review & Risk Assessment
Assessment Complete
Complete

Use completed / current / pending states.

5. Project Details Screen

Two-column editable metadata form.

Fields:

Project Name
Description
BG
Category
Type
Scope
Start Date
Launch Date
Evaluation Date
External Ref

Buttons:

Edit
Save
Cancel
6. Project Team Screen

Three professional team cards:

R&D Team
RA Team
Legal Team

Each card includes:

Members list
Pending invitations
Rejected invitations
Status chips
Add Member button

Also include Add Member modal with user search and scope selector.

7. Geography Screen

Workspace page with:

Search geography
Multi-select geography picker
Added geographies table or chips
Add Geography button
8. Linked Products Screen

Enterprise table with hierarchy rows.

Columns:

Product Name
Type
BG
Category
Format
Technology 1
Technology 2

Include:

Parent rows
Variant child rows
SKU rows
Indented hierarchy
Add Product button
Create Product button
Configure columns button
9. Related Claims Screen

Most advanced screen.

Accordion grouped sections:

Global Claims
Regional Adaptations
Local Adaptations
Local Adaptation SKUs

Claims table columns:

Claim Order
Version
Claim Statement
Status
Qualifier
Marketing Channel
Final Risk Level
Final Risk Icon
RCF Summary

Include:

Expand row interaction
Inline summary panels:
Support Strategy
Risk Assessment
Comments
Add Claim button
Copy Claim modal
Create Claim modal
10. Linked Assets Screen

Enterprise asset table.

Columns:

Asset Name
Type
Lifecycle State
Asset Number
Status

Include open asset row behavior.

11. Right Collaboration Drawer

Slide-out right panel available globally in workspace.

Tabs:

Comments
Tasks
Comments
Rich text editor
@mention team members
Activity thread
Timestamps
Tasks
Task title
Description
Assignee
Due date
Task list with statuses
12. Saved Views UX

Dropdown / modal flows:

Save View
Rename View
Delete View
Share View
Set as Default
Remove Shared View
Save as New View
13. Project Actions Dropdown

Inside workspace header:

Actions:

Rollout Project
Clone Project
Reopen Project
Archive Project
Cancel Project

Generate associated confirmation modals.

14. Risk & Review Expandable Panel

Advanced lifecycle component.

Three columns:

Global
Regional
Local

Each has tiles:

R&D
RA
Legal
Claims Forum

States:

In Progress
Completed

Include:

Tick toggle
Bell notification icon
Hover summary tooltip
15. Component Library

Generate reusable components:

Buttons (primary, secondary, ghost, destructive)
Inputs
Dropdowns
Multi-selects
Search bars
Table cells
Status badges
Tabs
Modals
Drawers
Sidebar items
Navbar items
Pagination
Avatars
Chips
Empty states
Toast notifications
UX Rules
Use enterprise table-first design, not dashboard-card-first
Prioritize usability over flashy visuals
Keep layouts realistic and implementation-ready
Maintain consistency across screens
Use proper spacing and alignment
Sticky toolbars where appropriate
Dense but readable tables
Modern iconography
Elegant professional typography
Avoid generic startup dashboard aesthetics
Deliverables to Generate

Produce a full Figma file structure with:

Foundations
Components
Navigation Shell
Projects Screens
Project Workspace Screens
Modals
Collaboration Drawer
Prototype Flows
Developer-ready Components

Generate multiple polished desktop screens covering the entire application.