// packages/firebase/src/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_FIREBASE_API_KEY?: string;
    REACT_APP_FIREBASE_AUTH_DOMAIN?: string;
    EXPO_PUBLIC_FIREBASE_API_KEY?: string;
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
    [key: string]: string | undefined;
  }
}