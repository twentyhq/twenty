import { OutboundProjectionService } from 'src/modules/executive-search/outbound/services/outbound-projection.service';

import {
  ExecutiveSearchOutboxService,
  OUTBOX_STATUS,
} from 'src/modules/executive-search/sync/services/outbox.service';
import { DirectusClientService } from 'src/modules/executive-search/directus/services/directus-client.service';
import { OutboundHmacSignerService } from 'src/modules/executive-search/outbound/services/outbound-hmac-signer.service';
import { DirectusConnectionConfigService } from 'src/modules/executive-search/outbound/services/directus-connection-config.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { FeatureFlagKey } from 'twenty-shared/types';
import { ExternalSyncOutboxWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-sync-outbox.workspace-entity';
import { ExternalEntityLinkWorkspaceEntity } from 'src/modules/executive-search/standard-objects/external-entity-link.workspace-entity';

describe('OutboundProjectionService', () => {
  let service: OutboundProjectionService;
  let mockGlobalWorkspaceOrmManager: jest.Mocked<GlobalWorkspaceOrmManager>;
  let mockDirectusClient: jest.Mocked<DirectusClientService>;
  let mockOutboxService: jest.Mocked<ExecutiveSearchOutboxService>;
  let mockSigner: jest.Mocked<OutboundHmacSignerService>;
  let mockConfigService: jest.Mocked<DirectusConnectionConfigService>;
  let mockFeatureFlagService: jest.Mocked<FeatureFlagService>;

  const workspaceId = 'workspace-1';
  const outboxId = 'outbox-1';

  const createMockRepository = () => ({
    update: jest.fn(),
    findOneBy: jest.fn(),
    upsert: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  });

  let outboxRepository: ReturnType<typeof createMockRepository>;
  let linkRepository: ReturnType<typeof createMockRepository>;

  const signedResult = {
    signature: 'sig-123',
    timestamp: '1710500000000',
    nonce: 'nonce-123',
    body: JSON.stringify({ name: 'Test', id: 'entity-1' }),
  };

  const signedHeaders = {
    'X-Twenty-Directus-Signature': 'sig-123',
    'X-Twenty-Directus-Timestamp': '1710500000000',
    'X-Twenty-Directus-Nonce': 'nonce-123',
    'Content-Type': 'application/json',
  };

  const configResult = {
    baseUrl: 'https://directus.example.com',
    email: 'admin@test.com',
    password: 'password123',
    hmacSecret: 'hmac-secret-123',
  };

  beforeEach(() => {
    outboxRepository = createMockRepository();
    linkRepository = createMockRepository();

    mockGlobalWorkspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((fn) => fn()),
      getRepository: jest.fn().mockImplementation((_wid, entity) => {
        if (entity === ExternalSyncOutboxWorkspaceEntity) {
          return Promise.resolve(outboxRepository);
        }
        if (entity === ExternalEntityLinkWorkspaceEntity) {
          return Promise.resolve(linkRepository);
        }
        return Promise.resolve(createMockRepository());
      }),
      getGlobalWorkspaceDataSource: jest.fn(),
      getGlobalWorkspaceDataSourceReplica: jest.fn(),
    } as unknown as jest.Mocked<GlobalWorkspaceOrmManager>;

    mockDirectusClient = {
      configure: jest.fn(),
      authenticate: jest.fn(),
      isAuthenticated: jest.fn(),
      createItem: jest.fn(),
      updateItem: jest.fn(),
      deleteItem: jest.fn(),
      getServerInfo: jest.fn(),
      getCollections: jest.fn(),
      getAllFields: jest.fn(),
      getFields: jest.fn(),
      getItems: jest.fn(),
      getRawSchemaSnapshot: jest.fn(),
    } as unknown as jest.Mocked<DirectusClientService>;

    mockOutboxService = {
      enqueue: jest.fn(),
      markSent: jest.fn(),
      markFailed: jest.fn(),
      findReadyForRetry: jest.fn(),
    } as unknown as jest.Mocked<ExecutiveSearchOutboxService>;

    mockSigner = {
      sign: jest.fn().mockReturnValue(signedResult),
      toHeaders: jest.fn().mockReturnValue(signedHeaders),
    } as unknown as jest.Mocked<OutboundHmacSignerService>;

    mockConfigService = {
      getConfig: jest.fn().mockReturnValue(configResult),
    } as unknown as jest.Mocked<DirectusConnectionConfigService>;

    mockFeatureFlagService = {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
      getWorkspaceFeatureFlags: jest.fn(),
      getWorkspaceFeatureFlagsMap: jest.fn(),
      enableFeatureFlags: jest.fn(),
      upsertWorkspaceFeatureFlag: jest.fn(),
    } as unknown as jest.Mocked<FeatureFlagService>;

    service = new OutboundProjectionService(
      mockGlobalWorkspaceOrmManager,
      mockDirectusClient,
      mockOutboxService,
      mockSigner,
      mockConfigService,
      mockFeatureFlagService,
    );
  });

  describe('feature flag', () => {
    it('should return early when feature flag is disabled', async () => {
      mockFeatureFlagService.isFeatureEnabled.mockResolvedValue(false);

      await service.deliver(workspaceId, outboxId);

      expect(
        mockFeatureFlagService.isFeatureEnabled,
      ).toHaveBeenCalledWith(
        FeatureFlagKey.IS_EXECUTIVE_SEARCH_OUTBOUND_PUBLISH_ENABLED,
        workspaceId,
      );
      expect(mockDirectusClient.configure).not.toHaveBeenCalled();
      expect(mockDirectusClient.authenticate).not.toHaveBeenCalled();
      expect(mockOutboxService.markSent).not.toHaveBeenCalled();
      expect(mockOutboxService.markFailed).not.toHaveBeenCalled();
    });
  });

  describe('atomic claim', () => {
    it('should return early when another worker already claimed the entry', async () => {
      outboxRepository.update.mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] });

      await service.deliver(workspaceId, outboxId);

      expect(outboxRepository.update).toHaveBeenCalledWith(
        { id: outboxId, status: OUTBOX_STATUS.PENDING },
        { status: OUTBOX_STATUS.PROCESSING },
      );
      expect(outboxRepository.findOneBy).not.toHaveBeenCalled();
      expect(mockDirectusClient.configure).not.toHaveBeenCalled();
      expect(mockOutboxService.markSent).not.toHaveBeenCalled();
      expect(mockOutboxService.markFailed).not.toHaveBeenCalled();
    });
  });

  describe('no link + create event', () => {
    const outboxRow = {
      id: outboxId,
      workspaceId,
      eventType: 'company.projection_updated',
      entityName: 'company',
      entityId: 'entity-1',
      payload: { name: 'Test', id: 'entity-1' },
      status: OUTBOX_STATUS.PROCESSING,
      retryCount: 0,
      maxRetries: 3,
    };

    beforeEach(() => {
      outboxRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      outboxRepository.findOneBy.mockResolvedValue(outboxRow);
      linkRepository.findOneBy.mockResolvedValue(null);
      mockDirectusClient.createItem.mockResolvedValue({ id: 'directus-123', name: 'Test' });
    });

    it('should call createItem and upsert link, then markSent', async () => {
      await service.deliver(workspaceId, outboxId);

      expect(mockDirectusClient.configure).toHaveBeenCalledWith(configResult.baseUrl);
      expect(mockDirectusClient.authenticate).toHaveBeenCalledWith(
        configResult.email,
        configResult.password,
      );
      expect(mockSigner.sign).toHaveBeenCalledWith(
        outboxRow.payload,
        configResult.hmacSecret,
      );
      expect(mockDirectusClient.createItem).toHaveBeenCalledWith(
        'companies',
        signedResult.body,
        signedHeaders,
      );
      expect(linkRepository.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          twentyEntityName: 'company',
          twentyRecordId: 'entity-1',
          externalSystemName: 'directus',
          externalEntityName: 'companies',
          externalRecordId: 'directus-123',
          authority: 'TWENTY',
          workspaceId: 'workspace-1',
        }),
        ['twentyEntityName', 'twentyRecordId', 'externalSystemName'],
      );
      expect(mockOutboxService.markSent).toHaveBeenCalledWith(workspaceId, outboxId);
      expect(mockOutboxService.markFailed).not.toHaveBeenCalled();
    });
  });

  describe('existing link + update event', () => {
    const outboxRow = {
      id: outboxId,
      workspaceId,
      eventType: 'opportunity.updated',
      entityName: 'opportunity',
      entityId: 'entity-2',
      payload: { name: 'Updated Opp', id: 'entity-2' },
      status: OUTBOX_STATUS.PROCESSING,
      retryCount: 0,
      maxRetries: 3,
    };

    const existingLink = {
      id: 'link-1',
      twentyEntityName: 'opportunity',
      twentyRecordId: 'entity-2',
      externalSystemName: 'directus',
      externalEntityName: 'opportunities',
      externalRecordId: 'directus-456',
      authority: 'TWENTY',
      lastSyncedAt: '2026-01-01T00:00:00Z',
    };

    beforeEach(() => {
      outboxRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      outboxRepository.findOneBy.mockResolvedValue(outboxRow);
      linkRepository.findOneBy.mockResolvedValue(existingLink);
    });

    it('should call updateItem with the existing link id and markSent', async () => {
      await service.deliver(workspaceId, outboxId);

      expect(mockDirectusClient.createItem).not.toHaveBeenCalled();
      expect(mockDirectusClient.updateItem).toHaveBeenCalledWith(
        'opportunities',
        'directus-456',
        signedResult.body,
        signedHeaders,
      );
      expect(linkRepository.upsert).not.toHaveBeenCalled();
      expect(mockOutboxService.markSent).toHaveBeenCalledWith(workspaceId, outboxId);
    });
  });

  describe('delete event with link', () => {
    const outboxRow = {
      id: outboxId,
      workspaceId,
      eventType: 'company.projection_deleted',
      entityName: 'company',
      entityId: 'entity-3',
      payload: { id: 'entity-3' },
      status: OUTBOX_STATUS.PROCESSING,
      retryCount: 0,
      maxRetries: 3,
    };

    const existingLink = {
      id: 'link-2',
      twentyEntityName: 'company',
      twentyRecordId: 'entity-3',
      externalSystemName: 'directus',
      externalEntityName: 'companies',
      externalRecordId: 'directus-789',
      authority: 'TWENTY',
      lastSyncedAt: '2026-01-01T00:00:00Z',
    };

    beforeEach(() => {
      outboxRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      outboxRepository.findOneBy.mockResolvedValue(outboxRow);
      linkRepository.findOneBy.mockResolvedValue(existingLink);
    });

    it('should call deleteItem and markSent', async () => {
      await service.deliver(workspaceId, outboxId);

      expect(mockDirectusClient.deleteItem).toHaveBeenCalledWith(
        'companies',
        'directus-789',
        signedHeaders,
      );
      expect(mockDirectusClient.createItem).not.toHaveBeenCalled();
      expect(mockDirectusClient.updateItem).not.toHaveBeenCalled();
      expect(mockOutboxService.markSent).toHaveBeenCalledWith(workspaceId, outboxId);
    });
  });

  describe('delete event without link', () => {
    const outboxRow = {
      id: outboxId,
      workspaceId,
      eventType: 'opportunity.closed',
      entityName: 'opportunity',
      entityId: 'entity-4',
      payload: { id: 'entity-4' },
      status: OUTBOX_STATUS.PROCESSING,
      retryCount: 0,
      maxRetries: 3,
    };

    beforeEach(() => {
      outboxRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      outboxRepository.findOneBy.mockResolvedValue(outboxRow);
      linkRepository.findOneBy.mockResolvedValue(null);
    });

    it('should not call deleteItem but still call markSent (no-op)', async () => {
      await service.deliver(workspaceId, outboxId);

      expect(mockDirectusClient.deleteItem).not.toHaveBeenCalled();
      expect(mockDirectusClient.createItem).not.toHaveBeenCalled();
      expect(mockDirectusClient.updateItem).not.toHaveBeenCalled();
      expect(mockOutboxService.markSent).toHaveBeenCalledWith(workspaceId, outboxId);
    });
  });

  describe('error handling', () => {
    const outboxRow = {
      id: outboxId,
      workspaceId,
      eventType: 'company.projection_updated',
      entityName: 'company',
      entityId: 'entity-5',
      payload: { name: 'Error Test' },
      status: OUTBOX_STATUS.PROCESSING,
      retryCount: 1,
      maxRetries: 3,
    };

    beforeEach(() => {
      outboxRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      outboxRepository.findOneBy.mockResolvedValue(outboxRow);
    });

    it('should call markFailed when client throws and NOT rethrow', async () => {
      const apiError = new Error('Directus API error 500: Internal Server Error');
      linkRepository.findOneBy.mockRejectedValue(apiError);

      await service.deliver(workspaceId, outboxId);

      expect(mockOutboxService.markFailed).toHaveBeenCalledWith(
        workspaceId,
        outboxId,
        'Directus API error 500: Internal Server Error',
        1,
        3,
      );
      // Ensure the method does not throw — the caller (BullMQ) should not retry
    });

    it('should call markFailed when config env var is missing and NOT rethrow', async () => {
      mockConfigService.getConfig.mockImplementation(() => {
        throw new Error(
          'DirectusConnectionConfigService: DIRECTUS_BASE_URL is not set',
        );
      });

      await service.deliver(workspaceId, outboxId);

      expect(mockOutboxService.markFailed).toHaveBeenCalledWith(
        workspaceId,
        outboxId,
        'DirectusConnectionConfigService: DIRECTUS_BASE_URL is not set',
        1,
        3,
      );
    });
  });
});
