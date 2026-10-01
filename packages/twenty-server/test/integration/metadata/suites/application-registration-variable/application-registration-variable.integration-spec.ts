import crypto from 'crypto';

import {
  findApplicationRegistrationVariables,
  updateApplicationRegistrationVariable,
} from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-api.util';
import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';

const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const insertRegistrationDirect = async (
  name: string,
): Promise<{ id: string }> => {
  const id = crypto.randomUUID();
  const universalIdentifier = crypto.randomUUID();
  const oAuthClientId = crypto.randomUUID();

  await globalThis.testDataSource.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris", "oAuthScopes", "workspaceId")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      id,
      universalIdentifier,
      name,
      oAuthClientId,
      ['http://localhost:3000/callback'],
      ['read'],
      TEST_WORKSPACE_ID,
    ],
  );

  return { id };
};

const deleteRegistrationDirect = async (id: string): Promise<void> => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."applicationRegistration" WHERE id = $1`,
    [id],
  );
};

describe('ApplicationRegistrationVariable (integration)', () => {
  let registrationId: string;
  let secretVariableId: string;

  beforeAll(async () => {
    const registration = await insertRegistrationDirect('Variable Test App');

    registrationId = registration.id;

    secretVariableId = await insertApplicationRegistrationVariable({
      applicationRegistrationId: registrationId,
      key: 'API_KEY',
      value: 'secret-value-123',
      isSecret: true,
    });

    await insertApplicationRegistrationVariable({
      applicationRegistrationId: registrationId,
      key: 'PUBLIC_URL',
      value: 'https://example.com',
      isSecret: false,
    });
  });

  afterAll(async () => {
    await deleteRegistrationDirect(registrationId);
  });

  describe('find and update', () => {
    it('should find variables for the registration', async () => {
      const { data } = await findApplicationRegistrationVariables({
        applicationRegistrationId: registrationId,
        expectToFail: false,
      });

      const variables = data.findApplicationRegistrationVariables;

      expect(
        variables.map(({ key, isSecret, isFilled }) => ({
          key,
          isSecret,
          isFilled,
        })),
      ).toEqual([
        { key: 'API_KEY', isSecret: true, isFilled: true },
        { key: 'PUBLIC_URL', isSecret: false, isFilled: true },
      ]);
    });

    it('should update the variable value', async () => {
      const { data } = await updateApplicationRegistrationVariable({
        id: secretVariableId,
        value: 'new-secret-value-456',
        expectToFail: false,
      });

      const variable = data.updateApplicationRegistrationVariable;

      expect(variable).toBeDefined();
      expect(variable.id).toBe(secretVariableId);
      expect(variable.isFilled).toBe(true);
    });

    it('should update the variable description', async () => {
      const { data } = await updateApplicationRegistrationVariable({
        id: secretVariableId,
        description: 'Updated API key description',
        expectToFail: false,
      });

      const variable = data.updateApplicationRegistrationVariable;

      expect(variable).toBeDefined();
      expect(variable.description).toBe('Updated API key description');
    });
  });

  describe('error cases', () => {
    it('should fail to update a non-existent variable', async () => {
      const { errors } = await updateApplicationRegistrationVariable({
        id: '00000000-0000-0000-0000-000000000000',
        value: 'new-value',
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail to find variables for a registration not owned by current workspace', async () => {
      const { errors } = await findApplicationRegistrationVariables({
        applicationRegistrationId: '00000000-0000-0000-0000-000000000000',
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
