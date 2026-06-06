import process from 'process';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient,
} from '@clickhouse/client';
import request from 'supertest';

import { formatDateTimeForClickHouse } from 'src/database/clickHouse/clickHouse.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const client = request(`http://localhost:${APP_PORT}`);

describe('Event Logs (integration)', () => {
  let clickHouseClient: ClickHouseClient;
  const testWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';
  const testUserWorkspaceId = '20202020-3957-45c9-be39-337dc4d9100a';
  const otherUserWorkspaceId = '20202020-0000-4000-8000-0000000000ff';

  beforeAll(async () => {
    jest.useRealTimers();

    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: {
        allow_experimental_json_type: 1,
      },
      log: { level: ClickHouseLogLevel.OFF },
    });

    await seedTestData();
  });

  afterAll(async () => {
    await cleanupTestData();

    if (clickHouseClient) {
      await clickHouseClient.close();
    }
  });

  const seedTestData = async () => {
    const now = new Date();

    const pageviewRecords = Array.from({ length: 25 }, (_, i) => ({
      workspaceId: testWorkspaceId,
      userId: testUserWorkspaceId,
      name: i % 2 === 0 ? 'settings/profile' : 'objects/companies',
      timestamp: formatDateTimeForClickHouse(
        new Date(now.getTime() - i * 60000),
      ),
      properties: { path: `/settings/${i}` },
    }));

    const workspaceEventRecords = Array.from({ length: 15 }, (_, i) => ({
      workspaceId: testWorkspaceId,
      userId: testUserWorkspaceId,
      event:
        i % 3 === 0
          ? 'user.login'
          : i % 3 === 1
            ? 'user.logout'
            : 'settings.updated',
      timestamp: formatDateTimeForClickHouse(
        new Date(now.getTime() - i * 120000),
      ),
      properties: { action: `action_${i}` },
    }));

    const objectEventRecords = Array.from({ length: 20 }, (_, i) => ({
      workspaceId: testWorkspaceId,
      userId: testUserWorkspaceId,
      event: i % 2 === 0 ? 'company.created' : 'company.updated',
      timestamp: formatDateTimeForClickHouse(
        new Date(now.getTime() - i * 90000),
      ),
      properties: { field: `field_${i}` },
      recordId: `record-${i}`,
      objectMetadataId: i % 2 === 0 ? 'object-meta-1' : 'object-meta-2',
      isCustom: i % 4 === 0,
    }));

    const usageEventRecords = Array.from({ length: 8 }, (_, i) => ({
      workspaceId: testWorkspaceId,
      userWorkspaceId: i < 5 ? testUserWorkspaceId : otherUserWorkspaceId,
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      quantity: (i + 1) * 100,
      unit: UsageUnit.TOKEN,
      creditsUsedMicro: (i + 1) * 500,
      resourceId: `agent-${i}`,
      resourceContext: 'gpt-4o',
      metadata: {},
      timestamp: formatDateTimeForClickHouse(
        new Date(now.getTime() - i * 60000),
      ),
    }));

    const applicationLogRecords = Array.from({ length: 8 }, (_, i) => ({
      workspaceId: testWorkspaceId,
      applicationId: 'app-1',
      logicFunctionId: 'fn-1',
      logicFunctionName: i % 2 === 0 ? 'sendEmail' : 'syncContacts',
      executionId: `exec-${i}`,
      level: i % 2 === 0 ? 'INFO' : 'ERROR',
      message: `log line ${i}`,
      timestamp: formatDateTimeForClickHouse(
        new Date(now.getTime() - i * 60000),
      ),
    }));

    await clickHouseClient.insert({
      table: 'pageview',
      values: pageviewRecords,
      format: 'JSONEachRow',
    });

    await clickHouseClient.insert({
      table: 'workspaceEvent',
      values: workspaceEventRecords,
      format: 'JSONEachRow',
    });

    await clickHouseClient.insert({
      table: 'objectEvent',
      values: objectEventRecords,
      format: 'JSONEachRow',
    });

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: usageEventRecords,
      format: 'JSONEachRow',
    });

    await clickHouseClient.insert({
      table: 'applicationLog',
      values: applicationLogRecords,
      format: 'JSONEachRow',
    });

    // Wait for ClickHouse async inserts to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));
  };

  const cleanupTestData = async () => {
    try {
      await clickHouseClient.command({
        query: `ALTER TABLE pageview DELETE WHERE workspaceId = '${testWorkspaceId}'`,
      });
      await clickHouseClient.command({
        query: `ALTER TABLE workspaceEvent DELETE WHERE workspaceId = '${testWorkspaceId}'`,
      });
      await clickHouseClient.command({
        query: `ALTER TABLE objectEvent DELETE WHERE workspaceId = '${testWorkspaceId}'`,
      });
      await clickHouseClient.command({
        query: `ALTER TABLE usageEvent DELETE WHERE workspaceId = '${testWorkspaceId}'`,
      });
      await clickHouseClient.command({
        query: `ALTER TABLE applicationLog DELETE WHERE workspaceId = '${testWorkspaceId}'`,
      });
    } catch {
      // Ignore cleanup errors
    }
  };

  const makeEventLogsQuery = (
    input: Record<string, unknown>,
    token = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  ) => {
    return client
      .post('/metadata')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: `
          query EventLogs($input: EventLogQueryInput!) {
            eventLogs(input: $input) {
              records {
                event
                timestamp
                userId
                properties
                recordId
                objectMetadataId
                isCustom
              }
              totalCount
              pageInfo {
                endCursor
                hasNextPage
              }
            }
          }
        `,
        variables: { input },
      });
  };

  describe('querying different tables', () => {
    it('should query PAGEVIEW table', async () => {
      const response = await makeEventLogsQuery({
        table: 'PAGEVIEW',
        first: 10,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.eventLogs).toBeDefined();
      expect(response.body.data.eventLogs.records.length).toBeGreaterThan(0);
      expect(response.body.data.eventLogs.totalCount).toBeGreaterThanOrEqual(
        response.body.data.eventLogs.records.length,
      );
    });

    it('should query WORKSPACE_EVENT table', async () => {
      const response = await makeEventLogsQuery({
        table: 'WORKSPACE_EVENT',
        first: 10,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.eventLogs).toBeDefined();
      expect(response.body.data.eventLogs.records.length).toBeGreaterThan(0);
    });

    it('should query OBJECT_EVENT table', async () => {
      const response = await makeEventLogsQuery({
        table: 'OBJECT_EVENT',
        first: 10,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.eventLogs).toBeDefined();
      expect(response.body.data.eventLogs.records.length).toBeGreaterThan(0);

      const record = response.body.data.eventLogs.records[0];

      expect(record.recordId).toBeDefined();
      expect(record.objectMetadataId).toBeDefined();
    });

    it('should query USAGE_EVENT table and fold columns into properties', async () => {
      const response = await makeEventLogsQuery({
        table: 'USAGE_EVENT',
        first: 10,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.eventLogs.records.length).toBeGreaterThan(0);

      const record = response.body.data.eventLogs.records[0];

      expect(typeof record.event).toBe('string');
      expect(record.event.length).toBeGreaterThan(0);
      expect(record.userId).toBeDefined();
      expect(record.properties.operationType).toBeDefined();
      expect(record.properties.quantity).toBeDefined();
      expect(record.properties.unit).toBeDefined();
      expect(record.properties.creditsUsedMicro).toBeDefined();
    });

    it('should query APPLICATION_LOG table and fold level/message into properties', async () => {
      const response = await makeEventLogsQuery({
        table: 'APPLICATION_LOG',
        first: 10,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.eventLogs.records.length).toBeGreaterThan(0);

      const record = response.body.data.eventLogs.records[0];

      expect(typeof record.event).toBe('string');
      expect(record.event.length).toBeGreaterThan(0);
      expect(record.properties.level).toBeDefined();
      expect(record.properties.message).toBeDefined();
      expect(record.properties.executionId).toBeDefined();
    });
  });

  describe('pagination', () => {
    it('should return hasNextPage=true when more records exist', async () => {
      const response = await makeEventLogsQuery({
        table: 'PAGEVIEW',
        first: 5,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.eventLogs.records.length).toBe(5);
      expect(response.body.data.eventLogs.pageInfo.hasNextPage).toBe(true);
      expect(response.body.data.eventLogs.pageInfo.endCursor).toBeDefined();
    });

    it('should fetch next page using cursor', async () => {
      const firstPage = await makeEventLogsQuery({
        table: 'PAGEVIEW',
        first: 5,
      });

      expect(firstPage.body.data.eventLogs.pageInfo.hasNextPage).toBe(true);
      const cursor = firstPage.body.data.eventLogs.pageInfo.endCursor;

      const secondPage = await makeEventLogsQuery({
        table: 'PAGEVIEW',
        first: 5,
        after: cursor,
      });

      expect(secondPage.status).toBe(200);
      expect(secondPage.body.data.eventLogs.records.length).toBeGreaterThan(0);

      const firstPageTimestamps = firstPage.body.data.eventLogs.records.map(
        (r: { timestamp: string }) => r.timestamp,
      );
      const secondPageTimestamps = secondPage.body.data.eventLogs.records.map(
        (r: { timestamp: string }) => r.timestamp,
      );

      const lastFirstPage = new Date(
        firstPageTimestamps[firstPageTimestamps.length - 1],
      );
      const firstSecondPage = new Date(secondPageTimestamps[0]);

      expect(lastFirstPage.getTime()).toBeGreaterThanOrEqual(
        firstSecondPage.getTime(),
      );
    });

    it('should return correct totalCount regardless of page size', async () => {
      const smallPage = await makeEventLogsQuery({
        table: 'PAGEVIEW',
        first: 3,
      });

      const largePage = await makeEventLogsQuery({
        table: 'PAGEVIEW',
        first: 100,
      });

      expect(smallPage.body.data.eventLogs.totalCount).toBe(
        largePage.body.data.eventLogs.totalCount,
      );
    });
  });

  describe('filters', () => {
    describe('eventType filter', () => {
      it('should filter by event type (partial match)', async () => {
        const response = await makeEventLogsQuery({
          table: 'PAGEVIEW',
          first: 50,
          filters: {
            eventType: 'settings',
          },
        });

        expect(response.status).toBe(200);
        expect(response.body.data.eventLogs.records.length).toBeGreaterThan(0);

        response.body.data.eventLogs.records.forEach(
          (record: { event: string }) => {
            expect(record.event.toLowerCase()).toContain('settings');
          },
        );
      });

      it('should filter by event type case-insensitively', async () => {
        const lowerCase = await makeEventLogsQuery({
          table: 'WORKSPACE_EVENT',
          first: 50,
          filters: { eventType: 'login' },
        });

        const upperCase = await makeEventLogsQuery({
          table: 'WORKSPACE_EVENT',
          first: 50,
          filters: { eventType: 'LOGIN' },
        });

        expect(lowerCase.body.data.eventLogs.totalCount).toBe(
          upperCase.body.data.eventLogs.totalCount,
        );
      });
    });

    describe('dateRange filter', () => {
      it('should filter by start date', async () => {
        const now = new Date();
        const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

        const response = await makeEventLogsQuery({
          table: 'PAGEVIEW',
          first: 50,
          filters: {
            dateRange: {
              start: tenMinutesAgo.toISOString(),
            },
          },
        });

        expect(response.status).toBe(200);

        response.body.data.eventLogs.records.forEach(
          (record: { timestamp: string }) => {
            expect(new Date(record.timestamp).getTime()).toBeGreaterThanOrEqual(
              tenMinutesAgo.getTime(),
            );
          },
        );
      });

      it('should filter by end date', async () => {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const response = await makeEventLogsQuery({
          table: 'PAGEVIEW',
          first: 50,
          filters: {
            dateRange: {
              end: fiveMinutesAgo.toISOString(),
            },
          },
        });

        expect(response.status).toBe(200);

        response.body.data.eventLogs.records.forEach(
          (record: { timestamp: string }) => {
            expect(new Date(record.timestamp).getTime()).toBeLessThanOrEqual(
              fiveMinutesAgo.getTime(),
            );
          },
        );
      });

      it('should filter by date range (start and end)', async () => {
        const now = new Date();
        const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const response = await makeEventLogsQuery({
          table: 'PAGEVIEW',
          first: 50,
          filters: {
            dateRange: {
              start: twentyMinutesAgo.toISOString(),
              end: fiveMinutesAgo.toISOString(),
            },
          },
        });

        expect(response.status).toBe(200);

        response.body.data.eventLogs.records.forEach(
          (record: { timestamp: string }) => {
            const timestamp = new Date(record.timestamp).getTime();

            expect(timestamp).toBeGreaterThanOrEqual(
              twentyMinutesAgo.getTime(),
            );
            expect(timestamp).toBeLessThanOrEqual(fiveMinutesAgo.getTime());
          },
        );
      });
    });

    describe('object event specific filters', () => {
      it('should filter by recordId', async () => {
        const response = await makeEventLogsQuery({
          table: 'OBJECT_EVENT',
          first: 50,
          filters: {
            recordId: 'record-0',
          },
        });

        expect(response.status).toBe(200);

        if (response.body.data.eventLogs.records.length > 0) {
          response.body.data.eventLogs.records.forEach(
            (record: { recordId: string }) => {
              expect(record.recordId).toBe('record-0');
            },
          );
        }
      });

      it('should filter by objectMetadataId', async () => {
        const response = await makeEventLogsQuery({
          table: 'OBJECT_EVENT',
          first: 50,
          filters: {
            objectMetadataId: 'object-meta-1',
          },
        });

        expect(response.status).toBe(200);

        if (response.body.data.eventLogs.records.length > 0) {
          response.body.data.eventLogs.records.forEach(
            (record: { objectMetadataId: string }) => {
              expect(record.objectMetadataId).toBe('object-meta-1');
            },
          );
        }
      });
    });

    describe('usage event specific filters', () => {
      it('should filter usage events by userWorkspaceId', async () => {
        const response = await makeEventLogsQuery({
          table: 'USAGE_EVENT',
          first: 50,
          filters: {
            userWorkspaceId: testUserWorkspaceId,
          },
        });

        expect(response.status).toBe(200);
        expect(response.body.data.eventLogs.records.length).toBeGreaterThan(0);

        response.body.data.eventLogs.records.forEach(
          (record: { userId: string }) => {
            expect(record.userId).toBe(testUserWorkspaceId);
          },
        );
      });
    });

    describe('combined filters', () => {
      it('should apply multiple filters together', async () => {
        const now = new Date();
        const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

        const response = await makeEventLogsQuery({
          table: 'WORKSPACE_EVENT',
          first: 50,
          filters: {
            eventType: 'login',
            dateRange: {
              start: thirtyMinutesAgo.toISOString(),
            },
          },
        });

        expect(response.status).toBe(200);

        response.body.data.eventLogs.records.forEach(
          (record: { event: string; timestamp: string }) => {
            expect(record.event.toLowerCase()).toContain('login');
            expect(new Date(record.timestamp).getTime()).toBeGreaterThanOrEqual(
              thirtyMinutesAgo.getTime(),
            );
          },
        );
      });
    });
  });

  describe('record structure', () => {
    it('should return properly structured pageview records', async () => {
      const response = await makeEventLogsQuery({
        table: 'PAGEVIEW',
        first: 1,
      });

      expect(response.status).toBe(200);
      const record = response.body.data.eventLogs.records[0];

      expect(record).toHaveProperty('event');
      expect(record).toHaveProperty('timestamp');
      expect(record).toHaveProperty('userId');
      expect(record).toHaveProperty('properties');
      expect(typeof record.event).toBe('string');
      expect(typeof record.timestamp).toBe('string');
    });

    it('should return properly structured object event records', async () => {
      const response = await makeEventLogsQuery({
        table: 'OBJECT_EVENT',
        first: 1,
      });

      expect(response.status).toBe(200);
      const record = response.body.data.eventLogs.records[0];

      expect(record).toHaveProperty('event');
      expect(record).toHaveProperty('timestamp');
      expect(record).toHaveProperty('recordId');
      expect(record).toHaveProperty('objectMetadataId');
      expect(record).toHaveProperty('isCustom');
    });
  });

  describe('permissions', () => {
    it('should deny access to member role', async () => {
      const response = await makeEventLogsQuery(
        { table: 'PAGEVIEW', first: 10 },
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
      );

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('FORBIDDEN');
    });

    it('should deny access without authentication', async () => {
      const response = await client.post('/metadata').send({
        query: `
          query EventLogs($input: EventLogQueryInput!) {
            eventLogs(input: $input) {
              records { event }
              totalCount
              pageInfo { hasNextPage }
            }
          }
        `,
        variables: { input: { table: 'PAGEVIEW', first: 10 } },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('error handling', () => {
    it('should reject invalid table name', async () => {
      const response = await makeEventLogsQuery({
        table: 'INVALID_TABLE' as 'PAGEVIEW',
        first: 10,
      });

      // Invalid enum values are rejected by GraphQL validation before reaching the resolver
      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
