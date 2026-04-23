#!/usr/bin/env node
/**
 * scripts/check-boundaries.mjs
 *
 * Architectural invariants that oxlint cannot express. Run as part of
 * `nx lint twenty-website-new`. Exit code is non-zero on violation.
 *
 * The rules here are deliberately narrow and high-signal. Layering rules
 * (sections cannot import app, lib cannot import sections, …) are enforced
 * by `no-restricted-imports` overrides in `.oxlintrc.json`. This script
 * handles invariants that need expression-level introspection.
 *
 * Add new rules sparingly — every entry is friction for contributors and
 * should pay for itself.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

/**
 * @typedef {{
 *   id: string,
 *   description: string,
 *   pattern: RegExp,
 *   appliesTo: (relativePath: string) => boolean,
 *   exempt: (relativePath: string) => boolean,
 *   help: string,
 * }} Rule
 */

/**
 * Known pre-existing violations grandfathered while the codebase is being
 * cleaned up. The check ratchets: any violation outside this set fails the
 * build, and any entry in this set that no longer fires also fails the build
 * (so the list cannot rot out of date).
 *
 * Drive the list to zero, then remove the entry entirely.
 *
 * Format: `<rule-id>:<relative-path>`
 */
const KNOWN_VIOLATIONS = new Set([
  // Halftone studio still uses raw THREE.WebGLRenderer for PNG / GIF export
  // because exporters render at custom resolutions outside the site-wide
  // context budget. Tracked for the halftone consolidation phase.
  'no-raw-webgl-renderer:src/app/halftone/_lib/exporters.ts',
]);

/** @type {Rule[]} */
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
      'preference defaults. See ARCHITECTURE.md → Heavy visuals.',
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

/**
 * @param {string} contents
 * @param {RegExp} pattern
 * @returns {Array<{ line: number, column: number, snippet: string }>}
 */
function findMatches(contents, pattern) {
  const matches = [];
  const lines = contents.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(pattern);
    if (m && m.index != null) {
      matches.push({
        line: i + 1,
        column: m.index + 1,
        snippet: line.trim(),
      });
    }
  }
  return matches;
}

async function main() {
  const violations = [];

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

      const matches = findMatches(contents, rule.pattern);
      for (const m of matches) {
        violations.push({ rule, file: rel, ...m });
      }
    }
  }

  /** @type {typeof violations} */
  const newViolations = [];
  /** @type {Set<string>} */
  const seenKnown = new Set();

  for (const v of violations) {
    const key = `${v.rule.id}:${v.file}`;
    if (KNOWN_VIOLATIONS.has(key)) {
      seenKnown.add(key);
    } else {
      newViolations.push(v);
    }
  }

  /** @type {string[]} */
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
      '  Remove the following from KNOWN_VIOLATIONS in scripts/check-boundaries.mjs',
    );
    console.error('  (the underlying violation no longer exists — good!):');
    console.error('');
    for (const key of staleKnown) {
      console.error(`    - ${key}`);
    }
    console.error('');
  }

  if (exitCode === 0 && KNOWN_VIOLATIONS.size > 0) {
    console.error(
      `check-boundaries: OK (${KNOWN_VIOLATIONS.size} grandfathered violation(s) tolerated; drive to zero).`,
    );
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
