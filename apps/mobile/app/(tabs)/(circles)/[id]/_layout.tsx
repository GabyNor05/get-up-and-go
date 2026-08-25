import { Stack } from "expo-router";

export default function SingleCircleLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The main Circle Feed / View */}
      <Stack.Screen 
        name="index" 
      />

      {/* Member/Goer profile view */}
      <Stack.Screen 
        name="goer" 
      />

      {/* Slide-over or modal for Manage Circlees */}
      <Stack.Screen
        name="manageCircleesDrawer"
        options={{
          presentation: "modal", // or 'formSheet' on iOS
          animation: "slide_from_bottom",
        }}
      />

      {/* Invite Screen */}
      <Stack.Screen
        name="invite"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
        }}
      />

      {/* Leave Circle Confirmation Alert/Modal */}
      <Stack.Screen
        name="confirmationModal"
        options={{
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}