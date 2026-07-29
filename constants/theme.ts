/**
 * Theme constants for light and dark modes.
 */

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    primaryText: string;
    completed: string;
    completedText: string;
    danger: string;
    dangerText: string;
    placeholder: string;
    shadow: string;
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: '#F5F7FA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    primary: '#3B82F6',
    primaryText: '#FFFFFF',
    completed: '#10B981',
    completedText: '#065F46',
    danger: '#EF4444',
    dangerText: '#FFFFFF',
    placeholder: '#9CA3AF',
    shadow: 'rgba(0, 0, 0, 0.08)',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: '#0F172A',
    surface: '#1E293B',
    card: '#1E293B',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    border: '#334155',
    primary: '#60A5FA',
    primaryText: '#FFFFFF',
    completed: '#34D399',
    completedText: '#064E3B',
    danger: '#F87171',
    dangerText: '#FFFFFF',
    placeholder: '#64748B',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

export const getTheme = (mode: ThemeMode): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};
