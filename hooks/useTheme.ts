/**
 * Hook for managing light/dark theme with persistence.
 */
import { useState, useEffect, useCallback } from 'react';
import { ThemeMode, Theme, getTheme } from '../constants/theme';
import { saveTheme, loadTheme } from '../utils/storage';

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const stored = await loadTheme();
      if (stored) {
        setMode(stored);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    await saveTheme(newMode);
  }, [mode]);

  const theme: Theme = getTheme(mode);

  return {
    mode,
    theme,
    toggleTheme,
    isLoading,
  };
};
