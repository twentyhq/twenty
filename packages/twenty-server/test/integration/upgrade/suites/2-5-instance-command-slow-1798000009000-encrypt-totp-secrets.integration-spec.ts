import { createCipheriv, createHash, randomBytes, randomUUID } from 'crypto';

import { config } from 'dotenv';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { SimpleSecretEncryptionUtil } from 'src/engine/core-modules/two-factor-authentication/utils/simple-secret-encryption.util';

import { EncryptTotpSecretsSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000009000-encrypt-totp-secrets';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const CHECK_CONSTRAINT_NAME =
  'CHK_twoFactorAuthenticationMethod_secret_encrypted';
const CHECK_CONSTRAINT_EXPR = `"secret" LIKE '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%'`;

const buildLegacyAesCbcCiphertext = ({
  plaintext,
  appSecret,
  purpose,
}: {
  plaintext: string;
  appSecret: string;
  purpose: string;
}): string => {
  const appSecretHex = createHash('sha256')
    .update(`${appSecret}${purpose}KEY_ENCRYPTION_KEY`)
    .digest('hex');
  const key = createHash('sha256')
    .update(appSecretHex)
    .digest()
    .subarray(0, 32);
  const iv = randomBytes(16);
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const dropCheckConstraint = (dataSource: DataSource): Promise<unknown> =>
  dataSource.query(
    `ALTER TABLE "core"."twoFactorAuthenticationMethod"
     DROP CONSTRAINT IF EXISTS "${CHECK_CONSTRAINT_NAME}"`,
  );

const restoreCheckConstraint = async (
  dataSource: DataSource,
): Promise<void> => {
  await dropCheckConstraint(dataSource);
  await dataSource.query(
    `ALTER TABLE "core"."twoFactorAuthenticationMethod"
     ADD CONSTRAINT "${CHECK_CONSTRAINT_NAME}"
     CHECK (${CHECK_CONSTRAINT_EXPR})`,
  );
};

// Stand-in for the real JwtWrapperService used by SimpleSecretEncryptionUtil.
// Reproduces JwtWrapperService.generateAppSecret byte-for-byte so the legacy
// CBC key derivation matches what production rows were sealed with.
const buildJwtWrapperServiceStub = (appSecret: string): JwtWrapperService => {
  return {
    generateAppSecret: (type: JwtTokenTypeEnum, appSecretBody: string): string =>
      createHash('sha256')
        .update(`${appSecret}${appSecretBody}${type}`)
        .digest('hex'),
  } as unknown as JwtWrapperService;
};

describe('2-5 slow instance command 1798000009000 - EncryptTotpSecretsSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let secretEncryptionService: SecretEncryptionService;
  let simpleSecretEncryptionUtil: SimpleSecretEncryptionUtil;
  let command: EncryptTotpSecretsSlowInstanceCommand;
  let appSecret: string;
  let userId: string;
  let workspaceId: string;
  let userWorkspaceId: string;
  const seededRowIds: string[] = [];

  const seedRow = async ({ secret }: { secret: string }): Promise<string> => {
    await dropCheckConstraint(dataSource);

    const id = randomUUID();

    await dataSource.query(
      `INSERT INTO "core"."twoFactorAuthenticationMethod"
         (id, "workspaceId", "userWorkspaceId", "secret", "status", "strategy")
       VALUES ($1, $2, $3, $4, 'VERIFIED', 'TOTP')`,
      [id, workspaceId, userWorkspaceId, secret],
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

    if (!isDefined(process.env.APP_SECRET) || process.env.APP_SECRET === '') {
      throw new Error(
        'APP_SECRET must be set in the integration test environment to build legacy CBC fixtures.',
      );
    }

    appSecret = process.env.APP_SECRET;
    secretEncryptionService = buildSecretEncryptionServiceFromEnv();
    simpleSecretEncryptionUtil = new SimpleSecretEncryptionUtil(
      buildJwtWrapperServiceStub(appSecret),
    );
    command = new EncryptTotpSecretsSlowInstanceCommand(
      secretEncryptionService,
      simpleSecretEncryptionUtil,
    );

    const [seedUserWorkspace] = await dataSource.query(
      `SELECT id, "userId", "workspaceId"
         FROM "core"."userWorkspace"
        LIMIT 1`,
    );

    if (!isDefined(seedUserWorkspace)) {
      throw new Error(
        'No seeded userWorkspace row found; run database:reset before the integration suite.',
      );
    }

    userWorkspaceId = seedUserWorkspace.id as string;
    userId = seedUserWorkspace.userId as string;
    workspaceId = seedUserWorkspace.workspaceId as string;
  }, 30000);

  afterEach(async () => {
    if (seededRowIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."twoFactorAuthenticationMethod" WHERE id = ANY($1::uuid[])`,
        [seededRowIds],
      );
      seededRowIds.length = 0;
    }
    await restoreCheckConstraint(dataSource);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('upgrades legacy AES-CBC TOTP secrets to enc:v2 with workspaceId-bound HKDF', async () => {
    const plaintext = 'KVKFKRCPNZQUYMLXOVYDSKLMNBVCXZ';
    const legacyCiphertext = buildLegacyAesCbcCiphertext({
      plaintext,
      appSecret,
      purpose: `${userId}${workspaceId}otp-secret`,
    });
    const id = await seedRow({ secret: legacyCiphertext });

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "secret" FROM "core"."twoFactorAuthenticationMethod" WHERE id = $1`,
      [id],
    );

    expect(row.secret.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX)).toBe(
      true,
    );
    expect(
      secretEncryptionService.decryptVersioned(row.secret, { workspaceId }),
    ).toBe(plaintext);
  });

  it('leaves enc:v2 rows untouched and is idempotent across re-runs', async () => {
    const plaintext = 'already-v2-totp-secret';
    const preexistingV2 = secretEncryptionService.encryptVersioned(plaintext, {
      workspaceId,
    });
    const id = await seedRow({ secret: preexistingV2 });

    await command.runDataMigration(dataSource);
    const [afterFirstRun] = await dataSource.query(
      `SELECT "secret" FROM "core"."twoFactorAuthenticationMethod" WHERE id = $1`,
      [id],
    );

    expect(afterFirstRun.secret).toBe(preexistingV2);

    await command.runDataMigration(dataSource);
    const [afterSecondRun] = await dataSource.query(
      `SELECT "secret" FROM "core"."twoFactorAuthenticationMethod" WHERE id = $1`,
      [id],
    );

    expect(afterSecondRun.secret).toBe(preexistingV2);
  });

  it('up() applies the CHECK constraint that rejects plaintext secret inserts', async () => {
    await dropCheckConstraint(dataSource);

    const queryRunner = dataSource.createQueryRunner();

    try {
      await command.up(queryRunner);

      const id = randomUUID();

      seededRowIds.push(id);

      await expect(
        dataSource.query(
          `INSERT INTO "core"."twoFactorAuthenticationMethod"
             (id, "workspaceId", "userWorkspaceId", "secret", "status", "strategy")
           VALUES ($1, $2, $3, 'plaintext-should-be-rejected', 'VERIFIED', 'TOTP')`,
          [id, workspaceId, userWorkspaceId],
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

      const id = await seedRow({ secret: 'plaintext-allowed-after-down' });

      const [row] = await dataSource.query(
        `SELECT "secret" FROM "core"."twoFactorAuthenticationMethod" WHERE id = $1`,
        [id],
      );

      expect(row.secret).toBe('plaintext-allowed-after-down');
    } finally {
      await queryRunner.release();
    }
  });
});
