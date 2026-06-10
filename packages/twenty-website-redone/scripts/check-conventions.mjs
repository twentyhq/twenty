import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const sourceRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
);

// Next.js route files are framework contracts: they require default exports
// and may export route config alongside (metadata, generateStaticParams...).
const NEXT_CONTRACT_FILES = new Set([
  'default.tsx',
  'error.tsx',
  'forbidden.tsx',
  'global-error.tsx',
  'layout.tsx',
  'loading.tsx',
  'manifest.ts',
  'not-found.tsx',
  'opengraph-image.tsx',
  'page.tsx',
  'robots.ts',
  'route.ts',
  'sitemap.ts',
  'template.tsx',
  'unauthorized.tsx',
]);

const VALUE_EXPORT_PATTERN =
  /^export (?:const|let|function|async function|class) /gm;
const DEFAULT_EXPORT_PATTERN = /^export default /m;
const REEXPORT_STATEMENT_PATTERN =
  /export (?:type )?\{[\s\S]*?\} from '[^']+';|export \* from '[^']+';/g;

const failures = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      // oxfmt silently ignores directories named "lib" (build-output
      // convention), so a lib/ directory would dodge formatting forever.
      if (entry.name === 'lib' || entry.name === 'generated') {
        failures.push(
          `${fullPath}: directories named "lib" or "generated" are forbidden (oxfmt ignores them).`,
        );
      }
      walk(fullPath);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name)) continue;

    const content = fs.readFileSync(fullPath, 'utf8');
    const relativePath = path.relative(sourceRoot, fullPath);

    // SectionShell is the only owner of <section>: it is where vertical
    // rhythm and surface schemes live, so no other file may create one.
    if (
      relativePath !== path.join('ui', 'section-shell.tsx') &&
      /<section[\s>]|styled\.section/.test(content)
    ) {
      failures.push(
        `src/${relativePath}: <section> may only be rendered by ui/section-shell.tsx.`,
      );
    }
    const isNextContractFile =
      relativePath.startsWith('app' + path.sep) &&
      NEXT_CONTRACT_FILES.has(entry.name);

    if (isNextContractFile) continue;

    if (DEFAULT_EXPORT_PATTERN.test(content)) {
      failures.push(
        `src/${relativePath}: default export outside a Next.js route file (use named exports).`,
      );
    }

    if (entry.name === 'index.ts') {
      const withoutReexports = content
        .replace(REEXPORT_STATEMENT_PATTERN, '')
        .replace(/\/\/[^\n]*/g, '');
      if (/\S/.test(withoutReexports)) {
        failures.push(
          `src/${relativePath}: barrels may only re-export (found: ${withoutReexports.trim().split('\n')[0]}).`,
        );
      }
      continue;
    }

    const valueExportCount = (content.match(VALUE_EXPORT_PATTERN) ?? []).length;
    if (valueExportCount > 1) {
      failures.push(
        `src/${relativePath}: ${valueExportCount} value exports (limit is one per file).`,
      );
    }
  }
}

walk(sourceRoot);

if (failures.length > 0) {
  console.error('check-conventions: FAILED');
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log('check-conventions: OK');
