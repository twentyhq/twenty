import gql from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';

// Real integration test for the encryption path: drive the full
// create/read/delete lifecycle through the GraphQL API and peek into
// Postgres mid-test to verify the stored value is ciphertext.
// applicationRegistrationVariable now uses
// SecretEncryptionService.encryptVersioned with no workspaceId (instance
// scope) — registration variables are server-level config, readable by
// any workspace that installs the parent registration.

describe('ApplicationRegistrationVariable encryption (integration)', () => {
  let dataSource: DataSource;
  let applicationRegistrationId: string;

  beforeAll(async () => {
    dataSource = global.testDataSource;

    const createRegistrationResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateRegistrationForEncryptionTest(
          $input: CreateApplicationRegistrationInput!
        ) {
          createApplicationRegistration(input: $input) {
            applicationRegistration {
              id
            }
          }
        }
      `,
      variables: {
        input: { name: 'enc-integration-test-registration' },
      },
    });

    const registrationId =
      createRegistrationResponse.body?.data?.createApplicationRegistration
        ?.applicationRegistration?.id;

    if (!isDefined(registrationId)) {
      throw new Error(
        `createApplicationRegistration failed: ${JSON.stringify(
          createRegistrationResponse.body,
        )}`,
      );
    }

    applicationRegistrationId = registrationId;
  });

  afterAll(async () => {
    await makeMetadataAPIRequest({
      query: gql`
        mutation DeleteRegistrationForEncryptionTest($id: String!) {
          deleteApplicationRegistration(id: $id)
        }
      `,
      variables: { id: applicationRegistrationId },
    });
  });

  it('encrypts the value on the API write path, persists ciphertext in Postgres, and decrypts back via the API read path', async () => {
    const plaintext = 'this-is-a-legacy-ctr-secret-value';

    const createVariableResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation CreateVariableForEncryptionTest(
          $input: CreateApplicationRegistrationVariableInput!
        ) {
          createApplicationRegistrationVariable(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          applicationRegistrationId,
          key: 'TEST_LEGACY_PLAIN',
          value: plaintext,
          isSecret: false,
        },
      },
    });

    expect(createVariableResponse.body.errors).toBeUndefined();
    const variableId =
      createVariableResponse.body.data.createApplicationRegistrationVariable.id;

    const [dbRow] = await dataSource.query(
      `SELECT "encryptedValue" FROM "core"."applicationRegistrationVariable" WHERE id = $1`,
      [variableId],
    );

    // The v2 envelope is `enc:v2:<8-hex keyId>:<base64 payload>`. Two
    // invariants: the column does NOT contain the plaintext, and the
    // value matches the envelope shape (proving encryption actually ran).
    expect(dbRow.encryptedValue).not.toContain(plaintext);
    expect(dbRow.encryptedValue.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)).toBe(
      true,
    );
    expect(dbRow.encryptedValue).toMatch(
      /^enc:v2:[0-9a-f]{8}:[A-Za-z0-9+/=]+$/,
    );

    const findResponse = await makeMetadataAPIRequest({
      query: gql`
        query FindVariablesForEncryptionTest(
          $applicationRegistrationId: String!
        ) {
          findApplicationRegistrationVariables(
            applicationRegistrationId: $applicationRegistrationId
          ) {
            id
            key
            value
            isSecret
          }
        }
      `,
      variables: { applicationRegistrationId },
    });

    expect(findResponse.body.errors).toBeUndefined();

    const variable =
      findResponse.body.data.findApplicationRegistrationVariables.find(
        (v: { id: string }) => v.id === variableId,
      );

    expect(variable).toBeDefined();
    expect(variable.isSecret).toBe(false);
    // For non-secret variables the resolver decrypts and returns the
    // plaintext directly — proves the legacy CTR encrypt + decrypt
    // round-trip works end-to-end via the live API.
    expect(variable.value).toBe(plaintext);
  });
});
