import crypto from 'crypto';
import process from 'process';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient,
} from '@clickhouse/client';
import { findAdminApplicationRegistrationLogs } from 'test/integration/metadata/suites/application-monitoring/utils/find-admin-application-registration-logs.util';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLICATION_REGISTRATION_ID = crypto.randomUUID();

const buildLogRow = ({
  workspaceId,
  minutesAgo,
  level,
  message,
}: {
  workspaceId: string;
  minutesAgo: number;
  level: string;
  message: string;
}) => ({
  timestamp: formatDateTimeForClickHouse(
    new Date(Date.now() - minutesAgo * 60_000),
  ),
  workspaceId,
  applicationId: crypto.randomUUID(),
  applicationRegistrationId: APPLICATION_REGISTRATION_ID,
  applicationVersion: '1.2.3',
  source: 'LOGIC_FUNCTION',
  logicFunctionId: crypto.randomUUID(),
  logicFunctionName: 'syncContacts',
  executionId: crypto.randomUUID(),
  level,
  message,
  errorCode: level === 'ERROR' ? 'TypeError' : '',
});

describe('Admin application registration logs (integration)', () => {
  let clickHouseClient: ClickHouseClient;

  beforeAll(async () => {
    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: { allow_experimental_json_type: 1 },
      log: { level: ClickHouseLogLevel.OFF },
    });

    await clickHouseClient.insert({
      table: 'applicationLog',
      format: 'JSONEachRow',
      values: [
        buildLogRow({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          minutesAgo: 5,
          level: 'INFO',
          message: 'Synced 214 contacts.',
        }),
        buildLogRow({
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
          minutesAgo: 10,
          level: 'ERROR',
          message: 'TypeError: Connection authentication failed',
        }),
        buildLogRow({
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
          minutesAgo: 15,
          level: 'WARN',
          message: 'Provider response delayed.',
        }),
      ],
    });
  });

  afterAll(async () => {
    await clickHouseClient.command({
      query: `ALTER TABLE applicationLog DELETE WHERE applicationRegistrationId = '${APPLICATION_REGISTRATION_ID}'`,
    });
    await clickHouseClient.close();
  });

  it('lists log rows of every workspace with the workspace named', async () => {
    const { data, errors } = await findAdminApplicationRegistrationLogs({
      input: { applicationRegistrationId: APPLICATION_REGISTRATION_ID },
    });

    expect(errors).toBeUndefined();

    const result = data.findAdminApplicationRegistrationLogs;

    expect(result.totalCount).toBe(3);
    expect(result.pageInfo.hasNextPage).toBe(false);
    expect(result.records.map((record) => record.properties)).toEqual([
      expect.objectContaining({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceName: expect.any(String),
        level: 'INFO',
      }),
      expect.objectContaining({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        level: 'ERROR',
        errorCode: 'TypeError',
      }),
      expect.objectContaining({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        level: 'WARN',
      }),
    ]);
  });

  it('filters by level and search, and paginates', async () => {
    const { data } = await findAdminApplicationRegistrationLogs({
      input: {
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        levels: ['ERROR', 'WARN'],
        search: 'authentication',
      },
    });

    expect(data.findAdminApplicationRegistrationLogs.totalCount).toBe(1);

    const firstPage = await findAdminApplicationRegistrationLogs({
      input: {
        applicationRegistrationId: APPLICATION_REGISTRATION_ID,
        first: 2,
      },
    });

    expect(
      firstPage.data.findAdminApplicationRegistrationLogs.pageInfo,
    ).toEqual({ hasNextPage: true, endCursor: '2' });
  });

  it('refuses users who are not server admins', async () => {
    const { errors } = await findAdminApplicationRegistrationLogs({
      input: { applicationRegistrationId: APPLICATION_REGISTRATION_ID },
      expectToFail: true,
      asNonServerAdmin: true,
    });

    expect(errors).toBeDefined();
  });
});
