import crypto from 'crypto';

import { config } from 'dotenv';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

import { EncryptApplicationVariableSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000005000-encrypt-application-variable';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const TEST_ROW_KEY_PREFIX = 'ENCRYPT_APP_VAR_TEST_';
const CHECK_CONSTRAINT_NAME = 'CHK_applicationVariable_value_encrypted';
const CHECK_CONSTRAINT_EXPR = `"isSecret" = false OR "value" = '' OR "value" LIKE '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%'`;

const dropCheckConstraint = (dataSource: DataSource): Promise<unknown> =>
  dataSource.query(
    `ALTER TABLE "core"."applicationVariable"
     DROP CONSTRAINT IF EXISTS "${CHECK_CONSTRAINT_NAME}"`,
  );

const restoreCheckConstraint = async (
  dataSource: DataSource,
): Promise<void> => {
  await dropCheckConstraint(dataSource);
  await dataSource.query(
    `ALTER TABLE "core"."applicationVariable"
     ADD CONSTRAINT "${CHECK_CONSTRAINT_NAME}"
     CHECK (${CHECK_CONSTRAINT_EXPR})`,
  );
};

describe('2-5 slow instance command 1798000005000 - EncryptApplicationVariableSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let secretEncryptionService: SecretEncryptionService;
  let command: EncryptApplicationVariableSlowInstanceCommand;
  let workspaceId: string;
  let applicationId: string;
  const seededRowIds: string[] = [];

  const seedRow = async ({
    isSecret,
    value,
  }: {
    isSecret: boolean;
    value: string;
  }): Promise<string> => {
    await dropCheckConstraint(dataSource);

    const id = crypto.randomUUID();
    const universalIdentifier = crypto.randomUUID();
    const key = `${TEST_ROW_KEY_PREFIX}${id}`;

    await dataSource.query(
      `INSERT INTO "core"."applicationVariable"
         (id, "universalIdentifier", "applicationId", "workspaceId",
          "key", "value", "isSecret")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        universalIdentifier,
        applicationId,
        workspaceId,
        key,
        value,
        isSecret,
      ],
    );

    seededRowIds.push(id);

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
    command = new EncryptApplicationVariableSlowInstanceCommand(
      secretEncryptionService,
    );

    const [seedWorkspace] = await dataSource.query(
      `SELECT id, "workspaceCustomApplicationId"
         FROM "core"."workspace"
        WHERE "workspaceCustomApplicationId" IS NOT NULL
        LIMIT 1`,
    );

    if (!isDefined(seedWorkspace)) {
      throw new Error(
        'No seeded workspace with a custom application found; run database:reset before the integration suite.',
      );
    }

    workspaceId = seedWorkspace.id as string;
    applicationId = seedWorkspace.workspaceCustomApplicationId as string;
  }, 30000);

  afterEach(async () => {
    if (seededRowIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."applicationVariable" WHERE id = ANY($1::uuid[])`,
        [seededRowIds],
      );
      seededRowIds.length = 0;
    }
    await restoreCheckConstraint(dataSource);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('upgrades legacy CTR secret rows to enc:v2 with workspaceId-bound HKDF', async () => {
    const plaintext = 'legacy-ctr-application-variable-secret';
    const id = await seedRow({
      isSecret: true,
      value: secretEncryptionService.encrypt(plaintext),
    });

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "value" FROM "core"."applicationVariable" WHERE id = $1`,
      [id],
    );

    expect(row.value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)).toBe(
      true,
    );
    expect(
      secretEncryptionService.decryptVersioned(row.value, { workspaceId }),
    ).toBe(plaintext);
  });

  it('leaves non-secret rows untouched', async () => {
    const plaintext = 'https://public.example.com/manifest.json';
    const id = await seedRow({ isSecret: false, value: plaintext });

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "value" FROM "core"."applicationVariable" WHERE id = $1`,
      [id],
    );

    expect(row.value).toBe(plaintext);
  });

  it('leaves enc:v2 rows untouched and is idempotent across re-runs', async () => {
    const plaintext = 'already-v2-secret';
    const preexistingV2 = secretEncryptionService.encryptVersioned(plaintext, {
      workspaceId,
    });
    const id = await seedRow({ isSecret: true, value: preexistingV2 });

    await command.runDataMigration(dataSource);
    const [afterFirstRun] = await dataSource.query(
      `SELECT "value" FROM "core"."applicationVariable" WHERE id = $1`,
      [id],
    );

    expect(afterFirstRun.value).toBe(preexistingV2);

    await command.runDataMigration(dataSource);
    const [afterSecondRun] = await dataSource.query(
      `SELECT "value" FROM "core"."applicationVariable" WHERE id = $1`,
      [id],
    );

    expect(afterSecondRun.value).toBe(preexistingV2);
  });

  it('up() applies the CHECK constraint that rejects plaintext secret inserts', async () => {
    await dropCheckConstraint(dataSource);

    const queryRunner = dataSource.createQueryRunner();

    try {
      await command.up(queryRunner);

      const id = crypto.randomUUID();

      seededRowIds.push(id);

      await expect(
        dataSource.query(
          `INSERT INTO "core"."applicationVariable"
             (id, "universalIdentifier", "applicationId", "workspaceId",
              "key", "value", "isSecret")
           VALUES ($1, $2, $3, $4, $5, 'plaintext-should-be-rejected', true)`,
          [
            id,
            crypto.randomUUID(),
            applicationId,
            workspaceId,
            `${TEST_ROW_KEY_PREFIX}${id}`,
          ],
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

      const id = await seedRow({
        isSecret: true,
        value: 'plaintext-allowed-after-down',
      });

      const [row] = await dataSource.query(
        `SELECT "value" FROM "core"."applicationVariable" WHERE id = $1`,
        [id],
      );

      expect(row.value).toBe('plaintext-allowed-after-down');
    } finally {
      await queryRunner.release();
    }
  });
});
