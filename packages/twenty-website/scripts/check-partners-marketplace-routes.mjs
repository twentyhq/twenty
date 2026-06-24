import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const routes = [
  'src/app/[locale]/(site)/partners/list/page.tsx',
  'src/app/[locale]/(site)/partners/profile/[slug]/page.tsx',
];

const failures = [];

for (const relativePath of routes) {
  const fullPath = path.join(root, relativePath);
  const source = fs.readFileSync(fullPath, 'utf8');
  if (!/export const dynamic = 'force-dynamic';/.test(source)) {
    failures.push(
      `${relativePath}: must export dynamic = 'force-dynamic' (OpenNext runtime fetch; build has no TWENTY_PARTNERS_API_KEY).`,
    );
  }
}

if (failures.length > 0) {
  console.error('check-partners-marketplace-routes: FAILED');
  for (const failure of failures) {
    console.error(`  ${failure}`);
  }
  process.exit(1);
}

console.log('check-partners-marketplace-routes: OK');
