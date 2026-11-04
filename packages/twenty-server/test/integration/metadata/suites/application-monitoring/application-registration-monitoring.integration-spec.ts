import crypto from 'crypto';
import process from 'process';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient,
} from '@clickhouse/client';
import { deleteApplicationRegistration } from 'test/integration/metadata/suites/application-registration/utils/delete-application-registration.util';
import { insertApplicationRegistrationWithVariable } from 'test/integration/metadata/suites/application-registration/utils/insert-application-registration-with-variable.util';
import { findApplicationRegistrationMonitoring } from 'test/integration/metadata/suites/application-monitoring/utils/find-application-registration-monitoring.util';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OTHER_INSTALL_WORKSPACE_ID = crypto.randomUUID();

const buildMetricEvent = ({
  applicationRegistrationId,
  workspaceId,
  minutesAgo,
  source = 'LOGIC_FUNCTION',
  level = 'INFO',
  errorCode = '',
  applicationVersion = '1.2.3',
  logicFunctionName = 'syncContacts',
  occurrenceCount = 1,
}: {
  applicationRegistrationId: string;
  workspaceId: string;
  minutesAgo: number;
  source?: string;
  level?: string;
  errorCode?: string;
  applicationVersion?: string;
  logicFunctionName?: string;
  occurrenceCount?: number;
}) => ({
  timestamp: formatDateTimeForClickHouse(
    new Date(Date.now() - minutesAgo * 60_000),
  ),
  applicationRegistrationId,
  workspaceId,
  applicationId: crypto.randomUUID(),
  applicationVersion,
  source,
  logicFunctionId: crypto.randomUUID(),
  logicFunctionName,
  level,
  errorCode,
  durationMs: 120,
  occurrenceCount,
});

describe('Application registration monitoring (integration)', () => {
  let clickHouseClient: ClickHouseClient;
  let ownedApplicationRegistrationId: string;

  beforeAll(async () => {
    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
      log: { level: ClickHouseLogLevel.OFF },
    });

    ({ applicationRegistrationId: ownedApplicationRegistrationId } =
      await insertApplicationRegistrationWithVariable({
        name: 'Monitored Registration',
      }));

    await clickHouseClient.insert({
      table: 'applicationMetricEvent',
      format: 'JSONEachRow',
      values: [
        buildMetricEvent({
          applicationRegistrationId: ownedApplicationRegistrationId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          minutesAgo: 5,
        }),
        buildMetricEvent({
          applicationRegistrationId: ownedApplicationRegistrationId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          minutesAgo: 10,
          level: 'ERROR',
          errorCode: 'TypeError',
        }),
        buildMetricEvent({
          applicationRegistrationId: ownedApplicationRegistrationId,
          workspaceId: OTHER_INSTALL_WORKSPACE_ID,
          minutesAgo: 15,
          level: 'ERROR',
          errorCode: 'TypeError',
        }),
        buildMetricEvent({
          applicationRegistrationId: ownedApplicationRegistrationId,
          workspaceId: OTHER_INSTALL_WORKSPACE_ID,
          minutesAgo: 20,
          source: 'UPGRADE',
          level: 'ERROR',
          errorCode: 'UPGRADE_FAILED',
          applicationVersion: '2.0.0',
          logicFunctionName: '',
        }),
        buildMetricEvent({
          applicationRegistrationId: ownedApplicationRegistrationId,
          workspaceId: OTHER_INSTALL_WORKSPACE_ID,
          minutesAgo: 25,
          source: 'API_RATE_LIMIT',
          level: 'WARN',
          errorCode: 'RATE_LIMITED',
          logicFunctionName: '',
          occurrenceCount: 40,
        }),
        buildMetricEvent({
          applicationRegistrationId: ownedApplicationRegistrationId,
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          minutesAgo: 30,
          source: 'JOB_RATE_LIMIT',
          level: 'WARN',
          errorCode: 'LIMIT_REACHED',
          logicFunctionName: '',
          occurrenceCount: 3,
        }),
      ],
    });
  });

  afterAll(async () => {
    await clickHouseClient.command({
      query:
        'ALTER TABLE applicationMetricEvent DELETE WHERE applicationRegistrationId = {applicationRegistrationId:String}',
      query_params: {
        applicationRegistrationId: ownedApplicationRegistrationId,
      },
    });
    await clickHouseClient.close();

    await deleteApplicationRegistration({
      input: { id: ownedApplicationRegistrationId },
      expectToFail: false,
    });
  });

  it('aggregates every install of an owned app without exposing workspaces', async () => {
    const { data, errors } = await findApplicationRegistrationMonitoring({
      input: { id: ownedApplicationRegistrationId },
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const monitoring = data.findApplicationRegistrationMonitoring;

    expect(monitoring).toMatchObject({
      runCount: 3,
      failedRunCount: 2,
      lifecycleFailureCount: 1,
      rateLimitEventCount: 43,
    });
    expect(monitoring.issues).toContainEqual(
      expect.objectContaining({
        level: 'ERROR',
        source: 'LOGIC_FUNCTION',
        errorCode: 'TypeError',
        logicFunctionName: 'syncContacts',
        versions: ['1.2.3'],
        eventCount: 2,
        affectedInstallCount: 2,
      }),
    );
    expect(monitoring.versions).toEqual([
      expect.objectContaining({ version: '1.2.3', activeInstallCount: 2 }),
    ]);
    expect(monitoring.functions).toEqual([
      expect.objectContaining({
        logicFunctionName: 'syncContacts',
        runCount: 3,
        failedRunCount: 2,
      }),
    ]);
    expect(JSON.stringify(monitoring)).not.toContain(SEED_APPLE_WORKSPACE_ID);
    expect(JSON.stringify(monitoring)).not.toContain(
      OTHER_INSTALL_WORKSPACE_ID,
    );
  });

  it('counts every rejected request and skipped job, apart from errors', async () => {
    const { data } = await findApplicationRegistrationMonitoring({
      input: { id: ownedApplicationRegistrationId },
      expectToFail: false,
    });

    const { activity, issues } = data.findApplicationRegistrationMonitoring;

    const sumActivity = (
      key: 'errorCount' | 'rateLimitedRequestCount' | 'rateLimitedJobCount',
    ) => activity.reduce((total, bucket) => total + bucket[key], 0);

    expect(sumActivity('errorCount')).toBe(3);
    expect(sumActivity('rateLimitedRequestCount')).toBe(40);
    expect(sumActivity('rateLimitedJobCount')).toBe(3);
    expect(issues).toContainEqual(
      expect.objectContaining({
        source: 'API_RATE_LIMIT',
        errorCode: 'RATE_LIMITED',
        eventCount: 40,
        affectedInstallCount: 1,
      }),
    );
  });

  it('charts the credits used by the installs of the app', async () => {
    const [{ id: applicationId, applicationRegistrationId }] =
      await globalThis.testDataSource.query(
        `SELECT id, "applicationRegistrationId" FROM core.application
         WHERE "workspaceId" = $1 AND name = $2`,
        [SEED_APPLE_WORKSPACE_ID, WORKSPACE_CUSTOM_APPLICATION_NAME],
      );
    const resourceId = crypto.randomUUID();

    const findCreditsUsed = async () => {
      const { data } = await findApplicationRegistrationMonitoring({
        input: { id: applicationRegistrationId },
        expectToFail: false,
      });

      return data.findApplicationRegistrationMonitoring;
    };

    const creditsUsedBefore = (await findCreditsUsed()).creditsUsed;

    await clickHouseClient.insert({
      table: 'usageEvent',
      format: 'JSONEachRow',
      values: [
        { applicationId, minutesAgo: 5, creditsUsedMicro: 1_500_000 },
        { applicationId, minutesAgo: 10, creditsUsedMicro: 500_000 },
        {
          applicationId: crypto.randomUUID(),
          minutesAgo: 5,
          creditsUsedMicro: 9_000_000,
        },
      ].map((event) => ({
        timestamp: formatDateTimeForClickHouse(
          new Date(Date.now() - event.minutesAgo * 60_000),
        ),
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        resourceType: 'WORKFLOW',
        operationType: 'CODE_EXECUTION',
        creditsUsedMicro: event.creditsUsedMicro,
        applicationId: event.applicationId,
        resourceId,
      })),
    });

    const monitoring = await findCreditsUsed();

    await clickHouseClient.command({
      query:
        'ALTER TABLE usageEvent DELETE WHERE resourceId = {resourceId:String}',
      query_params: { resourceId },
    });

    expect(creditsUsedBefore).not.toBeNull();
    expect(monitoring.creditsUsed).not.toBeNull();
    expect(
      (monitoring.creditsUsed ?? 0) - (creditsUsedBefore ?? 0),
    ).toBeCloseTo(2);
    expect(monitoring.creditUsage?.length).toBeGreaterThan(0);
  });

  it('refuses an app registration owned by another workspace', async () => {
    const otherApplicationRegistrationId = crypto.randomUUID();

    await globalThis.testDataSource.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris", "oAuthScopes", "workspaceId")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        otherApplicationRegistrationId,
        crypto.randomUUID(),
        'Someone else registration',
        crypto.randomUUID(),
        [],
        [],
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );

    const { errors } = await findApplicationRegistrationMonitoring({
      input: { id: otherApplicationRegistrationId },
      expectToFail: true,
    });

    expect(errors).toBeDefined();

    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE id = $1`,
      [otherApplicationRegistrationId],
    );
  });

  it('refuses API keys', async () => {
    const { errors } = await findApplicationRegistrationMonitoring({
      input: { id: ownedApplicationRegistrationId },
      expectToFail: true,
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(errors).toBeDefined();
  });
});
