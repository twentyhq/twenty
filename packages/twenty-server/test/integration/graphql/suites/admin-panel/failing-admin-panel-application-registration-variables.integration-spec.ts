import {
  findAdminApplicationRegistrationVariables,
  updateAdminApplicationRegistrationVariable,
} from 'test/integration/graphql/suites/admin-panel/utils/admin-application-registration-variable-api.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { isDefined } from 'twenty-shared/utils';

import {
  deleteSeededRegistration,
  readEncryptedValue,
  seedRegistrationOwnedByAnotherWorkspace,
  type SeededRegistration,
} from 'test/integration/graphql/suites/admin-panel/utils/seed-registration-with-variables.util';

/* global APPLE_PHIL_GUEST_ACCESS_TOKEN */

describe('Admin panel application registration variables should fail without the SECURITY permission flag', () => {
  let registration: SeededRegistration;

  const normalizeMessage = (message: string) =>
    message
      .replace(
        registration.applicationRegistrationId,
        '<applicationRegistrationId>',
      )
      .replace(
        registration.secretVariableId,
        '<applicationRegistrationVariableId>',
      );

  beforeAll(async () => {
    registration = await seedRegistrationOwnedByAnotherWorkspace(
      'failing-admin-panel-variables-registration',
    );
  });

  afterAll(async () => {
    // Guarded so a setup failure surfaces as itself rather than as a
    // TypeError raised while tearing down a fixture that never existed.
    if (isDefined(registration)) {
      await deleteSeededRegistration(registration.applicationRegistrationId);
    }
  });

  it('should refuse to read them', async () => {
    const { data, errors } = await findAdminApplicationRegistrationVariables({
      applicationRegistrationId: registration.applicationRegistrationId,
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    });

    expectOneNotInternalServerErrorSnapshot({ errors, normalizeMessage });
    expect(data?.findAdminApplicationRegistrationVariables).toBeFalsy();
  });

  it('should refuse to write them and leave the stored value untouched', async () => {
    const encryptedValueBeforeAttempt = await readEncryptedValue(
      registration.secretVariableId,
    );

    const { data, errors } = await updateAdminApplicationRegistrationVariable({
      id: registration.secretVariableId,
      value: 'value-from-a-caller-without-the-flag',
      token: APPLE_PHIL_GUEST_ACCESS_TOKEN,
    });

    expectOneNotInternalServerErrorSnapshot({ errors, normalizeMessage });
    expect(data?.updateAdminApplicationRegistrationVariable).toBeFalsy();

    expect(await readEncryptedValue(registration.secretVariableId)).toBe(
      encryptedValueBeforeAttempt,
    );
  });
});
