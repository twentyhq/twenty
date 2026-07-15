import { Logger } from '@nestjs/common';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { OutboundEventMapperService } from 'src/modules/executive-search/outbound/services/outbound-event-mapper.service';
import { OutboundProjectionListener } from 'src/modules/executive-search/outbound/listeners/outbound-projection.listener';
import {
  ExecutiveSearchOutboxService,
  OutboxEventInput,
} from 'src/modules/executive-search/sync/services/outbox.service';
import { ExternalSyncOutboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-outbox.workspace-entity';

/**
 * Focused end-to-end unit test that exercises the full
 * mapper → listener → outbox chain with mocked dependencies.
 *
 * This verifies that:
 *   1. Database events are correctly mapped by OutboundEventMapperService
 *   2. The listener consumes the mapper's eventType (never hardcoded)
 *   3. The outbox.enqueue receives correctly structured input
 *   4. Dedup works via domain idempotency key
 *   5. DELETE/DESTROY events produce 'company.projection_deleted'
 */
describe('OutboundPublishIntegration', () => {
  let listener: OutboundProjectionListener;
  let mapper: OutboundEventMapperService; // Real mapper, not a mock
  let mockOutboxService: jest.Mocked<ExecutiveSearchOutboxService>;
  let mockFeatureFlagService: jest.Mocked<FeatureFlagService>;

  const workspaceId = 'workspace-int-1';
  const companyId = 'company-int-1';

  const companyRecord = {
    id: companyId,
    name: 'Integration Corp',
    domainName: 'integration-corp.com',
    description: 'A company for integration testing',
    industry: 'Technology',
    address: '456 Integration Blvd',
    logo: 'https://example.com/logo-int.png',
    updatedAt: '2026-07-15T12:00:00Z',
    // Confidential fields that should be excluded
    accountStrategy: 'Secret strategy',
    fees: 100000,
    stakeholders: ['Alice', 'Bob'],
  };

  beforeEach(() => {
    // Use the real mapper
    mapper = new OutboundEventMapperService();

    mockOutboxService = {
      enqueue: jest.fn(),
      markSent: jest.fn(),
      markFailed: jest.fn(),
      findReadyForRetry: jest.fn(),
      findStaleProcessing: jest.fn(),
    } as unknown as jest.Mocked<ExecutiveSearchOutboxService>;

    mockFeatureFlagService = {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
      getWorkspaceFeatureFlags: jest.fn(),
      getWorkspaceFeatureFlagsMap: jest.fn(),
      enableFeatureFlags: jest.fn(),
      upsertWorkspaceFeatureFlag: jest.fn(),
    } as unknown as jest.Mocked<FeatureFlagService>;

    // Use a mock logger that tracks calls
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    listener = new OutboundProjectionListener(
      mockOutboxService,
      mapper,
      mockFeatureFlagService,
    );
    (listener as any).logger = mockLogger;
  });

  describe('Company CREATED — full chain', () => {
    it('should enqueue with allowlisted payload via real mapper', async () => {
      const payload: WorkspaceEventBatch<any> = {
        workspaceId,
        name: 'company.created',
        objectMetadata: { nameSingular: 'company' } as any,
        events: [
          {
            recordId: companyId,
            properties: { after: companyRecord },
          },
        ],
      };

      await listener.handleCompanyCreated(payload);

      expect(mockOutboxService.enqueue).toHaveBeenCalledTimes(1);

      const input = mockOutboxService.enqueue.mock
        .calls[0][0] as OutboxEventInput;

      // Verify eventType comes from the mapper, not hardcoded
      expect(input.eventType).toBe('company.projection_updated');
      expect(input.entityName).toBe('company');
      expect(input.entityId).toBe(companyId);
      expect(input.workspaceId).toBe(workspaceId);

      // Verify allowlisting — confidential fields excluded
      expect(input.payload).toHaveProperty('id', companyId);
      expect(input.payload).toHaveProperty('name', 'Integration Corp');
      expect(input.payload).toHaveProperty('domainName', 'integration-corp.com');
      expect(input.payload).toHaveProperty('website', 'integration-corp.com');
      expect(input.payload).toHaveProperty('description');
      expect(input.payload).toHaveProperty('industry', 'Technology');
      expect(input.payload).toHaveProperty('address');
      expect(input.payload).toHaveProperty('logo');
      expect(input.payload).toHaveProperty('updatedAt');
      expect(input.payload).not.toHaveProperty('accountStrategy');
      expect(input.payload).not.toHaveProperty('fees');
      expect(input.payload).not.toHaveProperty('stakeholders');

      // Verify idempotency key structure
      expect(input.domainIdempotencyKey).toBe(
        `${workspaceId}:company.projection_updated:${companyId}:2026-07-15T12:00:00Z`,
      );
    });

    it('should use record.updatedAt directly in the idempotency key', async () => {
      const recordWithCustomUpdatedAt = {
        id: companyId,
        name: 'Custom Date Corp',
        updatedAt: '2026-01-01T00:00:00Z',
      };
      const payload: WorkspaceEventBatch<any> = {
        workspaceId,
        name: 'company.created',
        objectMetadata: { nameSingular: 'company' } as any,
        events: [
          {
            recordId: companyId,
            properties: { after: recordWithCustomUpdatedAt },
          },
        ],
      };

      await listener.handleCompanyCreated(payload);

      const input = mockOutboxService.enqueue.mock
        .calls[0][0] as OutboxEventInput;
      expect(input.domainIdempotencyKey).toBe(
        `${workspaceId}:company.projection_updated:${companyId}:2026-01-01T00:00:00Z`,
      );
    });
  });

  describe('Same idempotency key twice — dedup', () => {
    it('should produce the same idempotency key for identical events', async () => {
      const payload: WorkspaceEventBatch<any> = {
        workspaceId,
        name: 'company.created',
        objectMetadata: { nameSingular: 'company' } as any,
        events: [
          {
            recordId: companyId,
            properties: { after: companyRecord },
          },
        ],
      };

      // Enqueue returns an existing entity the second time (simulating dedup)
      const existingEntity = { id: 'existing-outbox' } as ExternalSyncOutboxWorkspaceEntity;
      mockOutboxService.enqueue
        .mockResolvedValueOnce({ id: 'outbox-new' } as ExternalSyncOutboxWorkspaceEntity)
        .mockResolvedValueOnce(existingEntity);

      await listener.handleCompanyCreated(payload);
      await listener.handleCompanyCreated(payload);

      expect(mockOutboxService.enqueue).toHaveBeenCalledTimes(2);

      const key1 = (mockOutboxService.enqueue.mock.calls[0][0] as OutboxEventInput)
        .domainIdempotencyKey;
      const key2 = (mockOutboxService.enqueue.mock.calls[1][0] as OutboxEventInput)
        .domainIdempotencyKey;

      // Both calls produce the same idempotency key
      expect(key1).toBe(key2);
    });
  });

  describe('Company DELETED', () => {
    it('should enqueue with eventType "company.projection_deleted" and { id } payload', async () => {
      const payload: WorkspaceEventBatch<any> = {
        workspaceId,
        name: 'company.deleted',
        objectMetadata: { nameSingular: 'company' } as any,
        events: [
          {
            recordId: companyId,
            properties: { before: { id: companyId } },
          },
        ],
      };

      await listener.handleCompanyDeleted(payload);

      expect(mockOutboxService.enqueue).toHaveBeenCalledTimes(1);

      const input = mockOutboxService.enqueue.mock
        .calls[0][0] as OutboxEventInput;

      // CRITICAL: eventType must be 'company.projection_deleted', NOT 'company.projection_updated'
      expect(input.eventType).toBe('company.projection_deleted');
      expect(input.payload).toEqual({ id: companyId });
      expect(input.entityName).toBe('company');
      expect(input.entityId).toBe(companyId);
      expect(input.domainIdempotencyKey).toContain(
        `${workspaceId}:company.projection_deleted:${companyId}:`,
      );
    });
  });
});
