const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// Keep Expo's default watchFolders and make sure the monorepo root is in
// them, so imports from packages/firebase and packages/shared-ui (fonts,
// tokens) resolve.
config.watchFolders = Array.from(new Set([...(config.watchFolders ?? []), monorepoRoot]));

module.exports = withNativeWind(config, { input: './global.css' });
