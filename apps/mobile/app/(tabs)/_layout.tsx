import { Tabs } from 'expo-router';
import React from 'react';
import { House, UserRound, MapPinned, Settings, Award} from "lucide-react-native";
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#A6C261",
        tabBarInactiveTintColor: '#ffffff',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { 
          display: "flex",
          direction: "row",
          margin: "auto",
          marginBottom: 20,
          width: "95%",
          borderRadius: "100px",
          backgroundColor: '#352C53',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          height: 60,
          padding: 8,
        },
        tabBarShowLabel: false

      }}
      
      >
      <Tabs.Screen
        name="(achievements)/index"
        options={{
          title: 'Achievements',
          tabBarIcon: ({ color }) => <Award size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(nearby)/index"
        options={{
          title: 'Happenings',
          tabBarIcon: ({ color }) => <MapPinned size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(home)/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(circles)/index"
        options={{
          title: 'My Circles',
          tabBarIcon: ({ color }) => <UserRound size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="(settings)/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
