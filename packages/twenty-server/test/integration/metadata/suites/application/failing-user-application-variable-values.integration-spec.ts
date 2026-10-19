import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { expectPermissionDenied } from 'test/integration/metadata/suites/application/utils/expect-permission-denied.util';
import { myUserApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-user-application-variables.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateMyUserApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-user-application-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const NOT_INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  '8f7c1e0a-4b2d-4c3e-9a1f-0d2e3c4b5a69';

describe('User application variable values should fail', () => {
  let userVariableApplication: ApplicationWithVariable;
  let otherUserVariableApplication: ApplicationWithVariable;
  let workspaceVariableApplication: ApplicationWithVariable;
  let withoutConnectedAccountsApplication: ApplicationWithVariable;
  let janeApplicationToken: string;
  let applicationToken: string;
  let jonyWithoutConnectedAccountsApplicationToken: string;

  beforeAll(async () => {
    userVariableApplication = await setupApplicationWithVariable({
      name: 'User Variable Application',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });
    otherUserVariableApplication = await setupApplicationWithVariable({
      name: 'Other User Variable Application',
      variableKey: 'SHARE_MY_RECORDINGS',
      variableScope: 'USER',
    });
    workspaceVariableApplication = await setupApplicationWithVariable({
      name: 'Workspace Variable Application',
      variableKey: 'RECORD_ALL_MEETINGS',
    });
    withoutConnectedAccountsApplication = await setupApplicationWithVariable({
      name: 'User Variable Application Without Connected Accounts',
      variableKey: 'RECORD_MY_CALLS',
      variableScope: 'USER',
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.APPLICATIONS],
    });

    const [
      janeApplicationTokenPair,
      applicationTokenPair,
      jonyWithoutConnectedAccountsApplicationTokenPair,
    ] = await Promise.all([
      generateAppleAdminApplicationTokenPair({
        applicationId: userVariableApplication.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: userVariableApplication.id,
      }),
      generateApplicationTokenPair({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        applicationId: withoutConnectedAccountsApplication.id,
        userId: USER_DATA_SEED_IDS.JONY,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
      }),
    ]);

    janeApplicationToken =
      janeApplicationTokenPair.applicationAccessToken.token;
    applicationToken = applicationTokenPair.applicationAccessToken.token;
    jonyWithoutConnectedAccountsApplicationToken =
      jonyWithoutConnectedAccountsApplicationTokenPair.applicationAccessToken
        .token;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        userVariableApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        otherUserVariableApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        workspaceVariableApplication.universalIdentifier,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier:
        withoutConnectedAccountsApplication.universalIdentifier,
    });
  });

  it('should refuse to set a member value on a workspace variable', async () => {
    const { errors } = await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier:
          workspaceVariableApplication.universalIdentifier,
        key: workspaceVariableApplication.variableKey,
        value: 'mine',
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse a key the application does not declare', async () => {
    const { errors } = await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier:
          userVariableApplication.universalIdentifier,
        key: 'UNDECLARED_VARIABLE',
        value: 'mine',
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse an application that is not installed', async () => {
    const { errors } = await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier:
          NOT_INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
        key: userVariableApplication.variableKey,
        value: 'mine',
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse an application token no member is behind', async () => {
    const { errors } = await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier:
          userVariableApplication.universalIdentifier,
        key: userVariableApplication.variableKey,
        value: 'mine',
      },
      token: applicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse an application token writing a member value of another application', async () => {
    const { errors } = await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier:
          otherUserVariableApplication.universalIdentifier,
        key: otherUserVariableApplication.variableKey,
        value: 'mine',
      },
      token: janeApplicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse a guest whose role lacks the User Apps permission', async () => {
    const { data, errors } = await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier:
          userVariableApplication.universalIdentifier,
        key: userVariableApplication.variableKey,
        value: 'phil',
      },
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(data).toBeNull();
    expectPermissionDenied(errors);
  });

  it('should refuse an application token acting for a member when the application role lacks the User Apps permission', async () => {
    const { data, errors } = await updateMyUserApplicationVariable({
      input: {
        applicationUniversalIdentifier:
          withoutConnectedAccountsApplication.universalIdentifier,
        key: withoutConnectedAccountsApplication.variableKey,
        value: 'jony-from-app',
      },
      token: jonyWithoutConnectedAccountsApplicationToken,
      expectToFail: true,
    });

    expect(data).toBeNull();
    expectPermissionDenied(errors);
  });

  it('should refuse to list every member value from a session', async () => {
    const { errors } = await myUserApplicationVariables({
      input: {},
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse a member value on a workspace variable in the database', async () => {
    await expect(
      global.testDataSource.query(
        `INSERT INTO "core"."userApplicationVariableValue"
          ("workspaceId", "applicationVariableId", "userWorkspaceId", "value")
         SELECT "workspaceId", "id", $1, 'enc:v2:mine'
           FROM "core"."applicationVariable"
          WHERE "applicationId" = $2 AND "key" = $3`,
        [
          USER_WORKSPACE_DATA_SEED_IDS.JANE,
          workspaceVariableApplication.id,
          workspaceVariableApplication.variableKey,
        ],
      ),
    ).rejects.toThrow('violates foreign key constraint');
  });
});
