import { Test, type TestingModule } from '@nestjs/testing';

import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowDatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/workflow-database-event-trigger.listener';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

describe('WorkflowDatabaseEventTriggerListener', () => {
  let listener: WorkflowDatabaseEventTriggerListener;
  let globalWorkspaceOrmManager: jest.Mocked<GlobalWorkspaceOrmManager>;
  let messageQueueService: jest.Mocked<MessageQueueService>;

  const mockRepository = {
    find: jest.fn(),
  };

  const createMockFlatObjectMetadata = (
    overrides: Partial<FlatObjectMetadata>,
  ): FlatObjectMetadata =>
    ({
      id: 'test-object-metadata',
      workspaceId: 'test-workspace',
      nameSingular: 'testObject',
      namePlural: 'testObjects',
      labelSingular: 'Test Object',
      labelPlural: 'Test Objects',
      description: 'Test object for testing',
      targetTableName: 'test_objects',
      isSystem: false,
      isCustom: false,
      isActive: true,
      isRemote: false,
      isAuditLogged: true,
      isSearchable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: 'Icon123',
      universalIdentifier: 'test-object-metadata',
      fieldMetadataIds: [],
      indexMetadataIds: [],
      viewIds: [],
      applicationId: null,
      ...overrides,
    }) as FlatObjectMetadata;

  beforeEach(async () => {
    globalWorkspaceOrmManager = {
      getRepository: jest.fn().mockResolvedValue(mockRepository),
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((_authContext: any, fn: () => any) => fn()),
    } as any;

    messageQueueService = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowDatabaseEventTriggerListener,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
        {
          provide: MessageQueueService,
          useValue: messageQueueService,
        },
        {
          provide: 'MESSAGE_QUEUE_workflow-queue',
          useValue: messageQueueService,
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: {
            getWorkflowById: jest.fn(),
            getObjectMetadataInfo: jest.fn().mockResolvedValue({
              flatObjectMetadata: createMockFlatObjectMetadata({}),
              flatObjectMetadataMaps: { byId: {}, byName: {} },
              flatFieldMetadataMaps: { byId: {}, byName: {} },
            }),
          },
        },
      ],
    }).compile();

    listener = module.get<WorkflowDatabaseEventTriggerListener>(
      WorkflowDatabaseEventTriggerListener,
    );
  });

  describe('handleObjectRecordUpdateEvent', () => {
    const workspaceId = 'test-workspace';
    const databaseEventName = 'testEvent';
    const workflowId = 'test-workflow';

    const mockPayload: WorkspaceEventBatch<any> = {
      workspaceId,
      name: databaseEventName,
      objectMetadata: createMockFlatObjectMetadata({}),
      events: [
        {
          recordId: 'test-record',
          properties: {
            updatedFields: ['field1', 'field2'],
            before: { field1: 'old', field2: 'old' },
            after: { field1: 'new', field2: 'new' },
          },
        },
      ],
    };

    const mockEventListeners = [
      {
        type: AutomatedTriggerType.DATABASE_EVENT,
        workflowId,
        settings: {
          eventName: databaseEventName,
          fields: ['field1', 'field3'],
        },
      },
    ];

    it('should trigger workflow when fields are specified and match updated fields', async () => {
      mockRepository.find.mockResolvedValue(mockEventListeners);

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        {
          workspaceId,
          workflowId,
          payload: mockPayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    it('should trigger workflow when no fields are specified', async () => {
      mockRepository.find.mockResolvedValue([
        {
          ...mockEventListeners[0],
          settings: {
            eventName: databaseEventName,
            fields: undefined,
          },
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).toHaveBeenCalled();
    });

    it('should trigger workflow when fields array is empty', async () => {
      mockRepository.find.mockResolvedValue([
        {
          ...mockEventListeners[0],
          settings: {
            eventName: databaseEventName,
            fields: [],
          },
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).toHaveBeenCalled();
    });

    it('should not trigger workflow when fields are specified but none match updated fields', async () => {
      mockRepository.find.mockResolvedValue([
        {
          ...mockEventListeners[0],
          settings: {
            eventName: databaseEventName,
            fields: ['field3', 'field4'],
          },
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should handle create events correctly', async () => {
      const createPayload: WorkspaceEventBatch<any> = {
        ...mockPayload,
        name: 'createEvent',
        events: [
          {
            ...mockPayload.events[0],
            properties: {
              after: { field1: 'new', field2: 'new' },
            },
          },
        ],
      };

      mockRepository.find.mockResolvedValue([
        {
          type: AutomatedTriggerType.DATABASE_EVENT,
          workflowId,
          settings: {
            eventName: 'createEvent',
          },
        },
      ]);

      await listener.handleObjectRecordCreateEvent(createPayload);

      expect(messageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        {
          workspaceId,
          workflowId,
          payload: createPayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    it('should handle delete events correctly', async () => {
      const deletePayload: WorkspaceEventBatch<any> = {
        ...mockPayload,
        name: 'deleteEvent',
        events: [
          {
            ...mockPayload.events[0],
            properties: {
              before: { field1: 'old', field2: 'old' },
            },
          },
        ],
      };

      mockRepository.find.mockResolvedValue([
        {
          type: AutomatedTriggerType.DATABASE_EVENT,
          workflowId,
          settings: {
            eventName: 'deleteEvent',
          },
        },
      ]);

      await listener.handleObjectRecordDeleteEvent(deletePayload);

      expect(messageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        {
          workspaceId,
          workflowId,
          payload: deletePayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    it('should handle destroy events correctly', async () => {
      const destroyPayload: WorkspaceEventBatch<any> = {
        ...mockPayload,
        name: 'destroyEvent',
        events: [
          {
            ...mockPayload.events[0],
            properties: {
              before: { field1: 'old', field2: 'old' },
            },
          },
        ],
      };

      mockRepository.find.mockResolvedValue([
        {
          type: AutomatedTriggerType.DATABASE_EVENT,
          workflowId,
          settings: {
            eventName: 'destroyEvent',
          },
        },
      ]);

      await listener.handleObjectRecordDestroyEvent(destroyPayload);

      expect(messageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        {
          workspaceId,
          workflowId,
          payload: destroyPayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    it('should handle multiple events in a batch', async () => {
      const batchPayload: WorkspaceEventBatch<any> = {
        ...mockPayload,
        events: [
          mockPayload.events[0],
          {
            ...mockPayload.events[0],
            recordId: 'test-record-2',
            properties: {
              updatedFields: ['field1'],
              before: { field1: 'old' },
              after: { field1: 'new' },
            },
          },
        ],
      };

      mockRepository.find.mockResolvedValue([
        {
          type: AutomatedTriggerType.DATABASE_EVENT,
          workflowId,
          settings: {
            eventName: databaseEventName,
            fields: ['field1'],
          },
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(batchPayload);

      expect(messageQueueService.add).toHaveBeenCalledTimes(2);
      expect(messageQueueService.add).toHaveBeenNthCalledWith(
        1,
        WorkflowTriggerJob.name,
        {
          workspaceId,
          workflowId,
          payload: batchPayload.events[0],
        },
        { retryLimit: 3 },
      );
      expect(messageQueueService.add).toHaveBeenNthCalledWith(
        2,
        WorkflowTriggerJob.name,
        {
          workspaceId,
          workflowId,
          payload: batchPayload.events[1],
        },
        { retryLimit: 3 },
      );
    });
  });
});
