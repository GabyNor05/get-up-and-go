import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

import "../global.css";
import { useFonts } from "expo-font";

// Import CSS variables directly
import '../../../packages/shared-ui/shared-ui.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    // Alias name mapped to local asset path
    ADayWithoutSun: require('../../../packages/shared-ui/assets/fonts/A-Day-Without-Sun-Text-Regular-TRIAL.ttf'),
  });

  if (!loaded && !error) return null;

  return (
    <ThemeProvider value={colorScheme === "light" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal", headerShown: false}}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
