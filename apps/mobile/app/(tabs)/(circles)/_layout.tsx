import { Stack } from 'expo-router';

import { useAppTheme } from '@/hooks/useAppTheme';

export default function CirclesLayout() {
  const { t } = useAppTheme();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bgCanvas } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen name="newCircleForm" />
    </Stack>
  );
}
