/// <reference types="nativewind/types" />

declare module 'expo-router/unstable-native-tabs' {
  import React from 'react';

  export interface NativeTabsProps {
    className?: string;
    backgroundColor?: string;
    indicatorColor?: string;
    labelStyle?: {
      selected?: { color?: string };
      unselected?: { color?: string };
    };
    children?: React.ReactNode;
  }

  export const NativeTabs: React.FC<NativeTabsProps> & {
    Trigger: any;
  };
}