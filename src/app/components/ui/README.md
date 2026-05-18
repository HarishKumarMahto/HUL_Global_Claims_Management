# UI Component Library - Design System

Product-focused, consistent UI components for the Claims Management System.

## Core Principles

1. **User-Centric**: Every component designed with user tasks and mental models in mind
2. **Consistent**: Predictable behavior and visual language across the application
3. **Accessible**: WCAG 2.1 AA compliant with keyboard navigation support
4. **Responsive**: Adapts gracefully to different screen sizes
5. **Performant**: Optimized for speed with debouncing, lazy loading, and efficient re-renders

## Components

### Actions

#### Button
Standard button with variants for different contexts.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Save Changes</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button loading>Processing...</Button>
```

**Variants**: `primary`, `secondary`, `tertiary`, `danger`, `ghost`  
**Sizes**: `sm`, `md`, `lg`

### Feedback

#### Toast
Non-intrusive notifications for user actions.

```tsx
const toast = useToast();

toast.success('Project created successfully');
toast.error('Failed to save changes');
toast.warning('This action cannot be undone');
toast.info('New version available');
```

#### ConfirmDialog
Confirmation modal for destructive or important actions.

```tsx
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Delete Project?"
  message="This action cannot be undone. All claims and data will be permanently deleted."
  type="danger"
  confirmLabel="Delete"
/>
```

#### EmptyState
Helpful empty states with clear next actions.

```tsx
<EmptyState
  icon={FolderKanban}
  title="No projects yet"
  description="Get started by creating your first project."
  action={{
    label: "Create Project",
    onClick: handleCreate
  }}
/>
```

#### LoadingSpinner
Loading indicators for async operations.

```tsx
<LoadingSpinner size="lg" text="Loading projects..." />
```

### Forms

#### FormInput
Enhanced input with validation, icons, and helper text.

```tsx
<FormInput
  label="Project Name"
  required
  error={errors.name}
  placeholder="Enter project name"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

#### SearchInput
Debounced search with clear functionality.

```tsx
<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Search projects..."
  debounceMs={300}
/>
```

### Display

#### Badge
Labels and status indicators.

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning" dot>Pending</Badge>
<Badge variant="danger">Overdue</Badge>
```

#### Card
Content containers with optional hover states.

```tsx
<Card hover onClick={handleClick}>
  <CardHeader
    title="Project Summary"
    subtitle="Last updated 2 hours ago"
    action={<Button size="sm">Edit</Button>}
  />
  <div>Content goes here</div>
</Card>
```

#### Tooltip
Contextual help on hover.

```tsx
<Tooltip content="This action requires admin permissions">
  <Button disabled>Restricted Action</Button>
</Tooltip>
```

### Loading States

#### Skeleton
Skeleton screens for better perceived performance.

```tsx
<Skeleton width={200} height={24} />
<TableSkeleton rows={5} columns={6} />
<CardSkeleton />
```

## Hooks

### useToast
Toast notification management.

```tsx
const toast = useToast();

// Returns: { toasts, removeToast, success, error, warning, info }
```

### useDebounce
Debounce rapidly changing values (e.g., search inputs).

```tsx
const debouncedSearch = useDebounce(searchValue, 300);

useEffect(() => {
  // API call with debounced value
}, [debouncedSearch]);
```

## Color Palette

- **Primary (Sky)**: `#0052CC` - CTAs, links, focus states
- **Dark**: `#0747A6` - Hover states for primary actions
- **Night**: `#172B4D` - Text, headings
- **Earth**: `#F7F8F9` - Page background, subtle fills
- **Pale**: `#DEEBFF` - Light accents, selected states
- **Pebble**: `#DFE1E6` - Borders, dividers
- **White**: `#FFFFFF` - Cards, modals

## Spacing Scale

- XS: 0.25rem (4px)
- SM: 0.5rem (8px)
- MD: 1rem (16px)
- LG: 1.5rem (24px)
- XL: 2rem (32px)
- 2XL: 3rem (48px)

## Typography

- **Headings**: Medium weight (500)
- **Body**: Normal weight (400)
- **Labels**: Medium weight (500)
- **Line Height**: 1.5 for readability

## Best Practices

1. **Use semantic variants**: `primary` for main actions, `secondary` for alternatives, `danger` for destructive actions
2. **Provide feedback**: Show toasts for user actions, loading states for async operations
3. **Guide users**: Use empty states with clear CTAs, helper text in forms
4. **Validate early**: Show inline errors as users type, not just on submit
5. **Be consistent**: Use the same components and patterns throughout the app
