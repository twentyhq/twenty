import crypto from 'crypto';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { KeyValuePairType } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

import { EncryptSensitiveConfigStorageSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000008000-encrypt-sensitive-config-storage';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const SENSITIVE_STRING_KEY = 'EMAIL_SMTP_USER';

describe('2-5 slow instance command 1798000008000 - EncryptSensitiveConfigStorageSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let secretEncryptionService: SecretEncryptionService;
  let command: EncryptSensitiveConfigStorageSlowInstanceCommand;
  const seededRowIds: string[] = [];

  const clearSeededKey = (): Promise<unknown> =>
    dataSource.query(
      `DELETE FROM "core"."keyValuePair"
              WHERE type = $1 AND key = $2
                AND "userId" IS NULL AND "workspaceId" IS NULL`,
      [KeyValuePairType.CONFIG_VARIABLE, SENSITIVE_STRING_KEY],
    );

  const seedRow = async (value: string): Promise<string> => {
    const id = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."keyValuePair"
         (id, "userId", "workspaceId", key, value, type)
       VALUES ($1, NULL, NULL, $2, to_jsonb($3::text), $4)`,
      [id, SENSITIVE_STRING_KEY, value, KeyValuePairType.CONFIG_VARIABLE],
    );

    seededRowIds.push(id);

    return id;
  };

  const readValue = async (id: string): Promise<string> => {
    const [row] = await dataSource.query(
      `SELECT value FROM "core"."keyValuePair" WHERE id = $1`,
      [id],
    );

    return row.value as string;
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
    command = new EncryptSensitiveConfigStorageSlowInstanceCommand(
      secretEncryptionService,
    );

    await clearSeededKey();
  }, 30000);

  afterEach(async () => {
    if (seededRowIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."keyValuePair" WHERE id = ANY($1::uuid[])`,
        [seededRowIds],
      );
      seededRowIds.length = 0;
    }
  });

  afterAll(async () => {
    await clearSeededKey();
    await dataSource?.destroy();
  });

  it('upgrades a legacy CTR sensitive STRING config row to enc:v2 with instance-scoped HKDF', async () => {
    const plaintext = 'smtp-legacy-username';
    const id = await seedRow(secretEncryptionService.encrypt(plaintext));

    await command.runDataMigration(dataSource);

    const value = await readValue(id);

    expect(value.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)).toBe(true);
    expect(secretEncryptionService.decryptVersioned(value)).toBe(plaintext);
  });

  it('leaves enc:v2 rows untouched and is idempotent across re-runs', async () => {
    const plaintext = 'smtp-already-v2-username';
    const preexistingV2 = secretEncryptionService.encryptVersioned(plaintext);
    const id = await seedRow(preexistingV2);

    await command.runDataMigration(dataSource);
    expect(await readValue(id)).toBe(preexistingV2);

    await command.runDataMigration(dataSource);
    expect(await readValue(id)).toBe(preexistingV2);
  });

  it('leaves empty sensitive config rows untouched', async () => {
    const id = await seedRow('');

    await command.runDataMigration(dataSource);

    expect(await readValue(id)).toBe('');
  });
});
