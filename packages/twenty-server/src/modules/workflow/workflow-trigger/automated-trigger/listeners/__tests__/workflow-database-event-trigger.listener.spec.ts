import { Test, type TestingModule } from '@nestjs/testing';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import type { ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import {
  FieldMetadataType,
  MetadataReadability,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
  RelationType,
} from 'twenty-shared/types';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { AutomatedTriggerType } from 'src/engine/core-modules/workflow/enums/automated-trigger-type.enum';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { RecordShareStorageService } from 'src/engine/core-modules/record-share/services/record-share-storage.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowDatabaseEventTriggerListener } from 'src/modules/workflow/workflow-trigger/automated-trigger/listeners/workflow-database-event-trigger.listener';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

const TWENTY_STANDARD_APPLICATION_ID = 'twenty-standard-application-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';

describe('WorkflowDatabaseEventTriggerListener', () => {
  let listener: WorkflowDatabaseEventTriggerListener;
  let workspaceOrmManager: jest.Mocked<WorkspaceOrmManager>;
  let messageQueueService: jest.Mocked<MessageQueueService>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;
  let recordShareStorageService: jest.Mocked<RecordShareStorageService>;
  let workflowCommonWorkspaceService: {
    getWorkflowById: jest.Mock;
    getObjectMetadataInfo: jest.Mock;
  };
  let findRelatedRecords: jest.Mock;

  const setTriggerMap = (
    listeners: Array<{
      workflowId: string;
      settings: object;
      type?: unknown;
      applicationId?: string;
    }>,
    {
      applicationVersion = '1.0.1',
      applicationRole,
    }: {
      applicationVersion?: string | null;
      applicationRole?: { canReadObjectRecords: boolean } | null;
    } = {},
  ) => {
    const isApplicationWorkflow = applicationRole !== undefined;

    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatObjectMetadataMaps: { byUniversalIdentifier: {} },
      featureFlagsMap: {},
      flatApplicationMaps: {
        byId: {
          'application-id': {
            id: 'application-id',
            version: applicationVersion,
            defaultRoleId: applicationRole ? 'application-role-id' : null,
          },
        },
        idByUniversalIdentifier: {},
      },
      ...(isApplicationWorkflow
        ? {
            rolesPermissions: applicationRole
              ? {
                  'application-role-id': {
                    'test-object-metadata': {
                      canReadObjectRecords:
                        applicationRole.canReadObjectRecords,
                      canUpdateObjectRecords: false,
                      canSoftDeleteObjectRecords: false,
                      canDestroyObjectRecords: false,
                      restrictedFields: {},
                      rowLevelPermissionPredicates: [],
                      rowLevelPermissionPredicateGroups: [],
                    },
                  },
                }
              : {},
            roleIdsWithAllRecordsAccess: [],
            flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
            flatRowLevelPermissionPredicateGroupMaps:
              createEmptyFlatEntityMaps(),
            flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
          }
        : {}),
      flatRoleMaps: { byUniversalIdentifier: {} },
      workflowAutomatedTriggerMaps: {
        byWorkflowId: Object.fromEntries(
          listeners.map((listener) => [
            listener.workflowId,
            {
              type: AutomatedTriggerType.DATABASE_EVENT,
              coreWorkflowVersionId: `core-version-${listener.workflowId}`,
              workspaceWorkflowVersionId: `workspace-version-${listener.workflowId}`,
              applicationId: isApplicationWorkflow
                ? 'application-id'
                : WORKSPACE_CUSTOM_APPLICATION_ID,
              ...listener,
            },
          ]),
        ),
      },
    } as never);
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
      readability: MetadataReadability.OPEN,
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
    findRelatedRecords = jest.fn();
    workspaceOrmManager = {
      getRepository: jest.fn().mockReturnValue({ find: findRelatedRecords }),
      executeInWorkspaceContext: jest
        .fn()
        .mockImplementation((fn: () => any, _authContext?: any) => fn()),
    } as any;

    messageQueueService = {
      add: jest.fn(),
    } as any;

    workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: { byUniversalIdentifier: {} },
        featureFlagsMap: {},
        flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
        flatRoleMaps: { byUniversalIdentifier: {} },
        workflowAutomatedTriggerMaps: { byWorkflowId: {} },
      } as never),
    } as any;

    recordShareStorageService = {
      findByRecordIds: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<RecordShareStorageService>;

    workflowCommonWorkspaceService = {
      getWorkflowById: jest.fn(),
      getObjectMetadataInfo: jest.fn().mockResolvedValue({
        flatObjectMetadata: createMockFlatObjectMetadata({}),
        flatObjectMetadataMaps: { byId: {}, byName: {} },
        flatFieldMetadataMaps: { byId: {}, byName: {} },
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowDatabaseEventTriggerListener,
        {
          provide: WorkspaceOrmManager,
          useValue: workspaceOrmManager,
        },
        {
          provide: MessageQueueService,
          useValue: messageQueueService,
        },
        {
          provide: WorkspaceCacheService,
          useValue: workspaceCacheService,
        },
        {
          provide: RecordShareStorageService,
          useValue: recordShareStorageService,
        },

        RecordAccessPolicyService,
        {
          provide: 'MESSAGE_QUEUE_workflow-queue',
          useValue: messageQueueService,
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: workflowCommonWorkspaceService,
        },
        {
          provide: CoreEntityCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue({
              id: 'test-workspace',
              workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
            }),
          },
        },
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
              .fn()
              .mockResolvedValue({
                twentyStandardFlatApplication: {
                  id: TWENTY_STANDARD_APPLICATION_ID,
                },
                workspaceCustomFlatApplication: {
                  id: WORKSPACE_CUSTOM_APPLICATION_ID,
                },
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
      setTriggerMap(mockEventListeners);

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        {
          workspaceId,
          workflowId,
          coreWorkflowVersionId: `core-version-${workflowId}`,
          workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
          payload: mockPayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    it('should not trigger workflow while its application is still installing', async () => {
      setTriggerMap(mockEventListeners, {
        applicationVersion: null,
        applicationRole: { canReadObjectRecords: true },
      });

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should trigger an application workflow on records its application role reads', async () => {
      setTriggerMap(mockEventListeners, {
        applicationRole: { canReadObjectRecords: true },
      });

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
    });

    it('should not trigger an application workflow on records its application role cannot read', async () => {
      setTriggerMap(mockEventListeners, {
        applicationRole: { canReadObjectRecords: false },
      });

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should not trigger an application workflow whose application has no role', async () => {
      setTriggerMap(mockEventListeners, { applicationRole: null });

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should not trigger a workflow whose application is no longer installed', async () => {
      setTriggerMap(
        [{ ...mockEventListeners[0], applicationId: 'removed-application-id' }],
        { applicationRole: { canReadObjectRecords: true } },
      );

      await listener.handleObjectRecordUpdateEvent(mockPayload);

      expect(messageQueueService.add).not.toHaveBeenCalled();
    });

    it('should trigger workflow when no fields are specified', async () => {
      setTriggerMap([
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
      setTriggerMap([
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
      setTriggerMap([
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

      setTriggerMap([
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
          coreWorkflowVersionId: `core-version-${workflowId}`,
          workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
          payload: createPayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    describe('with a record related to a company', () => {
      const company = { id: 'company-id', name: 'Acme' };
      const createdRecord = {
        id: 'test-record',
        field1: 'new',
        companyId: company.id,
      };
      const createPayload: WorkspaceEventBatch<any> = {
        ...mockPayload,
        name: 'createEvent',
        events: [
          {
            ...mockPayload.events[0],
            properties: { after: createdRecord },
          },
        ],
      };
      const createListener = {
        type: AutomatedTriggerType.DATABASE_EVENT,
        workflowId,
        settings: { eventName: 'createEvent' },
      };

      const expectEnqueuedRecord = ({
        enqueuedWorkflowId = workflowId,
        record,
      }: {
        enqueuedWorkflowId?: string;
        record: object;
      }) =>
        expect(messageQueueService.add).toHaveBeenCalledWith(
          WorkflowTriggerJob.name,
          {
            workspaceId,
            workflowId: enqueuedWorkflowId,
            coreWorkflowVersionId: `core-version-${enqueuedWorkflowId}`,
            workspaceWorkflowVersionId: `workspace-version-${enqueuedWorkflowId}`,
            payload: {
              ...createPayload.events[0],
              properties: { after: record },
            },
          },
          { retryLimit: 3 },
        );

      beforeEach(() => {
        const companyField = getFlatFieldMetadataMock({
          id: 'company-field-id',
          universalIdentifier: 'company-field-id',
          objectMetadataId: 'test-object-metadata',
          type: FieldMetadataType.RELATION,
          name: 'company',
          settings: {
            relationType: RelationType.MANY_TO_ONE,
            joinColumnName: 'companyId',
          },
          relationTargetObjectMetadataId: 'company-object-id',
        });

        workflowCommonWorkspaceService.getObjectMetadataInfo.mockResolvedValue({
          flatObjectMetadata: createMockFlatObjectMetadata({
            fieldIds: [companyField.id],
          }),
          flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: getFlatObjectMetadataMock({
              id: 'company-object-id',
              universalIdentifier: 'company-object-id',
              nameSingular: 'company',
            }),
            flatEntityMaps: createEmptyFlatEntityMaps(),
          }),
          flatFieldMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: companyField,
            flatEntityMaps: createEmptyFlatEntityMaps(),
          }),
        });
        findRelatedRecords.mockResolvedValue([company]);
      });

      it('should give a workspace workflow the related company', async () => {
        setTriggerMap([createListener]);

        await listener.handleObjectRecordCreateEvent(createPayload);

        expect(messageQueueService.add).toHaveBeenCalledTimes(1);
        expectEnqueuedRecord({ record: { ...createdRecord, company } });
      });

      it('should not give an application workflow the related company', async () => {
        setTriggerMap([createListener], {
          applicationRole: { canReadObjectRecords: true },
        });

        await listener.handleObjectRecordCreateEvent(createPayload);

        expect(messageQueueService.add).toHaveBeenCalledTimes(1);
        expectEnqueuedRecord({ record: createdRecord });
        expect(findRelatedRecords).not.toHaveBeenCalled();
      });

      it('should give the related company only to the workspace workflow when an application workflow listens too', async () => {
        const workspaceWorkflowId = 'workspace-workflow';
        const applicationWorkflowId = 'application-workflow';

        setTriggerMap(
          [
            {
              ...createListener,
              workflowId: workspaceWorkflowId,
              applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
            },
            { ...createListener, workflowId: applicationWorkflowId },
          ],
          { applicationRole: { canReadObjectRecords: true } },
        );

        await listener.handleObjectRecordCreateEvent(createPayload);

        expect(messageQueueService.add).toHaveBeenCalledTimes(2);
        expectEnqueuedRecord({
          enqueuedWorkflowId: workspaceWorkflowId,
          record: { ...createdRecord, company },
        });
        expectEnqueuedRecord({
          enqueuedWorkflowId: applicationWorkflowId,
          record: createdRecord,
        });
      });
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

      setTriggerMap([
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
          coreWorkflowVersionId: `core-version-${workflowId}`,
          workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
          payload: deletePayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    it('should not hand the child records captured with a deletion to the workflow', async () => {
      const capturedEvent = {
        ...mockPayload.events[0],
        properties: {
          before: { field1: 'old', field2: 'old' },
          inheritedReadabilityChildRecords: {
            noteTarget: [{ id: 'note-target-1', noteId: 'record-1' }],
          },
        },
      };

      setTriggerMap([
        {
          type: AutomatedTriggerType.DATABASE_EVENT,
          workflowId,
          settings: {
            eventName: 'deleteEvent',
          },
        },
      ]);

      await listener.handleObjectRecordDeleteEvent({
        ...mockPayload,
        name: 'deleteEvent',
        events: [capturedEvent],
      });

      expect(messageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        expect.objectContaining({
          payload: {
            ...capturedEvent,
            properties: { before: { field1: 'old', field2: 'old' } },
          },
        }),
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

      setTriggerMap([
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
          coreWorkflowVersionId: `core-version-${workflowId}`,
          workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
          payload: destroyPayload.events[0],
        },
        { retryLimit: 3 },
      );
    });

    it('should only trigger workflow for records of a private object shared with the workflow role', async () => {
      const applicationRoleId = 'application-role-id';
      const applicationId = TWENTY_STANDARD_APPLICATION_ID;

      const privatePayload: WorkspaceEventBatch<ObjectRecordUpdateEvent> = {
        ...mockPayload,
        objectMetadata: createMockFlatObjectMetadata({
          readability: MetadataReadability.PRIVATE,
        }),
        events: [
          mockPayload.events[0],
          { ...mockPayload.events[0], recordId: 'test-record-2' },
        ],
      };

      workspaceCacheService.getOrRecompute.mockImplementation(((
        _workspaceId: string,
        keys: string[],
      ) =>
        Promise.resolve(
          !keys.includes('workflowAutomatedTriggerMaps')
            ? {
                flatObjectMetadataMaps: { byUniversalIdentifier: {} },
                featureFlagsMap: {},
                flatApplicationMaps: {
                  byId: {
                    [applicationId]: {
                      id: applicationId,
                      defaultRoleId: applicationRoleId,
                    },
                  },
                  idByUniversalIdentifier: {
                    [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER]:
                      applicationId,
                  },
                },
                flatRoleMaps: { byUniversalIdentifier: {} },
                rolesPermissions: {},
                roleIdsWithAllRecordsAccess: [],
                flatRowLevelPermissionPredicateMaps:
                  createEmptyFlatEntityMaps(),
                flatRowLevelPermissionPredicateGroupMaps:
                  createEmptyFlatEntityMaps(),
                flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
              }
            : {
                flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
                workflowAutomatedTriggerMaps: {
                  byWorkflowId: {
                    [workflowId]: {
                      type: AutomatedTriggerType.DATABASE_EVENT,
                      coreWorkflowVersionId: `core-version-${workflowId}`,
                      workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
                      workflowId,
                      applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
                      settings: { eventName: databaseEventName },
                    },
                  },
                },
              },
        )) as never);

      recordShareStorageService.findByRecordIds.mockResolvedValue([
        {
          id: 'record-share-1',
          recordId: 'test-record-2',
          objectMetadataId: privatePayload.objectMetadata.id,
          principalId: applicationRoleId,
          principalType: RecordSharePrincipalType.ROLE,
          accessLevel: RecordShareAccessLevel.READ,
          rowCause: RecordShareRowCause.MANUAL,
          sourceId: 'source-1',
        },
      ]);

      await listener.handleObjectRecordUpdateEvent(privatePayload);

      expect(recordShareStorageService.findByRecordIds).toHaveBeenCalledWith({
        workspaceId,
        objectMetadataId: privatePayload.objectMetadata.id,
        recordIds: ['test-record', 'test-record-2'],
      });
      expect(messageQueueService.add).toHaveBeenCalledTimes(1);
      expect(messageQueueService.add).toHaveBeenCalledWith(
        WorkflowTriggerJob.name,
        expect.objectContaining({ payload: privatePayload.events[1] }),
        { retryLimit: 3 },
      );
    });

    it('should not trigger workflow for a system object and no resolved role', async () => {
      const systemPayload: WorkspaceEventBatch<ObjectRecordUpdateEvent> = {
        ...mockPayload,
        objectMetadata: createMockFlatObjectMetadata({
          readability: MetadataReadability.SYSTEM,
        }),
      };

      workspaceCacheService.getOrRecompute.mockImplementation(((
        _workspaceId: string,
        keys: string[],
      ) =>
        Promise.resolve(
          !keys.includes('workflowAutomatedTriggerMaps')
            ? {
                flatObjectMetadataMaps: { byUniversalIdentifier: {} },
                featureFlagsMap: {},
                flatApplicationMaps: {
                  byId: {},
                  idByUniversalIdentifier: {},
                },
                flatRoleMaps: { byUniversalIdentifier: {} },
                rolesPermissions: {},
                roleIdsWithAllRecordsAccess: [],
                flatRowLevelPermissionPredicateMaps:
                  createEmptyFlatEntityMaps(),
                flatRowLevelPermissionPredicateGroupMaps:
                  createEmptyFlatEntityMaps(),
                flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
              }
            : {
                flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
                workflowAutomatedTriggerMaps: {
                  byWorkflowId: {
                    [workflowId]: {
                      type: AutomatedTriggerType.DATABASE_EVENT,
                      coreWorkflowVersionId: `core-version-${workflowId}`,
                      workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
                      workflowId,
                      applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
                      settings: { eventName: databaseEventName },
                    },
                  },
                },
              },
        )) as never);

      await listener.handleObjectRecordUpdateEvent(systemPayload);

      expect(recordShareStorageService.findByRecordIds).not.toHaveBeenCalled();
      expect(messageQueueService.add).not.toHaveBeenCalled();
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

      setTriggerMap([
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
          coreWorkflowVersionId: `core-version-${workflowId}`,
          workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
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
          coreWorkflowVersionId: `core-version-${workflowId}`,
          workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
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

      setTriggerMap([
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
          coreWorkflowVersionId: `core-version-${workflowId}`,
          workspaceWorkflowVersionId: `workspace-version-${workflowId}`,
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

      setTriggerMap([
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

      setTriggerMap([
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
});
