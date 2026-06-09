import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type LogicFunctionManifest,
  type Manifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

/**
 * Performance harness for installing / updating many logic functions through
 * application manifest sync. The goal is to find what could take >10s in prod
 * (which trips the node-postgres `query_timeout` in core.datasource.ts and
 * produces "Migration action 'update' for 'logicFunction' failed" + 504).
 *
 * IMPORTANT: the integration harness boots the NestJS app in-process with
 * `fakeTimers.enableGlobally: true`, so `Date.now()` / `setTimeout` are FAKE in
 * the server code. All server-side timing instrumentation uses
 * `process.hrtime.bigint()` (NOT faked). Here in the test we call
 * `jest.useRealTimers()` so cache-lock retry delays etc. do not hang.
 */

// Real timers for the whole suite — see note above.
jest.useRealTimers();

jest.setTimeout(120000);

const FN_COUNTS = [1, 8, 30];

// Stable universalIdentifiers across versions so the second sync exercises
// UPDATE (the actual incident), not CREATE+DELETE.
const buildManifest = ({
  appId,
  roleId,
  universalIdentifiers,
  checksumVersion,
}: {
  appId: string;
  roleId: string;
  universalIdentifiers: string[];
  checksumVersion: 'v1' | 'v2';
}): Manifest => {
  const logicFunctions: LogicFunctionManifest[] = universalIdentifiers.map(
    (universalIdentifier, i) => ({
      universalIdentifier,
      name: `PerfFn${i}`,
      description: `Perf logic function ${i}`,
      handlerName: 'handler',
      sourceHandlerPath: `src/fn-${i}.ts`,
      builtHandlerPath: `dist/fn-${i}.mjs`,
      builtHandlerChecksum: `checksum-${i}-${checksumVersion}`,
      httpRouteTriggerSettings: {
        path: `/fn-${i}`,
        httpMethod: 'GET',
        isAuthRequired: true,
      },
    }),
  );

  return buildBaseManifest({
    appId,
    roleId,
    overrides: { logicFunctions },
  });
};

const timeSync = async (
  label: string,
  manifest: Manifest,
): Promise<number> => {
  const startNs = process.hrtime.bigint();

  await syncApplication({ manifest, expectToFail: false });

  const ms = Number(process.hrtime.bigint() - startNs) / 1e6;

  // oxlint-disable-next-line no-console
  console.log(`[install-perf][test] ${label} took ${ms.toFixed(1)}ms`);

  return ms;
};

// TODO(install-perf): manual perf harness for the app-install 504 investigation.
// Skipped in CI (it runs many syncs and only logs timings, no assertions). Run
// locally with: npx nx test:integration:with-db-reset -- --testPathPattern
// "logic-function-install-performance". Remove with the rest of the
// [install-perf] instrumentation.
describe.skip('Logic function install performance', () => {
  it.each(FN_COUNTS)(
    'create + update sync with %i logic functions',
    async (count) => {
      const appId = uuidv4();
      const roleId = uuidv4();
      const universalIdentifiers = Array.from({ length: count }, () =>
        uuidv4(),
      );

      await setupApplicationForSync({
        applicationUniversalIdentifier: appId,
        name: `Perf App ${count}`,
        description: `Perf app with ${count} logic functions`,
        sourcePath: `perf-app-${count}`,
      });

      jest.useRealTimers();

      try {
        // No built-handler file upload is needed: the migration create/update
        // handlers never read the built file for LIVE functions (prebuilt
        // install is skipped), and uploading N files would trip the file-upload
        // rate limiter (30 per 30s). We only measure migration + cache cost.

        // oxlint-disable-next-line no-console
        console.log(
          `[install-perf][test] ===== N=${count} : FIRST SYNC (create ${count} functions) =====`,
        );

        const createMs = await timeSync(
          `N=${count} create sync`,
          buildManifest({
            appId,
            roleId,
            universalIdentifiers,
            checksumVersion: 'v1',
          }),
        );

        // oxlint-disable-next-line no-console
        console.log(
          `[install-perf][test] ===== N=${count} : SECOND SYNC (update ${count} functions, checksum v2) =====`,
        );

        const updateMs = await timeSync(
          `N=${count} update sync`,
          buildManifest({
            appId,
            roleId,
            universalIdentifiers,
            checksumVersion: 'v2',
          }),
        );

        // oxlint-disable-next-line no-console
        console.log(
          `[install-perf][test] ===== N=${count} SUMMARY: create=${createMs.toFixed(1)}ms update=${updateMs.toFixed(1)}ms =====`,
        );
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: appId,
        });
      }
    },
    120000,
  );
});
