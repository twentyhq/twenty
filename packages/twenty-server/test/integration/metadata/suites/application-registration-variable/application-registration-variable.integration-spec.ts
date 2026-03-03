import crypto from 'crypto';

import gql from 'graphql-tag';
import {
  createApplicationRegistrationVariable,
  deleteApplicationRegistrationVariable,
  findApplicationRegistrationVariables,
  updateApplicationRegistrationVariable,
} from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-api.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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

  beforeAll(async () => {
    const registration = await insertRegistrationDirect('Variable Test App');

    registrationId = registration.id;
  });

  afterAll(async () => {
    await deleteRegistrationDirect(registrationId);
  });

  describe('CRUD lifecycle', () => {
    let variableId: string;

    it('should create a variable', async () => {
      const { data } = await createApplicationRegistrationVariable({
        applicationRegistrationId: registrationId,
        key: 'API_KEY',
        value: 'secret-value-123',
        description: 'Third-party API key',
        isSecret: true,
        expectToFail: false,
      });

      const variable = data.createApplicationRegistrationVariable;

      expect(variable).toBeDefined();
      expect(variable.id).toBeDefined();
      expect(variable.key).toBe('API_KEY');
      expect(variable.description).toBe('Third-party API key');
      expect(variable.isSecret).toBe(true);
      expect(variable.isRequired).toBe(false);
      expect(variable.isFilled).toBe(true);

      variableId = variable.id;
    });

    it('should find variables for the registration', async () => {
      const { data } = await findApplicationRegistrationVariables({
        applicationRegistrationId: registrationId,
        expectToFail: false,
      });

      const variables = data.findApplicationRegistrationVariables;

      expect(variables).toBeDefined();
      expect(variables.length).toBe(1);
      expect(variables[0].key).toBe('API_KEY');
      expect(variables[0].isFilled).toBe(true);
    });

    it('should update the variable value', async () => {
      const { data } = await updateApplicationRegistrationVariable({
        id: variableId,
        value: 'new-secret-value-456',
        expectToFail: false,
      });

      const variable = data.updateApplicationRegistrationVariable;

      expect(variable).toBeDefined();
      expect(variable.id).toBe(variableId);
      expect(variable.isFilled).toBe(true);
    });

    it('should update the variable description', async () => {
      const { data } = await updateApplicationRegistrationVariable({
        id: variableId,
        description: 'Updated API key description',
        expectToFail: false,
      });

      const variable = data.updateApplicationRegistrationVariable;

      expect(variable).toBeDefined();
      expect(variable.description).toBe('Updated API key description');
    });

    it('should delete the variable', async () => {
      const { data } = await deleteApplicationRegistrationVariable({
        id: variableId,
        expectToFail: false,
      });

      expect(data.deleteApplicationRegistrationVariable).toBe(true);
    });

    it('should return empty list after deletion', async () => {
      const { data } = await findApplicationRegistrationVariables({
        applicationRegistrationId: registrationId,
        expectToFail: false,
      });

      expect(data.findApplicationRegistrationVariables).toHaveLength(0);
    });
  });

  describe('non-secret variable', () => {
    let variableId: string;

    afterAll(async () => {
      if (variableId) {
        await deleteApplicationRegistrationVariable({
          id: variableId,
        });
      }
    });

    it('should create a non-secret variable', async () => {
      const { data } = await createApplicationRegistrationVariable({
        applicationRegistrationId: registrationId,
        key: 'PUBLIC_URL',
        value: 'https://example.com',
        description: 'Public webhook URL',
        isSecret: false,
        expectToFail: false,
      });

      const variable = data.createApplicationRegistrationVariable;

      expect(variable).toBeDefined();
      expect(variable.key).toBe('PUBLIC_URL');
      expect(variable.isSecret).toBe(false);
      expect(variable.isFilled).toBe(true);

      variableId = variable.id;
    });
  });

  describe('error cases', () => {
    it('should fail to create a variable for a non-existent registration', async () => {
      const { errors } = await createApplicationRegistrationVariable({
        applicationRegistrationId: '00000000-0000-0000-0000-000000000000',
        key: 'SOME_KEY',
        value: 'some-value',
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail to update a non-existent variable', async () => {
      const { errors } = await updateApplicationRegistrationVariable({
        id: '00000000-0000-0000-0000-000000000000',
        value: 'new-value',
        expectToFail: true,
      });

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail to delete a non-existent variable', async () => {
      const { errors } = await deleteApplicationRegistrationVariable({
        id: '00000000-0000-0000-0000-000000000000',
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

  describe('variable via GraphQL createApplicationRegistration', () => {
    let gqlRegistrationId: string;

    afterAll(async () => {
      if (gqlRegistrationId) {
        await globalThis.testDataSource.query(
          `DELETE FROM core."applicationRegistration" WHERE id = $1`,
          [gqlRegistrationId],
        );
      }
    });

    it('should create a registration via GraphQL and manage variables on it', async () => {
      const createResponse = await makeMetadataAPIRequest({
        query: gql`
          mutation CreateApplicationRegistration(
            $input: CreateApplicationRegistrationInput!
          ) {
            createApplicationRegistration(input: $input) {
              applicationRegistration {
                id
                name
              }
            }
          }
        `,
        variables: {
          input: {
            name: 'GQL Variable Test App',
            description: 'Created via GraphQL for variable testing',
          },
        },
      });

      expect(createResponse.body.data).toBeDefined();

      const registration =
        createResponse.body.data.createApplicationRegistration
          .applicationRegistration;

      expect(registration).toBeDefined();
      expect(registration.id).toBeDefined();

      gqlRegistrationId = registration.id;

      const { data: createVarData } =
        await createApplicationRegistrationVariable({
          applicationRegistrationId: gqlRegistrationId,
          key: 'WEBHOOK_SECRET',
          value: 'whsec_test123',
          description: 'Webhook signing secret',
          expectToFail: false,
        });

      expect(createVarData.createApplicationRegistrationVariable.key).toBe(
        'WEBHOOK_SECRET',
      );
      expect(createVarData.createApplicationRegistrationVariable.isFilled).toBe(
        true,
      );

      const { data: findVarData } = await findApplicationRegistrationVariables({
        applicationRegistrationId: gqlRegistrationId,
        expectToFail: false,
      });

      expect(findVarData.findApplicationRegistrationVariables).toHaveLength(1);
      expect(findVarData.findApplicationRegistrationVariables[0].key).toBe(
        'WEBHOOK_SECRET',
      );
    });
  });
});
