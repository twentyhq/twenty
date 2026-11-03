import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';

const WORKSPACE_ID = 'workspace-id';

const buildService = ({
  staledRuns,
  inFlightJobs,
}: {
  staledRuns: { id: string; coreWorkflowId: string | null }[];
  inFlightJobs: { id?: string; data: { workflowRunId?: string } }[];
}) => {
  const workflowRunRepository = {
    find: jest.fn().mockResolvedValueOnce(staledRuns).mockResolvedValue([]),
    update: jest.fn(),
  };
  const messageQueueService = {
    add: jest.fn(),
    getInFlightJobs: jest.fn().mockResolvedValue(inFlightJobs),
  };

  const service = new WorkflowHandleStaledRunsWorkspaceService(
    {
      executeInWorkspaceContext: jest.fn().mockImplementation((work) => work()),
      getRepositoryWithoutPermissionChecks: jest
        .fn()
        .mockReturnValue(workflowRunRepository),
    } as never,
    {} as never,
    {
      getCoreWorkflowJobScopeResolver: jest
        .fn()
        .mockResolvedValue((coreWorkflowId: string | null) =>
          coreWorkflowId === 'workflow-of-app'
            ? {
                workspaceId: WORKSPACE_ID,
                applicationUniversalIdentifier: 'app-universal-id',
              }
            : { workspaceId: WORKSPACE_ID, isWorkspaceJob: true },
        ),
    } as never,
    messageQueueService as never,
    {} as never,
    {} as never,
  );

  return { service, workflowRunRepository, messageQueueService };
};

describe('WorkflowHandleStaledRunsWorkspaceService', () => {
  it('gives a new job to the staled runs whose job is gone and leaves the waiting ones alone', async () => {
    const { service, workflowRunRepository, messageQueueService } =
      buildService({
        staledRuns: [
          { id: 'lost-run', coreWorkflowId: 'workflow-of-app' },
          { id: 'never-enqueued-run', coreWorkflowId: null },
          { id: 'waiting-run', coreWorkflowId: 'workflow-of-app' },
          { id: 'resuming-run', coreWorkflowId: null },
        ],
        inFlightJobs: [
          {
            id: 'waiting-run-123e4567-e89b-12d3-a456-426614174000',
            data: { workflowRunId: 'waiting-run' },
          },
          { id: 'delayed-job', data: { workflowRunId: 'resuming-run' } },
        ],
      });

    await service.handleStaledRunsForWorkspace(WORKSPACE_ID);

    expect(workflowRunRepository.update).toHaveBeenCalledTimes(1);
    expect(workflowRunRepository.update).toHaveBeenCalledWith(
      ['lost-run', 'never-enqueued-run'],
      { status: WorkflowRunStatus.ENQUEUED, enqueuedAt: expect.any(String) },
    );
    expect(messageQueueService.add.mock.calls).toEqual([
      [
        RUN_WORKFLOW_JOB_NAME,
        { workflowRunId: 'lost-run', workspaceId: WORKSPACE_ID },
        {
          id: 'lost-run',
          doNotCheckDuplicatesBasedOnPrefix: true,
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'app-universal-id',
        },
      ],
      [
        RUN_WORKFLOW_JOB_NAME,
        { workflowRunId: 'never-enqueued-run', workspaceId: WORKSPACE_ID },
        {
          id: 'never-enqueued-run',
          doNotCheckDuplicatesBasedOnPrefix: true,
          workspaceId: WORKSPACE_ID,
          isWorkspaceJob: true,
        },
      ],
    ]);
  });

  it('touches nothing when every staled run still has a job', async () => {
    const { service, workflowRunRepository, messageQueueService } =
      buildService({
        staledRuns: [{ id: 'waiting-run', coreWorkflowId: null }],
        inFlightJobs: [{ data: { workflowRunId: 'waiting-run' } }],
      });

    await service.handleStaledRunsForWorkspace(WORKSPACE_ID);

    expect(workflowRunRepository.update).not.toHaveBeenCalled();
    expect(messageQueueService.add).not.toHaveBeenCalled();
  });
});
