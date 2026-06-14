const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Codex creates short-lived refs under .git while Metro starts. The Windows
// fallback watcher can discover one immediately before it is removed, causing
// fs.watch to throw ENOENT. Git metadata is never needed by the app bundle.
const escapedGitPath = path
  .join(projectRoot, '.git')
  .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : [config.resolver.blockList]),
  new RegExp(`^${escapedGitPath}(?:\\\\|/).*`),
];

module.exports = config;
