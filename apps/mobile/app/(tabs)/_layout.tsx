import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Award, House, MapPinned, Settings, UserRound, type LucideIcon } from 'lucide-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { SemanticTokens } from '../../../../packages/shared-ui/tokens';

interface TabIconProps {
  focused: boolean;
}

const DOCK_HEIGHT = 68;

/**
 * Floating dock icon:
 * - Home is an elevated round pill in action-primary.
 * - Other tabs get a subtle brand chip when active, plus a label.
 */
function buildTabIcon(Icon: LucideIcon, label: string, isHome: boolean, t: SemanticTokens) {
  const TabIcon = ({ focused }: TabIconProps) => {
    if (isHome) {
      return (
        <View style={[styles.homePill, { backgroundColor: t.actionPrimary, shadowColor: t.actionPrimary }]}>
          <Icon size={24} color={t.onActionPrimary} strokeWidth={2} />
        </View>
      );
    }

    const color = focused ? t.textBrand : t.textSecondary;
    return (
      <View style={styles.tabItem}>
        <View style={[styles.chip, { backgroundColor: focused ? t.fillBrandSubtle : 'transparent' }]}>
          <Icon size={20} color={color} strokeWidth={2} />
        </View>
        <Text numberOfLines={1} style={[styles.label, { color, fontWeight: focused ? '700' : '400' }]}>
          {label}
        </Text>
      </View>
    );
  };
  return TabIcon;
}

export default function TabLayout() {
  const { t } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarActiveTintColor: t.textBrand,
        tabBarInactiveTintColor: t.textSecondary,
        tabBarItemStyle: styles.tabBarItem,
        sceneStyle: { backgroundColor: t.bgCanvas },
        tabBarStyle: [
          styles.dock,
          {
            backgroundColor: t.bgElevated,
            marginBottom: Math.max(insets.bottom, 12),
          },
        ],
      }}
    >
      <Tabs.Screen
        name="(achievements)/index"
        options={{ title: 'Go-Points', tabBarIcon: buildTabIcon(Award, 'Go-Points', false, t) }}
      />
      <Tabs.Screen
        name="nearby"
        options={{ title: 'Nearby', tabBarIcon: buildTabIcon(MapPinned, 'Nearby', false, t) }}
      />
      <Tabs.Screen
        name="(home)/index"
        options={{ title: 'Home', tabBarIcon: buildTabIcon(House, 'Home', true, t) }}
      />
      <Tabs.Screen
        name="(circles)"
        options={{ title: 'Circles', tabBarIcon: buildTabIcon(UserRound, 'Circles', false, t) }}
      />
      <Tabs.Screen
        name="(settings)/index"
        options={{ title: 'Settings', tabBarIcon: buildTabIcon(Settings, 'Settings', false, t) }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dock: {
    marginHorizontal: '2.5%',
    width: '95%',
    height: DOCK_HEIGHT,
    borderRadius: 999,
    borderTopWidth: 0,
    paddingHorizontal: 8,
    paddingBottom: 0,
    overflow: 'visible',
    shadowColor: '#24221B',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  tabBarItem: {
    overflow: 'visible',
    height: DOCK_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homePill: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 64,
  },
  chip: {
    width: 44,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
