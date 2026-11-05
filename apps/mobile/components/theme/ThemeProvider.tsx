import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { semantic, type ColorScheme, type SemanticTokens } from '../../../../packages/shared-ui/tokens';

export type ThemePreference = 'system' | ColorScheme;

export interface AppTheme {
  /** The scheme actually being rendered */
  scheme: ColorScheme;
  isDark: boolean;
  /** Semantic colour tokens for the current scheme */
  t: SemanticTokens;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'gng.themePreference';

const isThemePreference = (value: unknown): value is ThemePreference =>
  value === 'system' || value === 'light' || value === 'dark';

export const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (isThemePreference(stored)) setPreferenceState(stored);
      } catch (err) {
        console.warn('Could not read theme preference', err);
      }
    };
    loadPreference();
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch((err: unknown) =>
      console.warn('Could not save theme preference', err),
    );
  }, []);

  const value = useMemo<AppTheme>(() => {
    const scheme: ColorScheme =
      preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
    return {
      scheme,
      isDark: scheme === 'dark',
      t: semantic[scheme],
      preference,
      setPreference,
    };
  }, [preference, systemScheme, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
