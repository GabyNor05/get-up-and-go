import { Stack } from "expo-router";

export default function CirclesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}> 
      <Stack.Screen name="[id]" />
      <Stack.Screen name="newCircleForm" />
    </Stack>
  );
}
