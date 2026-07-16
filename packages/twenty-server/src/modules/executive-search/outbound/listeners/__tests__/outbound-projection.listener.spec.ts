import { Logger } from '@nestjs/common';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FeatureFlagKey } from 'twenty-shared/types';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { OutboundEventMapperService } from 'src/modules/executive-search/outbound/services/outbound-event-mapper.service';
import { OutboundProjectionListener } from 'src/modules/executive-search/outbound/listeners/outbound-projection.listener';
import {
  ExecutiveSearchOutboxService,
  OutboxEventInput,
} from 'src/modules/executive-search/sync/services/outbox.service';
import { ExternalSyncOutboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-outbox.workspace-entity';

describe('OutboundProjectionListener', () => {
  let listener: OutboundProjectionListener;
  let mockOutboxService: jest.Mocked<ExecutiveSearchOutboxService>;
  let mockMapper: jest.Mocked<OutboundEventMapperService>;
  let mockFeatureFlagService: jest.Mocked<FeatureFlagService>;
  let mockLogger: jest.Mocked<Logger>;

  const workspaceId = 'workspace-1';

  const buildPayload = (
    action: DatabaseEventAction,
    overrides: Partial<WorkspaceEventBatch<any>> = {},
  ): WorkspaceEventBatch<any> => ({
    workspaceId,
    name: 'company.created',
    objectMetadata: { nameSingular: 'company' } as any,
    events: [
      {
        recordId: 'rec-1',
        properties: {
          after:
            action === DatabaseEventAction.DELETED ||
            action === DatabaseEventAction.DESTROYED
              ? undefined
              : {
                  id: 'rec-1',
                  name: 'Test Co',
                  updatedAt: '2024-01-01T00:00:00Z',
                },
          before:
            action === DatabaseEventAction.DELETED ||
            action === DatabaseEventAction.DESTROYED
              ? { id: 'rec-1', name: 'Test Co', updatedAt: '2024-01-01T00:00:00Z' }
              : undefined,
        },
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    mockOutboxService = {
      enqueue: jest.fn().mockResolvedValue({ id: 'outbox-1' } as ExternalSyncOutboxWorkspaceEntity),
      markSent: jest.fn(),
      markFailed: jest.fn(),
      findReadyForRetry: jest.fn(),
      findStaleProcessing: jest.fn(),
    } as unknown as jest.Mocked<ExecutiveSearchOutboxService>;

    mockMapper = {
      mapCompanyEvent: jest.fn().mockImplementation(
        (action: DatabaseEventAction, record: Record<string, unknown>) => {
          if (
            action === DatabaseEventAction.DELETED ||
            action === DatabaseEventAction.DESTROYED
          ) {
            return {
              eventType: 'company.projection_deleted',
              payload: { id: record.id },
            };
          }
          return {
            eventType: 'company.projection_updated',
            payload: { id: record.id, name: record.name, updatedAt: record.updatedAt },
          };
        },
      ),
      mapOpportunitySourceEvent: jest.fn(),
    } as unknown as jest.Mocked<OutboundEventMapperService>;

    mockFeatureFlagService = {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
      getWorkspaceFeatureFlags: jest.fn(),
      getWorkspaceFeatureFlagsMap: jest.fn(),
      enableFeatureFlags: jest.fn(),
      upsertWorkspaceFeatureFlag: jest.fn(),
    } as unknown as jest.Mocked<FeatureFlagService>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    listener = new OutboundProjectionListener(
      mockOutboxService,
      mockMapper,
      mockFeatureFlagService,
    );
    (listener as any).logger = mockLogger;
  });

  describe('handleCompanyCreated', () => {
    it('should enqueue with eventType "company.projection_updated" and allowlisted payload', async () => {
      const payload = buildPayload(DatabaseEventAction.CREATED);

      await listener.handleCompanyCreated(payload);

      expect(mockMapper.mapCompanyEvent).toHaveBeenCalledWith(
        DatabaseEventAction.CREATED,
        expect.objectContaining({ id: 'rec-1', name: 'Test Co' }),
      );
      expect(mockOutboxService.enqueue).toHaveBeenCalledTimes(1);
      const enqueueCall = mockOutboxService.enqueue.mock
        .calls[0][0] as OutboxEventInput;
      expect(enqueueCall.eventType).toBe('company.projection_updated');
      expect(enqueueCall.entityName).toBe('company');
      expect(enqueueCall.entityId).toBe('rec-1');
      expect(enqueueCall.workspaceId).toBe(workspaceId);
      expect(enqueueCall.payload).toMatchObject({
        id: 'rec-1',
        name: 'Test Co',
      });
      expect(enqueueCall.domainIdempotencyKey).toContain(workspaceId);
      expect(enqueueCall.domainIdempotencyKey).toContain('company.projection_updated');
      expect(enqueueCall.domainIdempotencyKey).toContain('rec-1');
    });
  });

  describe('handleCompanyUpdated', () => {
    it('should enqueue with eventType "company.projection_updated" and allowlisted payload', async () => {
      const payload = buildPayload(DatabaseEventAction.UPDATED);

      await listener.handleCompanyUpdated(payload);

      expect(mockMapper.mapCompanyEvent).toHaveBeenCalledWith(
        DatabaseEventAction.UPDATED,
        expect.objectContaining({ id: 'rec-1' }),
      );
      expect(mockOutboxService.enqueue).toHaveBeenCalledTimes(1);
      const enqueueCall = mockOutboxService.enqueue.mock
        .calls[0][0] as OutboxEventInput;
      expect(enqueueCall.eventType).toBe('company.projection_updated');
      expect(enqueueCall.entityName).toBe('company');
      expect(enqueueCall.entityId).toBe('rec-1');
    });
  });

  describe('handleCompanyDeleted', () => {
    it('should enqueue with eventType "company.projection_deleted" and { id } payload', async () => {
      const payload = buildPayload(DatabaseEventAction.DELETED);

      await listener.handleCompanyDeleted(payload);

      expect(mockMapper.mapCompanyEvent).toHaveBeenCalledWith(
        DatabaseEventAction.DELETED,
        expect.objectContaining({ id: 'rec-1' }),
      );
      expect(mockOutboxService.enqueue).toHaveBeenCalledTimes(1);
      const enqueueCall = mockOutboxService.enqueue.mock
        .calls[0][0] as OutboxEventInput;
      expect(enqueueCall.eventType).toBe('company.projection_deleted');
      expect(enqueueCall.entityName).toBe('company');
      expect(enqueueCall.entityId).toBe('rec-1');
      expect(enqueueCall.payload).toEqual({ id: 'rec-1' });
    });
  });

  describe('handleCompanyDestroyed', () => {
    it('should enqueue with eventType "company.projection_deleted" and { id } payload', async () => {
      const payload = buildPayload(DatabaseEventAction.DESTROYED);

      await listener.handleCompanyDestroyed(payload);

      expect(mockMapper.mapCompanyEvent).toHaveBeenCalledWith(
        DatabaseEventAction.DESTROYED,
        expect.objectContaining({ id: 'rec-1' }),
      );
      expect(mockOutboxService.enqueue).toHaveBeenCalledTimes(1);
      const enqueueCall = mockOutboxService.enqueue.mock
        .calls[0][0] as OutboxEventInput;
      expect(enqueueCall.eventType).toBe('company.projection_deleted');
      expect(enqueueCall.entityName).toBe('company');
      expect(enqueueCall.entityId).toBe('rec-1');
      expect(enqueueCall.payload).toEqual({ id: 'rec-1' });
    });
  });

  describe('feature flag disabled', () => {
    it('should NOT call enqueue when feature flag is off', async () => {
      mockFeatureFlagService.isFeatureEnabled.mockResolvedValue(false);
      const payload = buildPayload(DatabaseEventAction.CREATED);

      await listener.handleCompanyCreated(payload);

      expect(mockFeatureFlagService.isFeatureEnabled).toHaveBeenCalledWith(
        FeatureFlagKey.IS_EXECUTIVE_SEARCH_OUTBOUND_PUBLISH_ENABLED,
        workspaceId,
      );
      expect(mockMapper.mapCompanyEvent).not.toHaveBeenCalled();
      expect(mockOutboxService.enqueue).not.toHaveBeenCalled();
    });
  });

  describe('missing workspaceId', () => {
    it('should NOT call enqueue when workspaceId is missing', async () => {
      const payload = buildPayload(DatabaseEventAction.CREATED, {
        workspaceId: '',
      });

      await listener.handleCompanyCreated(payload);

      expect(mockFeatureFlagService.isFeatureEnabled).not.toHaveBeenCalled();
      expect(mockMapper.mapCompanyEvent).not.toHaveBeenCalled();
      expect(mockOutboxService.enqueue).not.toHaveBeenCalled();
    });
  });

  describe('empty events', () => {
    it('should NOT call enqueue when events array is empty', async () => {
      const payload = buildPayload(DatabaseEventAction.CREATED, {
        events: [],
      });

      await listener.handleCompanyCreated(payload);

      expect(mockFeatureFlagService.isFeatureEnabled).not.toHaveBeenCalled();
      expect(mockMapper.mapCompanyEvent).not.toHaveBeenCalled();
      expect(mockOutboxService.enqueue).not.toHaveBeenCalled();
    });
  });

  describe('events without record (null/undefined)', () => {
    it('should skip events that have no properties.after for CREATED', async () => {
      const payload = buildPayload(DatabaseEventAction.CREATED, {
        events: [
          {
            recordId: 'rec-null',
            properties: { after: null },
          },
        ],
      });

      await listener.handleCompanyCreated(payload);

      expect(mockFeatureFlagService.isFeatureEnabled).toHaveBeenCalled();
      expect(mockMapper.mapCompanyEvent).not.toHaveBeenCalled();
      expect(mockOutboxService.enqueue).not.toHaveBeenCalled();
    });

    it('should skip events that have no properties.before for DELETED', async () => {
      const payload = buildPayload(DatabaseEventAction.DELETED, {
        events: [
          {
            recordId: 'rec-null',
            properties: { before: null },
          },
        ],
      });

      await listener.handleCompanyDeleted(payload);

      expect(mockFeatureFlagService.isFeatureEnabled).toHaveBeenCalled();
      expect(mockMapper.mapCompanyEvent).not.toHaveBeenCalled();
      expect(mockOutboxService.enqueue).not.toHaveBeenCalled();
    });
  });
});
