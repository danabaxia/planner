import { useCallback } from 'react';

interface ColorContrastResult {
  /** The calculated contrast ratio between foreground and background colors */
  ratio: number;
  /** Whether the contrast meets WCAG AA standards */
  meetsAA: boolean;
  /** Whether the contrast meets WCAG AAA standards */
  meetsAAA: boolean;
  /** Whether the contrast is sufficient for large text (18pt+) */
  meetsLargeText: boolean;
}

/**
 * Calculate relative luminance of a color
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928
      ? c / 12.92
      : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
const getContrastRatio = (l1: number, l2: number): number => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Parse color string to RGB values
 */
const parseColor = (color: string): [number, number, number] => {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const rgb = parseInt(hex, 16);
    return [
      (rgb >> 16) & 255,
      (rgb >> 8) & 255,
      rgb & 255,
    ];
  }

  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const [r, g, b] = color
      .replace(/[^\d,]/g, '')
      .split(',')
      .map(Number);
    return [r, g, b];
  }

  throw new Error(`Unsupported color format: ${color}`);
};

/**
 * Convert a hex color to RGB values
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  // Handle shorthand hex (#fff)
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }

  // Handle full hex (#ffffff)
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return { r, g, b };
};

/**
 * Calculate relative luminance for RGB values
 * Formula from WCAG 2.1: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Hook to calculate color contrast ratios and check WCAG compliance
 * @param foreground - Foreground color in hex format (e.g., "#000000")
 * @param background - Background color in hex format (e.g., "#ffffff")
 * @returns Object containing contrast ratio and compliance information
 */
export const useColorContrast = (
  foreground: string,
  background: string
): ColorContrastResult => {
  const calculateContrast = useCallback(
    (fg: string, bg: string): number => {
      const fgRgb = hexToRgb(fg);
      const bgRgb = hexToRgb(bg);

      const fgLuminance = calculateLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
      const bgLuminance = calculateLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

      const lighter = Math.max(fgLuminance, bgLuminance);
      const darker = Math.min(fgLuminance, bgLuminance);

      return (lighter + 0.05) / (darker + 0.05);
    },
    []
  );

  const ratio = calculateContrast(foreground, background);

  return {
    ratio,
    meetsAA: ratio >= 4.5,
    meetsAAA: ratio >= 7,
    meetsLargeText: ratio >= 3,
  };
}; 