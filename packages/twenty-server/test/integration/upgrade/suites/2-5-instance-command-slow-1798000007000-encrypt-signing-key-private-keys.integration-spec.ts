import crypto from 'crypto';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

import { EncryptSigningKeyPrivateKeysSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000007000-encrypt-signing-key-private-keys';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const PUBLIC_KEY_FIXTURE =
  '-----BEGIN PUBLIC KEY-----\nintegration-test-public\n-----END PUBLIC KEY-----';
const CHECK_CONSTRAINT_NAME = 'CHK_signingKey_privateKey_encrypted';
const CHECK_CONSTRAINT_EXPR = `"privateKey" IS NULL OR "privateKey" LIKE '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%'`;

const dropCheckConstraint = (dataSource: DataSource): Promise<unknown> =>
  dataSource.query(
    `ALTER TABLE "core"."signingKey"
     DROP CONSTRAINT IF EXISTS "${CHECK_CONSTRAINT_NAME}"`,
  );

const restoreCheckConstraint = async (
  dataSource: DataSource,
): Promise<void> => {
  await dropCheckConstraint(dataSource);
  await dataSource.query(
    `ALTER TABLE "core"."signingKey"
     ADD CONSTRAINT "${CHECK_CONSTRAINT_NAME}"
     CHECK (${CHECK_CONSTRAINT_EXPR})`,
  );
};

describe('2-5 slow instance command 1798000007000 - EncryptSigningKeyPrivateKeysSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let secretEncryptionService: SecretEncryptionService;
  let command: EncryptSigningKeyPrivateKeysSlowInstanceCommand;
  const seededRowIds: string[] = [];

  const seedRow = async ({
    privateKey,
  }: {
    privateKey: string | null;
  }): Promise<string> => {
    await dropCheckConstraint(dataSource);

    const id = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."signingKey"
         (id, "publicKey", "privateKey", "isCurrent")
       VALUES ($1, $2, $3, false)`,
      [id, PUBLIC_KEY_FIXTURE, privateKey],
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
    command = new EncryptSigningKeyPrivateKeysSlowInstanceCommand(
      secretEncryptionService,
    );
  }, 30000);

  afterEach(async () => {
    if (seededRowIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."signingKey" WHERE id = ANY($1::uuid[])`,
        [seededRowIds],
      );
      seededRowIds.length = 0;
    }
    await restoreCheckConstraint(dataSource);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('upgrades a legacy CTR-encrypted private key to enc:v2 with instance-scoped HKDF', async () => {
    const plaintextPem =
      '-----BEGIN PRIVATE KEY-----\nlegacy-pem-material\n-----END PRIVATE KEY-----';
    const id = await seedRow({
      privateKey: secretEncryptionService.encrypt(plaintextPem),
    });

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "privateKey" FROM "core"."signingKey" WHERE id = $1`,
      [id],
    );

    expect(
      row.privateKey.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX),
    ).toBe(true);
    expect(secretEncryptionService.decryptVersioned(row.privateKey)).toBe(
      plaintextPem,
    );
  });

  it('leaves NULL private keys untouched (revoked / rotated keys)', async () => {
    const id = await seedRow({ privateKey: null });

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "privateKey" FROM "core"."signingKey" WHERE id = $1`,
      [id],
    );

    expect(row.privateKey).toBeNull();
  });

  it('leaves enc:v2 rows untouched and is idempotent across re-runs', async () => {
    const plaintext =
      '-----BEGIN PRIVATE KEY-----\nalready-v2\n-----END PRIVATE KEY-----';
    const preexistingV2 = secretEncryptionService.encryptVersioned(plaintext);
    const id = await seedRow({ privateKey: preexistingV2 });

    await command.runDataMigration(dataSource);
    const [afterFirstRun] = await dataSource.query(
      `SELECT "privateKey" FROM "core"."signingKey" WHERE id = $1`,
      [id],
    );

    expect(afterFirstRun.privateKey).toBe(preexistingV2);

    await command.runDataMigration(dataSource);
    const [afterSecondRun] = await dataSource.query(
      `SELECT "privateKey" FROM "core"."signingKey" WHERE id = $1`,
      [id],
    );

    expect(afterSecondRun.privateKey).toBe(preexistingV2);
  });

  it('up() applies the CHECK constraint that rejects plaintext inserts', async () => {
    await dropCheckConstraint(dataSource);

    const queryRunner = dataSource.createQueryRunner();

    try {
      await command.up(queryRunner);

      const id = crypto.randomUUID();

      seededRowIds.push(id);

      await expect(
        dataSource.query(
          `INSERT INTO "core"."signingKey"
             (id, "publicKey", "privateKey", "isCurrent")
           VALUES ($1, $2, 'plaintext-should-be-rejected', false)`,
          [id, PUBLIC_KEY_FIXTURE],
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

      const id = await seedRow({ privateKey: 'plaintext-allowed-after-down' });

      const [row] = await dataSource.query(
        `SELECT "privateKey" FROM "core"."signingKey" WHERE id = $1`,
        [id],
      );

      expect(row.privateKey).toBe('plaintext-allowed-after-down');
    } finally {
      await queryRunner.release();
    }
  });
});
