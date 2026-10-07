import { v4 as uuidv4 } from 'uuid';

import { myUserApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-user-application-variables.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { updateMyUserApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-user-application-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type UserApplicationVariableValueService } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.service';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

describe('User application variable value cache', () => {
  let application: ApplicationWithVariable;
  let applicationVariableId: string;
  let applicationToken: string;
  let janeApplicationToken: string;
  let workspaceCacheService: WorkspaceCacheService;

  const readCachedValues = async () => {
    const { userApplicationVariableValueMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'userApplicationVariableValueMaps',
      ]);

    return userApplicationVariableValueMaps.byApplicationVariableId[
      applicationVariableId
    ];
  };

  const updateValue = (value: string) =>
    updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
        key: application.variableKey,
        value,
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

  const expectVisibleValues = async (value: string) => {
    const [{ data: memberData }, { data: applicationData }] = await Promise.all(
      [
        myUserApplicationVariables({
          input: {},
          token: janeApplicationToken,
          expectToFail: false,
        }),
        myUserApplicationVariables({
          input: {},
          token: applicationToken,
          expectToFail: false,
        }),
      ],
    );

    expect(memberData.myUserApplicationVariables).toEqual([
      expect.objectContaining({
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        variables: [
          {
            key: application.variableKey,
            value: value === '' ? '' : SECRET_APPLICATION_VARIABLE_MASK,
          },
        ],
      }),
    ]);
    expect(
      applicationData.myUserApplicationVariables.find(
        ({ userWorkspaceId }) =>
          userWorkspaceId === USER_WORKSPACE_DATA_SEED_IDS.JANE,
      )?.variables,
    ).toEqual([{ key: application.variableKey, value }]);
  };

  beforeEach(async () => {
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    application = await setupApplicationWithVariable({
      name: 'Cached User Variable Application',
      variableKey: 'API_KEY',
      variableScope: 'USER',
      isSecret: true,
    });

    const [applicationVariable]: { id: string }[] =
      await global.testDataSource.query(
        'SELECT id FROM core."applicationVariable" WHERE "applicationId" = $1 AND key = $2',
        [application.id, application.variableKey],
      );

    applicationVariableId = applicationVariable.id;

    const [tokenPair, janeTokenPair] = await Promise.all([
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
      generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      }),
    ]);

    applicationToken = tokenPair.applicationAccessToken.token;
    janeApplicationToken = janeTokenPair.applicationAccessToken.token;
  }, 120000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('refreshes encrypted cached values after writes and preserves API masking', async () => {
    expect(await readCachedValues()).toBeUndefined();
    await expectVisibleValues('');
    await updateValue('first');

    expect(
      (await readCachedValues())?.[USER_WORKSPACE_DATA_SEED_IDS.JANE],
    ).toEqual(expect.stringContaining(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX));
    await expectVisibleValues('first');

    // Bypass invalidation to prove that both APIs read the cached value.
    await global.testDataSource.query(
      'DELETE FROM core."userApplicationVariableValue" WHERE "applicationVariableId" = $1',
      [applicationVariableId],
    );
    await expectVisibleValues('first');

    await updateValue('second');
    await expectVisibleValues('second');
    await updateValue('');
    await expectVisibleValues('');
  });

  it('removes cached values when a manifest deletes their declaration', async () => {
    await updateValue('first');
    expect(await readCachedValues()).toBeDefined();

    const [role]: { universalIdentifier: string }[] =
      await global.testDataSource.query(
        'SELECT "universalIdentifier" FROM core.role WHERE id = $1',
        [application.defaultRoleId],
      );

    await syncApplication({
      manifest: buildBaseManifest({
        appId: application.universalIdentifier,
        roleId: role.universalIdentifier,
      }),
      inferDeletionFromMissingEntities: true,
      expectToFail: false,
    });

    expect(await readCachedValues()).toBeUndefined();

    const { data } = await myUserApplicationVariables({
      input: {},
      token: applicationToken,
      expectToFail: false,
    });

    expect(data.myUserApplicationVariables).toEqual([]);
  });

  it('removes cached values when their application is uninstalled', async () => {
    await updateValue('first');
    expect(await readCachedValues()).toBeDefined();

    await uninstallApplication({
      universalIdentifier: application.universalIdentifier,
      expectToFail: false,
    });

    expect(await readCachedValues()).toBeUndefined();
  });

  it('removes a deleted membership from the cache and keeps other members values', async () => {
    const userId = uuidv4();
    const userWorkspaceId = uuidv4();

    await global.testDataSource.query(
      'INSERT INTO core."user" (id, email) VALUES ($1, $2)',
      [userId, `cache-test-${userId}@example.com`],
    );

    try {
      await global.testDataSource.query(
        'INSERT INTO core."userWorkspace" (id, "userId", "workspaceId") VALUES ($1, $2, $3)',
        [userWorkspaceId, userId, SEED_APPLE_WORKSPACE_ID],
      );
      await getAppProviderByClassName<UserApplicationVariableValueService>(
        'UserApplicationVariableValueService',
      ).updateMyUserApplicationVariable({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationUniversalIdentifier: application.universalIdentifier,
        userWorkspaceId,
        key: application.variableKey,
        plainTextValue: plaintextStringSchema.parse('temporary'),
      });
      await updateValue('first');
      expect((await readCachedValues())?.[userWorkspaceId]).toBeDefined();

      await getAppProviderByClassName<UserWorkspaceService>(
        'UserWorkspaceService',
      ).deleteUserWorkspace({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
      });

      expect((await readCachedValues())?.[userWorkspaceId]).toBeUndefined();
      await expectVisibleValues('first');
    } finally {
      await global.testDataSource.query(
        'DELETE FROM core."userWorkspace" WHERE id = $1',
        [userWorkspaceId],
      );
      await global.testDataSource.query(
        'DELETE FROM core."user" WHERE id = $1',
        [userId],
      );
    }
  });
});
