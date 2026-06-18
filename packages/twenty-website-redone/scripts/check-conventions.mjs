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

// Locale rewrites run BEFORE the filesystem: every top-level public/ dir
// must be a reserved prefix or its assets 404 under /fr/* style rewrites.
// This bug class shipped three times (models, halftone, lottie) before
// this check existed.
{
  const patternsSource = fs.readFileSync(
    'src/platform/routing/locale-rewrite-patterns.ts',
    'utf8',
  );
  const publicDirectories = fs
    .readdirSync('public', { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  for (const directory of publicDirectories) {
    if (!new RegExp(`'${directory}'`).test(patternsSource)) {
      failures.push(
        `public/${directory}/ is not in RESERVED_PREFIXES (locale-rewrite-patterns.ts) — its assets 404 under locale rewrites.`,
      );
    }
  }
}

// Color and easing literals live only in src/tokens (comments stripped
// before matching). Authored one-offs are allowlisted with their reason.
const LITERAL_ALLOWLIST = new Set([]);
// Files allowed to set the new-tab security attributes themselves.
const EXTERNAL_LINK_OWNERS = new Set([
  'src/ui/external-link.tsx',
  'src/ui/button.tsx',
]);

// Owned vector glyphs are React components in src/icons — never .svg
// files in public/. Files here are third-party brand assets the site can
// only serve by URL (plus twenty.svg, the data layer's static export of
// src/icons/twenty-logo.tsx for the mockup's brand-image-by-URL path).
const PUBLIC_SVG_BRAND_FILES = new Set([
  'public/images/logo-bar/otiima.svg',
  'public/images/logo-bar/civicactions.svg',
  'public/images/logo-bar/fora.svg',
  'public/images/logo-bar/wazoku.svg',
  'public/images/shared/companies/logos/linear.svg',
  'public/images/shared/companies/logos/twenty.svg',
]);
// Vertical rhythm rides margins ('& > * + *'), not row-gap: gap breaks
// silently when a wrapper changes the child list. row-gap is allowed only
// where layout is genuinely multi-axis (wrapping rows, multi-column
// tracks) — listed here explicitly.
const ROW_GAP_MULTI_AXIS_FILES = new Set([
  'sections/case-study-detail/case-study-hero.tsx',
  'sections/faq/faq.tsx',
  'sections/faq/faq-items.tsx',
  'sections/pricing-plans/pricing-board.tsx',
  'sections/problem/problem.tsx',
  'sections/releases-feed/releases-feed.tsx',
  'sections/stepper/product-stepper.tsx',
  'sections/stepper/stepper.tsx',
  'sections/testimonials/partner-testimonials-carousel.tsx',
  'sections/testimonials/testimonials-carousel.tsx',
  'sections/trusted-by/trusted-by.tsx',
  'sections/why-twenty-editorial/editorial.tsx',
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
    const posixPath = relativePath.split(path.sep).join('/');

    if (
      (posixPath.startsWith('ui/') || posixPath.startsWith('sections/')) &&
      /row-gap:/.test(content) &&
      !ROW_GAP_MULTI_AXIS_FILES.has(posixPath)
    ) {
      failures.push(
        `src/${relativePath}: row-gap in a flow stack — use '& > * + * { margin-top: … }' (mind: unlike gap, the margin shifts absolutely-positioned non-first children; allowlist the file if the layout is genuinely multi-axis).`,
      );
    }

    // The global * reset (layout.tsx) already zeroes every element's margin,
    // so a component's own 'margin: 0' is redundant — and it ties with the
    // owl rhythm ('& > * + * { margin-top }', equal specificity), silently
    // collapsing the gap by source order (this broke a heading once). Cancel
    // an owl gap deliberately with the specific 'margin-top: 0' instead.
    if (
      posixPath !== 'app/[locale]/layout.tsx' &&
      // The /halftone generator bakes standalone HTML whose own '* { margin: 0 }'
      // reset is required — the downloaded file has no global reset to inherit.
      !posixPath.startsWith('platform/visuals/halftone-studio/') &&
      !relativePath.includes('.test.') &&
      /^[ \t]*margin:[ \t]*0;[ \t]*$/m.test(content)
    ) {
      failures.push(
        `src/${relativePath}: redundant 'margin: 0' — the global * reset zeroes margins and it ties with the owl rhythm; remove it (use 'margin-top: 0' to deliberately cancel an owl gap).`,
      );
    }

    if (
      !relativePath.startsWith('tokens' + path.sep) &&
      // The /halftone generator is a standalone color/shader tool: hex + rgba
      // colors and cubic-bezier eases are its domain values (and what it
      // exports), not design-system tokens.
      !posixPath.startsWith('platform/visuals/halftone-studio/') &&
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
      (relativePath.startsWith('sections' + path.sep) ||
        relativePath.startsWith('case-studies' + path.sep) ||
        relativePath.startsWith('app-preview' + path.sep) ||
        relativePath.startsWith('contact-cal' + path.sep) ||
        relativePath.startsWith('partner-application' + path.sep) ||
        relativePath.startsWith('partners-marketplace' + path.sep) ||
        relativePath.startsWith('pricing-state' + path.sep)) &&
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

    // Shared composite layers (the product mockup, the contact modal) sit
    // between sections and primitives: multiple sections consume them, so
    // they may reach only the pure and platform layers, never sections.
    const sharedLayer = [
      'app-preview',
      'case-studies',
      'contact-cal',
      'partner-application',
      'partners-marketplace',
      'pricing-state',
    ].find((layer) => relativePath.startsWith(layer + path.sep));
    if (sharedLayer) {
      const allowedLayers = new Set([
        'tokens',
        'icons',
        'ui',
        'platform',
        sharedLayer,
      ]);
      const forbiddenLayer = [...content.matchAll(/from '@\/([a-z-]+)/g)]
        .map((m) => m[1])
        .find((layer) => !allowedLayers.has(layer));
      if (forbiddenLayer) {
        failures.push(
          `src/${relativePath}: ${sharedLayer} may import only tokens/icons/ui/platform, found @/${forbiddenLayer}.`,
        );
      }
    }

    // twenty-ui's theme is pure data, baked by Linaria at build time — consume
    // it directly so the mockups can't drift from the product. Its components
    // are React runtime (+ react-tooltip): importing them would weigh down the
    // marketing bundle, so the mockups stay on lean primitives built against
    // the theme.
    const badTwentyUiSubpath = [
      ...content.matchAll(/from 'twenty-ui(\/[a-z-]+)?'/g),
    ]
      .map((match) => match[1] ?? '')
      .find(
        (subpath) => subpath !== '/theme' && subpath !== '/theme-constants',
      );
    if (badTwentyUiSubpath !== undefined) {
      failures.push(
        `src/${relativePath}: only twenty-ui/theme is importable (pure data, baked at build); twenty-ui${badTwentyUiSubpath} pulls React runtime into the bundle — build a lean primitive instead.`,
      );
    }

    // three is heavy (~150KB gz): only the visuals heavy zones may value-
    // import it, reached exclusively via the rigs' dynamic imports — the
    // bundle boundary as a build invariant. (halftone-studio is the standalone
    // /halftone generator tool, dynamic-imported on its own code-split route.)
    if (
      !/^platform\/visuals\/(three-runtime|halftone|halftone-studio)\//.test(
        relativePath.split(path.sep).join('/'),
      ) &&
      /^import (?!type )[^;]*from 'three/m.test(content)
    ) {
      failures.push(
        `src/${relativePath}: value-imports three outside platform/visuals heavy zones (use "import type" for types).`,
      );
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

    // The module-shape rules are line-anchored and must not read inside
    // template literals (mock source-code fiction contains export lines).
    const withoutTemplateLiterals = content.replace(/`[\s\S]*?`/g, '``');

    if (DEFAULT_EXPORT_PATTERN.test(withoutTemplateLiterals)) {
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

    const valueExportCount = (
      withoutTemplateLiterals.match(VALUE_EXPORT_PATTERN) ?? []
    ).length;
    if (valueExportCount > 1) {
      failures.push(
        `src/${relativePath}: ${valueExportCount} value exports (limit is one per file).`,
      );
    }
  }
}

walk(sourceRoot);

// Public SVG audit: any .svg outside the brand-file allowlist means an
// owned glyph leaked out of src/icons.
const publicSvgs = [];
const walkPublic = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkPublic(fullPath);
    else if (entry.name.endsWith('.svg')) publicSvgs.push(fullPath);
  }
};
walkPublic('public');
for (const svgPath of publicSvgs) {
  if (!PUBLIC_SVG_BRAND_FILES.has(svgPath)) {
    failures.push(
      `${svgPath}: owned vector glyphs are components in src/icons — public/ svg files are third-party brand assets only (or add to PUBLIC_SVG_BRAND_FILES with a reason).`,
    );
  }
}

if (failures.length > 0) {
  console.error('check-conventions: FAILED');
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log('check-conventions: OK');
