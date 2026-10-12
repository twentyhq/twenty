import semver from 'semver';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

jest.setTimeout(120000);

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

const INJECTED_CURSOR_MARKER = 'integration-test-sync-server-version';

const SERVER_VERSION_GQL_FIELDS = `
  applicationUniversalIdentifier
  serverVersion
`;

const buildManifest = () =>
  buildBaseManifest({ appId: TEST_APP_ID, roleId: TEST_ROLE_ID });

describe('Sync application returns the server version', () => {
  let workspaceCompletedVersion: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Server Version Test Application',
      description: 'App for testing the server version returned by sync',
      sourcePath: 'sync-application-server-version',
    });

    const completedVersion =
      await getAppProviderByClassName<UpgradeStatusService>(
        'UpgradeStatusService',
      ).getWorkspaceCompletedVersion(SEED_APPLE_WORKSPACE_ID);

    if (!isDefined(completedVersion)) {
      throw new Error(
        `Expected a completed upgrade version for workspace ${SEED_APPLE_WORKSPACE_ID}`,
      );
    }

    workspaceCompletedVersion = completedVersion;
  }, 60000);

  afterEach(async () => {
    await global.testDataSource.query(
      `DELETE FROM core."upgradeMigration"
       WHERE "workspaceId" = $1 AND "executedByVersion" = $2`,
      [SEED_APPLE_WORKSPACE_ID, INJECTED_CURSOR_MARKER],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });

    jest.useFakeTimers();
  });

  it('returns the workspace completed version on dry run and on apply', async () => {
    expect(semver.valid(workspaceCompletedVersion)).not.toBeNull();

    const dryRunResponse = await syncApplication({
      manifest: buildManifest(),
      dryRun: true,
      gqlFields: SERVER_VERSION_GQL_FIELDS,
      expectToFail: false,
    });

    expect(dryRunResponse.errors).toBeUndefined();
    expect(dryRunResponse.data.syncApplication.serverVersion).toBe(
      workspaceCompletedVersion,
    );

    const applyResponse = await syncApplication({
      manifest: buildManifest(),
      gqlFields: SERVER_VERSION_GQL_FIELDS,
      expectToFail: false,
    });

    expect(applyResponse.errors).toBeUndefined();
    expect(applyResponse.data.syncApplication.serverVersion).toBe(
      workspaceCompletedVersion,
    );
  });

  it('returns an older version while the workspace has not completed its current upgrade', async () => {
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

    await global.testDataSource.query(
      `INSERT INTO core."upgradeMigration"
         (name, status, attempt, "executedByVersion", "workspaceId", "isInitial")
       VALUES ($1, 'failed', 2, $2, $3, false)`,
      [workspaceCursor.name, INJECTED_CURSOR_MARKER, SEED_APPLE_WORKSPACE_ID],
    );

    const { data, errors } = await syncApplication({
      manifest: buildManifest(),
      dryRun: true,
      gqlFields: SERVER_VERSION_GQL_FIELDS,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const { serverVersion } = data.syncApplication;

    expect(
      isDefined(serverVersion) &&
        semver.lt(serverVersion, workspaceCompletedVersion),
    ).toBe(true);
  });
});
