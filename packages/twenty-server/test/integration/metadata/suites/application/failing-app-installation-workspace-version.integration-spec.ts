import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { scrubSemverVersions } from 'test/utils/scrub-semver-versions.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { extractVersionFromCommandName } from 'src/engine/core-modules/upgrade/utils/extract-version-from-command-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// The full install flow runs cache-lock retries with real delays, so fake
// timers would hang it — mirror the other install suites.
jest.setTimeout(120000);

const INJECTED_CURSOR_MARKER = 'integration-test-workspace-version-gate';

const injectWorkspaceCursor = async (
  name: string,
  status: 'completed' | 'failed',
): Promise<void> => {
  // Inject as attempt 2 with a fresh createdAt (now): this stays unique against
  // the seeded completed attempt-1 cursor (which may share this name) and
  // outranks it, so getWorkspaceCompletedVersion reads this attempt.
  await global.testDataSource.query(
    `INSERT INTO core."upgradeMigration"
       (name, status, attempt, "executedByVersion", "workspaceId", "isInitial")
     VALUES ($1, $2, 2, $3, $4, false)`,
    [name, status, INJECTED_CURSOR_MARKER, SEED_APPLE_WORKSPACE_ID],
  );
};

const clearInjectedWorkspaceCursors = async (): Promise<void> => {
  await global.testDataSource.query(
    `DELETE FROM core."upgradeMigration"
     WHERE "workspaceId" = $1 AND "executedByVersion" = $2`,
    [SEED_APPLE_WORKSPACE_ID, INJECTED_CURSOR_MARKER],
  );
};

const uploadTarballApp = async ({
  universalIdentifier,
  roleId,
  requiredServerVersion,
}: {
  universalIdentifier: string;
  roleId: string;
  requiredServerVersion: string;
}): Promise<void> => {
  const tarball = await createAppTarball({
    'manifest.json': JSON.stringify(
      buildBaseManifest({ appId: universalIdentifier, roleId }),
    ),
    'package.json': JSON.stringify({
      name: `test-workspace-version-gate-${universalIdentifier}`,
      version: '1.0.0',
      engines: { twenty: requiredServerVersion },
    }),
  });

  const uploadResult = await uploadAppTarball({
    tarballBuffer: tarball,
    universalIdentifier,
  });

  expect(uploadResult.errors).toBeUndefined();
};

describe('Install application is gated by the workspace completed upgrade version', () => {
  let currentVersionCommandName: string;
  let currentServerVersion: string;
  const createdApplicationUniversalIdentifiers: string[] = [];

  beforeAll(async () => {
    jest.useRealTimers();

    // Derive the gate version from the last attempted instance command, which
    // is exactly what the upload-time server-compat check uses
    // (getInferredVersion). The seeded workspace cursor can sit a version ahead
    // of the instance right after a version bump whose newest segment ends in
    // workspace-scoped commands with no new instance command: requiring
    // >=workspaceVersion would then fail the instance gate at upload time,
    // before the workspace gate under test is reached.
    const [instanceCommand] = await global.testDataSource.query(
      `SELECT migration.name AS name
       FROM core."upgradeMigration" migration
       WHERE migration."workspaceId" IS NULL
         AND migration."isInitial" = false
         AND migration.attempt = (
           SELECT MAX(sub.attempt)
           FROM core."upgradeMigration" sub
           WHERE sub.name = migration.name
             AND sub."workspaceId" IS NULL
         )
       ORDER BY migration."createdAt" DESC
       LIMIT 1`,
    );

    if (!isDefined(instanceCommand)) {
      throw new Error('Expected a seeded instance upgrade command');
    }

    // Re-injecting this command as a failed workspace attempt makes the
    // workspace resolve to the previous completed version (behind the
    // instance), so the install reaches the workspace gate.
    currentVersionCommandName = instanceCommand.name;

    const inferredServerVersion = extractVersionFromCommandName(
      currentVersionCommandName,
    );

    if (!isDefined(inferredServerVersion)) {
      throw new Error(
        `Could not extract a server version from upgrade cursor "${currentVersionCommandName}"`,
      );
    }

    currentServerVersion = inferredServerVersion;
  });

  afterEach(async () => {
    await clearInjectedWorkspaceCursors();
  });

  afterAll(async () => {
    for (const universalIdentifier of createdApplicationUniversalIdentifiers) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: universalIdentifier,
      });
    }

    jest.useFakeTimers();
  });

  it('rejects installation when the workspace has not completed the required upgrade version', async () => {
    const universalIdentifier = uuidv4();
    const roleId = uuidv4();

    await uploadTarballApp({
      universalIdentifier,
      roleId,
      requiredServerVersion: `>=${currentServerVersion}`,
    });

    createdApplicationUniversalIdentifiers.push(universalIdentifier);

    // The workspace failed mid-way through the current version's upgrade
    // segment, so its last completed version is the previous one.
    await injectWorkspaceCursor(currentVersionCommandName, 'failed');

    const { errors } = await installApplication({
      input: { universalIdentifier },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: scrubSemverVersions,
    });
  });

  it('rejects installation when the workspace upgrade cursor cannot be interpreted', async () => {
    const universalIdentifier = uuidv4();
    const roleId = uuidv4();

    await uploadTarballApp({
      universalIdentifier,
      roleId,
      requiredServerVersion: '>=1.0.0',
    });

    createdApplicationUniversalIdentifiers.push(universalIdentifier);

    // A cursor pointing at a command outside the supported upgrade sequence
    // cannot be mapped to a completed version.
    await injectWorkspaceCursor(
      '1.0.0_UnknownLegacyCommand_1700000000000',
      'completed',
    );

    const { errors } = await installApplication({
      input: { universalIdentifier },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: scrubSemverVersions,
    });
  });
});
