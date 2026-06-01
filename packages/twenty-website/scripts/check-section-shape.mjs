#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SECTIONS_DIR = path.join(ROOT, 'src', 'sections');

const LEAF_SECTIONS = new Set([
  'CaseStudy',
  'CaseStudyCatalog',
  'ContactCal',
  'LegalDocument',
  'PartnerApplication',
  'Stepper',
  // Visual-only modules: their layout shells moved to src/templates/, so they
  // no longer own a section <Root> — they just expose visual components.
  'Hero',
  'ThreeCards',
  'Testimonials',
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
    // Legacy compound sections own the <section> in components/Root.tsx.
    path.join(sectionDir, 'components', 'Root.tsx'),
    // Single-file sections own it in <Section>.tsx (e.g. TrustedBy/TrustedBy.tsx).
    path.join(sectionDir, `${sectionName}.tsx`),
    path.join(sectionDir, `${sectionName}.ts`),
    // Flat-primitive sections own it in a <Section>Section shell
    // (e.g. Hero/components/HeroSection.tsx) consumed by page-local blocks.
    path.join(sectionDir, 'components', `${sectionName}Section.tsx`),
  ];
  for (const candidate of candidates) {
    if (await fileExists(candidate)) return candidate;
  }
  return null;
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
      `${name}: missing a barrel (index.{ts,tsx}) — every section must expose its public API through one barrel (flat named exports; no compound objects).`,
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

  return violations;
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
