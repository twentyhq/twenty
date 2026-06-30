import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// The three chunk must never enter the initial bundle: rigs reach the heavy
// zones only through next/dynamic. This reads the production build manifest
// and fails if any initial chunk contains the three marker.
const packageRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const manifestPath = path.join(packageRoot, '.next', 'build-manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error(
    'check-visual-bundle: run `next build` first (.next/build-manifest.json missing).',
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const initialChunks = new Set([
  ...(manifest.rootMainFiles ?? []),
  ...Object.values(manifest.pages ?? {}).flat(),
]);

const offending = [];
for (const chunk of initialChunks) {
  if (!chunk.endsWith('.js')) continue;
  const chunkPath = path.join(packageRoot, '.next', chunk);
  if (!fs.existsSync(chunkPath)) continue;
  const content = fs.readFileSync(chunkPath, 'utf8');
  if (content.includes('WebGLRenderer') || content.includes('three.module')) {
    offending.push(chunk);
  }
}

if (offending.length > 0) {
  console.error(
    'check-visual-bundle: FAILED — three reached the initial bundle:',
  );
  for (const chunk of offending) console.error(`  ${chunk}`);
  process.exit(1);
}

console.log(
  `check-visual-bundle: OK (${initialChunks.size} initial chunks, three absent)`,
);
