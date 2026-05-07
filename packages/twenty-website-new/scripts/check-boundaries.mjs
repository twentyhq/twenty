#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const KNOWN_VIOLATIONS = new Set([]);

const ALLOW_DIRECTIVE_REGEX =
  /\/\/\s*boundary-allow-next-line:([\w-]+)(?:\s+--\s+.+)?/;

const RULES = [
  {
    id: 'no-raw-webgl-renderer',
    description:
      '`new THREE.WebGLRenderer(...)` may only be instantiated inside `src/lib/visual-runtime/`.',
    pattern: /new\s+(?:THREE\.)?WebGLRenderer\s*\(/,
    appliesTo: (rel) =>
      rel.startsWith('src/') && /\.(ts|tsx|mjs|js|jsx)$/.test(rel),
    exempt: (rel) =>
      rel.startsWith('src/lib/visual-runtime/') ||
      rel.includes('__tests__') ||
      rel.endsWith('.d.ts'),
    help: [
      'Use `createSiteWebGlRenderer` from `@/lib/visual-runtime/create-site-webgl-renderer`',
      'instead. The factory enforces the site-wide context cap, attaches the kill',
      'switch (NEXT_PUBLIC_DISABLE_HEAVY_VISUALS), and centralises GPU / power',
      'preference defaults.',
    ].join('\n      '),
  },
  {
    id: 'no-raw-animation-frame',
    description:
      '`requestAnimationFrame(...)` / `cancelAnimationFrame(...)` may only be used inside shared runtime primitives.',
    pattern:
      /\b(?:window\.)?(?:requestAnimationFrame|cancelAnimationFrame)\s*\(/,
    appliesTo: (rel) =>
      rel.startsWith('src/') && /\.(ts|tsx|mjs|js|jsx)$/.test(rel),
    exempt: (rel) =>
      rel.startsWith('src/lib/animation/') ||
      rel.startsWith('src/lib/visual-runtime/') ||
      rel.includes('__tests__') ||
      rel === 'src/app/[locale]/halftone/_lib/exporters.ts' ||
      rel.endsWith('.d.ts'),
    help: [
      'Use `createAnimationFrameLoop` from `@/lib/animation` for one-shot',
      'or UI frame scheduling. Use `createVisualRenderLoop` from',
      '`@/lib/visual-runtime` for canvas/WebGL renderers so tab visibility,',
      'element visibility, cleanup, and render failures are handled consistently.',
    ].join('\n      '),
  },
];

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'storybook-static',
  'public',
  '.git',
]);

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(path.join(dir, entry.name));
    } else if (entry.isFile()) {
      yield path.join(dir, entry.name);
    }
  }
}

function findMatches(contents, pattern, ruleId) {
  const matches = [];
  const directives = [];
  const lines = contents.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const directiveMatch = line.match(ALLOW_DIRECTIVE_REGEX);
    if (directiveMatch && directiveMatch[1] === ruleId) {
      directives.push({ line: i + 1, ruleId, suppressed: false });
    }

    const m = line.match(pattern);
    if (m && m.index != null) {
      const prevDirective = directives.find((d) => d.line === i);
      const suppressed = prevDirective !== undefined;
      if (prevDirective) prevDirective.suppressed = true;
      matches.push({
        line: i + 1,
        column: m.index + 1,
        snippet: line.trim(),
        suppressed,
      });
    }
  }
  return { matches, directives };
}

async function main() {
  const violations = [];
  const staleDirectives = [];

  for await (const absPath of walk(SRC)) {
    const rel = path.relative(ROOT, absPath).split(path.sep).join('/');

    for (const rule of RULES) {
      if (!rule.appliesTo(rel)) continue;
      if (rule.exempt(rel)) continue;

      let contents;
      try {
        contents = await fs.readFile(absPath, 'utf8');
      } catch {
        continue;
      }

      const { matches, directives } = findMatches(
        contents,
        rule.pattern,
        rule.id,
      );
      for (const m of matches) {
        if (m.suppressed) continue;
        violations.push({
          rule,
          file: rel,
          line: m.line,
          column: m.column,
          snippet: m.snippet,
        });
      }
      for (const d of directives) {
        if (!d.suppressed) {
          staleDirectives.push({ rule, file: rel, line: d.line });
        }
      }
    }
  }

  const newViolations = [];
  const seenKnown = new Set();

  for (const v of violations) {
    const key = `${v.rule.id}:${v.file}`;
    if (KNOWN_VIOLATIONS.has(key)) {
      seenKnown.add(key);
    } else {
      newViolations.push(v);
    }
  }

  const staleKnown = [];
  for (const key of KNOWN_VIOLATIONS) {
    if (!seenKnown.has(key)) staleKnown.push(key);
  }

  let exitCode = 0;

  if (newViolations.length > 0) {
    exitCode = 1;
    const byRule = new Map();
    for (const v of newViolations) {
      if (!byRule.has(v.rule.id)) byRule.set(v.rule.id, []);
      byRule.get(v.rule.id).push(v);
    }

    console.error('');
    console.error(
      `\u001b[31mcheck-boundaries: ${newViolations.length} new violation(s) found\u001b[0m`,
    );
    console.error('');

    for (const [ruleId, list] of byRule.entries()) {
      const rule = list[0].rule;
      console.error(`\u001b[1m${ruleId}\u001b[0m — ${rule.description}`);
      console.error('');
      for (const v of list) {
        console.error(`  ${v.file}:${v.line}:${v.column}`);
        console.error(`    > ${v.snippet}`);
      }
      console.error('');
      console.error(`  help:`);
      console.error(`      ${rule.help}`);
      console.error('');
    }
  }

  if (staleKnown.length > 0) {
    exitCode = 1;
    console.error('');
    console.error(
      `\u001b[31mcheck-boundaries: ${staleKnown.length} stale entry/entries in KNOWN_VIOLATIONS\u001b[0m`,
    );
    console.error(
      '  Remove the following from KNOWN_VIOLATIONS in scripts/check-boundaries.mjs:',
    );
    console.error('');
    for (const key of staleKnown) {
      console.error(`    - ${key}`);
    }
    console.error('');
  }

  if (staleDirectives.length > 0) {
    exitCode = 1;
    console.error('');
    console.error(
      `\u001b[31mcheck-boundaries: ${staleDirectives.length} stale boundary-allow-next-line directive(s)\u001b[0m`,
    );
    console.error(
      '  The directive on these lines no longer suppresses any violation. Remove it:',
    );
    console.error('');
    for (const d of staleDirectives) {
      console.error(`    - ${d.file}:${d.line}  (${d.rule.id})`);
    }
    console.error('');
  }

  if (exitCode === 0) {
    if (KNOWN_VIOLATIONS.size > 0) {
      console.error(
        `check-boundaries: OK (${KNOWN_VIOLATIONS.size} grandfathered file-level violation(s) tolerated; drive to zero).`,
      );
    } else {
      console.error('check-boundaries: OK');
    }
  }

  return exitCode;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('check-boundaries: unexpected error');
    console.error(err);
    process.exit(2);
  });
