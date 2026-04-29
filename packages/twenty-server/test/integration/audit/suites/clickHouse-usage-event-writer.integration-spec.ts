import process from 'process';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient,
} from '@clickhouse/client';

import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const buildUsageEventRow = (
  workspaceId: string,
  overrides: Partial<{
    userWorkspaceId: string;
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
    quantity: number;
    unit: UsageUnit;
    creditsUsedMicro: number;
    resourceId: string;
    resourceContext: string;
  }> = {},
) => ({
  timestamp: formatDateTimeForClickHouse(new Date()),
  workspaceId,
  userWorkspaceId: overrides.userWorkspaceId ?? '',
  resourceType: overrides.resourceType ?? UsageResourceType.AI,
  operationType: overrides.operationType ?? UsageOperationType.AI_CHAT_TOKEN,
  quantity: overrides.quantity ?? 0,
  unit: overrides.unit ?? UsageUnit.TOKEN,
  creditsUsedMicro: overrides.creditsUsedMicro ?? 0,
  resourceId: overrides.resourceId ?? '',
  resourceContext: overrides.resourceContext ?? '',
  metadata: {},
});

describe('ClickHouse Usage Event Writer (integration)', () => {
  let clickHouseClient: ClickHouseClient;

  beforeAll(async () => {
    jest.useRealTimers();

    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
      log: { level: ClickHouseLogLevel.OFF },
    });

    await clickHouseClient.query({
      query: 'TRUNCATE TABLE usageEvent',
      format: 'JSONEachRow',
    });
  });

  afterAll(async () => {
    if (clickHouseClient) {
      await clickHouseClient.close();
    }
  });

  it('should insert a usage event row matching the schema produced by UsageEventWriterService', async () => {
    const workspaceId = '00000000-0000-0000-0000-000000000001';

    const row = buildUsageEventRow(workspaceId, {
      userWorkspaceId: '00000000-0000-0000-0000-000000000002',
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      quantity: 1500,
      unit: UsageUnit.TOKEN,
      creditsUsedMicro: 7500,
      resourceId: 'agent-123',
      resourceContext: 'gpt-4o',
    });

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: [row],
      format: 'JSONEachRow',
    });

    const queryResult = await clickHouseClient.query({
      query: `
        SELECT *
        FROM usageEvent
        WHERE workspaceId = '${workspaceId}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json<Record<string, unknown>>();

    expect(rows).toHaveLength(1);
    expect(rows[0].workspaceId).toBe(workspaceId);
    expect(rows[0].resourceType).toBe(UsageResourceType.AI);
    expect(rows[0].operationType).toBe(UsageOperationType.AI_CHAT_TOKEN);
    expect(rows[0].quantity).toBe(1500);
    expect(rows[0].unit).toBe(UsageUnit.TOKEN);
    expect(rows[0].creditsUsedMicro).toBe(7500);
    expect(rows[0].resourceId).toBe('agent-123');
    expect(rows[0].resourceContext).toBe('gpt-4o');
  });

  it('should insert a usage event with empty optional fields', async () => {
    const workspaceId = '00000000-0000-0000-0000-000000000003';

    const row = buildUsageEventRow(workspaceId, {
      resourceType: UsageResourceType.WORKFLOW,
      operationType: UsageOperationType.WORKFLOW_EXECUTION,
      quantity: 1,
      unit: UsageUnit.INVOCATION,
      creditsUsedMicro: 1,
    });

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: [row],
      format: 'JSONEachRow',
    });

    const queryResult = await clickHouseClient.query({
      query: `
        SELECT *
        FROM usageEvent
        WHERE workspaceId = '${workspaceId}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json<Record<string, unknown>>();

    expect(rows).toHaveLength(1);
    expect(rows[0].userWorkspaceId).toBe('');
    expect(rows[0].resourceId).toBe('');
    expect(rows[0].resourceContext).toBe('');
  });
});
