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

// Color and easing literals live only in src/tokens (comments stripped
// before matching). Authored one-offs are allowlisted with their reason.
const LITERAL_ALLOWLIST = new Set([
  'src/sections/home-hero/home-hero.tsx', // ported radial gradient stops
]);
// Files allowed to set the new-tab security attributes themselves.
const EXTERNAL_LINK_OWNERS = new Set([
  'src/ui/external-link.tsx',
  'src/ui/button.tsx',
]);
const LITERAL_PATTERNS = [
  [/#[0-9a-fA-F]{3,8}\b/, 'hex color literal'],
  [/rgba?\(/, 'rgb/rgba literal'],
  [/cubic-bezier\(/, 'cubic-bezier literal'],
];

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

    if (
      !relativePath.startsWith('tokens' + path.sep) &&
      !relativePath.includes('.test.') &&
      !LITERAL_ALLOWLIST.has(`src/${relativePath}`)
    ) {
      const withoutComments = content
        .split('\n')
        .map((line) => line.replace(/\/\/.*$/, ''))
        .join('\n')
        .replace(/\/\*[\s\S]*?\*\//g, '');
      for (const [pattern, label] of LITERAL_PATTERNS) {
        if (pattern.test(withoutComments)) {
          failures.push(
            `src/${relativePath}: ${label} outside src/tokens — use a token.`,
          );
        }
      }
    }

    // Breakpoints exist only through mediaUp(); a raw width query bypasses
    // the breakpoint tokens (reduced-motion and print queries are fine).
    if (
      !relativePath.startsWith('tokens' + path.sep) &&
      /@media \((?:min|max)-width/.test(content)
    ) {
      failures.push(
        `src/${relativePath}: raw width @media query — use mediaUp().`,
      );
    }

    if (
      !EXTERNAL_LINK_OWNERS.has(`src/${relativePath}`) &&
      /target="_blank"|noopener/.test(content)
    ) {
      failures.push(
        `src/${relativePath}: new-tab attributes belong to ui/ExternalLink — compose it.`,
      );
    }

    // Screen-reader strings are user-facing: a11y attributes must be
    // localized, never string literals.
    if (
      relativePath.startsWith('sections' + path.sep) &&
      /(?:aria-label|ariaLabel|aria-roledescription|placeholder|alt)="[A-Za-z]/.test(
        content,
      )
    ) {
      failures.push(
        `src/${relativePath}: untranslated a11y string literal — wrap in i18n._(msg\`...\`).`,
      );
    }

    // Sections are islands: importing another section couples compositions
    // that must evolve independently. Shared shapes live in ui/icons/platform.
    if (relativePath.startsWith('sections' + path.sep)) {
      const ownSection = relativePath.split(path.sep)[1];
      const crossImport = [...content.matchAll(/from '@\/sections\/([a-z-]+)/g)]
        .map((m) => m[1])
        .find((section) => section !== ownSection);
      if (crossImport) {
        failures.push(
          `src/${relativePath}: imports from sections/${crossImport} — sections may not import each other.`,
        );
      }
    }

    // tokens and icons are pure: no client runtime.
    if (
      (relativePath.startsWith('tokens' + path.sep) ||
        relativePath.startsWith('icons' + path.sep)) &&
      content.includes("'use client'")
    ) {
      failures.push(`src/${relativePath}: 'use client' in a pure layer.`);
    }

    // kebab-case filenames (compiled locale catalogs are generated).
    if (
      !relativePath.startsWith('locales' + path.sep) &&
      /[A-Z]/.test(entry.name)
    ) {
      failures.push(`src/${relativePath}: filenames are kebab-case.`);
    }

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
