import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to persist state in localStorage
 *
 * Features:
 * - Automatically syncs state with localStorage
 * - Type-safe with generics
 * - Handles JSON serialization/deserialization
 * - Graceful error handling for storage failures
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Setter function that handles both direct values and updater functions
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const newValue = value instanceof Function ? value(prev) : value;
      return newValue;
    });
  }, []);

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook specifically for table preferences
 */
export interface TablePreferences {
  columnVisibility: Record<string, boolean>;
  sorting: { id: string; desc: boolean }[];
  density: 'comfortable' | 'compact' | 'spacious';
}

const defaultTablePreferences: TablePreferences = {
  columnVisibility: {},
  sorting: [],
  density: 'comfortable',
};

export function useTablePreferences(tableId: string) {
  const [preferences, setPreferences, resetPreferences] = useLocalStorage<TablePreferences>(
    `table-preferences-${tableId}`,
    defaultTablePreferences
  );

  const updateColumnVisibility = useCallback(
    (columnVisibility: Record<string, boolean>) => {
      setPreferences((prev) => ({ ...prev, columnVisibility }));
    },
    [setPreferences]
  );

  const updateSorting = useCallback(
    (sorting: { id: string; desc: boolean }[]) => {
      setPreferences((prev) => ({ ...prev, sorting }));
    },
    [setPreferences]
  );

  const updateDensity = useCallback(
    (density: 'comfortable' | 'compact' | 'spacious') => {
      setPreferences((prev) => ({ ...prev, density }));
    },
    [setPreferences]
  );

  return {
    preferences,
    updateColumnVisibility,
    updateSorting,
    updateDensity,
    resetPreferences,
  };
}
