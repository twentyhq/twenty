import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowStatusesUpdateJob,
  type WorkflowVersionBatchEvent,
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

  const mockGlobalWorkspaceOrmManager = {
    getRepository: jest
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
    executeInWorkspaceContext: jest
      .fn()

      .mockImplementation((_authContext: any, fn: () => any) => fn()),
  };

  const mockServerlessFunctionService = {
    publishOneServerlessFunctionOrFail: jest.fn(),
    findOneOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowStatusesUpdateJob,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
        {
          provide: ServerlessFunctionService,
          useValue: mockServerlessFunctionService,
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue({
              nameSingular: 'workflow',
            }),
          },
        },
        {
          provide: getRepositoryToken(ServerlessFunctionEntity),
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
        mockServerlessFunctionService.publishOneServerlessFunctionOrFail.mockResolvedValue(
          mockServerlessFunction,
        );

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(
          mockWorkflowVersionRepository.findOneOrFail,
        ).toHaveBeenCalledTimes(1);
        expect(
          mockServerlessFunctionService.publishOneServerlessFunctionOrFail,
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
      });
    });
  });
});
