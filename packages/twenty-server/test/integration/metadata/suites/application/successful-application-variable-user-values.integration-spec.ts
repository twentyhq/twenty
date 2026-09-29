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

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Application variable user values should succeed', () => {
  let application: ApplicationWithVariable;
  let applicationToken: string;
  let janeApplicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'User Variable Application',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
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

  it('should give a member the workspace value until they set their own', async () => {
    const { data } = await myApplicationVariables({
      input: { applicationId: application.id },
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: 'initial' },
    ]);
  });

  it('should let a member without the applications permission set their own value', async () => {
    const { data: updateData } = await updateMyApplicationVariable({
      input: {
        key: application.variableKey,
        value: 'jony',
        applicationId: application.id,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(updateData.updateMyApplicationVariable).toBe(true);

    const { data } = await myApplicationVariables({
      input: { applicationId: application.id },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: 'jony' },
    ]);
  });

  it('should target the own application from a user-bound application token', async () => {
    const { data: updateData } = await updateMyApplicationVariable({
      input: { key: application.variableKey, value: 'jane' },
      token: janeApplicationToken,
      expectToFail: false,
    });

    expect(updateData.updateMyApplicationVariable).toBe(true);

    const { data } = await myApplicationVariables({
      input: {},
      token: janeApplicationToken,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: 'jane' },
    ]);
  });

  it('should follow the workspace value for a member who has not set their own', async () => {
    await updateOneApplicationVariable({
      input: {
        key: application.variableKey,
        value: 'workspace',
        applicationId: application.id,
      },
      expectToFail: false,
    });

    const [{ data: philData }, { data: jonyData }] = await Promise.all([
      myApplicationVariables({
        input: { applicationId: application.id },
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        expectToFail: false,
      }),
      myApplicationVariables({
        input: { applicationId: application.id },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: false,
      }),
    ]);

    expect(philData.myApplicationVariables).toEqual([
      { key: application.variableKey, value: 'workspace' },
    ]);
    expect(jonyData.myApplicationVariables).toEqual([
      { key: application.variableKey, value: 'jony' },
    ]);
  });

  it('should list the value of every member for a token no person is behind', async () => {
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
          value: 'jane',
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          value: 'jony',
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          value: 'workspace',
        },
      ]),
    );
  });

  it('should list only the own value for a token a person is behind', async () => {
    const { data } = await applicationVariableUserValues({
      input: { key: application.variableKey },
      token: janeApplicationToken,
      expectToFail: false,
    });

    expect(data.applicationVariableUserValues).toEqual([
      {
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        value: 'jane',
      },
    ]);
  });
});
