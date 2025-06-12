import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowStatusesUpdateJob,
  WorkflowVersionBatchEvent,
  WorkflowVersionEventType,
} from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';

describe('WorkflowStatusesUpdate', () => {
  let job: WorkflowStatusesUpdateJob;

  const mockWorkflowRepository = {
    findOneOrFail: jest.fn(),
    update: jest.fn(),
  };

  const mockWorkflowVersionRepository = {
    findOneOrFail: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockTwentyORMGlobalManager = {
    getRepositoryForWorkspace: jest
      .fn()
      .mockImplementation((_workspaceId, entity, options) => {
        if (!options?.shouldBypassPermissionChecks) {
          throw new Error(
            'Permission check will fail because job runners dont have permissions',
          );
        }

        if (entity === 'workflow') {
          return Promise.resolve(mockWorkflowRepository);
        }
        if (entity === 'workflowVersion') {
          return Promise.resolve(mockWorkflowVersionRepository);
        }

        return Promise.resolve(null);
      }),
  };

  const mockServerlessFunctionService = {
    publishOneServerlessFunction: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  const mockWorkspaceEventEmitter = {
    emitDatabaseBatchEvent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowStatusesUpdateJob,
        {
          provide: TwentyORMGlobalManager,
          useValue: mockTwentyORMGlobalManager,
        },
        {
          provide: ServerlessFunctionService,
          useValue: mockServerlessFunctionService,
        },
        {
          provide: WorkspaceEventEmitter,
          useValue: mockWorkspaceEventEmitter,
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity, 'core'),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue({
              nameSingular: 'workflow',
            }),
          },
        },
        {
          provide: getRepositoryToken(ServerlessFunctionEntity, 'core'),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue({
              latestVersion: 'v2',
            }),
          },
        },
      ],
    }).compile();

    job = await module.resolve<WorkflowStatusesUpdateJob>(
      WorkflowStatusesUpdateJob,
    );
  });

  it('should be defined', () => {
    expect(job).toBeDefined();
  });

  describe('handle', () => {
    describe('when event type is CREATE', () => {
      it('when already a draft, do not change anything', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.CREATE,
          workflowIds: ['1'],
        };

        const mockWorkflow = {
          id: '1',
          statuses: [WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.find.mockResolvedValue([
          { status: WorkflowVersionStatus.DRAFT },
        ]);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
        expect(
          mockWorkspaceEventEmitter.emitDatabaseBatchEvent,
        ).toHaveBeenCalledTimes(0);
      });

      it('when no draft yet, update statuses', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.CREATE,
          workflowIds: ['1'],
        };

        const mockWorkflow = {
          id: '1',
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.find.mockResolvedValue([
          { status: WorkflowVersionStatus.ACTIVE },
          { status: WorkflowVersionStatus.DRAFT },
        ]);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [WorkflowStatus.DRAFT, WorkflowStatus.ACTIVE] },
        );
        expect(
          mockWorkspaceEventEmitter.emitDatabaseBatchEvent,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('when event type is STATUS_UPDATE', () => {
      test('when status is the same, should not do anything', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              workflowVersionId: '1',
              previousStatus: WorkflowVersionStatus.ACTIVE,
              newStatus: WorkflowVersionStatus.ACTIVE,
            },
          ],
        };

        const mockWorkflow = {
          id: '1',
          statuses: [WorkflowStatus.ACTIVE],
        };

        const mockWorkflowVersion = {
          id: '1',
          status: WorkflowVersionStatus.ACTIVE,
          steps: [],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.findOneOrFail.mockResolvedValue(
          mockWorkflowVersion,
        );
        mockWorkflowVersionRepository.find.mockResolvedValue([
          { status: WorkflowVersionStatus.ACTIVE },
        ]);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(
          mockWorkflowVersionRepository.findOneOrFail,
        ).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
        expect(
          mockWorkspaceEventEmitter.emitDatabaseBatchEvent,
        ).toHaveBeenCalledTimes(0);
      });

      test('when WorkflowVersionStatus.DRAFT to WorkflowVersionStatus.ACTIVE, should activate and publish serverless functions', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              workflowVersionId: '1',
              previousStatus: WorkflowVersionStatus.DRAFT,
              newStatus: WorkflowVersionStatus.ACTIVE,
            },
          ],
        };

        const mockWorkflow = {
          id: '1',
          statuses: [WorkflowStatus.DRAFT],
        };

        const mockWorkflowVersion = {
          id: '1',
          status: WorkflowVersionStatus.ACTIVE,
          steps: [
            {
              type: 'CODE',
              settings: {
                input: {
                  serverlessFunctionId: 'serverless-1',
                },
              },
            },
          ],
        };

        const mockServerlessFunction = {
          id: 'serverless-1',
          latestVersion: 'v2',
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.findOneOrFail.mockResolvedValue(
          mockWorkflowVersion,
        );
        mockWorkflowVersionRepository.find.mockResolvedValue([
          { status: WorkflowVersionStatus.ACTIVE },
        ]);
        mockServerlessFunctionService.findOneOrFail.mockResolvedValue(
          mockServerlessFunction,
        );

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(
          mockWorkflowVersionRepository.findOneOrFail,
        ).toHaveBeenCalledTimes(1);
        expect(
          mockServerlessFunctionService.publishOneServerlessFunction,
        ).toHaveBeenCalledWith('serverless-1', '1');
        expect(mockWorkflowVersionRepository.update).toHaveBeenCalledWith('1', {
          steps: [
            {
              type: 'CODE',
              settings: {
                input: {
                  serverlessFunctionId: 'serverless-1',
                  serverlessFunctionVersion: 'v2',
                },
              },
            },
          ],
        });
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [WorkflowStatus.ACTIVE] },
        );
        expect(
          mockWorkspaceEventEmitter.emitDatabaseBatchEvent,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('when event type is DELETE', () => {
      test('when status is not draft, should not do anything', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.DELETE,
          workflowIds: ['1'],
        };

        const mockWorkflow = {
          id: '1',
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.find.mockResolvedValue([
          { status: WorkflowVersionStatus.ACTIVE },
        ]);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
      });

      test('when status is draft, should delete', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.DELETE,
          workflowIds: ['1'],
        };

        const mockWorkflow = {
          id: '1',
          statuses: [WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.find.mockResolvedValue([]);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [] },
        );
        expect(
          mockWorkspaceEventEmitter.emitDatabaseBatchEvent,
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
