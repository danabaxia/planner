import { useEffect, useState } from 'react';

/**
 * Hook to detect if the user prefers high contrast
 * @returns {boolean} Whether high contrast is preferred
 */
export const useHighContrast = (): boolean => {
  const [prefersHighContrast, setPrefersHighContrast] = useState<boolean>(() => {
    // Check if window is defined (for SSR)
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(forced-colors: active)').matches ||
           window.matchMedia('(-ms-high-contrast: active)').matches;
  });

  useEffect(() => {
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    const highContrastQuery = window.matchMedia('(-ms-high-contrast: active)');
    
    const handleChange = () => {
      setPrefersHighContrast(
        forcedColorsQuery.matches || highContrastQuery.matches
      );
    };

    // Modern browsers
    if (forcedColorsQuery.addEventListener) {
      forcedColorsQuery.addEventListener('change', handleChange);
      highContrastQuery.addEventListener('change', handleChange);
    }
    // Older browsers
    else {
      forcedColorsQuery.addListener(handleChange);
      highContrastQuery.addListener(handleChange);
    }

    return () => {
      // Modern browsers
      if (forcedColorsQuery.removeEventListener) {
        forcedColorsQuery.removeEventListener('change', handleChange);
        highContrastQuery.removeEventListener('change', handleChange);
      }
      // Older browsers
      else {
        forcedColorsQuery.removeListener(handleChange);
        highContrastQuery.removeListener(handleChange);
      }
    };
  }, []);

  return prefersHighContrast;
}; 