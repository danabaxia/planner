'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'planner-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous theme classes
    root.classList.remove('light', 'dark');

    let systemTheme: 'light' | 'dark' = 'light';
    
    if (theme === 'system') {
      systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }

    const activeTheme = theme === 'system' ? systemTheme : theme;
    
    // Add the active theme class
    root.classList.add(activeTheme);
    setResolvedTheme(activeTheme);

    // Save to localStorage
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(systemTheme);
        
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(systemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Theme toggle component
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      );
    }
    
    if (resolvedTheme === 'dark') {
      return (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      );
    }
    
    return (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    );
  };

  const getThemeLabel = () => {
    if (theme === 'system') return 'System';
    return theme === 'light' ? 'Light' : 'Dark';
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn-ghost btn-sm flex items-center gap-2"
      title={`Current theme: ${getThemeLabel()}. Click to cycle themes.`}
      aria-label={`Switch theme. Current: ${getThemeLabel()}`}
    >
      {getThemeIcon()}
      <span className="hidden sm:inline">{getThemeLabel()}</span>
    </button>
  );
}

// Hook to get theme-aware styles
export function useThemeStyles() {
  const { resolvedTheme } = useTheme();
  
  return {
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    
    // Common theme-aware class combinations
    cardBg: resolvedTheme === 'dark' ? 'bg-neutral-800' : 'bg-white',
    textPrimary: resolvedTheme === 'dark' ? 'text-neutral-100' : 'text-neutral-900',
    textSecondary: resolvedTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600',
    border: resolvedTheme === 'dark' ? 'border-neutral-700' : 'border-neutral-200',
    hover: resolvedTheme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-neutral-50',
    
    // Activity status colors (theme-aware)
    statusPending: resolvedTheme === 'dark' 
      ? 'bg-warning-900/20 text-warning-300 border-warning-800' 
      : 'bg-warning-100 text-warning-800 border-warning-200',
    statusInProgress: resolvedTheme === 'dark'
      ? 'bg-info-900/20 text-info-300 border-info-800'
      : 'bg-info-100 text-info-800 border-info-200',
    statusCompleted: resolvedTheme === 'dark'
      ? 'bg-success-900/20 text-success-300 border-success-800'
      : 'bg-success-100 text-success-800 border-success-200',
    statusCancelled: resolvedTheme === 'dark'
      ? 'bg-error-900/20 text-error-300 border-error-800'
      : 'bg-error-100 text-error-800 border-error-200',
    statusScheduled: resolvedTheme === 'dark'
      ? 'bg-secondary-900/20 text-secondary-300 border-secondary-800'
      : 'bg-secondary-100 text-secondary-800 border-secondary-200',
  };
}

// Utility function to get theme-aware color values
export function getThemeColor(
  lightColor: string,
  darkColor: string,
  theme: 'light' | 'dark'
): string {
  return theme === 'dark' ? darkColor : lightColor;
}

// CSS-in-JS theme object for complex styling
export function useThemeObject() {
  const { resolvedTheme } = useTheme();
  
  return {
    colors: {
      background: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
      foreground: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a',
      card: resolvedTheme === 'dark' ? '#1e293b' : '#ffffff',
      border: resolvedTheme === 'dark' ? '#334155' : '#e2e8f0',
      primary: resolvedTheme === 'dark' ? '#3b82f6' : '#0ea5e9',
      secondary: resolvedTheme === 'dark' ? '#a855f7' : '#d946ef',
      muted: resolvedTheme === 'dark' ? '#64748b' : '#f1f5f9',
      accent: resolvedTheme === 'dark' ? '#8b5cf6' : '#a855f7',
    },
    shadows: {
      sm: resolvedTheme === 'dark' 
        ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)' 
        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: resolvedTheme === 'dark'
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      lg: resolvedTheme === 'dark'
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    },
  };
} 