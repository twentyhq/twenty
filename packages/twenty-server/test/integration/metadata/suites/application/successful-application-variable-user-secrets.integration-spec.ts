import { applicationVariableUserValues } from 'test/integration/metadata/suites/application/utils/application-variable-user-values.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateMyApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-application-variable.util';
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
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  it('should leave an unset personal secret empty', async () => {
    const { data } = await applicationVariableUserValues({
      input: {},
      token: applicationToken,
      expectToFail: false,
    });

    const jonyValues = data.applicationVariableUserValues.find(
      ({ userWorkspaceId }) =>
        userWorkspaceId === USER_WORKSPACE_DATA_SEED_IDS.JONY,
    );

    expect(jonyValues?.variables).toEqual([
      { key: application.variableKey, value: '' },
    ]);
  });

  it('should encrypt a member secret at rest', async () => {
    await updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
        key: application.variableKey,
        value: 'jony-key',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

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
  });

  it('should mask the own secret for a token a person is behind', async () => {
    await updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
        key: application.variableKey,
        value: 'jane-key',
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data } = await applicationVariableUserValues({
      input: {},
      token: janeApplicationToken,
      expectToFail: false,
    });

    expect(data.applicationVariableUserValues).toEqual([
      {
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        variables: [
          {
            key: application.variableKey,
            value: SECRET_APPLICATION_VARIABLE_MASK,
          },
        ],
      },
    ]);
  });

  it('should give a token no person is behind the real secret of every member', async () => {
    const { data } = await applicationVariableUserValues({
      input: {},
      token: applicationToken,
      expectToFail: false,
    });

    expect(data.applicationVariableUserValues).toEqual(
      expect.arrayContaining([
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          variables: [{ key: application.variableKey, value: 'jane-key' }],
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          variables: [{ key: application.variableKey, value: 'jony-key' }],
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          variables: [{ key: application.variableKey, value: '' }],
        },
      ]),
    );
  });

  it('should leave a cleared personal secret empty', async () => {
    await updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
        key: application.variableKey,
        value: '',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data } = await applicationVariableUserValues({
      input: {},
      token: applicationToken,
      expectToFail: false,
    });

    const jonyValues = data.applicationVariableUserValues.find(
      ({ userWorkspaceId }) =>
        userWorkspaceId === USER_WORKSPACE_DATA_SEED_IDS.JONY,
    );

    expect(jonyValues?.variables).toEqual([
      { key: application.variableKey, value: '' },
    ]);
  });
});
