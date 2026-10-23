import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Version stamp shown on the title screen so players can tell which build they are running.
function git(cmd: string, fallback: string) {
  try { return execSync(`git ${cmd}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() || fallback; } catch { return fallback; }
}
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));
const BUILD = {
  version: pkg.version as string,
  build: Number(git('rev-list --count HEAD', '0')),
  sha: (process.env.GITHUB_SHA ?? git('rev-parse HEAD', 'dev')).slice(0, 7),
  date: new Date().toISOString(),
};

export default defineConfig({
  base: './',
  define: { __BUILD__: JSON.stringify(BUILD) },
  build: { target: 'es2020', outDir: 'dist', assetsInlineLimit: 0 },
  test: { globals: true, environment: 'node', testTimeout: 120000 },
} as any);
