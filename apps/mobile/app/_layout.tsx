if (typeof globalThis.DOMException === "undefined") {
  class DOMException extends Error {
    code: number;
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name ?? "Error";
      this.code = 0;
    }
  }
  globalThis.DOMException = DOMException as any;
}

import "../global.css";
import { Stack } from "expo-router";

// Import CSS variables directly
import '../../../packages/shared-ui/shared-ui.css';
export default function RootLayout() {


  return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      
  );
}
