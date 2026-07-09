import { Test, type TestingModule } from '@nestjs/testing';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';

const mockRepository = {
  count: jest.fn(),
  find: jest.fn(),
  update: jest.fn().mockResolvedValue(undefined),
};

const mockGlobalWorkspaceOrmManager = {
  getRepository: jest.fn().mockResolvedValue(mockRepository),
  executeInWorkspaceContext: jest
    .fn()
    // oxlint-disable-next-line typescript/no-explicit-any
    .mockImplementation((fn: () => any) => fn()),
};

const mockWorkflowThrottlingWorkspaceService = {
  recomputeWorkflowRunNotStartedCount: jest.fn().mockResolvedValue(undefined),
};

// Mirrors QUERY_MAX_RECORDS, the per-batch cap the service applies. Kept as a
// local literal rather than imported from twenty-shared/constants to avoid a
// jest circular-init issue with config-variables loading the same barrel.
const QUERY_MAX_RECORDS = 200;

const buildStaledRuns = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ id: `run-${index}` }));

describe('WorkflowHandleStaledRunsWorkspaceService', () => {
  let service: WorkflowHandleStaledRunsWorkspaceService;

  const workspaceId = 'workspace-1';

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowHandleStaledRunsWorkspaceService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: mockGlobalWorkspaceOrmManager,
        },
        {
          provide: WorkflowThrottlingWorkspaceService,
          useValue: mockWorkflowThrottlingWorkspaceService,
        },
      ],
    }).compile();

    service = module.get<WorkflowHandleStaledRunsWorkspaceService>(
      WorkflowHandleStaledRunsWorkspaceService,
    );
  });

  it('should do nothing when there are no staled runs', async () => {
    mockRepository.count.mockResolvedValueOnce(0);

    await service.handleStaledRunsForWorkspace(workspaceId);

    expect(mockRepository.find).not.toHaveBeenCalled();
    expect(mockRepository.update).not.toHaveBeenCalled();
    expect(
      mockWorkflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount,
    ).not.toHaveBeenCalled();
  });

  it('should reset a single batch and recompute the not-started count once', async () => {
    const staledRuns = buildStaledRuns(3);

    mockRepository.count.mockResolvedValueOnce(3);
    mockRepository.find.mockResolvedValueOnce(staledRuns);

    await service.handleStaledRunsForWorkspace(workspaceId);

    expect(mockRepository.update).toHaveBeenCalledTimes(1);
    expect(mockRepository.update).toHaveBeenCalledWith(
      ['run-0', 'run-1', 'run-2'],
      {
        enqueuedAt: null,
        status: WorkflowRunStatus.NOT_STARTED,
      },
    );
    expect(
      mockWorkflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockWorkflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount,
    ).toHaveBeenCalledWith(workspaceId);
  });

  it('should never fetch more than QUERY_MAX_RECORDS ids per update', async () => {
    mockRepository.count.mockResolvedValueOnce(QUERY_MAX_RECORDS);
    mockRepository.find.mockResolvedValueOnce(
      buildStaledRuns(QUERY_MAX_RECORDS),
    );

    await service.handleStaledRunsForWorkspace(workspaceId);

    expect(mockRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({ take: QUERY_MAX_RECORDS }),
    );
    expect(mockRepository.update.mock.calls[0][0]).toHaveLength(
      QUERY_MAX_RECORDS,
    );
  });

  it('should drain a multi-batch backlog based on the initial count', async () => {
    // 450 staled runs => 3 batches (200, 200, 50)
    mockRepository.count.mockResolvedValueOnce(450);
    mockRepository.find
      .mockResolvedValueOnce(buildStaledRuns(QUERY_MAX_RECORDS))
      .mockResolvedValueOnce(buildStaledRuns(QUERY_MAX_RECORDS))
      .mockResolvedValueOnce(buildStaledRuns(50));

    await service.handleStaledRunsForWorkspace(workspaceId);

    expect(mockRepository.find).toHaveBeenCalledTimes(3);
    expect(mockRepository.update).toHaveBeenCalledTimes(3);
    expect(mockRepository.update.mock.calls[0][0]).toHaveLength(
      QUERY_MAX_RECORDS,
    );
    expect(mockRepository.update.mock.calls[1][0]).toHaveLength(
      QUERY_MAX_RECORDS,
    );
    expect(mockRepository.update.mock.calls[2][0]).toHaveLength(50);

    // Recompute runs exactly once, after the whole backlog is drained
    expect(
      mockWorkflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount,
    ).toHaveBeenCalledTimes(1);
  });
});
