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

describe('Application variable user values should fail', () => {
  let userVariableApplication: ApplicationWithVariable;
  let workspaceVariableApplication: ApplicationWithVariable;
  let applicationToken: string;
  let janeApplicationToken: string;

  beforeAll(async () => {
    userVariableApplication = await setupApplicationWithVariable({
      name: 'User Variable Application',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });
    workspaceVariableApplication = await setupApplicationWithVariable({
      name: 'Workspace Variable Application',
      variableKey: 'RECORD_ALL_MEETINGS',
    });

    const [applicationTokenPair, janeApplicationTokenPair] = await Promise.all([
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: userVariableApplication.id,
      }),
      generateAppleAdminApplicationTokenPair({
        applicationId: userVariableApplication.id,
      }),
    ]);

    applicationToken = applicationTokenPair.applicationAccessToken.token;
    janeApplicationToken =
      janeApplicationTokenPair.applicationAccessToken.token;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        userVariableApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        workspaceVariableApplication.universalIdentifier,
    });
  });

  it('should refuse to set a member value on a workspace variable', async () => {
    const { errors } = await updateMyApplicationVariable({
      input: {
        key: workspaceVariableApplication.variableKey,
        value: 'mine',
        applicationId: workspaceVariableApplication.id,
      },
      expectToFail: true,
    });

    expect(errors.map(({ extensions }) => extensions.code)).toEqual([
      'BAD_USER_INPUT',
    ]);
  });

  it('should refuse a key the application does not declare', async () => {
    const { errors } = await updateMyApplicationVariable({
      input: {
        key: 'UNDECLARED_VARIABLE',
        value: 'mine',
        applicationId: userVariableApplication.id,
      },
      expectToFail: true,
    });

    expect(errors.map(({ extensions }) => extensions.code)).toEqual([
      'NOT_FOUND',
    ]);
  });

  it('should refuse to read member values with a token no person is behind', async () => {
    const { errors } = await myApplicationVariables({
      input: {},
      token: applicationToken,
      expectToFail: true,
    });

    expect(errors.map(({ extensions }) => extensions.code)).toEqual([
      'FORBIDDEN',
    ]);
  });

  it('should refuse an application token naming another application', async () => {
    const { errors } = await updateMyApplicationVariable({
      input: {
        key: workspaceVariableApplication.variableKey,
        value: 'mine',
        applicationId: workspaceVariableApplication.id,
      },
      token: janeApplicationToken,
      expectToFail: true,
    });

    expect(errors.map(({ extensions }) => extensions.code)).toEqual([
      'FORBIDDEN',
    ]);
  });

  it('should require an application id from a session', async () => {
    const { errors } = await myApplicationVariables({
      input: {},
      expectToFail: true,
    });

    expect(errors.map(({ extensions }) => extensions.code)).toEqual([
      'BAD_USER_INPUT',
    ]);
  });

  it('should refuse to list every member value from a session', async () => {
    const { errors } = await applicationVariableUserValues({
      input: { key: userVariableApplication.variableKey },
      expectToFail: true,
    });

    expect(errors.map(({ extensions }) => extensions.code)).toEqual([
      'FORBIDDEN',
    ]);
  });
});
