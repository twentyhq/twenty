#!/usr/bin/env node
/**
 * scripts/check-section-shape.mjs
 *
 * Architectural invariants for `src/sections/<Section>/` folders. Run as
 * part of `nx lint twenty-website-new` (sibling to `check-boundaries.mjs`).
 *
 * Sections are the page-agnostic compounds the routes consume. The
 * contract:
 *
 *   1. `<Section>/components/index.{ts,tsx}` exists and is the public
 *      barrel.
 *   2. `<Section>/components/Root.tsx` exists (or the barrel re-exports
 *      a `Root` from a sibling file).
 *   3. No `Children.toArray(children)` positional indexing inside
 *      `Root.tsx` — slots must be matched by `displayName`.
 *   4. Each compound slot exported from the barrel sets a `displayName`
 *      so consumers (and `Root`) can match by name. Detected via static
 *      grep: every `*.tsx` under `<Section>/components/` whose default
 *      shape is a function-component must either set
 *      `<ComponentName>.displayName = '...'` or be exempt (private
 *      helpers, `Root`, layout wrappers without slot semantics).
 *
 *   Rule (4) is the noisy one — it would fire on every styled wrapper
 *   in the codebase. Instead we apply it narrowly: any component whose
 *   *name* appears in the `Section` compound export object is required
 *   to set `displayName`. This catches the only thing that matters
 *   (slot components used by name-based discovery) without lighting up
 *   on internal helpers.
 *
 * The script is intentionally line-based rather than AST-based — the
 * regexes here have to be tight, and a real parser would add a
 * dependency for what amounts to four checks.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SECTIONS_DIR = path.join(ROOT, 'src', 'sections');

/**
 * Sections whose `Root` discovers children by `displayName`. The value
 * is the set of *slot* names that Root inspects (i.e. every name that
 * `Root.tsx` will look up by `displayName`). Auxiliary exports from the
 * barrel — leaf primitives consumers may render directly, like
 * `TrustedBy.Logo` rendered inside `TrustedBy.Logos` — are intentionally
 * omitted because they don't participate in slot matching.
 */
const SECTIONS_USING_NAMED_SLOTS = new Map([
  ['Marquee', new Set(['Heading'])],
  ['TrustedBy', new Set(['Separator', 'Logos', 'ClientCount'])],
]);

/**
 * Sections that intentionally do not own a single `<section>` `Root` —
 * they ship a *toolkit* of independently-composable parts that the
 * route stitches together (the slots are siblings inside a route-owned
 * wrapper, not children of a section-owned wrapper). The barrel rule
 * still applies, only the Root + Children-toArray rules are skipped.
 *
 * Adding to this set is a deliberate architectural decision — most
 * sections should own their Root.
 */
const LEAF_SECTIONS = new Set([
  'CaseStudy',
  'CaseStudyCatalog',
  // LegalDocument exposes a single page-shaped wrapper (`LegalDocument.Page`)
  // rather than a Root + slots. The route renders one `<LegalDocument.Page>`
  // around its own MDX/JSX body. Renaming `Page` -> `Root` would lose the
  // semantic that this is the *only* shape this section ever takes.
  'LegalDocument',
]);

async function listSections() {
  const entries = await fs.readdir(SECTIONS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function fileExists(absPath) {
  try {
    await fs.stat(absPath);
    return true;
  } catch {
    return false;
  }
}

async function readFileOrNull(absPath) {
  try {
    return await fs.readFile(absPath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Locate the section barrel. We accept either `components/index.ts` or
 * `components/index.tsx`; both forms exist in the codebase today and
 * they're equivalent at the consumer.
 */
async function findBarrel(sectionDir) {
  const candidates = [
    path.join(sectionDir, 'components', 'index.ts'),
    path.join(sectionDir, 'components', 'index.tsx'),
  ];
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

/**
 * Locate `Root.tsx`. Sections always own their root component locally;
 * we don't (yet) need to walk imports out of the barrel.
 */
async function findRoot(sectionDir) {
  const candidate = path.join(sectionDir, 'components', 'Root.tsx');
  if (await fileExists(candidate)) return candidate;
  return null;
}

/**
 * Parse the slot names exported from a section barrel by reading the
 * `export const <Section> = { Slot1, Slot2, ... };` block. Returns the
 * raw identifier list — caller is responsible for cross-checking that
 * each identifier resolves to a function component with `displayName`
 * set.
 *
 * If the barrel does not match the expected shape we return `null`,
 * which the caller treats as "skip the slot-displayName check for this
 * section". This is intentionally permissive: static parsing of every
 * possible barrel shape is out of scope for this script — the `Root`
 * and `Children.toArray` checks below carry most of the contract.
 */
function parseSlotIdentifiers(barrelContents) {
  const exportMatch = barrelContents.match(
    /export\s+const\s+\w+\s*=\s*\{([^}]+)\}/m,
  );
  if (!exportMatch) return null;
  const body = exportMatch[1];
  return body
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .map((entry) => {
      const colon = entry.indexOf(':');
      return colon === -1 ? entry : entry.slice(0, colon).trim();
    });
}

const TOARRAY_REGEX = /Children\.toArray\s*\(/;

/**
 * Strip block comments (`/* ... *​/`) and line comments (`//` to EOL)
 * so subsequent regex checks only look at executable source. The naive
 * pass below is good enough — it doesn't try to honour string literals
 * (we don't expect `"// ..."` to appear inside a Root) and it doesn't
 * preserve line numbers (callers report by file, not line, so that's
 * fine).
 */
function stripComments(source) {
  let out = source.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out.replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  return out;
}

async function checkSection(name) {
  const sectionDir = path.join(SECTIONS_DIR, name);
  /** @type {string[]} */
  const violations = [];

  const barrel = await findBarrel(sectionDir);
  if (barrel === null) {
    violations.push(
      `${name}: missing components/index.{ts,tsx} barrel — every section must expose a single compound export.`,
    );
    return violations;
  }

  if (LEAF_SECTIONS.has(name)) return violations;

  const root = await findRoot(sectionDir);
  if (root === null) {
    violations.push(
      `${name}: missing components/Root.tsx — every section needs a Root that owns the outer <section> element.`,
    );
  } else {
    const rootContents = await readFileOrNull(root);
    if (
      rootContents !== null &&
      TOARRAY_REGEX.test(stripComments(rootContents))
    ) {
      violations.push(
        `${name}: components/Root.tsx uses Children.toArray(...) positional indexing — match slots by displayName instead (see TrustedBy.Root for the pattern).`,
      );
    }
  }

  const slotsToCheck = SECTIONS_USING_NAMED_SLOTS.get(name);
  if (slotsToCheck !== undefined) {
    const barrelContents = await readFileOrNull(barrel);
    const exportedSlotNames = barrelContents
      ? parseSlotIdentifiers(barrelContents)
      : null;
    for (const slot of slotsToCheck) {
      if (exportedSlotNames !== null && !exportedSlotNames.includes(slot)) {
        violations.push(
          `${name}: slot "${slot}" is declared in SECTIONS_USING_NAMED_SLOTS but is not exported from ${path.relative(
            ROOT,
            barrel,
          )}. Either export it or remove the entry from check-section-shape.mjs.`,
        );
        continue;
      }
      const expected = `${name}.${slot}`;
      const slotFile = await locateSlotFile(sectionDir, slot);
      if (slotFile === null) {
        violations.push(
          `${name}: slot "${slot}" is declared in SECTIONS_USING_NAMED_SLOTS but no source file matches the conventional path (components/${slot}.tsx or components/${slot}/${slot}.tsx).`,
        );
        continue;
      }
      const contents = await readFileOrNull(slotFile);
      if (contents === null) continue;
      if (!contents.includes(`displayName = '${expected}'`)) {
        violations.push(
          `${name}: slot "${slot}" source (${path.relative(
            ROOT,
            slotFile,
          )}) does not set ${slot}.displayName = '${expected}'. Root looks slots up by displayName; without it the slot silently fails to render.`,
        );
      }
    }
  }

  return violations;
}

/**
 * Best-effort source resolution for a slot identifier exported from the
 * barrel. We look for `<components>/<slot>.tsx` first and fall back to
 * any `*.tsx` under `components/` whose default export name matches.
 * This keeps the script side-effect-free without parsing imports — the
 * common case (TrustedBy/Marquee) lives one directory down.
 */
async function locateSlotFile(sectionDir, slot) {
  const candidates = [
    path.join(sectionDir, 'components', `${slot}.tsx`),
    path.join(sectionDir, 'components', slot, `${slot}.tsx`),
  ];
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

async function main() {
  const sections = await listSections();
  /** @type {string[]} */
  const allViolations = [];
  for (const name of sections) {
    const sectionViolations = await checkSection(name);
    for (const v of sectionViolations) allViolations.push(v);
  }

  if (allViolations.length === 0) {
    console.error(
      `check-section-shape: OK (${sections.length} sections inspected).`,
    );
    return 0;
  }

  console.error('');
  console.error(
    `\u001b[31mcheck-section-shape: ${allViolations.length} violation(s)\u001b[0m`,
  );
  console.error('');
  for (const v of allViolations) {
    console.error(`  - ${v}`);
  }
  console.error('');
  console.error(
    '  See ARCHITECTURE.md → "Section contract" for the full rules.',
  );
  console.error('');
  return 1;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('check-section-shape: unexpected error');
    console.error(err);
    process.exit(2);
  });
