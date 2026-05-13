import { isNonEmptyString } from '@sniptt/guards';
import { config } from 'dotenv';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

import { EncryptConnectedAccountTokensSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-5/2-5-instance-command-slow-1798000004000-encrypt-connected-account-tokens';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const TEST_ROW_HANDLE_PREFIX = 'encrypt-slow-cmd-test-';

const buildSecretEncryptionService = (): SecretEncryptionService => {
  const appSecret = process.env.APP_SECRET;

  if (!isNonEmptyString(appSecret)) {
    throw new Error(
      'APP_SECRET must be set in the integration test environment to run this suite.',
    );
  }

  const driver = {
    get: (key: string) => (key === 'APP_SECRET' ? appSecret : undefined),
  } as unknown as EnvironmentConfigDriver;

  return new SecretEncryptionService(driver);
};

const seedRow = async ({
  dataSource,
  workspaceId,
  userWorkspaceId,
  handle,
  accessToken,
  refreshToken,
}: {
  dataSource: DataSource;
  workspaceId: string;
  userWorkspaceId: string;
  handle: string;
  accessToken: string | null;
  refreshToken: string | null;
}): Promise<string> => {
  // Insert directly with raw SQL to bypass the CHECK constraint while we
  // seed the plaintext rows that the slow command is meant to upgrade.
  await dataSource.query(
    `ALTER TABLE "core"."connectedAccount"
       DROP CONSTRAINT IF EXISTS "CHK_connectedAccount_accessToken_encrypted"`,
  );
  await dataSource.query(
    `ALTER TABLE "core"."connectedAccount"
       DROP CONSTRAINT IF EXISTS "CHK_connectedAccount_refreshToken_encrypted"`,
  );

  const result = await dataSource.query(
    `INSERT INTO "core"."connectedAccount"
       ("handle", "provider", "accessToken", "refreshToken",
        "userWorkspaceId", "workspaceId")
     VALUES ($1, 'google', $2, $3, $4, $5)
     RETURNING id`,
    [handle, accessToken, refreshToken, userWorkspaceId, workspaceId],
  );

  return result[0].id as string;
};

const dropEncryptionCheckConstraints = async (
  dataSource: DataSource,
): Promise<void> => {
  await dataSource.query(
    `ALTER TABLE "core"."connectedAccount"
       DROP CONSTRAINT IF EXISTS "CHK_connectedAccount_accessToken_encrypted"`,
  );
  await dataSource.query(
    `ALTER TABLE "core"."connectedAccount"
       DROP CONSTRAINT IF EXISTS "CHK_connectedAccount_refreshToken_encrypted"`,
  );
};

const restoreEncryptionCheckConstraints = async (
  dataSource: DataSource,
): Promise<void> => {
  await dropEncryptionCheckConstraints(dataSource);
  await dataSource.query(
    `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "CHK_connectedAccount_accessToken_encrypted"
       CHECK ("accessToken" IS NULL OR "accessToken" LIKE '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%')`,
  );
  await dataSource.query(
    `ALTER TABLE "core"."connectedAccount"
       ADD CONSTRAINT "CHK_connectedAccount_refreshToken_encrypted"
       CHECK ("refreshToken" IS NULL OR "refreshToken" LIKE '${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}%')`,
  );
};

describe('EncryptConnectedAccountTokensSlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let secretEncryptionService: SecretEncryptionService;
  let connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService;
  let command: EncryptConnectedAccountTokensSlowInstanceCommand;
  let workspaceId: string;
  let userWorkspaceId: string;
  const seededRowIds: string[] = [];

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [],
      synchronize: false,
    });
    await dataSource.initialize();

    secretEncryptionService = buildSecretEncryptionService();
    connectedAccountTokenEncryptionService =
      new ConnectedAccountTokenEncryptionService(secretEncryptionService);
    command = new EncryptConnectedAccountTokensSlowInstanceCommand(
      connectedAccountTokenEncryptionService,
    );

    const seedWorkspaceRow = await dataSource.query(
      `SELECT uw.id AS "userWorkspaceId", uw."workspaceId" AS "workspaceId"
         FROM "core"."userWorkspace" uw
         LIMIT 1`,
    );

    if (!isDefined(seedWorkspaceRow[0])) {
      throw new Error(
        'No seeded userWorkspace row found; run database:reset before the integration suite.',
      );
    }

    userWorkspaceId = seedWorkspaceRow[0].userWorkspaceId as string;
    workspaceId = seedWorkspaceRow[0].workspaceId as string;
  }, 30000);

  afterEach(async () => {
    if (seededRowIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."connectedAccount" WHERE id = ANY($1::uuid[])`,
        [seededRowIds],
      );
      seededRowIds.length = 0;
    }
    // Always leave the schema with the production-shape constraints so
    // subsequent integration suites see the expected state.
    await restoreEncryptionCheckConstraints(dataSource);
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('upgrades plaintext rows to enc:v2 with workspaceId-bound HKDF', async () => {
    const handle = `${TEST_ROW_HANDLE_PREFIX}plaintext`;
    const accessTokenPlaintext = 'plaintext-access-token';
    const refreshTokenPlaintext = 'plaintext-refresh-token';

    const id = await seedRow({
      dataSource,
      workspaceId,
      userWorkspaceId,
      handle,
      accessToken: accessTokenPlaintext,
      refreshToken: refreshTokenPlaintext,
    });

    seededRowIds.push(id);

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "accessToken", "refreshToken"
         FROM "core"."connectedAccount" WHERE id = $1`,
      [id],
    );

    expect(
      row.accessToken.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX),
    ).toBe(true);
    expect(
      row.refreshToken.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX),
    ).toBe(true);
    expect(
      connectedAccountTokenEncryptionService.decrypt({
        ciphertext: row.accessToken,
        workspaceId,
      }),
    ).toBe(accessTokenPlaintext);
    expect(
      connectedAccountTokenEncryptionService.decrypt({
        ciphertext: row.refreshToken,
        workspaceId,
      }),
    ).toBe(refreshTokenPlaintext);
  });

  it('leaves enc:v2 rows untouched and is idempotent across re-runs', async () => {
    const handle = `${TEST_ROW_HANDLE_PREFIX}v2`;
    const plaintext = 'v2-token';
    const preexistingV2Ciphertext = secretEncryptionService.encryptVersioned(
      plaintext,
      { workspaceId },
    );

    const id = await seedRow({
      dataSource,
      workspaceId,
      userWorkspaceId,
      handle,
      accessToken: preexistingV2Ciphertext,
      refreshToken: null,
    });

    seededRowIds.push(id);

    await command.runDataMigration(dataSource);
    const [afterFirstRun] = await dataSource.query(
      `SELECT "accessToken" FROM "core"."connectedAccount" WHERE id = $1`,
      [id],
    );

    expect(afterFirstRun.accessToken).toBe(preexistingV2Ciphertext);

    await command.runDataMigration(dataSource);
    const [afterSecondRun] = await dataSource.query(
      `SELECT "accessToken" FROM "core"."connectedAccount" WHERE id = $1`,
      [id],
    );

    expect(afterSecondRun.accessToken).toBe(preexistingV2Ciphertext);
  });

  it('handles a row that mixes a v2 column and a plaintext column (per-cell guard)', async () => {
    const handle = `${TEST_ROW_HANDLE_PREFIX}mixed`;
    const accessPlaintext = 'mixed-access';
    const refreshPlaintext = 'mixed-refresh';
    const preexistingV2Access = secretEncryptionService.encryptVersioned(
      accessPlaintext,
      { workspaceId },
    );

    const id = await seedRow({
      dataSource,
      workspaceId,
      userWorkspaceId,
      handle,
      accessToken: preexistingV2Access,
      refreshToken: refreshPlaintext,
    });

    seededRowIds.push(id);

    await command.runDataMigration(dataSource);

    const [row] = await dataSource.query(
      `SELECT "accessToken", "refreshToken"
         FROM "core"."connectedAccount" WHERE id = $1`,
      [id],
    );

    expect(row.accessToken).toBe(preexistingV2Access);
    expect(
      row.refreshToken.startsWith(SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX),
    ).toBe(true);
    expect(
      connectedAccountTokenEncryptionService.decrypt({
        ciphertext: row.refreshToken,
        workspaceId,
      }),
    ).toBe(refreshPlaintext);
  });

  it('rejects a plaintext insert once the CHECK constraint is in place', async () => {
    await dropEncryptionCheckConstraints(dataSource);

    const queryRunner = dataSource.createQueryRunner();

    try {
      await command.up(queryRunner);

      await expect(
        dataSource.query(
          `INSERT INTO "core"."connectedAccount"
             ("handle", "provider", "accessToken", "refreshToken",
              "userWorkspaceId", "workspaceId")
           VALUES ($1, 'google', $2, NULL, $3, $4)`,
          [
            `${TEST_ROW_HANDLE_PREFIX}rejected`,
            'plaintext-should-be-rejected',
            userWorkspaceId,
            workspaceId,
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

      const handle = `${TEST_ROW_HANDLE_PREFIX}down`;
      const id = await seedRow({
        dataSource,
        workspaceId,
        userWorkspaceId,
        handle,
        accessToken: 'plaintext-allowed-after-down',
        refreshToken: null,
      });

      seededRowIds.push(id);

      const [row] = await dataSource.query(
        `SELECT "accessToken" FROM "core"."connectedAccount" WHERE id = $1`,
        [id],
      );

      expect(row.accessToken).toBe('plaintext-allowed-after-down');
    } finally {
      await queryRunner.release();
    }
  });
});
