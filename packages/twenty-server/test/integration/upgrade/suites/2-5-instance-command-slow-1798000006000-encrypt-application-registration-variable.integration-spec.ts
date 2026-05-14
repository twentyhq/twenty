import crypto from 'crypto';

import { config } from 'dotenv';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

import { EncryptApplicationRegistrationVariableSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000006000-encrypt-application-registration-variable';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const TEST_REGISTRATION_NAME_PREFIX = 'encrypt-app-reg-var-test-';
const CHECK_CONSTRAINT_NAME =
  'CHK_applicationRegistrationVariable_encryptedValue_encrypted';
const CHECK_CONSTRAINT_EXPR = `"encryptedValue" = '' OR "encryptedValue" LIKE '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%'`;

const dropCheckConstraint = (dataSource: DataSource): Promise<unknown> =>
  dataSource.query(
    `ALTER TABLE "core"."applicationRegistrationVariable"
     DROP CONSTRAINT IF EXISTS "${CHECK_CONSTRAINT_NAME}"`,
  );

const restoreCheckConstraint = async (
  dataSource: DataSource,
): Promise<void> => {
  await dropCheckConstraint(dataSource);
  await dataSource.query(
    `ALTER TABLE "core"."applicationRegistrationVariable"
     ADD CONSTRAINT "${CHECK_CONSTRAINT_NAME}"
     CHECK (${CHECK_CONSTRAINT_EXPR})`,
  );
};

describe('2-5 slow instance command 1798000006000 - EncryptApplicationRegistrationVariableSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let secretEncryptionService: SecretEncryptionService;
  let command: EncryptApplicationRegistrationVariableSlowInstanceCommand;
  let workspaceId: string;
  let registrationId: string;
  const seededVariableIds: string[] = [];

  const seedVariable = async ({
    encryptedValue,
    isSecret = true,
  }: {
    encryptedValue: string;
    isSecret?: boolean;
  }): Promise<string> => {
    await dropCheckConstraint(dataSource);

    const id = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."applicationRegistrationVariable"
         (id, "applicationRegistrationId", "key", "encryptedValue",
          "isSecret", "isRequired")
       VALUES ($1, $2, $3, $4, $5, false)`,
      [id, registrationId, `KEY_${id}`, encryptedValue, isSecret],
    );

    seededVariableIds.push(id);

    return id;
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();

    secretEncryptionService = buildSecretEncryptionServiceFromEnv();
    command = new EncryptApplicationRegistrationVariableSlowInstanceCommand(
      secretEncryptionService,
    );

    const [seedWorkspace] = await dataSource.query(
      `SELECT id FROM "core"."workspace" LIMIT 1`,
    );

    if (!isDefined(seedWorkspace)) {
      throw new Error(
        'No seeded workspace found; run database:reset before the integration suite.',
      );
    }

    workspaceId = seedWorkspace.id as string;

    registrationId = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."applicationRegistration"
         (id, "universalIdentifier", name, "oAuthClientId",
          "oAuthRedirectUris", "oAuthScopes", "workspaceId", "sourceType")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'local')`,
      [
        registrationId,
        crypto.randomUUID(),
        `${TEST_REGISTRATION_NAME_PREFIX}${registrationId}`,
        crypto.randomUUID(),
        ['http://localhost:3000/callback'],
        ['read'],
        workspaceId,
      ],
    );
  }, 30000);

  afterEach(async () => {
    if (seededVariableIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."applicationRegistrationVariable"
                WHERE id = ANY($1::uuid[])`,
        [seededVariableIds],
      );
      seededVariableIds.length = 0;
    }
    await restoreCheckConstraint(dataSource);
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM "core"."applicationRegistration" WHERE id = $1`,
      [registrationId],
    );
    await dataSource?.destroy();
  });

  it('upgrades legacy CTR rows to enc:v2 with instance-scoped HKDF', async () => {
    const plaintext = 'legacy-ctr-registration-variable-secret';
    const id = await seedVariable({
      encryptedValue: secretEncryptionService.encrypt(plaintext),
    });

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "encryptedValue"
         FROM "core"."applicationRegistrationVariable"
        WHERE id = $1`,
      [id],
    );

    expect(
      row.encryptedValue.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX),
    ).toBe(true);
    expect(secretEncryptionService.decryptVersioned(row.encryptedValue)).toBe(
      plaintext,
    );
  });

  it('leaves unfilled rows (encryptedValue = "") untouched', async () => {
    const id = await seedVariable({ encryptedValue: '' });

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "encryptedValue"
         FROM "core"."applicationRegistrationVariable"
        WHERE id = $1`,
      [id],
    );

    expect(row.encryptedValue).toBe('');
  });

  it('leaves enc:v2 rows untouched and is idempotent across re-runs', async () => {
    const plaintext = 'already-v2-registration-secret';
    const preexistingV2 = secretEncryptionService.encryptVersioned(plaintext);
    const id = await seedVariable({ encryptedValue: preexistingV2 });

    await command.runDataMigration(dataSource);
    const [afterFirstRun] = await dataSource.query(
      `SELECT "encryptedValue"
         FROM "core"."applicationRegistrationVariable"
        WHERE id = $1`,
      [id],
    );

    expect(afterFirstRun.encryptedValue).toBe(preexistingV2);

    await command.runDataMigration(dataSource);
    const [afterSecondRun] = await dataSource.query(
      `SELECT "encryptedValue"
         FROM "core"."applicationRegistrationVariable"
        WHERE id = $1`,
      [id],
    );

    expect(afterSecondRun.encryptedValue).toBe(preexistingV2);
  });

  it('up() applies the CHECK constraint that rejects plaintext inserts', async () => {
    await dropCheckConstraint(dataSource);

    const queryRunner = dataSource.createQueryRunner();

    try {
      await command.up(queryRunner);

      const id = crypto.randomUUID();

      seededVariableIds.push(id);

      await expect(
        dataSource.query(
          `INSERT INTO "core"."applicationRegistrationVariable"
             (id, "applicationRegistrationId", "key", "encryptedValue",
              "isSecret", "isRequired")
           VALUES ($1, $2, $3, 'plaintext-should-be-rejected', true, false)`,
          [id, registrationId, `KEY_${id}`],
        ),
      ).rejects.toThrow(/check constraint/i);
    } finally {
      await queryRunner.release();
    }
  });

  it('down() removes the CHECK constraint and lets plaintext through (for rollback safety only)', async () => {
    const queryRunner = dataSource.createQueryRunner();

    try {
      await command.down(queryRunner);

      const id = await seedVariable({
        encryptedValue: 'plaintext-allowed-after-down',
      });

      const [row] = await dataSource.query(
        `SELECT "encryptedValue"
           FROM "core"."applicationRegistrationVariable"
          WHERE id = $1`,
        [id],
      );

      expect(row.encryptedValue).toBe('plaintext-allowed-after-down');
    } finally {
      await queryRunner.release();
    }
  });
});
