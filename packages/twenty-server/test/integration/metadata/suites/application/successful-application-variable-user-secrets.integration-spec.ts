import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { myApplicationVariables } from 'test/integration/metadata/suites/application/utils/my-application-variables.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateMyApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-my-application-variable.util';
import { updateOneApplicationVariable } from 'test/integration/metadata/suites/application/utils/update-one-application-variable.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';

import { ApplicationVariableUserValueEntity } from 'src/engine/core-modules/application/application-variable/application-variable-user-value.entity';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';

describe('Secret application variable user values should succeed', () => {
  let application: ApplicationWithVariable;
  let janeApplicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Secret User Variable Application',
      variableKey: 'API_KEY',
      variableScope: 'USER',
      isSecret: true,
      isRequired: true,
    });

    const tokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId: application.id,
    });

    janeApplicationToken = tokenPair.applicationAccessToken.token;

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

    const storedValues = await global.testDataSource
      .getRepository(ApplicationVariableUserValueEntity)
      .find({
        where: { applicationVariable: { applicationId: application.id } },
      });

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
