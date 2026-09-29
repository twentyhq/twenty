import { applicationVariableUserValues } from 'test/integration/metadata/suites/application/utils/application-variable-user-values.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-application-variables.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateMyApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-application-variable.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Secret application variable user values should succeed', () => {
  let application: ApplicationWithVariable;
  let applicationToken: string;
  let janeApplicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Secret User Variable Application',
      variableKey: 'API_KEY',
      variableScope: 'USER',
      isSecret: true,
      isRequired: true,
    });

    const [applicationTokenPair, janeApplicationTokenPair] = await Promise.all([
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
      generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      }),
    ]);

    applicationToken = applicationTokenPair.applicationAccessToken.token;
    janeApplicationToken =
      janeApplicationTokenPair.applicationAccessToken.token;

    await updateOneApplicationVariable({
      input: {
        key: application.variableKey,
        value: 'workspace-secret',
        applicationId: application.id,
      },
      expectToFail: false,
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('should leave an unset personal secret empty even when the workspace has a value', async () => {
    const { data } = await myApplicationVariables({
      input: { applicationId: application.id },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: '' },
    ]);
  });

  it('should encrypt a member secret at rest and mask it when read', async () => {
    await updateMyApplicationVariable({
      input: {
        key: application.variableKey,
        value: 'jony-key',
        applicationId: application.id,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data } = await myApplicationVariables({
      input: { applicationId: application.id },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: SECRET_APPLICATION_VARIABLE_MASK },
    ]);

    const storedValues: { value: string }[] = await global.testDataSource.query(
      `SELECT "userValue"."value"
         FROM "core"."applicationVariableUserValue" "userValue"
         JOIN "core"."applicationVariable" "variable"
           ON "variable"."id" = "userValue"."applicationVariableId"
        WHERE "variable"."applicationId" = $1`,
      [application.id],
    );

    expect(storedValues).toHaveLength(1);
    expect(storedValues[0].value).toMatch(/^enc:v2:/);
    expect(storedValues[0].value).not.toContain('jony-key');

    const { data: philData } = await myApplicationVariables({
      input: { applicationId: application.id },
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(philData.myApplicationVariables).toEqual([
      { key: application.variableKey, value: '' },
    ]);
  });

  it('should mask secrets read through a user-bound application token', async () => {
    await updateMyApplicationVariable({
      input: { key: application.variableKey, value: 'jane-key' },
      token: janeApplicationToken,
      expectToFail: false,
    });

    const { data } = await myApplicationVariables({
      input: {},
      token: janeApplicationToken,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: SECRET_APPLICATION_VARIABLE_MASK },
    ]);
  });

  it('should give a token no person is behind the real secret of every member', async () => {
    const { data } = await applicationVariableUserValues({
      input: { key: application.variableKey },
      token: applicationToken,
      expectToFail: false,
    });

    expect(data.applicationVariableUserValues).toEqual(
      expect.arrayContaining([
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          value: 'jane-key',
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          value: 'jony-key',
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          value: '',
        },
      ]),
    );
  });

  it('should mask the own secret for a token a person is behind', async () => {
    const { data } = await applicationVariableUserValues({
      input: { key: application.variableKey },
      token: janeApplicationToken,
      expectToFail: false,
    });

    expect(data.applicationVariableUserValues).toEqual([
      {
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        value: SECRET_APPLICATION_VARIABLE_MASK,
      },
    ]);
  });

  it('should leave a cleared personal secret empty instead of using the workspace value', async () => {
    await updateMyApplicationVariable({
      input: {
        key: application.variableKey,
        value: '',
        applicationId: application.id,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data } = await myApplicationVariables({
      input: { applicationId: application.id },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: '' },
    ]);
  });
});
