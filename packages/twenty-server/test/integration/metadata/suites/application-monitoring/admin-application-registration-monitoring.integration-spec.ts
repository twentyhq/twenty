import crypto from 'crypto';
import process from 'process';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient,
} from '@clickhouse/client';
import { deleteApplicationRegistration } from 'test/integration/metadata/suites/application-registration/utils/delete-application-registration.util';
import { insertApplicationRegistrationWithVariable } from 'test/integration/metadata/suites/application-registration/utils/insert-application-registration-with-variable.util';
import { findAdminApplicationRegistrationMonitoring } from 'test/integration/metadata/suites/application-monitoring/utils/find-admin-application-registration-monitoring.util';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const buildRunEvent = ({
  applicationRegistrationId,
  workspaceId,
  minutesAgo,
  level,
}: {
  applicationRegistrationId: string;
  workspaceId: string;
  minutesAgo: number;
  level: 'INFO' | 'ERROR';
}) => ({
  timestamp: formatDateTimeForClickHouse(
    new Date(Date.now() - minutesAgo * 60_000),
  ),
  applicationRegistrationId,
  workspaceId,
  applicationId: crypto.randomUUID(),
  applicationVersion: '1.2.3',
  source: 'LOGIC_FUNCTION',
  logicFunctionId: crypto.randomUUID(),
  logicFunctionName: 'syncContacts',
  level,
  errorCode: level === 'ERROR' ? 'TypeError' : '',
  durationMs: 120,
});

describe('Admin application registration monitoring (integration)', () => {
  let clickHouseClient: ClickHouseClient;
  let applicationRegistrationId: string;

  beforeAll(async () => {
    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
      log: { level: ClickHouseLogLevel.OFF },
    });

    ({ applicationRegistrationId } =
      await insertApplicationRegistrationWithVariable({
        name: 'Admin Monitored Registration',
      }));

    await clickHouseClient.insert({
      table: 'applicationMetricEvent',
      format: 'JSONEachRow',
      values: [
        buildRunEvent({
          applicationRegistrationId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          minutesAgo: 5,
          level: 'INFO',
        }),
        buildRunEvent({
          applicationRegistrationId,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
          minutesAgo: 10,
          level: 'ERROR',
        }),
        buildRunEvent({
          applicationRegistrationId,
          workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
          minutesAgo: 15,
          level: 'ERROR',
        }),
        {
          ...buildRunEvent({
            applicationRegistrationId,
            workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
            minutesAgo: 1,
            level: 'ERROR',
          }),
          applicationVersion: '2.0.0',
          source: 'UPGRADE',
          logicFunctionId: '',
          logicFunctionName: '',
          errorCode: 'UPGRADE_FAILED',
        },
      ],
    });
  });

  afterAll(async () => {
    await clickHouseClient.command({
      query:
        'ALTER TABLE applicationMetricEvent DELETE WHERE applicationRegistrationId = {applicationRegistrationId:String}',
      query_params: { applicationRegistrationId },
    });
    await clickHouseClient.close();

    await deleteApplicationRegistration({
      input: { id: applicationRegistrationId },
      expectToFail: false,
    });
  });

  it('breaks the app down by named workspace, most failing first', async () => {
    const { data, errors } = await findAdminApplicationRegistrationMonitoring({
      id: applicationRegistrationId,
    });

    expect(errors).toBeUndefined();

    const monitoring = data.findAdminApplicationRegistrationMonitoring;

    expect(monitoring.runCount).toBe(3);
    expect(monitoring.activeWorkspaceCount).toBe(2);
    expect(monitoring.workspaces).toEqual([
      expect.objectContaining({
        workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
        workspaceName: expect.any(String),
        applicationVersion: '1.2.3',
        runCount: 2,
        failedRunCount: 2,
      }),
      expect.objectContaining({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        workspaceName: expect.any(String),
        runCount: 1,
        failedRunCount: 0,
      }),
    ]);
  });

  it('narrows every aggregate to one workspace', async () => {
    const { data } = await findAdminApplicationRegistrationMonitoring({
      id: applicationRegistrationId,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    const monitoring = data.findAdminApplicationRegistrationMonitoring;

    expect(monitoring.runCount).toBe(1);
    expect(monitoring.failedRunCount).toBe(0);
    expect(monitoring.activeWorkspaceCount).toBe(1);
  });

  it('refuses users who are not server admins', async () => {
    const { errors } = await findAdminApplicationRegistrationMonitoring({
      id: applicationRegistrationId,
      expectToFail: true,
      asNonServerAdmin: true,
    });

    expect(errors).toBeDefined();
  });
});
