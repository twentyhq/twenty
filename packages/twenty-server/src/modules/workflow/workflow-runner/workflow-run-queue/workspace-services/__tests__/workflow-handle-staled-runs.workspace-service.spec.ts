import { Test, type TestingModule } from '@nestjs/testing';

import { StepStatus } from 'twenty-shared/workflow';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

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

const mockWorkflowRunWorkspaceService = {
  endWorkflowRun: jest.fn().mockResolvedValue(undefined),
  getWorkflowRunOrFail: jest.fn(),
};

const mockMessageQueueService = {
  getInFlightJobs: jest.fn().mockResolvedValue([]),
};

const mockMetricsService = {
  incrementCounterForEvent: jest.fn().mockResolvedValue(undefined),
};

const mockCacheStorageService = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue(undefined),
};

// Mirrors QUERY_MAX_RECORDS, the per-batch cap the service applies. Kept as a
// local literal rather than imported from twenty-shared/constants to avoid a
// jest circular-init issue with config-variables loading the same barrel.
const QUERY_MAX_RECORDS = 200;

const buildStaledRuns = (count: number, startIndex = 0) =>
  Array.from({ length: count }, (_, index) => ({
    id: `run-${startIndex + index}`,
  }));

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
        {
          provide: WorkflowRunWorkspaceService,
          useValue: mockWorkflowRunWorkspaceService,
        },
        {
          provide: `MESSAGE_QUEUE_${MessageQueue.workflowQueue}`,
          useValue: mockMessageQueueService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
        {
          provide: CacheStorageNamespace.ModuleWorkflow,
          useValue: mockCacheStorageService,
        },
      ],
    }).compile();

    mockWorkflowRunWorkspaceService.endWorkflowRun
      .mockReset()
      .mockResolvedValue(undefined);
    mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockReset();
    mockMessageQueueService.getInFlightJobs.mockReset().mockResolvedValue([]);
    mockCacheStorageService.get.mockReset().mockResolvedValue(undefined);
    mockCacheStorageService.set.mockReset().mockResolvedValue(undefined);

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

  describe('handleStuckStoppingRunsForWorkspace', () => {
    it('should do nothing when there are no stuck stopping runs', async () => {
      mockRepository.find.mockResolvedValueOnce([]);

      await service.handleStuckStoppingRunsForWorkspace(workspaceId);

      expect(
        mockWorkflowRunWorkspaceService.endWorkflowRun,
      ).not.toHaveBeenCalled();
    });

    it('should finalize each stuck stopping run to STOPPED', async () => {
      mockRepository.find.mockResolvedValueOnce(buildStaledRuns(3));

      await service.handleStuckStoppingRunsForWorkspace(workspaceId);

      expect(
        mockWorkflowRunWorkspaceService.endWorkflowRun,
      ).toHaveBeenCalledTimes(3);
      expect(
        mockWorkflowRunWorkspaceService.endWorkflowRun,
      ).toHaveBeenCalledWith({
        workflowRunId: 'run-0',
        workspaceId,
        status: WorkflowRunStatus.STOPPED,
      });
    });

    it('should page through a multi-page backlog until a short page', async () => {
      mockRepository.find
        .mockResolvedValueOnce(buildStaledRuns(QUERY_MAX_RECORDS))
        .mockResolvedValueOnce(
          buildStaledRuns(QUERY_MAX_RECORDS, QUERY_MAX_RECORDS),
        )
        .mockResolvedValueOnce(buildStaledRuns(50, 2 * QUERY_MAX_RECORDS));

      await service.handleStuckStoppingRunsForWorkspace(workspaceId);

      expect(mockRepository.find).toHaveBeenCalledTimes(3);
      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: QUERY_MAX_RECORDS }),
      );
      expect(
        mockWorkflowRunWorkspaceService.endWorkflowRun,
      ).toHaveBeenCalledTimes(2 * QUERY_MAX_RECORDS + 50);
    });

    it('should keep finalizing remaining runs when one fails', async () => {
      mockRepository.find.mockResolvedValueOnce(buildStaledRuns(3));
      mockWorkflowRunWorkspaceService.endWorkflowRun
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValue(undefined);

      await service.handleStuckStoppingRunsForWorkspace(workspaceId);

      expect(
        mockWorkflowRunWorkspaceService.endWorkflowRun,
      ).toHaveBeenCalledTimes(3);
    });

    it('should advance past a fully failed page instead of starving later runs', async () => {
      mockRepository.find
        .mockResolvedValueOnce(buildStaledRuns(QUERY_MAX_RECORDS))
        .mockResolvedValueOnce(buildStaledRuns(50, QUERY_MAX_RECORDS));
      // Whole first page fails, later runs still get finalized
      mockWorkflowRunWorkspaceService.endWorkflowRun.mockImplementation(
        ({ workflowRunId }: { workflowRunId: string }) => {
          const index = Number(workflowRunId.replace('run-', ''));

          return index < QUERY_MAX_RECORDS
            ? Promise.reject(new Error('boom'))
            : Promise.resolve(undefined);
        },
      );

      await service.handleStuckStoppingRunsForWorkspace(workspaceId);

      expect(mockRepository.find).toHaveBeenCalledTimes(2);
      expect(
        mockWorkflowRunWorkspaceService.endWorkflowRun,
      ).toHaveBeenCalledTimes(QUERY_MAX_RECORDS + 50);
      expect(
        mockWorkflowRunWorkspaceService.endWorkflowRun,
      ).toHaveBeenCalledWith({
        workflowRunId: `run-${QUERY_MAX_RECORDS}`,
        workspaceId,
        status: WorkflowRunStatus.STOPPED,
      });
    });
  });

  describe('handleStuckRunningRunsForWorkspace', () => {
    const buildRunningWorkflowRun = ({
      id = 'run-0',
      steps,
      stepInfos,
    }: {
      id?: string;
      // oxlint-disable-next-line typescript/no-explicit-any
      steps: any[];
      // oxlint-disable-next-line typescript/no-explicit-any
      stepInfos: Record<string, any>;
    }) => ({
      id,
      status: WorkflowRunStatus.RUNNING,
      updatedAt: '2026-07-15T00:00:00.000Z',
      state: { flow: { steps }, stepInfos },
    });

    const expectNoWorkflowRunEnded = () => {
      expect(
        mockWorkflowRunWorkspaceService.endWorkflowRun,
      ).not.toHaveBeenCalled();
    };

    it('should do nothing when there are no stuck running nor flagged runs', async () => {
      mockRepository.find.mockResolvedValueOnce([]);

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(mockMessageQueueService.getInFlightJobs).not.toHaveBeenCalled();
      expect(mockCacheStorageService.set).not.toHaveBeenCalled();
      expectNoWorkflowRunEnded();
    });

    it('should not flag runs that still have an in-flight job matched by id prefix', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'run-0' }]);
      mockMessageQueueService.getInFlightJobs.mockResolvedValueOnce([
        { id: 'run-0-8a521c10-92b1-4013-a4a7-71f20b1a4a4a', data: {} },
      ]);

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(
        mockWorkflowRunWorkspaceService.getWorkflowRunOrFail,
      ).not.toHaveBeenCalled();
      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        {},
      );
      expectNoWorkflowRunEnded();
    });

    it('should not flag runs whose pre-deploy job is matched by job data', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'run-0' }]);
      mockMessageQueueService.getInFlightJobs.mockResolvedValueOnce([
        { id: '12345', data: { workspaceId, workflowRunId: 'run-0' } },
      ]);

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(
        mockWorkflowRunWorkspaceService.getWorkflowRunOrFail,
      ).not.toHaveBeenCalled();
      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        {},
      );
      expectNoWorkflowRunEnded();
    });

    it('should flag a run with an orphaned running step without ending it', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'run-0' }]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValueOnce(
        buildRunningWorkflowRun({
          steps: [{ id: 'step-1', type: 'CODE', nextStepIds: [] }],
          stepInfos: { 'step-1': { status: StepStatus.RUNNING } },
        }),
      );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(mockMetricsService.incrementCounterForEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.WorkflowRunStuckRunningDetected,
        }),
      );
      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        { 'run-0': expect.any(String) },
      );
      expectNoWorkflowRunEnded();
    });

    it('should not flag runs waiting on a pending step', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'run-0' }]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValueOnce(
        buildRunningWorkflowRun({
          steps: [{ id: 'step-1', type: 'DELAY', nextStepIds: [] }],
          stepInfos: { 'step-1': { status: StepStatus.PENDING } },
        }),
      );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(
        mockMetricsService.incrementCounterForEvent,
      ).not.toHaveBeenCalled();
      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        {},
      );
      expectNoWorkflowRunEnded();
    });

    it('should flag a run with a failed branch even when another branch is pending', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'run-0' }]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValueOnce(
        buildRunningWorkflowRun({
          steps: [
            { id: 'step-1', type: 'CODE', nextStepIds: [] },
            { id: 'step-2', type: 'DELAY', nextStepIds: [] },
          ],
          stepInfos: {
            'step-1': { status: StepStatus.FAILED },
            'step-2': { status: StepStatus.PENDING },
          },
        }),
      );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(mockMetricsService.incrementCounterForEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.WorkflowRunStuckRunningDetected,
        }),
      );
      expectNoWorkflowRunEnded();
    });

    it('should flag a run whose job was lost between two steps', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'run-0' }]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValueOnce(
        buildRunningWorkflowRun({
          steps: [
            { id: 'step-1', type: 'CODE', nextStepIds: ['step-2'] },
            { id: 'step-2', type: 'CODE', nextStepIds: [] },
          ],
          stepInfos: {
            'step-1': { status: StepStatus.SUCCESS },
            'step-2': { status: StepStatus.NOT_STARTED },
          },
        }),
      );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(mockMetricsService.incrementCounterForEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.WorkflowRunStuckRunningDetected,
        }),
      );
      expectNoWorkflowRunEnded();
    });

    it('should not flag runs that progressed since the query', async () => {
      mockRepository.find.mockResolvedValueOnce([{ id: 'run-0' }]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValueOnce(
        {
          id: 'run-0',
          status: WorkflowRunStatus.COMPLETED,
        },
      );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(
        mockMetricsService.incrementCounterForEvent,
      ).not.toHaveBeenCalled();
      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        {},
      );
      expectNoWorkflowRunEnded();
    });

    it('should keep a still-stuck flagged run without counting it again', async () => {
      mockCacheStorageService.get.mockResolvedValueOnce({
        'run-0': '2026-07-16T00:00:00.000Z',
      });
      mockRepository.find.mockResolvedValueOnce([{ id: 'run-0' }]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValueOnce(
        buildRunningWorkflowRun({
          steps: [{ id: 'step-1', type: 'CODE', nextStepIds: [] }],
          stepInfos: { 'step-1': { status: StepStatus.RUNNING } },
        }),
      );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(
        mockMetricsService.incrementCounterForEvent,
      ).not.toHaveBeenCalled();
      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        { 'run-0': '2026-07-16T00:00:00.000Z' },
      );
      expectNoWorkflowRunEnded();
    });

    it('should record a false positive when a flagged run ended on its own', async () => {
      mockCacheStorageService.get.mockResolvedValueOnce({
        'run-0': '2026-07-16T00:00:00.000Z',
      });
      mockRepository.find.mockResolvedValueOnce([]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValueOnce(
        {
          id: 'run-0',
          status: WorkflowRunStatus.COMPLETED,
        },
      );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(mockMetricsService.incrementCounterForEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.WorkflowRunStuckRunningFalsePositive,
        }),
      );
      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        {},
      );
      expectNoWorkflowRunEnded();
    });

    it('should record a false positive when a flagged run got a new queue job', async () => {
      mockCacheStorageService.get.mockResolvedValueOnce({
        'run-0': '2026-07-16T00:00:00.000Z',
      });
      mockRepository.find.mockResolvedValueOnce([]);
      mockMessageQueueService.getInFlightJobs.mockResolvedValueOnce([
        { id: 'run-0-8a521c10-92b1-4013-a4a7-71f20b1a4a4a', data: {} },
      ]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail.mockResolvedValueOnce(
        buildRunningWorkflowRun({
          steps: [{ id: 'step-1', type: 'CODE', nextStepIds: [] }],
          stepInfos: { 'step-1': { status: StepStatus.RUNNING } },
        }),
      );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(mockMetricsService.incrementCounterForEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.WorkflowRunStuckRunningFalsePositive,
        }),
      );
      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        {},
      );
      expectNoWorkflowRunEnded();
    });

    it('should keep checking remaining runs when one check fails', async () => {
      mockRepository.find.mockResolvedValueOnce([
        { id: 'run-0' },
        { id: 'run-1' },
      ]);
      mockWorkflowRunWorkspaceService.getWorkflowRunOrFail
        .mockRejectedValueOnce(new Error('boom'))
        .mockResolvedValueOnce(
          buildRunningWorkflowRun({
            id: 'run-1',
            steps: [{ id: 'step-1', type: 'CODE', nextStepIds: [] }],
            stepInfos: { 'step-1': { status: StepStatus.RUNNING } },
          }),
        );

      await service.handleStuckRunningRunsForWorkspace(workspaceId);

      expect(mockCacheStorageService.set).toHaveBeenCalledWith(
        expect.any(String),
        { 'run-1': expect.any(String) },
      );
      expectNoWorkflowRunEnded();
    });
  });
});
