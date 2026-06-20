import { Logger } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildPersonSyncSourceFilter } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/build-person-sync-source-filter.util';
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
      isActive: true,
      isRemote: false,
      isAuditLogged: true,
      isSearchable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      icon: 'Icon123',
      universalIdentifier: 'test-object-metadata',
      fieldIds: [],
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
        .mockImplementation((fn: () => any, _authContext?: any) => fn()),
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

    it('should trigger workflow for position-only updates when no fields are specified', async () => {
      const positionOnlyPayload: WorkspaceEventBatch<any> = {
        ...mockPayload,
        events: [
          {
            ...mockPayload.events[0],
            properties: {
              updatedFields: ['position'],
              before: { position: 1 },
              after: { position: 2 },
            },
          },
        ],
      };

      mockRepository.find.mockResolvedValue([
        {
          ...mockEventListeners[0],
          settings: {
            eventName: databaseEventName,
            fields: undefined,
          },
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(positionOnlyPayload);

      expect(messageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        {
          workspaceId,
          workflowId,
          payload: positionOnlyPayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    it('should trigger workflow when position changes alongside another field', async () => {
      const positionAndFieldPayload: WorkspaceEventBatch<any> = {
        ...mockPayload,
        events: [
          {
            ...mockPayload.events[0],
            properties: {
              updatedFields: ['field1', 'position'],
              before: { field1: 'old', position: 1 },
              after: { field1: 'new', position: 2 },
            },
          },
        ],
      };

      mockRepository.find.mockResolvedValue([
        {
          ...mockEventListeners[0],
          settings: {
            eventName: databaseEventName,
            fields: undefined,
          },
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(positionAndFieldPayload);

      expect(messageQueueService.add).toHaveBeenCalled();
    });

    it('should not trigger workflow for position-only updates when fields are specified', async () => {
      const positionOnlyPayload: WorkspaceEventBatch<any> = {
        ...mockPayload,
        events: [
          {
            ...mockPayload.events[0],
            properties: {
              updatedFields: ['position'],
              before: { position: 1 },
              after: { position: 2 },
            },
          },
        ],
      };

      mockRepository.find.mockResolvedValue([
        {
          ...mockEventListeners[0],
          settings: {
            eventName: databaseEventName,
            fields: ['field1'],
          },
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(positionOnlyPayload);

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });
  });

  describe('record filter (trigger-level conditions)', () => {
    const workspaceId = 'test-workspace';
    const databaseEventName = 'createEvent';
    const workflowId = 'test-workflow';

    const createPayloadWith = (after: Record<string, unknown>) =>
      ({
        workspaceId,
        name: databaseEventName,
        objectMetadata: createMockFlatObjectMetadata({}),
        events: [{ recordId: 'test-record', properties: { after } }],
      }) as WorkspaceEventBatch<any>;

    const listenerWithFilter = {
      type: AutomatedTriggerType.DATABASE_EVENT,
      workflowId,
      settings: {
        eventName: databaseEventName,
        filter: {
          stepFilterGroups: [{ id: 'group-1', logicalOperator: 'AND' }],
          stepFilters: [
            {
              id: 'filter-1',
              type: 'boolean',
              value: 'true',
              operand: 'IS',
              stepOutputKey: '{{trigger.properties.after.isActive}}',
              stepFilterGroupId: 'group-1',
            },
          ],
        },
      },
    };

    it('should enqueue the job when the record matches the filter', async () => {
      mockRepository.find.mockResolvedValue([listenerWithFilter]);

      await listener.handleObjectRecordCreateEvent(
        createPayloadWith({ isActive: true }),
      );

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    });

    it('should not enqueue the job when the record does not match the filter', async () => {
      mockRepository.find.mockResolvedValue([listenerWithFilter]);

      await listener.handleObjectRecordCreateEvent(
        createPayloadWith({ isActive: false }),
      );

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should enqueue the job when the filter has no conditions', async () => {
      mockRepository.find.mockResolvedValue([
        {
          ...listenerWithFilter,
          settings: {
            eventName: databaseEventName,
            filter: { stepFilterGroups: [], stepFilters: [] },
          },
        },
      ]);

      await listener.handleObjectRecordCreateEvent(
        createPayloadWith({ isActive: false }),
      );

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    });

    it('should fail closed (no enqueue, no throw) when the filter is malformed', async () => {
      const loggerErrorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);

      mockRepository.find.mockResolvedValue([
        {
          ...listenerWithFilter,
          settings: {
            eventName: databaseEventName,
            filter: {
              // The filter references a group that does not exist, which makes
              // evaluation throw; the listener must skip the run rather than let
              // the error abort the suppressed @OnEvent batch.
              stepFilterGroups: [{ id: 'group-1', logicalOperator: 'AND' }],
              stepFilters: [
                {
                  id: 'filter-1',
                  type: 'boolean',
                  value: 'true',
                  operand: 'IS',
                  stepOutputKey: '{{trigger.properties.after.isActive}}',
                  stepFilterGroupId: 'missing-group',
                },
              ],
            },
          },
        },
      ]);

      await expect(
        listener.handleObjectRecordCreateEvent(
          createPayloadWith({ isActive: true }),
        ),
      ).resolves.not.toThrow();

      expect(messageQueueService.add).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalled();

      loggerErrorSpy.mockRestore();
    });
  });

  describe('record filter — seeded person-sync default (real filter)', () => {
    const workspaceId = 'test-workspace';
    const databaseEventName = 'createEvent';
    const workflowId = 'test-workflow';

    const seededListener = {
      type: AutomatedTriggerType.DATABASE_EVENT,
      workflowId,
      settings: {
        eventName: databaseEventName,
        filter: buildPersonSyncSourceFilter({
          createdByFieldMetadataId: 'created-by-field-id',
        }),
      },
    };

    const createPersonPayload = (createdBy: Record<string, unknown>) =>
      ({
        workspaceId,
        name: databaseEventName,
        objectMetadata: createMockFlatObjectMetadata({}),
        events: [
          { recordId: 'person-1', properties: { after: { createdBy } } },
        ],
      }) as WorkspaceEventBatch<any>;

    it.each(['EMAIL', 'CALENDAR'])(
      'does not enqueue for a contact auto-created by the %s sync',
      async (source) => {
        mockRepository.find.mockResolvedValue([seededListener]);

        await listener.handleObjectRecordCreateEvent(
          createPersonPayload({ source }),
        );

        expect(messageQueueService.add).not.toHaveBeenCalled();
      },
    );

    it.each(['MANUAL', 'API', 'IMPORT'])(
      'enqueues for a contact created via %s',
      async (source) => {
        mockRepository.find.mockResolvedValue([seededListener]);

        await listener.handleObjectRecordCreateEvent(
          createPersonPayload({ source }),
        );

        expect(messageQueueService.add).toHaveBeenCalledTimes(1);
      },
    );

    it('enqueues when createdBy is absent (fails open)', async () => {
      mockRepository.find.mockResolvedValue([seededListener]);

      await listener.handleObjectRecordCreateEvent(createPersonPayload({}));

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('record filter robustness', () => {
    const workspaceId = 'test-workspace';
    const databaseEventName = 'createEvent';
    const workflowId = 'test-workflow';

    const createPayload = () =>
      ({
        workspaceId,
        name: databaseEventName,
        objectMetadata: createMockFlatObjectMetadata({}),
        events: [{ recordId: 'r1', properties: { after: { isActive: true } } }],
      }) as WorkspaceEventBatch<any>;

    it('enqueues without throwing when stepFilters is missing from settings', async () => {
      // A filter persisted in JSONB without a stepFilters array must be treated
      // as "no conditions" rather than throwing in the suppressed @OnEvent path.
      mockRepository.find.mockResolvedValue([
        {
          type: AutomatedTriggerType.DATABASE_EVENT,
          workflowId,
          settings: {
            eventName: databaseEventName,
            filter: { stepFilterGroups: [] },
          },
        },
      ]);

      await expect(
        listener.handleObjectRecordCreateEvent(createPayload()),
      ).resolves.not.toThrow();

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    });
  });

  describe('record filter combined with watched fields on update', () => {
    const workspaceId = 'test-workspace';
    const databaseEventName = 'updateEvent';
    const workflowId = 'test-workflow';

    const updateListener = {
      type: AutomatedTriggerType.DATABASE_EVENT,
      workflowId,
      settings: {
        eventName: databaseEventName,
        fields: ['stage'],
        filter: {
          stepFilterGroups: [],
          stepFilters: [
            {
              id: 'f1',
              type: 'TEXT',
              value: 'WON',
              operand: 'CONTAINS',
              stepOutputKey: '{{trigger.properties.after.stage}}',
              stepFilterGroupId: 'unused',
            },
          ],
        },
      },
    };

    const updatePayload = (
      updatedFields: string[],
      after: Record<string, unknown>,
    ) =>
      ({
        workspaceId,
        name: databaseEventName,
        objectMetadata: createMockFlatObjectMetadata({}),
        events: [
          { recordId: 'r1', properties: { updatedFields, before: {}, after } },
        ],
      }) as WorkspaceEventBatch<any>;

    it('enqueues when a watched field changed and the filter matches', async () => {
      mockRepository.find.mockResolvedValue([updateListener]);

      await listener.handleObjectRecordUpdateEvent(
        updatePayload(['stage'], { stage: 'WON' }),
      );

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    });

    it('does not enqueue when a watched field changed but the filter does not match', async () => {
      mockRepository.find.mockResolvedValue([updateListener]);

      await listener.handleObjectRecordUpdateEvent(
        updatePayload(['stage'], { stage: 'LOST' }),
      );

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('does not enqueue when the filter matches but no watched field changed', async () => {
      mockRepository.find.mockResolvedValue([updateListener]);

      await listener.handleObjectRecordUpdateEvent(
        updatePayload(['name'], { stage: 'WON' }),
      );

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });
  });
});
