# Daily Activity Planner Design System

## Overview

This design system provides a comprehensive set of design tokens, components, and guidelines for building consistent and accessible user interfaces in the Daily Activity Planner application.

## Design Principles

1. **Clarity**: Clear visual hierarchy and intuitive interactions
2. **Consistency**: Unified patterns across all components
3. **Accessibility**: WCAG 2.1 AA compliant design
4. **Performance**: Optimized animations and efficient rendering
5. **Responsiveness**: Mobile-first, adaptive design

## Color System

### Primary Colors
- **Primary 50**: `#f0f9ff` - Lightest blue for backgrounds
- **Primary 500**: `#0ea5e9` - Main brand color
- **Primary 600**: `#0284c7` - Primary button color
- **Primary 700**: `#0369a1` - Primary button hover
- **Primary 900**: `#0c4a6e` - Dark text on light backgrounds

### Secondary Colors
- **Secondary 50**: `#fdf4ff` - Lightest purple for backgrounds
- **Secondary 500**: `#d946ef` - Accent color
- **Secondary 600**: `#c026d3` - Secondary button color
- **Secondary 900**: `#701a75` - Dark purple text

### Activity Status Colors
- **Pending**: `#f59e0b` (Amber) - Tasks waiting to start
- **In Progress**: `#3b82f6` (Blue) - Currently active tasks
- **Completed**: `#10b981` (Green) - Finished tasks
- **Cancelled**: `#ef4444` (Red) - Cancelled tasks
- **Scheduled**: `#8b5cf6` (Purple) - Future scheduled tasks

### Priority Colors
- **Low**: `#6b7280` (Gray) - Low priority tasks
- **Medium**: `#f59e0b` (Amber) - Medium priority tasks
- **High**: `#ef4444` (Red) - High priority tasks
- **Urgent**: `#dc2626` (Dark Red) - Urgent tasks

### Semantic Colors
- **Success**: `#22c55e` - Success states and confirmations
- **Warning**: `#f59e0b` - Warning states and alerts
- **Error**: `#ef4444` - Error states and destructive actions
- **Info**: `#3b82f6` - Informational messages

### Neutral Colors
- **Neutral 50**: `#f8fafc` - Page backgrounds
- **Neutral 100**: `#f1f5f9` - Card backgrounds
- **Neutral 200**: `#e2e8f0` - Borders and dividers
- **Neutral 500**: `#64748b` - Secondary text
- **Neutral 700**: `#334155` - Primary text
- **Neutral 900**: `#0f172a` - Headings and emphasis

## Typography

### Font Families
- **Sans**: Inter (body text, UI elements)
- **Display**: Poppins (headings, emphasis)
- **Mono**: JetBrains Mono (code, timestamps)

### Font Sizes
- **xs**: 0.75rem (12px) - Small labels, captions
- **sm**: 0.875rem (14px) - Secondary text
- **base**: 1rem (16px) - Body text
- **lg**: 1.125rem (18px) - Large body text
- **xl**: 1.25rem (20px) - Small headings
- **2xl**: 1.5rem (24px) - Medium headings
- **3xl**: 1.875rem (30px) - Large headings
- **4xl**: 2.25rem (36px) - Page titles

### Font Weights
- **Light**: 300 - Subtle text
- **Normal**: 400 - Body text
- **Medium**: 500 - Emphasized text
- **Semibold**: 600 - Subheadings
- **Bold**: 700 - Headings

## Spacing System

Based on 0.25rem (4px) increments:

- **0**: 0px
- **1**: 4px - Tight spacing
- **2**: 8px - Small spacing
- **3**: 12px - Medium spacing
- **4**: 16px - Default spacing
- **6**: 24px - Large spacing
- **8**: 32px - Extra large spacing
- **12**: 48px - Section spacing
- **16**: 64px - Page spacing

## Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  @apply btn bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm hover:shadow-md;
}
```

#### Secondary Button
```css
.btn-secondary {
  @apply btn bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 border border-secondary-200;
}
```

#### Outline Button
```css
.btn-outline {
  @apply btn border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100;
}
```

#### Ghost Button
```css
.btn-ghost {
  @apply btn text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200;
}
```

#### Button Sizes
- **Small**: `.btn-sm` - 12px vertical padding
- **Medium**: `.btn-md` - 16px vertical padding (default)
- **Large**: `.btn-lg` - 24px vertical padding

### Cards

#### Basic Card
```css
.card {
  @apply rounded-xl border border-neutral-200 bg-white shadow-sm;
}
```

#### Activity Card
```css
.activity-card {
  @apply card hover:shadow-md transition-all duration-200 cursor-pointer;
}
```

### Status Indicators

#### Status Badge
```css
.status-indicator {
  @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
}
```

#### Status Variants
- **Pending**: `.status-pending` - Amber background
- **In Progress**: `.status-in-progress` - Blue background
- **Completed**: `.status-completed` - Green background
- **Cancelled**: `.status-cancelled` - Red background
- **Scheduled**: `.status-scheduled` - Purple background

### Form Elements

#### Input Field
```css
.input {
  @apply flex w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50;
}
```

#### Error State
```css
.input-error {
  @apply border-error-500 focus:border-error-500 focus:ring-error-500;
}
```

### Timeline

#### Timeline Item
```css
.timeline-item {
  @apply relative pl-8 pb-8;
}

.timeline-item::before {
  @apply absolute left-0 top-2 h-2 w-2 rounded-full bg-primary-500 content-[''];
}

.timeline-item::after {
  @apply absolute left-1 top-4 h-full w-px bg-neutral-200 content-[''];
}
```

### Sidebar

#### Sidebar Container
```css
.sidebar {
  @apply flex h-full w-64 flex-col bg-white border-r border-neutral-200;
}
```

#### Navigation Item
```css
.sidebar-nav-item {
  @apply flex items-center rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors;
}

.sidebar-nav-item.active {
  @apply bg-primary-100 text-primary-900;
}
```

## Animation Guidelines

### Timing
- **Fast**: 200ms - Micro-interactions (hover, focus)
- **Medium**: 300ms - Component transitions
- **Slow**: 500ms - Page transitions, complex animations

### Easing
- **Ease Out**: For entrances and user-initiated actions
- **Ease In**: For exits and system-initiated actions
- **Spring**: For playful, organic feeling interactions

### Animation Variants

#### Fade Animations
- `fadeIn` - Opacity 0 to 1
- `fadeOut` - Opacity 1 to 0

#### Slide Animations
- `slideUp` - Slide from bottom with fade
- `slideDown` - Slide from top with fade
- `slideLeft` - Slide from right with fade
- `slideRight` - Slide from left with fade

#### Scale Animations
- `scaleIn` - Scale from 0.9 to 1 with fade
- `scaleOut` - Scale from 1 to 0.9 with fade

#### Stagger Animations
- `staggerContainer` - Container for staggered children
- `staggerItem` - Individual items in staggered list

## Accessibility Guidelines

### Color Contrast
- All text must meet WCAG 2.1 AA standards (4.5:1 ratio)
- Interactive elements must have sufficient contrast
- Don't rely solely on color to convey information

### Focus Management
- All interactive elements must have visible focus indicators
- Focus order should be logical and predictable
- Skip links should be provided for keyboard navigation

### Screen Reader Support
- Use semantic HTML elements
- Provide appropriate ARIA labels and descriptions
- Ensure all content is accessible via keyboard

### Motion and Animation
- Respect `prefers-reduced-motion` setting
- Provide alternatives for motion-based interactions
- Keep animations subtle and purposeful

## Responsive Design

### Breakpoints
- **sm**: 640px - Small tablets
- **md**: 768px - Tablets
- **lg**: 1024px - Small desktops
- **xl**: 1280px - Large desktops
- **2xl**: 1536px - Extra large screens

### Mobile-First Approach
- Design for mobile first, then enhance for larger screens
- Use progressive enhancement for advanced features
- Ensure touch targets are at least 44px

### Grid System
- Use CSS Grid for complex layouts
- Use Flexbox for component-level layouts
- Provide responsive grid utilities

## Usage Examples

### Activity Card Component
```tsx
<div className="activity-card">
  <div className="card-header">
    <h3 className="card-title">Morning Workout</h3>
    <span className="status-scheduled">Scheduled</span>
  </div>
  <div className="card-content">
    <p className="text-neutral-600">30-minute cardio session</p>
    <div className="flex items-center gap-2 mt-2">
      <span className="priority-medium">Medium Priority</span>
      <span className="text-sm text-neutral-500">9:00 AM</span>
    </div>
  </div>
</div>
```

### Button Group
```tsx
<div className="flex gap-2">
  <button className="btn-primary btn-md">Save</button>
  <button className="btn-outline btn-md">Cancel</button>
</div>
```

### Timeline Item
```tsx
<div className="timeline-item">
  <div className="flex items-center gap-3">
    <span className="status-completed">Completed</span>
    <h4 className="font-medium">Task completed</h4>
  </div>
  <p className="text-sm text-neutral-600 mt-1">
    Successfully finished the morning workout routine.
  </p>
</div>
```

## Best Practices

### Component Development
1. Use semantic HTML elements
2. Follow the single responsibility principle
3. Implement proper TypeScript types
4. Include comprehensive prop validation
5. Write unit tests for all components

### Styling
1. Use Tailwind utility classes for styling
2. Create component classes for repeated patterns
3. Maintain consistent spacing and sizing
4. Follow the established color system

### Animation
1. Use Framer Motion for complex animations
2. Keep animations subtle and purposeful
3. Respect user preferences for reduced motion
4. Test animations on various devices

### Performance
1. Optimize images and assets
2. Use lazy loading for non-critical content
3. Minimize bundle size with tree shaking
4. Implement proper caching strategies

## Maintenance

### Regular Reviews
- Review and update color contrast ratios
- Test accessibility with screen readers
- Validate responsive behavior on new devices
- Update animation performance benchmarks

### Documentation Updates
- Keep component examples current
- Document new patterns and components
- Update usage guidelines based on user feedback
- Maintain version history of design changes 