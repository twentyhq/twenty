#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SECTIONS_DIR = path.join(ROOT, 'src', 'sections');

const SECTIONS_USING_NAMED_SLOTS = new Map([]);

const LEAF_SECTIONS = new Set([
  'CaseStudy',
  'CaseStudyCatalog',
  'ContactCal',
  'LegalDocument',
  'PartnerApplication',
  'Stepper',
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

async function findBarrel(sectionDir) {
  const candidates = [
    path.join(sectionDir, 'components', 'index.ts'),
    path.join(sectionDir, 'components', 'index.tsx'),
    path.join(sectionDir, 'index.ts'),
    path.join(sectionDir, 'index.tsx'),
  ];
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

async function findRoot(sectionDir) {
  const sectionName = path.basename(sectionDir);
  const candidates = [
    path.join(sectionDir, 'components', 'Root.tsx'),
    path.join(sectionDir, `${sectionName}.tsx`),
    path.join(sectionDir, `${sectionName}.ts`),
  ];
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
}

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

function stripComments(source) {
  let out = source.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out.replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  return out;
}

async function checkSection(name) {
  const sectionDir = path.join(SECTIONS_DIR, name);
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
  return 1;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error('check-section-shape: unexpected error');
    console.error(err);
    process.exit(2);
  });
