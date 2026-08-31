import { Test, type TestingModule } from '@nestjs/testing';

import { WorkflowVersionStatus as CoreWorkflowVersionStatus } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowVersionStatus } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';
import { WorkflowTriggerJob } from 'src/modules/workflow/workflow-trigger/jobs/workflow-trigger.job';

describe('WorkflowTriggerJob', () => {
  let job: WorkflowTriggerJob;

  const mockWorkflowRepository = {
    findOneBy: jest.fn(),
  };
  const mockWorkspaceOrmManager = {
    getRepository: jest.fn().mockReturnValue(mockWorkflowRepository),
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((fn: () => unknown) => fn()),
  };
  const mockWorkflowCommonWorkspaceService = {
    getWorkflowVersionOrFail: jest.fn(),
  };
  const mockWorkflowRunnerWorkspaceService = {
    run: jest.fn(),
  };
  const mockWorkflowCoreSyncService = {
    findCoreWorkflowById: jest.fn(),
  };
  const mockWorkflowVersionCoreSyncService = {
    findCoreVersionById: jest.fn(),
  };
  const mockExceptionHandlerService = {
    captureExceptions: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowTriggerJob,
        { provide: WorkspaceOrmManager, useValue: mockWorkspaceOrmManager },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: mockWorkflowCommonWorkspaceService,
        },
        {
          provide: WorkflowRunnerWorkspaceService,
          useValue: mockWorkflowRunnerWorkspaceService,
        },
        {
          provide: WorkflowCoreSyncService,
          useValue: mockWorkflowCoreSyncService,
        },
        {
          provide: WorkflowVersionCoreSyncService,
          useValue: mockWorkflowVersionCoreSyncService,
        },
        {
          provide: ExceptionHandlerService,
          useValue: mockExceptionHandlerService,
        },
      ],
    }).compile();

    job = await module.resolve<WorkflowTriggerJob>(WorkflowTriggerJob);
  });

  const coreJobData = {
    workspaceId: 'workspace-1',
    workflowId: 'workspace-workflow-1',
    coreWorkflowId: 'core-workflow-1',
    coreWorkflowVersionId: 'core-version-1',
    workspaceWorkflowVersionId: 'workspace-version-1',
    payload: { recordId: 'record-1' },
  };

  it('should run from core ids without touching the workspace workflow', async () => {
    mockWorkflowVersionCoreSyncService.findCoreVersionById.mockResolvedValue({
      id: 'core-version-1',
      status: CoreWorkflowVersionStatus.ACTIVE,
    });
    mockWorkflowCommonWorkspaceService.getWorkflowVersionOrFail.mockResolvedValue(
      {
        id: 'workspace-version-1',
        status: WorkflowVersionStatus.ACTIVE,
      },
    );
    mockWorkflowCoreSyncService.findCoreWorkflowById.mockResolvedValue({
      id: 'core-workflow-1',
      name: 'Core name',
    });

    await job.handle(coreJobData);

    expect(mockWorkflowRunnerWorkspaceService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: 'workspace-1',
        workflowVersionId: 'workspace-version-1',
        payload: { recordId: 'record-1' },
        source: expect.objectContaining({ name: 'Core name' }),
      }),
    );
    expect(mockWorkflowRepository.findOneBy).not.toHaveBeenCalled();
  });

  it('should not run when the core version is not active', async () => {
    mockWorkflowVersionCoreSyncService.findCoreVersionById.mockResolvedValue({
      id: 'core-version-1',
      status: CoreWorkflowVersionStatus.DEACTIVATED,
    });

    await job.handle(coreJobData);

    expect(mockWorkflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  it('should not run when the core version is missing', async () => {
    mockWorkflowVersionCoreSyncService.findCoreVersionById.mockResolvedValue(
      null,
    );

    await job.handle(coreJobData);

    expect(mockWorkflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  it('should not run when the workspace twin of an active core version is not active', async () => {
    mockWorkflowVersionCoreSyncService.findCoreVersionById.mockResolvedValue({
      id: 'core-version-1',
      status: CoreWorkflowVersionStatus.ACTIVE,
    });
    mockWorkflowCommonWorkspaceService.getWorkflowVersionOrFail.mockResolvedValue(
      {
        id: 'workspace-version-1',
        status: WorkflowVersionStatus.DEACTIVATED,
      },
    );

    await job.handle(coreJobData);

    expect(mockWorkflowRunnerWorkspaceService.run).not.toHaveBeenCalled();
  });

  it('should fall back to the workspace path when only part of the core ids are present', async () => {
    mockWorkflowRepository.findOneBy.mockResolvedValue({
      id: 'workspace-workflow-1',
      name: 'Workspace name',
      lastPublishedVersionId: 'workspace-version-1',
    });
    mockWorkflowCommonWorkspaceService.getWorkflowVersionOrFail.mockResolvedValue(
      {
        id: 'workspace-version-1',
        status: WorkflowVersionStatus.ACTIVE,
      },
    );

    await job.handle({
      ...coreJobData,
      coreWorkflowId: null,
    });

    expect(
      mockWorkflowVersionCoreSyncService.findCoreVersionById,
    ).not.toHaveBeenCalled();
    expect(mockWorkflowRunnerWorkspaceService.run).toHaveBeenCalledWith(
      expect.objectContaining({ workflowVersionId: 'workspace-version-1' }),
    );
  });

  it('should fall back to the workspace path when core ids are absent', async () => {
    mockWorkflowRepository.findOneBy.mockResolvedValue({
      id: 'workspace-workflow-1',
      name: 'Workspace name',
      lastPublishedVersionId: 'workspace-version-1',
    });
    mockWorkflowCommonWorkspaceService.getWorkflowVersionOrFail.mockResolvedValue(
      {
        id: 'workspace-version-1',
        status: WorkflowVersionStatus.ACTIVE,
      },
    );

    await job.handle({
      workspaceId: 'workspace-1',
      workflowId: 'workspace-workflow-1',
      payload: {},
    });

    expect(mockWorkflowRunnerWorkspaceService.run).toHaveBeenCalledWith(
      expect.objectContaining({
        workflowVersionId: 'workspace-version-1',
        source: expect.objectContaining({ name: 'Workspace name' }),
      }),
    );
    expect(
      mockWorkflowVersionCoreSyncService.findCoreVersionById,
    ).not.toHaveBeenCalled();
  });
});
