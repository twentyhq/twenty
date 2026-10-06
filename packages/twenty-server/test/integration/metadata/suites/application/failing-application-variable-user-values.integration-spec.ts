import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
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

const NOT_INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  '8f7c1e0a-4b2d-4c3e-9a1f-0d2e3c4b5a69';

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
    const { errors } = await updateMyApplicationVariable({
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
    const { errors } = await myApplicationVariables({
      input: {
        applicationUniversalIdentifier:
          NOT_INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse to read member values with a token no person is behind', async () => {
    const { errors } = await myApplicationVariables({
      input: {
        applicationUniversalIdentifier:
          userVariableApplication.universalIdentifier,
      },
      token: applicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse an application token reading another application', async () => {
    const { errors } = await myApplicationVariables({
      input: {
        applicationUniversalIdentifier:
          workspaceVariableApplication.universalIdentifier,
      },
      token: janeApplicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse an application token writing a member value of its own application', async () => {
    const { errors } = await updateMyApplicationVariable({
      input: {
        applicationUniversalIdentifier:
          userVariableApplication.universalIdentifier,
        key: userVariableApplication.variableKey,
        value: 'mine',
      },
      token: janeApplicationToken,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse to list every member value from a session', async () => {
    const { errors } = await applicationVariableUserValues({
      input: {},
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });

  it('should refuse a member value on a workspace variable in the database', async () => {
    await expect(
      global.testDataSource.query(
        `INSERT INTO "core"."applicationVariableUserValue"
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
