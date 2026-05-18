import crypto from 'crypto';

import gql from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const V2_ENVELOPE_REGEX = /^enc:v2:[0-9a-f]{8}:[A-Za-z0-9+/=]+$/;
const CONSTRAINT_NAME =
  'CHK_applicationRegistrationVariable_encryptedValue_encrypted';
const CONSTRAINT_EXPR = `"encryptedValue" = '' OR "encryptedValue" LIKE 'enc:v2:%'`;

describe('ApplicationRegistrationVariable encryption (integration)', () => {
  let dataSource: DataSource;
  let secretEncryption: SecretEncryptionService;
  let applicationRegistrationId: string;

  beforeAll(async () => {
    dataSource = global.testDataSource;
    secretEncryption = buildSecretEncryptionServiceFromEnv();

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
    const plaintext = 'this-is-a-v2-encrypted-secret-value';

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
          key: 'TEST_V2_KEY',
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

    expect(dbRow.encryptedValue).not.toContain(plaintext);
    expect(
      dbRow.encryptedValue.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX),
    ).toBe(true);
    expect(dbRow.encryptedValue).toMatch(V2_ENVELOPE_REGEX);

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
    expect(variable.value).toBe(plaintext);
  });

  describe('legacy CTR fallback', () => {
    let legacyVariableId: string;

    beforeAll(async () => {
      await dataSource.query(
        `ALTER TABLE core."applicationRegistrationVariable"
         DROP CONSTRAINT IF EXISTS "${CONSTRAINT_NAME}"`,
      );
    });

    afterAll(async () => {
      await dataSource.query(
        `DELETE FROM core."applicationRegistrationVariable" WHERE id = $1`,
        [legacyVariableId],
      );
      await dataSource.query(
        `ALTER TABLE core."applicationRegistrationVariable"
         ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK (${CONSTRAINT_EXPR})`,
      );
    });

    it('decrypts a legacy CTR-encrypted value through the live API', async () => {
      legacyVariableId = crypto.randomUUID();
      const plaintext = 'legacy-ctr-registration-variable-secret';

      await dataSource.query(
        `INSERT INTO core."applicationRegistrationVariable"
           (id, "applicationRegistrationId", "key", "encryptedValue",
            "isSecret", "isRequired")
         VALUES ($1, $2, 'TEST_LEGACY_CTR_KEY', $3, false, false)`,
        [
          legacyVariableId,
          applicationRegistrationId,
          secretEncryption.encrypt(plaintext),
        ],
      );

      const findResponse = await makeMetadataAPIRequest({
        query: gql`
          query FindLegacyCtrVariablesForEncryptionTest(
            $applicationRegistrationId: String!
          ) {
            findApplicationRegistrationVariables(
              applicationRegistrationId: $applicationRegistrationId
            ) {
              id
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
          (v: { id: string }) => v.id === legacyVariableId,
        );

      expect(variable).toBeDefined();
      expect(variable.isSecret).toBe(false);
      expect(variable.value).toBe(plaintext);
    });
  });
});
