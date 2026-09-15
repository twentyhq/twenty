import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { scrubSemverVersions } from 'test/utils/scrub-semver-versions.util';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// The sync flow can run cache-lock retries with real delays, so fake timers
// would hang it — mirror the other application suites.
jest.setTimeout(120000);

const INJECTED_CURSOR_MARKER = 'integration-test-sync-workspace-version-gate';

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

const buildManifestWithRequiredServerVersionRange = ({
  appId,
  roleId,
  requiredServerVersionRange,
}: {
  appId: string;
  roleId: string;
  requiredServerVersionRange: string;
}): Manifest => {
  const manifest = buildBaseManifest({ appId, roleId });

  manifest.application.requiredServerVersionRange = requiredServerVersionRange;

  return manifest;
};

describe('Sync application is gated by the workspace completed upgrade version', () => {
  let currentVersionCommandName: string;

  beforeAll(async () => {
    jest.useRealTimers();

    // The seeded workspace's cursor is the last step of the current version.
    // Re-injecting it as a failed attempt makes the workspace resolve to the
    // previous completed version — i.e. behind the instance.
    const [workspaceCursor] = await global.testDataSource.query(
      `SELECT name FROM core."upgradeMigration"
       WHERE "workspaceId" = $1
       ORDER BY "createdAt" DESC, attempt DESC
       LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    if (!isDefined(workspaceCursor)) {
      throw new Error(
        `Expected a seeded upgrade cursor for workspace ${SEED_APPLE_WORKSPACE_ID}`,
      );
    }

    currentVersionCommandName = workspaceCursor.name;
  });

  afterEach(async () => {
    await clearInjectedWorkspaceCursors();
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  it('rejects sync when the workspace has not completed the required upgrade version', async () => {
    const manifest = buildManifestWithRequiredServerVersionRange({
      appId: uuidv4(),
      roleId: uuidv4(),
      requiredServerVersionRange: `>=${TWENTY_CURRENT_VERSION}`,
    });

    // The workspace failed mid-way through the current version's upgrade
    // segment, so its last completed version is the previous one.
    await injectWorkspaceCursor(currentVersionCommandName, 'failed');

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: scrubSemverVersions,
    });
  });

  it('rejects sync when the workspace upgrade cursor cannot be interpreted', async () => {
    const manifest = buildManifestWithRequiredServerVersionRange({
      appId: uuidv4(),
      roleId: uuidv4(),
      requiredServerVersionRange: '>=1.0.0',
    });

    // A cursor pointing at a command outside the supported upgrade sequence
    // cannot be mapped to a completed version.
    await injectWorkspaceCursor(
      '1.0.0_UnknownLegacyCommand_1700000000000',
      'completed',
    );

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: scrubSemverVersions,
    });
  });
});
