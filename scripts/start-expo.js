const { spawn } = require('node:child_process');
const path = require('node:path');

const expoCli = require.resolve('expo/bin/cli');
const args = ['start', ...process.argv.slice(2)];

const child = spawn(process.execPath, [expoCli, ...args], {
  env: {
    ...process.env,
    DOTSLASH_CACHE: path.join(process.cwd(), '.dotslash-cache'),
    // LAN development and Expo Go QR scanning work without Expo's remote API.
    // This also keeps startup reliable on restricted or intermittent networks.
    EXPO_OFFLINE: process.env.EXPO_OFFLINE ?? '1',
  },
  stdio: 'inherit',
});

child.on('exit', (code) => process.exit(code ?? 1));
