// Consumer B: twenty-client-sdk built from this branch, core client generated
// from the POST-PR schema, pointed at the same server.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { run } from './runner.mjs';

const here = dirname(fileURLToPath(import.meta.url));

await run({
  consumerDir: join(here, 'local-consumer'),
  flavor: 'new',
  outputFile: join(here, 'results-local-sdk.json'),
});
