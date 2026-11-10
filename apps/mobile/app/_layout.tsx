import '../global.css';
import '../../../packages/shared-ui/shared-ui.css';

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { configureNotifications } from '@/utils/notifications';

// Firebase Auth expects DOMException, which Hermes doesn't provide.
if (typeof globalThis.DOMException === 'undefined') {
  class DOMExceptionPolyfill extends Error {
    code: number;
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? 'Error';
      this.code = 0;
    }
  }
  (globalThis as { DOMException?: unknown }).DOMException = DOMExceptionPolyfill;
}

configureNotifications();

SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden — safe to ignore */
});

function RootStack() {
  const { isDark, t } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bgCanvas } }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Fredoka-SemiBold': require('../assets/fonts/Fredoka-SemiBold.ttf'),
    'Fredoka-Medium': require('../assets/fonts/Fredoka-Medium.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  // Hold the native splash until fonts are ready; fall back to system fonts on error.
  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
