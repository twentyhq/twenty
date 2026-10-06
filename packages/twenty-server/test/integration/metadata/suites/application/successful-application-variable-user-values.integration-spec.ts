import { applicationVariableUserValues } from 'test/integration/metadata/suites/application/utils/application-variable-user-values.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-application-variables.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateMyApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-application-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

describe('Application variable user values should succeed', () => {
  let application: ApplicationWithVariable;
  let otherApplication: ApplicationWithVariable;
  let defaultApplication: ApplicationWithVariable;
  let applicationToken: string;
  let defaultApplicationToken: string;
  let janeApplicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'User Variable Application',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });
    otherApplication = await setupApplicationWithVariable({
      name: 'Other User Variable Application',
      variableKey: 'SHARE_MY_RECORDINGS',
      variableScope: 'USER',
    });
    defaultApplication = await setupApplicationWithVariable({
      name: 'Default User Variable Application',
      variableKey: 'TRANSCRIBE_MY_MEETINGS',
      variableScope: 'USER',
      value: 'true',
    });

    const [
      applicationTokenPair,
      janeApplicationTokenPair,
      defaultApplicationTokenPair,
    ] = await Promise.all([
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: application.id,
      }),
      generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: defaultApplication.id,
      }),
    ]);

    applicationToken = applicationTokenPair.applicationAccessToken.token;
    defaultApplicationToken =
      defaultApplicationTokenPair.applicationAccessToken.token;
    janeApplicationToken =
      janeApplicationTokenPair.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: otherApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: defaultApplication.universalIdentifier,
    });
  });

  it('should give a member the declaration and no value until they set their own', async () => {
    const { data } = await myApplicationVariables({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      gqlFields:
        'key label description type options isSecret isRequired isDeprecated value',
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      {
        key: application.variableKey,
        label: '',
        description: '',
        type: 'TEXT',
        options: null,
        isSecret: false,
        isRequired: false,
        isDeprecated: false,
        value: '',
      },
    ]);
  });

  it('should let a member without the applications permission set their own value', async () => {
    const { data: updateData } = await updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
        key: application.variableKey,
        value: 'jony',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(updateData.updateMyApplicationVariable).toBe(true);

    const { data } = await myApplicationVariables({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: 'jony' },
    ]);
  });

  it('should read the own value through a user-bound application token', async () => {
    const { data: updateData } = await updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
        key: application.variableKey,
        value: 'jane',
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(updateData.updateMyApplicationVariable).toBe(true);

    const { data } = await myApplicationVariables({
      input: {
        applicationUniversalIdentifier: application.universalIdentifier,
      },
      token: janeApplicationToken,
      expectToFail: false,
    });

    expect(data.myApplicationVariables).toEqual([
      { key: application.variableKey, value: 'jane' },
    ]);
  });

  it('should never give a member the value of another member', async () => {
    const [{ data: philData }, { data: jonyData }] = await Promise.all([
      myApplicationVariables({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
        token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
        expectToFail: false,
      }),
      myApplicationVariables({
        input: {
          applicationUniversalIdentifier: application.universalIdentifier,
        },
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        expectToFail: false,
      }),
    ]);

    expect(philData.myApplicationVariables).toEqual([
      { key: application.variableKey, value: '' },
    ]);
    expect(jonyData.myApplicationVariables).toEqual([
      { key: application.variableKey, value: 'jony' },
    ]);
  });

  it('should list the values of every member for a token no person is behind', async () => {
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
          variables: [{ key: application.variableKey, value: 'jane' }],
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          variables: [{ key: application.variableKey, value: 'jony' }],
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          variables: [{ key: application.variableKey, value: '' }],
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
          variables: [{ key: application.variableKey, value: '' }],
        },
        {
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.SCOTT,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.SCOTT,
          variables: [{ key: application.variableKey, value: '' }],
        },
      ]),
    );
  });

  it('should leave the values of another application out of the list', async () => {
    await updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier: otherApplication.universalIdentifier,
        key: otherApplication.variableKey,
        value: 'jony-other',
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
      { key: application.variableKey, value: 'jony' },
    ]);
  });

  it('should list only the own values for a token a person is behind', async () => {
    const { data } = await applicationVariableUserValues({
      input: {},
      token: janeApplicationToken,
      expectToFail: false,
    });

    expect(data.applicationVariableUserValues).toEqual([
      {
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        variables: [{ key: application.variableKey, value: 'jane' }],
      },
    ]);
  });

  it('should give a member the default until they set their own', async () => {
    const { data: defaultData } = await myApplicationVariables({
      input: {
        applicationUniversalIdentifier: defaultApplication.universalIdentifier,
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    expect(defaultData.myApplicationVariables).toEqual([
      { key: defaultApplication.variableKey, value: 'true' },
    ]);

    await updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier: defaultApplication.universalIdentifier,
        key: defaultApplication.variableKey,
        value: 'false',
      },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: false,
    });

    const { data } = await applicationVariableUserValues({
      input: {},
      token: defaultApplicationToken,
      expectToFail: false,
    });

    expect(data.applicationVariableUserValues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
          variables: [{ key: defaultApplication.variableKey, value: 'false' }],
        }),
        expect.objectContaining({
          userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
          variables: [{ key: defaultApplication.variableKey, value: 'true' }],
        }),
      ]),
    );
  });
});
