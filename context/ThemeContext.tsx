/**
 * Theme context — provides theme state across the app so screens
 * don't each re-load from AsyncStorage on mount.
 */
import React, { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Theme, ThemeMode } from '../constants/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  theme: Theme;
  toggleTheme: () => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const themeValue = useTheme();
  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};
