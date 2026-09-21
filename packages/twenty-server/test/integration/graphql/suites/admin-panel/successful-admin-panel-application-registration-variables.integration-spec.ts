import {
  findAdminApplicationRegistrationVariables,
  updateAdminApplicationRegistrationVariable,
} from 'test/integration/graphql/suites/admin-panel/utils/admin-application-registration-variable-api.util';
import { isDefined } from 'twenty-shared/utils';

import {
  deleteSeededRegistration,
  NON_SECRET_PLAINTEXT_VALUE,
  OBFUSCATED_VALUE,
  readEncryptedValue,
  SECRET_PLAINTEXT_VALUE,
  seedRegistrationOwnedByAnotherWorkspace,
  type SeededRegistration,
} from 'test/integration/graphql/suites/admin-panel/utils/seed-registration-with-variables.util';

describe('Admin panel application registration variables should succeed', () => {
  let registration: SeededRegistration;

  beforeAll(async () => {
    registration = await seedRegistrationOwnedByAnotherWorkspace(
      'successful-admin-panel-variables-registration',
    );
  });

  afterAll(async () => {
    // Guarded so a setup failure surfaces as itself rather than as a
    // TypeError raised while tearing down a fixture that never existed.
    if (isDefined(registration)) {
      await deleteSeededRegistration(registration.applicationRegistrationId);
    }
  });

  it('should read the variables of a registration owned by another workspace', async () => {
    const { data, errors } = await findAdminApplicationRegistrationVariables({
      applicationRegistrationId: registration.applicationRegistrationId,
    });

    expect(errors).toBeUndefined();

    const variables = data.findAdminApplicationRegistrationVariables;

    expect(variables).toHaveLength(2);
    expect(variables.map((variable) => variable.key)).toEqual([
      'ADMIN_SCOPE_API_KEY',
      'ADMIN_SCOPE_PUBLIC_URL',
    ]);
  });

  it('should obfuscate a secret value and never send its plaintext', async () => {
    const { data, rawBody } = await findAdminApplicationRegistrationVariables({
      applicationRegistrationId: registration.applicationRegistrationId,
    });

    const secretVariable = data.findAdminApplicationRegistrationVariables.find(
      (variable) => variable.id === registration.secretVariableId,
    );

    expect(secretVariable?.isFilled).toBe(true);
    expect(secretVariable?.value).toBe(OBFUSCATED_VALUE);
    expect(JSON.stringify(rawBody)).not.toContain(SECRET_PLAINTEXT_VALUE);
  });

  it('should return a non-secret value in plaintext', async () => {
    const { data } = await findAdminApplicationRegistrationVariables({
      applicationRegistrationId: registration.applicationRegistrationId,
    });

    const nonSecretVariable =
      data.findAdminApplicationRegistrationVariables.find(
        (variable) => variable.id === registration.nonSecretVariableId,
      );

    expect(nonSecretVariable?.value).toBe(NON_SECRET_PLAINTEXT_VALUE);
  });

  it('should write a variable of a registration owned by another workspace', async () => {
    const encryptedValueBeforeUpdate = await readEncryptedValue(
      registration.secretVariableId,
    );

    const { data, errors } = await updateAdminApplicationRegistrationVariable({
      id: registration.secretVariableId,
      value: 'admin-panel-rotated-value',
    });

    expect(errors).toBeUndefined();

    const variable = data.updateAdminApplicationRegistrationVariable;

    expect(variable.id).toBe(registration.secretVariableId);
    expect(variable.isFilled).toBe(true);
    expect(variable.value).toBe(OBFUSCATED_VALUE);

    expect(await readEncryptedValue(registration.secretVariableId)).not.toBe(
      encryptedValueBeforeUpdate,
    );
  });
});
