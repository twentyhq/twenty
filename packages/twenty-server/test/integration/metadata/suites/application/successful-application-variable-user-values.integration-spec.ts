import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-application-variables.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateMyApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-application-variable.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';

describe('Application variable user values should succeed', () => {
  let application: ApplicationWithVariable;
  let janeApplicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'User Variable Application',
      variableKey: 'RECORD_MY_MEETINGS',
      variableScope: 'USER',
    });

    const janeApplicationTokenPair =
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      });

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
});
