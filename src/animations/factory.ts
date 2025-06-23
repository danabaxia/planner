import { Variants, Transition } from 'framer-motion';
import {
  transitions,
  springs,
  scales,
  offsets,
  states,
  staggers,
  TransitionPreset,
  SpringPreset,
} from './core';

interface FadeConfig {
  duration?: number;
  delay?: number;
  transition?: TransitionPreset;
  initialOpacity?: number;
}

interface ScaleConfig {
  duration?: number;
  delay?: number;
  transition?: TransitionPreset;
  initialScale?: number;
}

interface SlideConfig {
  duration?: number;
  delay?: number;
  transition?: SpringPreset;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

interface StaggerConfig {
  staggerChildren?: number;
  delayChildren?: number;
  transition?: TransitionPreset;
}

// Factory functions for creating animation variants
export const createFadeVariants = ({
  duration,
  delay = 0,
  transition = 'normal',
  initialOpacity = 0,
}: FadeConfig = {}): Variants => ({
  [states.hidden]: {
    opacity: initialOpacity,
  },
  [states.visible]: {
    opacity: 1,
    transition: {
      ...transitions[transition],
      delay,
      duration,
    },
  },
  [states.exit]: {
    opacity: 0,
    transition: transitions.fast,
  },
});

export const createScaleVariants = ({
  duration,
  delay = 0,
  transition = 'spring',
  initialScale = 0.95,
}: ScaleConfig = {}): Variants => ({
  [states.hidden]: {
    opacity: 0,
    scale: initialScale,
  },
  [states.visible]: {
    opacity: 1,
    scale: 1,
    transition: {
      ...transitions[transition],
      delay,
      duration,
    },
  },
  [states.exit]: {
    opacity: 0,
    scale: initialScale,
    transition: transitions.fast,
  },
});

export const createSlideVariants = ({
  duration,
  delay = 0,
  transition = 'default',
  distance = offsets.large,
  direction = 'up',
}: SlideConfig = {}): Variants => {
  const getOffset = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
    }
  };

  return {
    [states.hidden]: {
      opacity: 0,
      ...getOffset(),
    },
    [states.visible]: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        ...springs[transition],
        delay,
        duration,
      },
    },
    [states.exit]: {
      opacity: 0,
      ...getOffset(),
      transition: springs.stiff,
    },
  };
};

export const createStaggerVariants = ({
  staggerChildren = staggers.normal,
  delayChildren = 0,
  transition = 'normal',
}: StaggerConfig = {}): Variants => ({
  [states.hidden]: {
    opacity: 0,
  },
  [states.visible]: {
    opacity: 1,
    transition: {
      ...transitions[transition],
      staggerChildren,
      delayChildren,
    },
  },
});

// Hover and tap animations
export const createHoverVariants = (scale = scales.hover): Variants => ({
  [states.initial]: { scale: 1 },
  [states.hover]: {
    scale,
    transition: springs.gentle,
  },
  [states.tap]: {
    scale: scales.tap,
    transition: springs.stiff,
  },
});

// List item animations
export const createListItemVariants = (
  index: number,
  transition: Transition = springs.default
): Variants => ({
  [states.hidden]: {
    opacity: 0,
    y: offsets.medium,
  },
  [states.visible]: {
    opacity: 1,
    y: 0,
    transition: {
      ...transition,
      delay: index * staggers.normal,
    },
  },
  [states.exit]: {
    opacity: 0,
    y: offsets.medium,
    transition: transitions.fast,
  },
});

// Modal animations
export const createModalVariants = (): {
  overlay: Variants;
  content: Variants;
} => ({
  overlay: {
    [states.hidden]: { opacity: 0 },
    [states.visible]: {
      opacity: 1,
      transition: transitions.normal,
    },
    [states.exit]: {
      opacity: 0,
      transition: transitions.fast,
    },
  },
  content: {
    [states.hidden]: {
      opacity: 0,
      scale: 0.95,
      y: -offsets.medium,
    },
    [states.visible]: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: springs.default,
    },
    [states.exit]: {
      opacity: 0,
      scale: 0.95,
      y: offsets.medium,
      transition: transitions.fast,
    },
  },
}); 