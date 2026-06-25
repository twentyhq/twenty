import { readdirSync, readFileSync } from 'fs';
import { join, sep } from 'path';

// Integration specs that assert REAL asynchronous BullMQ job behaviour (they
// poll workflow runs or await queued jobs) opt in by adding this docblock tag
// at the top of the file:
//
//   /**
//    * @queue-driver: bullmq
//    */
//
// Tagged specs run under jest-integration-bullmq.config.ts with the real
// awaited driver; every other spec runs on the inline SyncDriver, so a prior
// test's still-draining job can never leak into the next one. Discovery is by
// tag (not a hardcoded list) so a new async spec only needs the comment.
export const BULLMQ_REAL_DRIVER_TAG = '@queue-driver: bullmq';

const INTEGRATION_TEST_ROOT = join(__dirname, '..');
const SPEC_SUFFIX = '.integration-spec.ts';
const TAG_SCAN_BYTES = 500;

// Returns paths relative to packages/twenty-server, e.g.
// "test/integration/graphql/suites/workflow/if-else-workflow.integration-spec.ts".
export const discoverBullmqSpecs = (): string[] => {
  const entries = readdirSync(INTEGRATION_TEST_ROOT, {
    recursive: true,
  }) as string[];

  return entries
    .filter((entry) => entry.endsWith(SPEC_SUFFIX))
    .filter((entry) =>
      readFileSync(join(INTEGRATION_TEST_ROOT, entry), 'utf8')
        .slice(0, TAG_SCAN_BYTES)
        .includes(BULLMQ_REAL_DRIVER_TAG),
    )
    .map((entry) => `test/integration/${entry.split(sep).join('/')}`);
};
