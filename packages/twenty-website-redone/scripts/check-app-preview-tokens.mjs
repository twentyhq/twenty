import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { appPreviewTokenGeneration } from './app-preview-token-generation.mjs';

// Lint-time freshness + policy check (the check-translations pattern):
// regenerates the mockup theme in memory and diffs it against the
// committed module, then asserts the derivation policy itself. Never
// mutates the tree.

const failures = [];

const theme = await appPreviewTokenGeneration.buildTheme();

// Policy assertions — executable at every lint, not just on test runs.
const remBasePx = theme.facts.remBasePx.value;
if (remBasePx !== 13) {
  failures.push(
    `product rem base changed: expected 13, read ${remBasePx} — re-ratify the mockup's font derivation`,
  );
}
for (const [token, px] of Object.entries(theme.values.font.sizePx)) {
  if (typeof px !== 'number' || px <= 0) {
    failures.push(`font.sizePx.${token} is not a positive number: ${px}`);
  }
}
if (theme.values.font.sizePx.md !== remBasePx) {
  failures.push(
    `font md must equal the rem base (product renders 1rem = ${remBasePx}px), got ${theme.values.font.sizePx.md}`,
  );
}
for (const [label, icon] of Object.entries(theme.values.standardObjectIcons)) {
  if (!/^Icon[A-Z]/.test(icon)) {
    failures.push(`standardObjectIcons.${label} is not a tabler name: ${icon}`);
  }
}
if (theme.values.chrome.navigationItemHeightPx !== 28) {
  failures.push(
    `nav item height must derive spacing×7 = 28, got ${theme.values.chrome.navigationItemHeightPx}`,
  );
}

// Freshness: committed module must equal a fresh render (post-oxfmt).
// oxfmt has no stdin mode, so the render formats in a tmp dir outside
// the tree — this check never mutates the repository.
const rendered = appPreviewTokenGeneration.renderModule(theme);
const scratchDirectory = mkdtempSync(join(tmpdir(), 'app-preview-tokens-'));
const scratchFile = join(scratchDirectory, 'app-preview-theme.ts');
let formatted;
try {
  writeFileSync(scratchFile, rendered);
  execSync(`npx oxfmt ${scratchFile}`, { stdio: 'pipe' });
  formatted = readFileSync(scratchFile, 'utf8');
} finally {
  rmSync(scratchDirectory, { recursive: true, force: true });
}
let committed = null;
try {
  committed = readFileSync(appPreviewTokenGeneration.outputPath, 'utf8');
} catch {
  failures.push(
    `${appPreviewTokenGeneration.outputPath} is missing — run: npx nx run twenty-website-redone:tokens:generate`,
  );
}
if (committed !== null && committed !== formatted) {
  failures.push(
    `${appPreviewTokenGeneration.outputPath} is stale vs twenty-ui/product sources — run: npx nx run twenty-website-redone:tokens:generate and commit`,
  );
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`  ✗ ${failure}`);
  }
  console.error(`check-app-preview-tokens: FAILED (${failures.length})`);
  process.exit(1);
}
console.log('check-app-preview-tokens: OK (fresh + policy holds)');
