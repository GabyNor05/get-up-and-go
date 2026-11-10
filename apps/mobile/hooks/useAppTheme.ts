import { useContext } from 'react';

import { ThemeContext, type AppTheme } from '../components/theme/ThemeProvider';

/**
 * Current colour scheme + semantic tokens.
 * Follows the system scheme unless the Goer picks one in Settings.
 */
export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useAppTheme must be used inside <ThemeProvider>');
  }
  return theme;
}
