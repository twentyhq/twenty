// Consumer A: latest twenty-client-sdk published on npm, core client generated
// from the PRE-PR schema (what an existing app in the wild is running today),
// pointed at the server running the PR branch.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { run } from './runner.mjs';

const here = dirname(fileURLToPath(import.meta.url));

await run({
  consumerDir: join(here, 'npm-consumer'),
  flavor: 'old',
  outputFile: join(here, 'results-npm-sdk.json'),
});
