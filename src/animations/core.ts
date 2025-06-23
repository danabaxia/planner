import { Transition } from 'framer-motion';

// Animation durations (in seconds)
export const durations = {
  instant: 0,
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
  slower: 0.4,
  slowest: 0.6,
} as const;

// Easing functions
export const easings = {
  // Default easings
  easeOut: 'easeOut',
  easeIn: 'easeIn',
  easeInOut: 'easeInOut',
  // Custom cubic-bezier curves
  emphasized: [0.2, 0.0, 0, 1.0],
  emphasizedDecelerate: [0.05, 0.7, 0.1, 1.0],
  emphasizedAccelerate: [0.3, 0.0, 0.8, 0.15],
  standard: [0.2, 0.0, 0.2, 1.0],
} as const;

// Spring configurations
export const springs = {
  // Gentle spring for subtle movements
  gentle: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 1,
  },
  // Default spring for most interactions
  default: {
    type: 'spring',
    stiffness: 300,
    damping: 25,
    mass: 1,
  },
  // Bouncy spring for playful animations
  bouncy: {
    type: 'spring',
    stiffness: 400,
    damping: 20,
    mass: 1,
  },
  // Stiff spring for quick, snappy movements
  stiff: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
    mass: 1,
  },
} as const;

// Common transition presets
export const transitions = {
  // Tween transitions
  fast: {
    duration: durations.fast,
    ease: easings.easeOut,
  },
  normal: {
    duration: durations.normal,
    ease: easings.easeOut,
  },
  slow: {
    duration: durations.slow,
    ease: easings.easeOut,
  },
  emphasized: {
    duration: durations.slower,
    ease: easings.emphasized,
  },
  // Spring transitions
  spring: springs.default,
  springGentle: springs.gentle,
  springBouncy: springs.bouncy,
  springStiff: springs.stiff,
} as Record<string, Transition>;

// Stagger configurations
export const staggers = {
  fast: 0.03,
  normal: 0.05,
  slow: 0.08,
} as const;

// Scale factors
export const scales = {
  tap: 0.95,
  hover: 1.05,
  pressed: 0.98,
  focus: 1.02,
} as const;

// Offset distances (in pixels)
export const offsets = {
  tiny: 2,
  small: 4,
  medium: 8,
  large: 16,
  xlarge: 24,
} as const;

// Animation states
export const states = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  hover: 'hover',
  tap: 'tap',
  focus: 'focus',
  pressed: 'pressed',
  dragging: 'dragging',
  hidden: 'hidden',
  visible: 'visible',
} as const;

// Helper types
export type AnimationState = keyof typeof states;
export type TransitionPreset = keyof typeof transitions;
export type SpringPreset = keyof typeof springs;
export type EasingPreset = keyof typeof easings;
export type Duration = keyof typeof durations;
export type Stagger = keyof typeof staggers;
export type Scale = keyof typeof scales;
export type Offset = keyof typeof offsets; 