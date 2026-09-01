import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const load = async (name) =>
  JSON.parse(await readFile(join(here, name), 'utf-8'));

// Record ids differ between runs (each run creates its own records) and the
// new-schema client adds __typename projections; everything else must match.
const normalize = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }
  if (value !== null && typeof value === 'object') {
    const normalized = {};
    for (const key of Object.keys(value).sort()) {
      if (key === '__typename' || key === 'id' || key === 'flavor') {
        continue;
      }
      normalized[key] = normalize(value[key]);
    }
    return normalized;
  }
  return value;
};

const diffPaths = (left, right, path, output) => {
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      output.push(`${path}: array length ${left.length} vs ${right.length}`);
      return;
    }
    left.forEach((item, index) =>
      diffPaths(item, right[index], `${path}[${index}]`, output),
    );
    return;
  }

  const leftIsObject = left !== null && typeof left === 'object';
  const rightIsObject = right !== null && typeof right === 'object';

  if (leftIsObject && rightIsObject) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    for (const key of keys) {
      diffPaths(left[key], right[key], `${path}.${key}`, output);
    }
    return;
  }

  if (JSON.stringify(left) !== JSON.stringify(right)) {
    output.push(
      `${path}: ${JSON.stringify(left)} (npm) vs ${JSON.stringify(right)} (local)`,
    );
  }
};

const npmResults = normalize(await load('results-npm-sdk.json'));
const localResults = normalize(await load('results-local-sdk.json'));

const differences = [];
diffPaths(npmResults, localResults, '$', differences);

if (differences.length === 0) {
  console.log('MATCH: both SDK clients returned the same data.');
} else {
  console.log(`${differences.length} difference(s) after normalization:`);
  for (const difference of differences) {
    console.log(`  - ${difference}`);
  }
  process.exitCode = 1;
}
