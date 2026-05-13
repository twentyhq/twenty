import crypto from 'crypto';

import { type DataSource } from 'typeorm';

import { EncryptApplicationRegistrationVariableSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000006000-encrypt-application-registration-variable';
import { EncryptApplicationVariableSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000005000-encrypt-application-variable';
import { EncryptSensitiveConfigStorageSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000008000-encrypt-sensitive-config-storage';
import { EncryptSigningKeyPrivateKeysSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000007000-encrypt-signing-key-private-keys';
import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

// Each slow command upgrades legacy CTR ciphertext to the versioned envelope.
// These tests drive the real command against Postgres and the real
// SecretEncryptionService wired up by the test Nest app:
//   1. drop the CHECK constraint so we can seed legacy rows,
//   2. seed legacy CTR ciphertext (or the pre-encryption shape the column
//      previously held) directly through SQL,
//   3. run `runDataMigration` end-to-end,
//   4. assert the row now matches the v2 envelope and decrypts back to the
//      original plaintext,
//   5. restore the constraint — which also asserts every migrated row
//      conforms to the schema invariant.

const V2_ENVELOPE_REGEX = /^enc:v2:[0-9a-f]{8}:[A-Za-z0-9+/=]+$/;

describe('Encryption backfill slow instance commands (integration)', () => {
  let dataSource: DataSource;
  let secretEncryption: SecretEncryptionService;

  beforeAll(() => {
    dataSource = global.testDataSource;
    secretEncryption = global.app.get(SecretEncryptionService);
  });

  describe('EncryptApplicationVariableSlowInstanceCommand', () => {
    const CONSTRAINT_NAME = 'CHK_applicationVariable_value_encrypted';
    const CONSTRAINT_EXPR = `"isSecret" = false OR "value" = '' OR "value" LIKE 'enc:v2:%'`;
    const insertedIds: string[] = [];
    let applicationId: string;

    beforeAll(async () => {
      // The seeded Apple workspace's auto-created custom application is a
      // pre-existing FK target we can borrow without seeding more rows.
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

    it('re-encrypts legacy secret rows with workspace-scoped HKDF, leaves non-secret rows untouched, and is idempotent', async () => {
      const secretRow = {
        id: crypto.randomUUID(),
        universalIdentifier: crypto.randomUUID(),
        plaintext: 'legacy-secret-value',
      };
      const nonSecretRow = {
        id: crypto.randomUUID(),
        universalIdentifier: crypto.randomUUID(),
        plaintext: 'https://example.com',
      };

      insertedIds.push(secretRow.id, nonSecretRow.id);

      await dataSource.query(
        `INSERT INTO core."applicationVariable"
           (id, "universalIdentifier", "applicationId", "workspaceId",
            "key", "value", "isSecret")
         VALUES
           ($1, $2, $3, $4, 'BACKFILL_API_KEY',    $5, true),
           ($6, $7, $3, $4, 'BACKFILL_PUBLIC_URL', $8, false)`,
        [
          secretRow.id,
          secretRow.universalIdentifier,
          applicationId,
          SEED_APPLE_WORKSPACE_ID,
          secretEncryption.encrypt(secretRow.plaintext),
          nonSecretRow.id,
          nonSecretRow.universalIdentifier,
          nonSecretRow.plaintext,
        ],
      );

      const command = global.app.get(
        EncryptApplicationVariableSlowInstanceCommand,
      );

      await command.runDataMigration(dataSource);

      const rows: { id: string; value: string }[] = await dataSource.query(
        `SELECT id, "value" FROM core."applicationVariable" WHERE id = ANY($1)`,
        [insertedIds],
      );
      const byId = new Map(rows.map((row) => [row.id, row.value]));

      expect(byId.get(secretRow.id)).toMatch(V2_ENVELOPE_REGEX);
      expect(
        secretEncryption.decryptVersioned(byId.get(secretRow.id) as string, {
          workspaceId: SEED_APPLE_WORKSPACE_ID,
        }),
      ).toBe(secretRow.plaintext);
      expect(byId.get(nonSecretRow.id)).toBe(nonSecretRow.plaintext);

      await command.runDataMigration(dataSource);

      const [{ value: stillV2 }] = await dataSource.query(
        `SELECT "value" FROM core."applicationVariable" WHERE id = $1`,
        [secretRow.id],
      );

      expect(stillV2).toBe(byId.get(secretRow.id));
    });
  });

  describe('EncryptApplicationRegistrationVariableSlowInstanceCommand', () => {
    const CONSTRAINT_NAME =
      'CHK_applicationRegistrationVariable_encryptedValue_encrypted';
    const CONSTRAINT_EXPR = `"encryptedValue" = '' OR "encryptedValue" LIKE 'enc:v2:%'`;
    let registrationId: string;

    beforeAll(async () => {
      registrationId = crypto.randomUUID();

      await dataSource.query(
        `INSERT INTO core."applicationRegistration"
           (id, "universalIdentifier", name, "oAuthClientId",
            "oAuthRedirectUris", "oAuthScopes", "workspaceId", "sourceType")
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'local')`,
        [
          registrationId,
          crypto.randomUUID(),
          'enc-backfill-test-registration',
          crypto.randomUUID(),
          ['http://localhost:3000/callback'],
          ['read'],
          SEED_APPLE_WORKSPACE_ID,
        ],
      );

      await dataSource.query(
        `ALTER TABLE core."applicationRegistrationVariable"
         DROP CONSTRAINT IF EXISTS "${CONSTRAINT_NAME}"`,
      );
    });

    afterAll(async () => {
      // Cascades to applicationRegistrationVariable rows we seeded.
      await dataSource.query(
        `DELETE FROM core."applicationRegistration" WHERE id = $1`,
        [registrationId],
      );

      await dataSource.query(
        `ALTER TABLE core."applicationRegistrationVariable"
         ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK (${CONSTRAINT_EXPR})`,
      );
    });

    it('re-encrypts legacy values with instance-scoped HKDF and leaves empty rows untouched', async () => {
      const filledId = crypto.randomUUID();
      const emptyId = crypto.randomUUID();
      const plaintext = 'legacy-registration-secret';

      await dataSource.query(
        `INSERT INTO core."applicationRegistrationVariable"
           (id, "applicationRegistrationId", "key", "encryptedValue",
            "isSecret", "isRequired")
         VALUES
           ($1, $2, 'FILLED_KEY', $3, true, false),
           ($4, $2, 'EMPTY_KEY',  '',  true, false)`,
        [
          filledId,
          registrationId,
          secretEncryption.encrypt(plaintext),
          emptyId,
        ],
      );

      const command = global.app.get(
        EncryptApplicationRegistrationVariableSlowInstanceCommand,
      );

      await command.runDataMigration(dataSource);

      const rows: { id: string; encryptedValue: string }[] =
        await dataSource.query(
          `SELECT id, "encryptedValue"
             FROM core."applicationRegistrationVariable"
            WHERE id = ANY($1)`,
          [[filledId, emptyId]],
        );
      const byId = new Map(rows.map((row) => [row.id, row.encryptedValue]));

      expect(byId.get(filledId)).toMatch(V2_ENVELOPE_REGEX);
      expect(
        secretEncryption.decryptVersioned(byId.get(filledId) as string),
      ).toBe(plaintext);
      expect(byId.get(emptyId)).toBe('');
    });
  });

  describe('EncryptSigningKeyPrivateKeysSlowInstanceCommand', () => {
    const CONSTRAINT_NAME = 'CHK_signingKey_privateKey_encrypted';
    const CONSTRAINT_EXPR = `"privateKey" IS NULL OR "privateKey" LIKE 'enc:v2:%'`;
    let insertedId: string;

    beforeAll(async () => {
      await dataSource.query(
        `ALTER TABLE core."signingKey"
         DROP CONSTRAINT IF EXISTS "${CONSTRAINT_NAME}"`,
      );
    });

    afterAll(async () => {
      if (insertedId) {
        await dataSource.query(`DELETE FROM core."signingKey" WHERE id = $1`, [
          insertedId,
        ]);
      }

      await dataSource.query(
        `ALTER TABLE core."signingKey"
         ADD CONSTRAINT "${CONSTRAINT_NAME}" CHECK (${CONSTRAINT_EXPR})`,
      );
    });

    it('re-encrypts a legacy private key into the instance-scoped envelope', async () => {
      insertedId = crypto.randomUUID();
      const plaintextPem =
        '-----BEGIN PRIVATE KEY-----\nlegacy-pem\n-----END PRIVATE KEY-----';

      await dataSource.query(
        `INSERT INTO core."signingKey"
           (id, "publicKey", "privateKey", "isCurrent")
         VALUES ($1, $2, $3, false)`,
        [
          insertedId,
          '-----BEGIN PUBLIC KEY-----\nlegacy-public\n-----END PUBLIC KEY-----',
          secretEncryption.encrypt(plaintextPem),
        ],
      );

      const command = global.app.get(
        EncryptSigningKeyPrivateKeysSlowInstanceCommand,
      );

      await command.runDataMigration(dataSource);

      const [{ privateKey }] = await dataSource.query(
        `SELECT "privateKey" FROM core."signingKey" WHERE id = $1`,
        [insertedId],
      );

      expect(privateKey).toMatch(V2_ENVELOPE_REGEX);
      expect(secretEncryption.decryptVersioned(privateKey)).toBe(plaintextPem);
    });
  });

  describe('EncryptSensitiveConfigStorageSlowInstanceCommand', () => {
    // EMAIL_SMTP_USER is declared as sensitive STRING in ConfigVariables.
    // Picking a real key (vs. a fabricated one) is required because the
    // command introspects ConfigVariables metadata to decide what to walk.
    const KEY = 'EMAIL_SMTP_USER';

    beforeAll(async () => {
      // The (key, NULL userId, NULL workspaceId) partial unique index would
      // collide if the app already wrote a value to this slot — wipe any
      // pre-existing instance-scoped row so we own the slot for the test.
      await dataSource.query(
        `DELETE FROM core."keyValuePair"
           WHERE type = $1 AND key = $2
             AND "userId" IS NULL AND "workspaceId" IS NULL`,
        [KeyValuePairType.CONFIG_VARIABLE, KEY],
      );
    });

    afterAll(async () => {
      await dataSource.query(
        `DELETE FROM core."keyValuePair"
           WHERE type = $1 AND key = $2
             AND "userId" IS NULL AND "workspaceId" IS NULL`,
        [KeyValuePairType.CONFIG_VARIABLE, KEY],
      );
    });

    it('re-encrypts a legacy sensitive STRING config row into the instance-scoped envelope', async () => {
      const id = crypto.randomUUID();
      const plaintext = 'smtp-legacy-username';

      // jsonb stores strings JSON-encoded — `to_jsonb($::text)` produces a
      // JSON string value that the command's `typeof rawValue === 'string'`
      // guard matches.
      await dataSource.query(
        `INSERT INTO core."keyValuePair"
           (id, "userId", "workspaceId", key, value, type)
         VALUES ($1, NULL, NULL, $2, to_jsonb($3::text), $4)`,
        [
          id,
          KEY,
          secretEncryption.encrypt(plaintext),
          KeyValuePairType.CONFIG_VARIABLE,
        ],
      );

      const command = global.app.get(
        EncryptSensitiveConfigStorageSlowInstanceCommand,
      );

      await command.runDataMigration(dataSource);

      const [{ value }] = await dataSource.query(
        `SELECT value FROM core."keyValuePair" WHERE id = $1`,
        [id],
      );

      const stringValue = value as string;

      expect(stringValue).toMatch(V2_ENVELOPE_REGEX);
      expect(secretEncryption.decryptVersioned(stringValue)).toBe(plaintext);
    });
  });
});
