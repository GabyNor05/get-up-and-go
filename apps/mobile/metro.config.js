const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Expo SDK 52+ configures monorepo watchFolders (repo root + workspaces)
// automatically, so packages/firebase and packages/shared-ui resolve
// without overriding them here.
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
