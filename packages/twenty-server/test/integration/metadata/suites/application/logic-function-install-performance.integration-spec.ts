import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type LogicFunctionManifest,
  type Manifest,
} from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

// Hunts for logic-function syncs slow enough to trip the prod query_timeout
// (504 on "Migration action 'update' for 'logicFunction' failed").

// The harness enables fake timers globally, which would fake performance.now()
// and hang cache-lock retry delays.
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

const timeSync = async (label: string, manifest: Manifest): Promise<number> => {
  const start = performance.now();

  await syncApplication({ manifest, expectToFail: false });

  const ms = performance.now() - start;

  // oxlint-disable-next-line no-console
  console.log(`[install-perf][test] ${label} took ${ms.toFixed(1)}ms`);

  return ms;
};

// TODO(install-perf): temporary manual perf harness, remove. Skipped in CI.
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
