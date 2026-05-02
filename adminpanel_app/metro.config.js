const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// ── Isolate from parent project ──────────────────────────────────────
// The parent directory has a different react-native version (0.84.1).
// Without this, Metro walks up and resolves modules from the parent's
// node_modules, which causes "PlatformConstants could not be found".
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Block the parent project's node_modules entirely
const parentNodeModules = path
  .resolve(__dirname, '..', 'node_modules')
  .replace(/[/\\]/g, '[/\\\\]');
config.resolver.blockList = [
  ...(config.resolver.blockList ? [config.resolver.blockList] : []).flat(),
  new RegExp(`${parentNodeModules}.*`),
];

module.exports = withNativeWind(config, { input: './global.css' });
