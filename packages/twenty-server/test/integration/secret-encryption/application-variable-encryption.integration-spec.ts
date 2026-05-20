import crypto from 'crypto';

import gql from 'graphql-tag';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

const V2_ENVELOPE_REGEX = /^enc:v2:[0-9a-f]{8}:[A-Za-z0-9+/=]+$/;
const CONSTRAINT_NAME = 'CHK_applicationVariable_value_encrypted';
const CONSTRAINT_EXPR = `"isSecret" = false OR "value" = '' OR "value" LIKE 'enc:v2:%'`;

const V2_VARIABLE_KEY = 'TEST_V2_SECRET';
const LEGACY_VARIABLE_KEY = 'TEST_LEGACY_CTR_SECRET';

const buildExpectedMask = (plaintext: string): string => {
  const visibleCharsCount = Math.min(5, Math.floor(plaintext.length / 10));

  return `${plaintext.slice(0, visibleCharsCount)}${SECRET_APPLICATION_VARIABLE_MASK}`;
};

describe('ApplicationVariable encryption (integration)', () => {
  let dataSource: DataSource;
  let secretEncryption: SecretEncryptionService;
  let applicationUniversalIdentifier: string;
  let applicationId: string;

  beforeAll(async () => {
    dataSource = global.testDataSource;
    secretEncryption = buildSecretEncryptionServiceFromEnv();

    applicationUniversalIdentifier = crypto.randomUUID();
    const roleUniversalIdentifier = crypto.randomUUID();

    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'Test Application',
      description: 'App for testing application-variable encryption',
      sourcePath: 'test-application-variable-encryption',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: applicationUniversalIdentifier,
        roleId: roleUniversalIdentifier,
        overrides: {
          application: {
            universalIdentifier: applicationUniversalIdentifier,
            defaultRoleUniversalIdentifier: roleUniversalIdentifier,
            displayName: 'Test Application',
            description: 'App for testing application-variable encryption',
            applicationVariables: {
              [V2_VARIABLE_KEY]: {
                universalIdentifier: crypto.randomUUID(),
                isSecret: true,
              },
              [LEGACY_VARIABLE_KEY]: {
                universalIdentifier: crypto.randomUUID(),
                isSecret: true,
              },
            },
            packageJsonChecksum: null,
            yarnLockChecksum: null,
          },
        },
      }),
      expectToFail: false,
    });

    const findResponse = await makeMetadataAPIRequest({
      query: gql`
        query FindAppForEncryptionTestSetup($universalIdentifier: UUID!) {
          findOneApplication(universalIdentifier: $universalIdentifier) {
            id
          }
        }
      `,
      variables: { universalIdentifier: applicationUniversalIdentifier },
    });

    if (!isDefined(findResponse.body?.data?.findOneApplication?.id)) {
      throw new Error(
        `findOneApplication after sync did not return an id: ${JSON.stringify(
          findResponse.body,
        )}`,
      );
    }

    applicationId = findResponse.body.data.findOneApplication.id;
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
  });

  it('encrypts the value on the API write path, persists a v2 envelope in Postgres, and returns the masked decrypted value via the API read path', async () => {
    const plaintext = 'v2-encrypted-application-variable-secret-value-here';

    const updateResponse = await makeMetadataAPIRequest({
      query: gql`
        mutation UpdateAppVariableForEncryptionTest(
          $key: String!
          $value: String!
          $applicationId: UUID!
        ) {
          updateOneApplicationVariable(
            key: $key
            value: $value
            applicationId: $applicationId
          )
        }
      `,
      variables: {
        key: V2_VARIABLE_KEY,
        value: plaintext,
        applicationId,
      },
    });

    expect(updateResponse.body.errors).toBeUndefined();
    expect(updateResponse.body.data.updateOneApplicationVariable).toBe(true);

    const [dbRow] = await dataSource.query(
      `SELECT "value"
         FROM "core"."applicationVariable"
        WHERE "applicationId" = $1 AND "key" = $2`,
      [applicationId, V2_VARIABLE_KEY],
    );

    expect(dbRow.value).not.toContain(plaintext);
    expect(dbRow.value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)).toBe(
      true,
    );
    expect(dbRow.value).toMatch(V2_ENVELOPE_REGEX);

    const findResponse = await makeMetadataAPIRequest({
      query: gql`
        query FindAppVariablesForEncryptionTest($id: UUID!) {
          findOneApplication(id: $id) {
            applicationVariables {
              key
              value
              isSecret
            }
          }
        }
      `,
      variables: { id: applicationId },
    });

    expect(findResponse.body.errors).toBeUndefined();

    const variable =
      findResponse.body.data.findOneApplication.applicationVariables.find(
        (v: { key: string }) => v.key === V2_VARIABLE_KEY,
      );

    expect(variable).toBeDefined();
    expect(variable.isSecret).toBe(true);
    expect(variable.value).toBe(buildExpectedMask(plaintext));
  });

  describe('legacy CTR fallback', () => {
    beforeAll(async () => {
      await dataSource.query(
        `ALTER TABLE core."applicationVariable"
         DROP CONSTRAINT IF EXISTS "${CONSTRAINT_NAME}"`,
      );
    });

    afterAll(async () => {
      await dataSource.query(
        `UPDATE core."applicationVariable"
              SET "value" = ''
            WHERE "applicationId" = $1 AND "key" = $2`,
        [applicationId, LEGACY_VARIABLE_KEY],
      );
      await dataSource.query(
        `ALTER TABLE core."applicationVariable"
         ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK (${CONSTRAINT_EXPR})`,
      );
    });

    it('decrypts a legacy CTR-encrypted value through the live API read path', async () => {
      const plaintext = 'legacy-ctr-application-variable-secret-value-here';

      await dataSource.query(
        `UPDATE core."applicationVariable"
              SET "value" = $1
            WHERE "applicationId" = $2 AND "key" = $3`,
        [
          secretEncryption.encrypt(plaintext),
          applicationId,
          LEGACY_VARIABLE_KEY,
        ],
      );

      const findResponse = await makeMetadataAPIRequest({
        query: gql`
          query FindLegacyCtrAppVariablesForEncryptionTest($id: UUID!) {
            findOneApplication(id: $id) {
              applicationVariables {
                key
                value
                isSecret
              }
            }
          }
        `,
        variables: { id: applicationId },
      });

      expect(findResponse.body.errors).toBeUndefined();

      const variable =
        findResponse.body.data.findOneApplication.applicationVariables.find(
          (v: { key: string }) => v.key === LEGACY_VARIABLE_KEY,
        );

      expect(variable).toBeDefined();
      expect(variable.isSecret).toBe(true);
      expect(variable.value).toBe(buildExpectedMask(plaintext));
    });
  });
});
