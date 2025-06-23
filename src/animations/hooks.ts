import { useState, useEffect, useCallback, useRef } from 'react';
import { useAnimate, useInView, useScroll, useSpring, MotionValue, InViewHookProps } from 'framer-motion';
import { springs, transitions, offsets } from './core';

// Hook for scroll-linked animations
export const useScrollAnimation = (
  threshold: number = 0.2,
  once: boolean = true
) => {
  const [ref, inView] = useInView({
    amount: threshold,
    once,
  });

  return { ref, inView };
};

// Hook for scroll-progress animations
export const useScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, springs.default);

  return { scaleX };
};

// Hook for sequential animations
export const useSequentialAnimation = (delay: number = 0.1) => {
  const [scope, animate] = useAnimate();
  const [hasAnimated, setHasAnimated] = useState(false);

  const startAnimation = useCallback(async () => {
    if (hasAnimated) return;

    const elements = scope.current?.querySelectorAll('[data-animate]');
    if (!elements) return;

    for (const element of elements) {
      await animate(
        element,
        { opacity: [0, 1], y: [offsets.medium, 0] },
        { ...transitions.normal, delay }
      );
    }

    setHasAnimated(true);
  }, [animate, delay, hasAnimated]);

  return { scope, startAnimation };
};

// Hook for infinite loop animations
export const useLoopAnimation = (
  duration: number = 2,
  pause: boolean = false
) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (pause) return;

    animate(
      scope.current,
      { rotate: [0, 360] },
      { duration, repeat: Infinity, ease: 'linear' }
    );
  }, [animate, duration, pause]);

  return { scope };
};

// Hook for hover animations with spring physics
export const useSpringHover = (
  initialScale: number = 1,
  hoverScale: number = 1.05
) => {
  const [ref, animate] = useAnimate();

  const handleHoverStart = () => {
    animate(ref.current, { scale: hoverScale }, springs.gentle);
  };

  const handleHoverEnd = () => {
    animate(ref.current, { scale: initialScale }, springs.gentle);
  };

  return { ref, handleHoverStart, handleHoverEnd };
};

// Hook for drag constraints
export const useDragConstraints = () => {
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [constraints, setConstraints] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (!containerRef) return;

    const updateConstraints = () => {
      const container = containerRef.getBoundingClientRect();
      setConstraints({
        top: -container.height + 100,
        right: 0,
        bottom: 0,
        left: -container.width + 100,
      });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);

    return () => window.removeEventListener('resize', updateConstraints);
  }, [containerRef]);

  return { containerRef: setContainerRef, constraints };
};

// Hook for smooth counter animation
export const useCountAnimation = (
  value: number,
  duration: number = 1
) => {
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, springs.default);

  useEffect(() => {
    springValue.set(value);
    
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });

    return () => unsubscribe();
  }, [value, springValue]);

  return displayValue;
};

// Hook for parallax scrolling
export const useParallax = (
  sensitivity: number = 0.5,
  clamp: boolean = true
): [React.RefObject<HTMLElement>, MotionValue<number>] => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useSpring(0, springs.gentle);

  useEffect(() => {
    const updateY = () => {
      const newY = scrollYProgress.get() * sensitivity * -100;
      y.set(clamp ? Math.min(0, Math.max(-100, newY)) : newY);
    };

    const unsubscribe = scrollYProgress.on('change', updateY);
    return () => unsubscribe();
  }, [scrollYProgress, sensitivity, clamp, y]);

  return [ref, y];
}; 