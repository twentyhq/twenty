#!/usr/bin/env node
// ReevoCrm patch P3: applies our brand to the engine source at build time, so the
// upstream files stay untouched in git and merges from twenty/main do not conflict.
//
//   node reevo/brand/apply-brand.mjs --check   verify every rule still matches; change nothing
//   node reevo/brand/apply-brand.mjs           apply rules and copy assets (CI, before `docker build`)
//
// Apply only on a throwaway checkout (CI or image build). It edits tracked files in place.
// Values come from brand.json, rules from rules.json, replacement files from assets/.
// No dependencies: runs on any Node >= 18.

import { copyFileSync, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const brandDir = dirname(fileURLToPath(import.meta.url));
const engineRoot = join(brandDir, '..', '..');
const assetsDir = join(brandDir, 'assets');
const checkOnly = process.argv.includes('--check');

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const brand = readJson(join(brandDir, 'brand.json'));
const { rules } = readJson(join(brandDir, 'rules.json'));

const problems = [];
const pending = new Set();

// Brand values land inside JS strings, template literals, JSX attributes and HTML,
// so plain text and URLs only.
const unsafe = /['"`<>\\{}$]/;
for (const [key, value] of Object.entries(brand)) {
  if (!key.startsWith('_') && typeof value === 'string' && unsafe.test(value)) {
    problems.push(`brand.json: "${key}" contains a quote, bracket, backslash or $`);
  }
}

// Returns null when the template uses a brand value that is not set yet.
const fill = (template) => {
  let missing = false;
  const text = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = brand[key];
    if (value === null || value === undefined || value === '') {
      pending.add(key);
      missing = true;
      return '';
    }
    return value;
  });
  return missing ? null : text;
};

const countOf = (text, find) => text.split(find).length - 1;

const contents = new Map();
const changed = new Set();
const load = (file) => {
  if (!contents.has(file)) {
    contents.set(file, readFileSync(join(engineRoot, file), 'utf8'));
  }
  return contents.get(file);
};

let applied = 0;
let skipped = 0;

for (const rule of rules) {
  if (!existsSync(join(engineRoot, rule.file))) {
    problems.push(`${rule.file}: file not found (moved or deleted upstream?)`);
    continue;
  }
  const text = load(rule.file);

  if (rule.json) {
    const data = JSON.parse(text);
    let edited = false;
    for (const [key, template] of Object.entries(rule.json)) {
      if (!(key in data)) {
        problems.push(`${rule.file}: key "${key}" not found`);
        continue;
      }
      const value = fill(template);
      if (value === null) {
        skipped++;
      } else if (data[key] !== value) {
        data[key] = value;
        edited = true;
      }
    }
    if (edited) {
      contents.set(rule.file, `${JSON.stringify(data, null, 2)}\n`);
      changed.add(rule.file);
      applied++;
    }
    continue;
  }

  const expected = rule.count ?? 1;
  const found = countOf(text, rule.find);
  const replacement = fill(rule.replace);
  const alreadyApplied = found === 0 && replacement !== null && text.includes(replacement);

  if (found !== expected && !alreadyApplied) {
    problems.push(`${rule.file}: expected ${expected} x ${JSON.stringify(rule.find)}, found ${found}`);
    continue;
  }
  if (replacement === null) {
    skipped++;
    continue;
  }
  if (!alreadyApplied) {
    contents.set(rule.file, text.split(rule.find).join(replacement));
    changed.add(rule.file);
    applied++;
  }
}

// assets/ mirrors engine paths; each file replaces the upstream file at the same path.
const listFiles = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).flatMap((name) => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? listFiles(path) : [path];
      })
    : [];

const assets = listFiles(assetsDir)
  .map((path) => relative(assetsDir, path).split(sep).join('/'))
  .filter((path) => path !== 'README.md');

for (const asset of assets) {
  if (!existsSync(join(engineRoot, asset))) {
    problems.push(`assets/${asset}: no upstream file at ${asset} to replace (moved or deleted upstream?)`);
  }
}

if (problems.length > 0) {
  console.error('apply-brand: upstream drift or bad config; nothing was changed.');
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error('Update reevo/brand/rules.json (or brand.json, assets/) to match upstream, then rerun.');
  process.exit(1);
}

if (!checkOnly) {
  for (const file of changed) {
    writeFileSync(join(engineRoot, file), contents.get(file));
  }
  for (const asset of assets) {
    copyFileSync(join(assetsDir, asset), join(engineRoot, asset));
  }
}

const verb = checkOnly ? 'would apply' : 'applied';
console.log(
  `apply-brand: ${rules.length} rules match upstream; ${verb} ${applied}, ${skipped} waiting for brand values; ${assets.length} asset file(s).`,
);
if (pending.size > 0) {
  console.log(`  pending brand values (null in brand.json): ${[...pending].sort().join(', ')}`);
}
if (brand._status === 'placeholder') {
  console.log(`  brand.json is a placeholder ("${brand.name}"); replace it once the brand is chosen.`);
}
