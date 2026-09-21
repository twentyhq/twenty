import { type QueryRunner } from 'typeorm';

import { MakeUserEmailCaseInsensitiveFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-37/2-37-instance-command-fast-1787836741000-make-user-email-case-insensitive';

const PROBE_PREFIX = 'upgrade-probe';

const columnType = async (): Promise<string> => {
  const [row] = await global.testDataSource.query(
    `SELECT udt_name FROM information_schema.columns
     WHERE table_schema = 'core' AND table_name = 'user' AND column_name = 'email'`,
  );

  return row.udt_name;
};

const uniqueIndexDefinition = async (): Promise<string | undefined> => {
  const [row] = await global.testDataSource.query(
    `SELECT indexdef FROM pg_indexes
     WHERE schemaname = 'core' AND tablename = 'user' AND indexname = 'UQ_USER_EMAIL'`,
  );

  return row?.indexdef;
};

const forceVarcharBaseline = async (): Promise<void> => {
  await global.testDataSource.query(
    `DROP INDEX IF EXISTS core."UQ_USER_EMAIL"`,
  );
  await global.testDataSource.query(
    `ALTER TABLE core."user" ALTER COLUMN email TYPE character varying USING email::character varying`,
  );
  await global.testDataSource.query(
    `CREATE UNIQUE INDEX "UQ_USER_EMAIL" ON core."user" (email) WHERE "deletedAt" IS NULL`,
  );
};

const insertUser = async ({
  email,
  deletedAt = null,
}: {
  email: string;
  deletedAt?: string | null;
}): Promise<void> => {
  await global.testDataSource.query(
    `INSERT INTO core."user" ("firstName", "lastName", "email", "deletedAt")
     VALUES ('probe', 'user', $1, $2)`,
    [email, deletedAt],
  );
};

const deleteProbeUsers = async (): Promise<void> => {
  await global.testDataSource.query(
    `DELETE FROM core."user" WHERE email ILIKE $1`,
    [`${PROBE_PREFIX}%`],
  );
};

// Mirrors instance-command-runner.service.ts: up() runs inside a transaction
// that is rolled back if the command throws.
const runCommandLikeUpgradeRunner = async (
  direction: 'up' | 'down',
): Promise<{ threw: boolean; message?: string }> => {
  const command = new MakeUserEmailCaseInsensitiveFastInstanceCommand();
  const queryRunner: QueryRunner = global.testDataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await command[direction](queryRunner);
    await queryRunner.commitTransaction();

    return { threw: false };
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }

    return { threw: true, message: (error as Error).message };
  } finally {
    await queryRunner.release();
  }
};

describe('MakeUserEmailCaseInsensitive instance command (integration)', () => {
  beforeEach(async () => {
    await deleteProbeUsers();
    await forceVarcharBaseline();
  });

  afterAll(async () => {
    await deleteProbeUsers();
    await forceVarcharBaseline();
    await runCommandLikeUpgradeRunner('up');
  });

  it('converts the column and keeps the unique index on a clean database', async () => {
    expect(await columnType()).toBe('varchar');

    const result = await runCommandLikeUpgradeRunner('up');

    expect(result.threw).toBe(false);
    expect(await columnType()).toBe('citext');
    expect(await uniqueIndexDefinition()).toContain('UNIQUE INDEX');
    expect(await uniqueIndexDefinition()).toContain('"deletedAt" IS NULL');
  });

  it('skips without failing the upgrade when live addresses differ only by casing', async () => {
    await insertUser({ email: `${PROBE_PREFIX}-clash@example.com` });
    await insertUser({ email: `${PROBE_PREFIX}-CLASH@example.com` });

    const before = await uniqueIndexDefinition();
    const result = await runCommandLikeUpgradeRunner('up');

    expect(result.threw).toBe(false);
    expect(await columnType()).toBe('varchar');
    expect(await uniqueIndexDefinition()).toBe(before);
  });

  it('converts on a later run once the colliding addresses are gone', async () => {
    await insertUser({ email: `${PROBE_PREFIX}-retry@example.com` });
    await insertUser({ email: `${PROBE_PREFIX}-RETRY@example.com` });

    expect((await runCommandLikeUpgradeRunner('up')).threw).toBe(false);
    expect(await columnType()).toBe('varchar');

    await global.testDataSource.query(
      `DELETE FROM core."user" WHERE email = $1`,
      [`${PROBE_PREFIX}-RETRY@example.com`],
    );

    expect((await runCommandLikeUpgradeRunner('up')).threw).toBe(false);
    expect(await columnType()).toBe('citext');
  });

  it('ignores soft-deleted addresses that collide with a live one', async () => {
    await insertUser({ email: `${PROBE_PREFIX}-soft@example.com` });
    await insertUser({
      email: `${PROBE_PREFIX}-SOFT@example.com`,
      deletedAt: new Date().toISOString(),
    });

    const result = await runCommandLikeUpgradeRunner('up');

    expect(result.threw).toBe(false);
    expect(await columnType()).toBe('citext');
  });

  it('restores the original column type and index on down', async () => {
    await runCommandLikeUpgradeRunner('up');
    expect(await columnType()).toBe('citext');

    const result = await runCommandLikeUpgradeRunner('down');

    expect(result.threw).toBe(false);
    expect(await columnType()).toBe('varchar');
    expect(await uniqueIndexDefinition()).toContain('UNIQUE INDEX');
  });

  it('survives a full up down up cycle', async () => {
    expect((await runCommandLikeUpgradeRunner('up')).threw).toBe(false);
    expect((await runCommandLikeUpgradeRunner('down')).threw).toBe(false);
    expect((await runCommandLikeUpgradeRunner('up')).threw).toBe(false);

    expect(await columnType()).toBe('citext');
    expect(await uniqueIndexDefinition()).toContain('UNIQUE INDEX');
  });

  it('still converts and rebuilds the index when it is missing beforehand', async () => {
    await global.testDataSource.query(
      `DROP INDEX IF EXISTS core."UQ_USER_EMAIL"`,
    );

    const result = await runCommandLikeUpgradeRunner('up');

    expect(result.threw).toBe(false);
    expect(await columnType()).toBe('citext');
    expect(await uniqueIndexDefinition()).toContain('UNIQUE INDEX');
  });

  it('enforces uniqueness across casing once converted', async () => {
    await insertUser({ email: `${PROBE_PREFIX}-unique@example.com` });
    await runCommandLikeUpgradeRunner('up');

    await expect(
      insertUser({ email: `${PROBE_PREFIX}-UNIQUE@example.com` }),
    ).rejects.toThrow(/UQ_USER_EMAIL/);
  });

  it('still allows a soft-deleted row to share an address with a live one', async () => {
    await insertUser({ email: `${PROBE_PREFIX}-revive@example.com` });
    await runCommandLikeUpgradeRunner('up');

    await expect(
      insertUser({
        email: `${PROBE_PREFIX}-REVIVE@example.com`,
        deletedAt: new Date().toISOString(),
      }),
    ).resolves.toBeUndefined();
  });

  it('keeps admin panel ILIKE searches working after conversion', async () => {
    await insertUser({ email: `${PROBE_PREFIX}-search@example.com` });
    await runCommandLikeUpgradeRunner('up');

    const rows = await global.testDataSource.query(
      `SELECT email FROM core."user" WHERE email ILIKE $1`,
      [`${PROBE_PREFIX}-SEARCH%`],
    );

    expect(rows).toHaveLength(1);
  });
});
