import { Test, TestingModule } from '@nestjs/testing';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AutomatedTriggerType } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { DatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/database-event-trigger.listener';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

describe('DatabaseEventTriggerListener', () => {
  let listener: DatabaseEventTriggerListener;
  let twentyORMGlobalManager: jest.Mocked<TwentyORMGlobalManager>;
  let messageQueueService: jest.Mocked<MessageQueueService>;
  let featureFlagService: jest.Mocked<FeatureFlagService>;

  const mockRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    twentyORMGlobalManager = {
      getRepositoryForWorkspace: jest.fn().mockResolvedValue(mockRepository),
    } as any;

    messageQueueService = {
      add: jest.fn(),
    } as any;

    featureFlagService = {
      isFeatureEnabled: jest.fn().mockResolvedValue(true),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseEventTriggerListener,
        {
          provide: TwentyORMGlobalManager,
          useValue: twentyORMGlobalManager,
        },
        {
          provide: MessageQueueService,
          useValue: messageQueueService,
        },
        {
          provide: FeatureFlagService,
          useValue: featureFlagService,
        },
        {
          provide: 'MESSAGE_QUEUE_workflow-queue',
          useValue: messageQueueService,
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: {
            getWorkflowById: jest.fn(),
            getObjectMetadataItemWithFieldsMaps: jest.fn().mockResolvedValue({
              objectMetadataMaps: {
                byId: {
                  'test-object-metadata': {
                    nameSingular: 'testObject',
                    namePlural: 'testObjects',
                  },
                },
              },
              objectMetadataItemWithFieldsMaps: {
                fieldsByJoinColumnName: {},
              },
            }),
          },
        },
      ],
    }).compile();

    listener = module.get<DatabaseEventTriggerListener>(
      DatabaseEventTriggerListener,
    );
  });

  describe('handleObjectRecordUpdateEvent', () => {
    const workspaceId = 'test-workspace';
    const databaseEventName = 'testEvent';
    const workflowId = 'test-workflow';

    const mockPayload = {
      workspaceId,
      name: databaseEventName,
      events: [
        {
          recordId: 'test-record',
          objectMetadata: {
            id: 'test-object-metadata',
            workspaceId,
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
            createdAt: new Date(),
            updatedAt: new Date(),
            fields: [],
            relationships: [],
            fromRelations: [],
            toRelations: [],
            indexMetadatas: [],
          },
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

    it('should filter event listeners by event name', async () => {
      mockRepository.find.mockResolvedValue([
        ...mockEventListeners,
        {
          type: AutomatedTriggerType.DATABASE_EVENT,
          workflowId: 'other-workflow',
          settings: {
            eventName: 'otherEvent',
            fields: ['field1'],
          },
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
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
  });
});
