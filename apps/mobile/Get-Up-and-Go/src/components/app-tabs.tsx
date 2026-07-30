import { NativeTabs as ExpoNativeTabs } from "expo-router/unstable-native-tabs";
import { Home, Compass, Users, Award, Settings } from "lucide-react-native";
import { useColorScheme } from "react-native";

import "../global.css";

// Wrap the NativeTabs components so NativeWind can inject className types
const NativeTabs = ExpoNativeTabs;
const NativeTabsLabel = ExpoNativeTabs.Trigger.Label;

export default function AppTabs() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const navBgColor = isDark ? "#000000" : "#1A1A1A";
  const activeColor = "#FAF8F0";
  const inactiveColor = isDark ? "#B8B6AC" : "#605E55";

  return (
    <NativeTabs
      className="bg-gng-nav-light dark:bg-gng-nav-dark border-t border-gng-border-light dark:border-gng-border-dark"
      backgroundColor={navBgColor}
      indicatorColor="transparent"
   /*    labelStyle={{
        selected: {
          color: activeColor,
          backgroundColor: "#F2E7D6",
          paddingHorizontal: 8,
          paddingVertical: 6,
          borderRadius: 999,
          overflow: "hidden",
        },
        unselected: {
          color: inactiveColor,
          display: "none",
        },
      }} */
    >
      {/* 1. HOME TAB */}
      <ExpoNativeTabs.Trigger name="home/index">
        <NativeTabsLabel className="text-caption font-sans">
          Home
        </NativeTabsLabel>
        <ExpoNativeTabs.Trigger.Icon src={Home} renderingMode="template" />
      </ExpoNativeTabs.Trigger>

      {/* 2. NEARBY TAB */}
      <ExpoNativeTabs.Trigger name="nearby/index">
        <NativeTabsLabel className="text-caption font-sans">
          Nearby
        </NativeTabsLabel>
        <ExpoNativeTabs.Trigger.Icon src={Compass} renderingMode="template" />
      </ExpoNativeTabs.Trigger>

      {/* 3. CIRCLES TAB */}
      <ExpoNativeTabs.Trigger name="circles/index">
        <NativeTabsLabel className="text-caption font-sans">
          Circles
        </NativeTabsLabel>
        <ExpoNativeTabs.Trigger.Icon src={Users} renderingMode="template" />
      </ExpoNativeTabs.Trigger>

      {/* 4. ACHIEVEMENTS TAB */}
      <ExpoNativeTabs.Trigger name="achievements/index">
        <NativeTabsLabel className="text-caption font-sans">
          Badges
        </NativeTabsLabel>
        <ExpoNativeTabs.Trigger.Icon src={Award} renderingMode="template" />
      </ExpoNativeTabs.Trigger>

      {/* 5. SETTINGS TAB */}
      <ExpoNativeTabs.Trigger name="settings/index">
        <NativeTabsLabel className="text-caption font-sans">
          Settings
        </NativeTabsLabel>
        <ExpoNativeTabs.Trigger.Icon src={Settings} renderingMode="template" />
      </ExpoNativeTabs.Trigger>
    </NativeTabs>
  );
}
