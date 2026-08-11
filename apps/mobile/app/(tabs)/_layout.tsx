import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text } from 'react-native';
import { House, UserRound, MapPinned, Settings, Award, LucideIcon } from "lucide-react-native";
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const BAR_BG = '#A88AED'; // Indigo Shade — matches the current solid tab bar colour
const ACTIVE = '#A88AED'; // Indigo Core
const ACTIVE_CHIP_BG = 'rgba(168,138,237,0.28)';
const INACTIVE = 'rgba(36,34,27,0.4)';

interface Props {
  darkMode: boolean;
}

/**
 * Builds a tabBarIcon renderer matching the FigmaMake nav:
 * - Home gets an elevated circular pill in Indigo Core with a white icon.
 * - Every other tab gets a rounded "chip" behind the icon when active, tinted
 *   Indigo Core, plus a small label underneath (default RN tab labels are
 *   switched off via tabBarShowLabel so this custom label doesn't double up).
 */
function buildTabIcon(Icon: LucideIcon, label: string, isHome: boolean) {
  return ({ focused }: { color: string; focused: boolean }) => {
    if (isHome) {
      return (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: ACTIVE,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -10,
            shadowColor: ACTIVE,
            shadowOpacity: 0.55,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Icon size={22} color="#FFFFFF" />
        </View>
      );
    }
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <View
          style={{
            width: 40,
            height: 32,
            borderRadius: 100,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom:-5,
            backgroundColor: focused ? ACTIVE_CHIP_BG : 'transparent',
          }}
        >
          <Icon size={20} color={focused ? ACTIVE : INACTIVE} />
        </View>
        <Text
          style={{
            fontSize: 10,
            fontWeight: focused ? '700' : '400',
            color: focused ? ACTIVE : INACTIVE,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </View>
    );
  };
}

export default function TabLayout({darkMode}: Props) {
  const colorScheme = useColorScheme();
  const bg = darkMode
    ? 'rgba(36,34,27,0.92)'
    : 'rgba(250,248,240,0.92)';
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          margin: "auto",
          marginBottom: 20,
          width: "95%",
          borderRadius: 100,
          backgroundColor: bg,
          borderTopWidth: 0,
          height: 68,
          paddingHorizontal: 8,
          overflow: 'visible',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
        },
        tabBarItemStyle: { overflow: 'visible' },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="(achievements)/index"
        options={{
          title: 'Achievements',
          tabBarIcon: buildTabIcon(Award, 'Badges', false),
        }}
      />
      <Tabs.Screen
        name="(nearby)/index"
        options={{
          title: 'Happenings',
          tabBarIcon: buildTabIcon(MapPinned, 'Nearby', false),
        }}
      />
      <Tabs.Screen
        name="(home)/index"
        options={{
          title: 'Home',
          tabBarIcon: buildTabIcon(House, 'Home', true),
        }}
      />
      <Tabs.Screen
        name="(circles)/index"
        options={{
          title: 'My Circles',
          tabBarIcon: buildTabIcon(UserRound, 'Circles', false),
        }}
      />
      <Tabs.Screen
        name="(settings)/index"
        options={{
          title: 'Settings',
          tabBarIcon: buildTabIcon(Settings, 'Settings', false),
        }}
      />
    </Tabs>
  );
}