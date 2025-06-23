import { Variants, Transition, Variant, Target } from 'framer-motion';
import { states, transitions } from './core';

/**
 * Configuration for reduced motion variants
 */
export interface ReducedMotionConfig {
  /** Original variants to adapt */
  variants: Variants;
  /** Custom transition for reduced motion */
  transition?: Transition;
  /** Whether to preserve opacity animations */
  preserveOpacity?: boolean;
}

/**
 * Creates reduced motion variants by removing transform animations
 * while preserving opacity changes for accessibility
 */
export const createReducedMotionVariants = ({
  variants,
  transition = transitions.fast,
  preserveOpacity = true,
}: ReducedMotionConfig): Variants => {
  const reducedVariants: Variants = {};

  // Process each animation state
  Object.entries(variants).forEach(([key, value]) => {
    if (typeof value === 'object') {
      // Start with a clean variant
      const reducedVariant: any = {};

      // Preserve opacity if specified
      if (preserveOpacity && 'opacity' in value) {
        reducedVariant.opacity = value.opacity;
      }

      // Add custom transition
      reducedVariant.transition = transition;

      reducedVariants[key] = reducedVariant;
    }
  });

  return reducedVariants;
};

/**
 * Utility function to combine regular and reduced motion variants
 */
export const combineWithReducedMotion = (
  variants: Variants,
  config: Omit<ReducedMotionConfig, 'variants'> = {}
): Record<string, Target> => {
  const reducedVariants = createReducedMotionVariants({
    variants,
    ...config,
  });

  return {
    [states.initial]: variants[states.initial] as Target,
    [states.animate]: variants[states.animate] as Target,
    [states.exit]: variants[states.exit] as Target,
    reducedMotion: reducedVariants as unknown as Target,
  };
};

/**
 * Creates instant transition variants for reduced motion
 */
export const createInstantVariants = (variants: Variants): Variants => {
  return createReducedMotionVariants({
    variants,
    transition: { duration: 0 },
    preserveOpacity: true,
  });
};

/**
 * Creates fade-only variants for reduced motion
 */
export const createFadeOnlyVariants = (variants: Variants): Variants => {
  return createReducedMotionVariants({
    variants,
    transition: transitions.fast,
    preserveOpacity: true,
  });
}; 