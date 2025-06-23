# Motion-Inspired Animation System

A comprehensive animation system built on top of Framer Motion, providing a consistent and easy-to-use API for animations across the application.

## Core Configuration

The animation system is built around several core configuration objects that define the animation behavior:

- `durations`: Predefined animation durations
- `easings`: Common easing functions and custom cubic-bezier curves
- `springs`: Spring physics configurations for natural motion
- `transitions`: Ready-to-use transition presets
- `staggers`: Timing configurations for staggered animations
- `scales`: Scale factors for hover and tap animations
- `offsets`: Common pixel distances for translations
- `states`: Standard animation state names

## Factory Functions

The system provides factory functions to generate common animation variants:

```tsx
import { createFadeVariants, createScaleVariants, createSlideVariants } from '@/animations';

// Simple fade animation
const fadeAnimation = createFadeVariants({
  duration: 0.2,
  delay: 0.1,
});

// Scale animation with spring physics
const scaleAnimation = createScaleVariants({
  transition: 'spring',
  initialScale: 0.9,
});

// Slide animation with direction
const slideAnimation = createSlideVariants({
  direction: 'up',
  distance: 20,
});
```

## Custom Hooks

The system includes several custom hooks for common animation patterns:

### useScrollAnimation
```tsx
const MyComponent = () => {
  const { ref, inView } = useScrollAnimation(0.2, true);
  return (
    <motion.div
      ref={ref}
      animate={inView ? 'visible' : 'hidden'}
      variants={fadeAnimation}
    >
      Content
    </motion.div>
  );
};
```

### useScrollProgress
```tsx
const ProgressBar = () => {
  const { scaleX } = useScrollProgress();
  return (
    <motion.div
      style={{
        scaleX,
        height: 4,
        background: 'blue',
        transformOrigin: 'left',
      }}
    />
  );
};
```

### useSequentialAnimation
```tsx
const SequentialList = () => {
  const { scope, startAnimation } = useSequentialAnimation(0.1);
  
  useEffect(() => {
    startAnimation();
  }, []);

  return (
    <motion.div ref={scope}>
      <motion.div data-animate>Item 1</motion.div>
      <motion.div data-animate>Item 2</motion.div>
      <motion.div data-animate>Item 3</motion.div>
    </motion.div>
  );
};
```

### useSpringHover
```tsx
const HoverCard = () => {
  const { ref, handleHoverStart, handleHoverEnd } = useSpringHover();
  
  return (
    <motion.div
      ref={ref}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      Card Content
    </motion.div>
  );
};
```

### useParallax
```tsx
const ParallaxSection = () => {
  const [ref, y] = useParallax(0.5);
  
  return (
    <motion.div
      ref={ref}
      style={{ y }}
    >
      Parallax Content
    </motion.div>
  );
};
```

## Best Practices

1. **Use Presets**: Prefer using the predefined animation presets from `core.ts` to maintain consistency.

2. **Performance**: 
   - Use `transform` properties (scale, rotate, translate) over properties that trigger layout.
   - Enable hardware acceleration for smoother animations with `willChange` when needed.
   - Use `layoutId` for shared element transitions.

3. **Accessibility**:
   - Respect user's reduced motion preferences using the `prefers-reduced-motion` media query.
   - Ensure animations don't interfere with screen readers.
   - Keep animation durations reasonable (200-400ms for most cases).

4. **Responsive Design**:
   - Scale animation distances based on viewport size.
   - Consider touch interactions for mobile devices.
   - Test animations across different devices and screen sizes.

5. **Code Organization**:
   - Keep animation logic separate from component logic.
   - Reuse animation variants through factory functions.
   - Document complex animations with comments.

## Examples

### Card Animation
```tsx
import { createHoverVariants, springs, states } from '@/animations';

const cardVariants = {
  [states.initial]: {
    opacity: 0,
    y: 20,
  },
  [states.animate]: {
    opacity: 1,
    y: 0,
    transition: springs.default,
  },
  ...createHoverVariants(1.05),
};

const Card = () => (
  <motion.div
    initial="initial"
    animate="animate"
    whileHover="hover"
    whileTap="tap"
    variants={cardVariants}
  >
    Card Content
  </motion.div>
);
```

### List Animation
```tsx
import { createStaggerVariants, createListItemVariants } from '@/animations';

const listVariants = createStaggerVariants({
  staggerChildren: 0.1,
  delayChildren: 0.2,
});

const ListItem = ({ index }: { index: number }) => (
  <motion.li variants={createListItemVariants(index)}>
    Item {index + 1}
  </motion.li>
);

const List = () => (
  <motion.ul
    initial="hidden"
    animate="visible"
    variants={listVariants}
  >
    {items.map((item, index) => (
      <ListItem key={item.id} index={index} />
    ))}
  </motion.ul>
);
```

## Contributing

When adding new animations:

1. Follow the existing patterns and naming conventions
2. Add TypeScript types for all new functions and components
3. Document the new additions in this README
4. Add examples demonstrating the usage
5. Test across different browsers and devices 