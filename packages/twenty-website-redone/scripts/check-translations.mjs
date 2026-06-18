import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Translations are authored by the Crowdin automation in CI, so empty
// msgstr entries are a normal intermediate state and are NOT checked here.
// What IS the engineer's responsibility: every msg in code must be
// extracted into en.po, where Crowdin can see it. This re-runs extraction
// against a copy and fails when the catalog would change (unextracted new
// strings, or stale entries that --clean would remove).
const packageRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const localesDirectory = path.join(packageRoot, 'src', 'locales');

const readMsgIds = (file) =>
  new Set(
    [...fs.readFileSync(file, 'utf8').matchAll(/^msgid "(.+)"$/gm)].map(
      (match) => match[1],
    ),
  );

const catalogFiles = fs
  .readdirSync(localesDirectory)
  .filter((name) => name.endsWith('.po'));
const backups = new Map(
  catalogFiles.map((name) => [
    name,
    fs.readFileSync(path.join(localesDirectory, name), 'utf8'),
  ]),
);
const before = readMsgIds(path.join(localesDirectory, 'en.po'));

try {
  execSync('npx lingui extract --overwrite --clean', {
    cwd: packageRoot,
    stdio: 'pipe',
  });
  const after = readMsgIds(path.join(localesDirectory, 'en.po'));

  const unextracted = [...after].filter((id) => !before.has(id));
  const stale = [...before].filter((id) => !after.has(id));

  if (unextracted.length > 0 || stale.length > 0) {
    console.error(
      'check-translations: FAILED — run `lingui extract` and commit the catalogs',
    );
    for (const id of unextracted) {
      console.error(`  not extracted: "${id.slice(0, 70)}"`);
    }
    for (const id of stale) {
      console.error(`  stale entry: "${id.slice(0, 70)}"`);
    }
    process.exitCode = 1;
  } else {
    console.log('check-translations: OK (catalogs in sync with source)');
  }
} finally {
  // The check must never mutate the working tree.
  for (const [name, content] of backups) {
    fs.writeFileSync(path.join(localesDirectory, name), content);
  }
}
