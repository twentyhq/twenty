import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// The full install flow runs cache-lock retries with real delays, so fake
// timers would hang it — mirror the other install suites.
jest.setTimeout(120000);

const INJECTED_CURSOR_MARKER = 'integration-test-workspace-version-gate';

const injectWorkspaceCursor = async (
  name: string,
  status: 'completed' | 'failed',
): Promise<void> => {
  // A fresh row with the default createdAt (now) outranks the workspace's
  // seeded initial cursor, so getWorkspaceCompletedVersion reads this one.
  await global.testDataSource.query(
    `INSERT INTO core."upgradeMigration"
       (name, status, attempt, "executedByVersion", "workspaceId", "isInitial")
     VALUES ($1, $2, 1, $3, $4, false)`,
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
  const createdApplicationUniversalIdentifiers: string[] = [];

  beforeAll(async () => {
    jest.useRealTimers();

    const [instanceCommand] = await global.testDataSource.query(
      `SELECT name FROM core."upgradeMigration"
       WHERE "workspaceId" IS NULL
         AND "isInitial" = false
         AND name LIKE $1
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      [`${TWENTY_CURRENT_VERSION}_%`],
    );

    if (!isDefined(instanceCommand)) {
      throw new Error(
        `Expected at least one recorded instance command for version ${TWENTY_CURRENT_VERSION}`,
      );
    }

    currentVersionCommandName = instanceCommand.name;
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
      requiredServerVersion: `>=${TWENTY_CURRENT_VERSION}`,
    });

    createdApplicationUniversalIdentifiers.push(universalIdentifier);

    // The workspace failed mid-way through the current version's upgrade
    // segment, so its last completed version is the previous one.
    await injectWorkspaceCursor(currentVersionCommandName, 'failed');

    const { errors } = await installApplication({
      input: { universalIdentifier },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
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

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
