// Polyfill DOMException before Expo Router boots
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

import "expo-router/entry";

import logo from "../../packages/shared-ui/assets/logos/lightBgLogo.png"