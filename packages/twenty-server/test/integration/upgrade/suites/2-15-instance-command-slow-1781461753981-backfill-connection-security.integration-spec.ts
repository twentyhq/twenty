import { config } from 'dotenv';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { BackfillConnectionSecuritySlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-15/2-15-instance-command-slow-1781461753981-backfill-connection-security';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const TEST_ROW_HANDLE_PREFIX = 'backfill-connection-security-test-';

describe('BackfillConnectionSecuritySlowInstanceCommand (integration)', () => {
  let dataSource: DataSource;
  let command: BackfillConnectionSecuritySlowInstanceCommand;
  let workspaceId: string;
  let userWorkspaceId: string;
  const seededRowIds: string[] = [];

  const seedAccount = async (
    connectionParameters: Record<string, unknown>,
  ): Promise<string> => {
    const [row] = await dataSource.query(
      `INSERT INTO "core"."connectedAccount"
         ("handle", "provider", "userWorkspaceId", "workspaceId", "visibility", "connectionParameters")
       VALUES ($1, 'imap_smtp_caldav', $2, $3, 'user', $4)
       RETURNING id`,
      [
        `${TEST_ROW_HANDLE_PREFIX}${seededRowIds.length}`,
        userWorkspaceId,
        workspaceId,
        JSON.stringify(connectionParameters),
      ],
    );

    seededRowIds.push(row.id as string);

    return row.id as string;
  };

  const getConnectionParameters = async (
    id: string,
  ): Promise<Record<string, Record<string, unknown>>> => {
    const [row] = await dataSource.query(
      `SELECT "connectionParameters" FROM "core"."connectedAccount" WHERE id = $1`,
      [id],
    );

    return row.connectionParameters;
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

    command = new BackfillConnectionSecuritySlowInstanceCommand();

    const [seedWorkspaceRow] = await dataSource.query(
      `SELECT uw.id AS "userWorkspaceId", uw."workspaceId" AS "workspaceId"
         FROM "core"."userWorkspace" uw
         LIMIT 1`,
    );

    if (!isDefined(seedWorkspaceRow)) {
      throw new Error(
        'No seeded userWorkspace row found; run database:reset before the integration suite.',
      );
    }

    userWorkspaceId = seedWorkspaceRow.userWorkspaceId;
    workspaceId = seedWorkspaceRow.workspaceId;
  }, 30000);

  afterEach(async () => {
    if (seededRowIds.length > 0) {
      await dataSource.query(
        `DELETE FROM "core"."connectedAccount" WHERE id = ANY($1::uuid[])`,
        [seededRowIds],
      );
      seededRowIds.length = 0;
    }
  });

  afterAll(async () => {
    await dataSource?.destroy();
  });

  it('maps every legacy protocol to the mode matching its prior on-wire behavior and drops the secure key', async () => {
    const id = await seedAccount({
      IMAP: {
        host: 'imap.example.com',
        port: 993,
        secure: true,
        password: 'enc:v2:x',
      },
      SMTP: {
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        password: 'enc:v2:x',
      },
      CALDAV: {
        host: 'https://dav.example.com',
        port: 443,
        secure: true,
        password: 'enc:v2:x',
      },
    });

    await command.runDataMigration(dataSource);

    const params = await getConnectionParameters(id);

    expect(params.IMAP.connectionSecurity).toBe('SSL_TLS');
    expect(params.SMTP.connectionSecurity).toBe('STARTTLS');
    expect(params.CALDAV.connectionSecurity).toBe('SSL_TLS');
    expect(params.IMAP.secure).toBeUndefined();
    expect(params.SMTP.secure).toBeUndefined();
    expect(params.CALDAV.secure).toBeUndefined();
  });

  it('maps implicit-TLS SMTP (port 465) and opportunistic IMAP (secure:false) correctly', async () => {
    const implicitSmtpId = await seedAccount({
      SMTP: {
        host: 'smtp.example.com',
        port: 465,
        secure: true,
        password: 'enc:v2:x',
      },
    });
    const plaintextImapId = await seedAccount({
      IMAP: {
        host: 'imap.example.com',
        port: 143,
        secure: false,
        password: 'enc:v2:x',
      },
    });

    await command.runDataMigration(dataSource);

    expect(
      (await getConnectionParameters(implicitSmtpId)).SMTP.connectionSecurity,
    ).toBe('SSL_TLS');
    expect(
      (await getConnectionParameters(plaintextImapId)).IMAP.connectionSecurity,
    ).toBe('STARTTLS');
  });

  it('is idempotent and leaves already-migrated accounts untouched', async () => {
    const legacyId = await seedAccount({
      SMTP: {
        host: 'smtp.example.com',
        port: 587,
        secure: true,
        password: 'enc:v2:x',
      },
    });
    const alreadyMigratedId = await seedAccount({
      SMTP: {
        host: 'smtp.example.com',
        port: 465,
        connectionSecurity: 'STARTTLS',
        password: 'enc:v2:x',
      },
    });

    await command.runDataMigration(dataSource);
    await command.runDataMigration(dataSource);

    expect(
      (await getConnectionParameters(legacyId)).SMTP.connectionSecurity,
    ).toBe('STARTTLS');
    // A pre-set connectionSecurity is never overwritten, even when it disagrees with the port.
    expect(
      (await getConnectionParameters(alreadyMigratedId)).SMTP
        .connectionSecurity,
    ).toBe('STARTTLS');
  });
});
