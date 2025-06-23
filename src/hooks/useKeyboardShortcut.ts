import { useEffect, useCallback, useRef } from 'react';

type KeyboardKey = string;
type ModifierKey = 'Alt' | 'Control' | 'Meta' | 'Shift';

interface KeyboardShortcutOptions {
  /** The key to listen for */
  key: KeyboardKey;
  /** Modifier keys required (e.g., ['Control', 'Shift']) */
  modifiers?: ModifierKey[];
  /** Whether the shortcut is disabled */
  disabled?: boolean;
  /** Whether to prevent the default browser behavior */
  preventDefault?: boolean;
  /** Whether to stop event propagation */
  stopPropagation?: boolean;
  /** Whether the shortcut should work when an input/textarea is focused */
  enableOnFormElements?: boolean;
  /** Whether the shortcut is currently enabled based on application state */
  enabled?: boolean;
  /** Description of what the shortcut does (for documentation) */
  description?: string;
}

/**
 * Hook to manage keyboard shortcuts with accessibility in mind
 * @param callback Function to call when the shortcut is triggered
 * @param options Shortcut configuration options
 */
export const useKeyboardShortcut = (
  callback: (event: KeyboardEvent) => void,
  {
    key,
    modifiers = [],
    disabled = false,
    preventDefault = true,
    stopPropagation = true,
    enableOnFormElements = false,
    enabled = true,
    description,
  }: KeyboardShortcutOptions
) => {
  // Keep track of pressed modifier keys
  const pressedKeys = useRef<Set<string>>(new Set());

  // Check if an element is a form element
  const isFormElement = useCallback((element: HTMLElement) => {
    const formTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    const contentEditableTags = ['true', 'plaintext-only'];

    return (
      formTags.includes(element.tagName) ||
      contentEditableTags.includes(element.getAttribute('contenteditable') || '')
    );
  }, []);

  // Handle keydown events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip if disabled or not enabled
      if (disabled || !enabled) return;

      // Add the key to pressed keys
      pressedKeys.current.add(event.key);

      // Skip if we're on a form element and shortcuts are not enabled for them
      if (
        !enableOnFormElements &&
        document.activeElement instanceof HTMLElement &&
        isFormElement(document.activeElement)
      ) {
        return;
      }

      // Check if all required modifier keys are pressed
      const allModifiersPressed = modifiers.every((modifier) =>
        pressedKeys.current.has(modifier)
      );

      // Check if the main key is pressed
      const mainKeyPressed = pressedKeys.current.has(key);

      // If all required keys are pressed, trigger the callback
      if (allModifiersPressed && mainKeyPressed) {
        if (preventDefault) {
          event.preventDefault();
        }
        if (stopPropagation) {
          event.stopPropagation();
        }
        callback(event);
      }
    },
    [
      callback,
      key,
      modifiers,
      disabled,
      preventDefault,
      stopPropagation,
      enableOnFormElements,
      enabled,
      isFormElement,
    ]
  );

  // Handle keyup events
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    pressedKeys.current.delete(event.key);
  }, []);

  // Handle window blur
  const handleBlur = useCallback(() => {
    pressedKeys.current.clear();
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp, handleBlur]);

  // Return the shortcut description for documentation
  return {
    description,
    key,
    modifiers,
    enabled: enabled && !disabled,
  };
};

/**
 * Format a keyboard shortcut for display
 * @param key The main key
 * @param modifiers Array of modifier keys
 * @returns Formatted shortcut string (e.g., "Ctrl + Shift + A")
 */
export const formatKeyboardShortcut = (
  key: string,
  modifiers: ModifierKey[] = []
): string => {
  const formattedModifiers = modifiers.map((modifier) => {
    switch (modifier) {
      case 'Control':
        return 'Ctrl';
      case 'Meta':
        return 'Cmd';
      default:
        return modifier;
    }
  });

  const formattedKey = key.length === 1 ? key.toUpperCase() : key;
  return [...formattedModifiers, formattedKey].join(' + ');
}; 