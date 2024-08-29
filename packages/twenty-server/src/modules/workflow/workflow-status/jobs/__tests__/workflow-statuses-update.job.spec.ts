import { Test, TestingModule } from '@nestjs/testing';

import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowStatus } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  WorkflowStatusesUpdateJob,
  WorkflowVersionBatchEvent,
  WorkflowVersionEventType,
} from 'src/modules/workflow/workflow-status/jobs/workflow-statuses-update.job';

describe('WorkflowStatusesUpdate', () => {
  let job: WorkflowStatusesUpdateJob;

  const mockWorkflowVersionRepository = {
    find: jest.fn(),
  };

  const mockWorkflowRepository = {
    findOneOrFail: jest.fn(),
    update: jest.fn(),
  };

  const mockTwentyORMManager = {
    getRepository: jest
      .fn()
      .mockImplementation((name) =>
        name === 'workflow'
          ? mockWorkflowRepository
          : mockWorkflowVersionRepository,
      ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowStatusesUpdateJob,
        {
          provide: TwentyORMManager,
          useValue: mockTwentyORMManager,
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
    beforeEach(() => {
      // make twentyORMManager.getRepository return a mock object
      TwentyORMManager.prototype.getRepository = jest.fn();
    });

    describe('when event type is CREATE', () => {
      it('when already a draft, do not change anything', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.CREATE,
          workflowIds: ['1'],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
      });

      it('when no draft yet, update statuses', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.CREATE,
          workflowIds: ['1'],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(1);
      });
    });

    describe('when event type is STATUS_UPDATE', () => {
      test('when status is the same, should not do anything', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              previousStatus: WorkflowVersionStatus.ACTIVE,
              newStatus: WorkflowVersionStatus.ACTIVE,
            },
          ],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
      });

      test('when update that should be impossible, do not do anything', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              previousStatus: WorkflowVersionStatus.ACTIVE,
              newStatus: WorkflowVersionStatus.DRAFT,
            },
          ],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
      });

      test('when WorkflowVersionStatus.DEACTIVATED to WorkflowVersionStatus.ACTIVE, should activate', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              previousStatus: WorkflowVersionStatus.DEACTIVATED,
              newStatus: WorkflowVersionStatus.ACTIVE,
            },
          ],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.DEACTIVATED],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [WorkflowStatus.ACTIVE] },
        );
      });

      test('when WorkflowVersionStatus.ACTIVE to WorkflowVersionStatus.DEACTIVATED, should deactivate', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              previousStatus: WorkflowVersionStatus.ACTIVE,
              newStatus: WorkflowVersionStatus.DEACTIVATED,
            },
          ],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.ACTIVE, WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.find.mockResolvedValue([]);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowVersionRepository.find).toHaveBeenCalledWith({
          where: {
            workflowId: '1',
            status: WorkflowVersionStatus.ACTIVE,
          },
        });
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [WorkflowStatus.DEACTIVATED, WorkflowStatus.DRAFT] },
        );
      });

      test('when WorkflowVersionStatus.DRAFT to WorkflowVersionStatus.ACTIVE, should activate', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.STATUS_UPDATE,
          statusUpdates: [
            {
              workflowId: '1',
              previousStatus: WorkflowVersionStatus.DRAFT,
              newStatus: WorkflowVersionStatus.ACTIVE,
            },
          ],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.find.mockResolvedValue([]);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowVersionRepository.find).toHaveBeenCalledWith({
          where: {
            workflowId: '1',
            status: WorkflowVersionStatus.DRAFT,
          },
        });
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [WorkflowStatus.ACTIVE] },
        );
      });
    });

    describe('when event type is DELETE', () => {
      test('when status is not draft, should not do anything', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.DELETE,
          workflowIds: ['1'],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.ACTIVE],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowRepository.update).toHaveBeenCalledTimes(0);
      });

      test('when status is draft, should delete', async () => {
        // Arrange
        const event: WorkflowVersionBatchEvent = {
          workspaceId: '1',
          type: WorkflowVersionEventType.DELETE,
          workflowIds: ['1'],
        };

        const mockWorkflow = {
          statuses: [WorkflowStatus.DRAFT],
        };

        mockWorkflowRepository.findOneOrFail.mockResolvedValue(mockWorkflow);
        mockWorkflowVersionRepository.find.mockResolvedValue([]);

        // Act
        await job.handle(event);

        // Assert
        expect(mockWorkflowRepository.findOneOrFail).toHaveBeenCalledTimes(1);
        expect(mockWorkflowVersionRepository.find).toHaveBeenCalledWith({
          where: {
            workflowId: '1',
            status: WorkflowVersionStatus.DRAFT,
          },
        });
        expect(mockWorkflowRepository.update).toHaveBeenCalledWith(
          { id: '1' },
          { statuses: [] },
        );
      });
    });
  });
});
