import { Test, TestingModule } from '@nestjs/testing';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowStatusesUpdateJob,
  WorkflowVersionBatchEvent,
  WorkflowVersionEventType,
} from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';

describe('WorkflowStatusesUpdate', () => {
  let job: WorkflowStatusesUpdateJob;

  const mockWorkflowRepository = {
    findOneOrFail: jest.fn(),
    update: jest.fn(),
  };

  const mockTwentyORMManager = {
    getRepository: jest.fn().mockResolvedValue(mockWorkflowRepository),
  };

  const mockServerlessFunctionService = {
    publishOneServerlessFunction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowStatusesUpdateJob,
        {
          provide: TwentyORMManager,
          useValue: mockTwentyORMManager,
        },
        {
          provide: ServerlessFunctionService,
          useValue: mockServerlessFunctionService,
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
          statuses: [WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

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

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [WorkflowStatus.ACTIVE, WorkflowStatus.DRAFT] },
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
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(2);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
      });

      test('when update that should be impossible, do not do anything', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              workflowVersionId: '1',
              previousStatus: WorkflowVersionStatus.ACTIVE,
              newStatus: WorkflowVersionStatus.DRAFT,
            },
          ],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(2);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
      });

      test('when WorkflowVersionStatus.DEACTIVATED to WorkflowVersionStatus.ACTIVE, should activate', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              workflowVersionId: '1',
              previousStatus: WorkflowVersionStatus.DEACTIVATED,
              newStatus: WorkflowVersionStatus.ACTIVE,
            },
          ],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.DEACTIVATED],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(2);
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [WorkflowStatus.ACTIVE] },
        );
      });

      test('when WorkflowVersionStatus.ACTIVE to WorkflowVersionStatus.DEACTIVATED, should deactivate', async () => {
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              workflowVersionId: '1',
              previousStatus: WorkflowVersionStatus.ACTIVE,
              newStatus: WorkflowVersionStatus.DEACTIVATED,
            },
          ],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(2);
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [WorkflowStatus.DEACTIVATED] },
        );
      });

      test('when WorkflowVersionStatus.DRAFT to WorkflowVersionStatus.ACTIVE, should activate', async () => {
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
          statuses: [WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        await job.handle(event);

        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(2);
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
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

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
          statuses: [WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

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
