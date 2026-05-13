import crypto from 'crypto';

import gql from 'graphql-tag';
import { type DataSource } from 'typeorm';

import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CONSTRAINT_NAME = 'CHK_applicationVariable_value_encrypted';
const CONSTRAINT_EXPR = `"isSecret" = false OR "value" = '' OR "value" LIKE 'enc:v2:%'`;

const buildExpectedMask = (plaintext: string): string => {
  const visibleCharsCount = Math.min(5, Math.floor(plaintext.length / 10));

  return `${plaintext.slice(0, visibleCharsCount)}${SECRET_APPLICATION_VARIABLE_MASK}`;
};

describe('ApplicationVariable encryption (integration)', () => {
  let dataSource: DataSource;
  let secretEncryption: SecretEncryptionService;
  let applicationId: string;
  const insertedIds: string[] = [];

  beforeAll(async () => {
    dataSource = global.testDataSource;
    secretEncryption = global.app.get(SecretEncryptionService, {
      strict: false,
    });

    const [{ workspaceCustomApplicationId }] = await dataSource.query(
      `SELECT "workspaceCustomApplicationId"
         FROM core."workspace" WHERE id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    applicationId = workspaceCustomApplicationId;

    await dataSource.query(
      `ALTER TABLE core."applicationVariable"
       DROP CONSTRAINT IF EXISTS "${CONSTRAINT_NAME}"`,
    );
  });

  afterAll(async () => {
    if (insertedIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."applicationVariable" WHERE id = ANY($1)`,
        [insertedIds],
      );
    }

    await dataSource.query(
      `ALTER TABLE core."applicationVariable"
       ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK (${CONSTRAINT_EXPR})`,
    );
  });

  it('returns plaintext for non-secret variables and masked decrypted values for both v2 and legacy CTR secret rows through the live API', async () => {
    const v2Plaintext = 'v2-encrypted-application-variable-secret-value-here';
    const legacyPlaintext = 'legacy-ctr-application-variable-secret-value-here';
    const publicPlaintext = 'https://public.example.com/manifest.json';

    const v2Row = {
      id: crypto.randomUUID(),
      universalIdentifier: crypto.randomUUID(),
      key: 'TEST_V2_SECRET',
      value: secretEncryption.encryptVersioned(v2Plaintext, {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
    };
    const legacyRow = {
      id: crypto.randomUUID(),
      universalIdentifier: crypto.randomUUID(),
      key: 'TEST_LEGACY_CTR_SECRET',
      value: secretEncryption.encrypt(legacyPlaintext),
    };
    const publicRow = {
      id: crypto.randomUUID(),
      universalIdentifier: crypto.randomUUID(),
      key: 'TEST_PUBLIC_URL',
      value: publicPlaintext,
    };

    insertedIds.push(v2Row.id, legacyRow.id, publicRow.id);

    await dataSource.query(
      `INSERT INTO core."applicationVariable"
         (id, "universalIdentifier", "applicationId", "workspaceId",
          "key", "value", "isSecret")
       VALUES
         ($1,  $2,  $3, $4, $5,  $6,  true),
         ($7,  $8,  $3, $4, $9,  $10, true),
         ($11, $12, $3, $4, $13, $14, false)`,
      [
        v2Row.id,
        v2Row.universalIdentifier,
        applicationId,
        SEED_APPLE_WORKSPACE_ID,
        v2Row.key,
        v2Row.value,
        legacyRow.id,
        legacyRow.universalIdentifier,
        legacyRow.key,
        legacyRow.value,
        publicRow.id,
        publicRow.universalIdentifier,
        publicRow.key,
        publicRow.value,
      ],
    );

    const findResponse = await makeMetadataAPIRequest({
      query: gql`
        query FindApplicationForEncryptionTest($id: UUID!) {
          findOneApplication(id: $id) {
            id
            applicationVariables {
              id
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

    const variablesById = new Map(
      findResponse.body.data.findOneApplication.applicationVariables.map(
        (variable: { id: string }) => [variable.id, variable],
      ),
    );

    const v2Variable = variablesById.get(v2Row.id) as
      | { value: string; isSecret: boolean }
      | undefined;
    const legacyVariable = variablesById.get(legacyRow.id) as
      | { value: string; isSecret: boolean }
      | undefined;
    const publicVariable = variablesById.get(publicRow.id) as
      | { value: string; isSecret: boolean }
      | undefined;

    expect(v2Variable).toBeDefined();
    expect(v2Variable?.isSecret).toBe(true);
    expect(v2Variable?.value).toBe(buildExpectedMask(v2Plaintext));

    expect(legacyVariable).toBeDefined();
    expect(legacyVariable?.isSecret).toBe(true);
    expect(legacyVariable?.value).toBe(buildExpectedMask(legacyPlaintext));

    expect(publicVariable).toBeDefined();
    expect(publicVariable?.isSecret).toBe(false);
    expect(publicVariable?.value).toBe(publicPlaintext);
  });
});
