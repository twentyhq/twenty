import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { WorkflowRunEnqueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-enqueue.workspace-service';
import { WorkflowRunJobScopeWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-job-scope.workspace-service';

const WORKSPACE_ID = 'workspace-id';

const buildFlatWorkflowMaps = (
  workflows: { id: string; applicationId: string }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    workflows.map((workflow) => [`${workflow.id}-universal-id`, workflow]),
  ),
  universalIdentifierById: Object.fromEntries(
    workflows.map((workflow) => [workflow.id, `${workflow.id}-universal-id`]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildService = (
  runs: { id: string; coreWorkflowId: string | null }[],
) => {
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatWorkflowMaps: buildFlatWorkflowMaps([
        { id: 'workflow-a', applicationId: 'application-a' },
        { id: 'workflow-b', applicationId: 'application-b' },
      ]),
      flatApplicationMaps: {
        byId: {
          'application-a': {
            id: 'application-a',
            universalIdentifier: 'application-a-universal-id',
          },
          'application-b': {
            id: 'application-b',
            universalIdentifier: 'application-b-universal-id',
          },
        },
        idByUniversalIdentifier: {},
      },
    }),
  };
  const workflowRunRepository = {
    find: jest.fn().mockResolvedValueOnce(runs).mockResolvedValue([]),
    update: jest.fn(),
  };
  const workflowThrottlingWorkspaceService = {
    acquireWorkflowEnqueueLock: jest.fn().mockResolvedValue('lock-token'),
    releaseWorkflowEnqueueLock: jest.fn(),
    getNotStartedRunsCountFromCache: jest.fn().mockResolvedValue(runs.length),
    consumeRemainingRunsToEnqueueCount: jest
      .fn()
      .mockImplementation(async (_workspaceId, count: number) => count),
    decreaseWorkflowRunNotStartedCount: jest.fn(),
  };
  const messageQueueService = { add: jest.fn() };

  const service = new WorkflowRunEnqueueWorkspaceService(
    workflowThrottlingWorkspaceService as never,
    {
      executeInWorkspaceContext: jest.fn().mockImplementation((work) => work()),
      getRepository: jest.fn().mockReturnValue(workflowRunRepository),
    } as never,
    messageQueueService as never,
    { incrementCounterForEvent: jest.fn() } as never,
    new WorkflowRunJobScopeWorkspaceService(
      workspaceCacheService as never,
      {} as never,
    ),
  );

  return { service, messageQueueService, workspaceCacheService };
};

describe('WorkflowRunEnqueueWorkspaceService', () => {
  it('scopes each run job to the application owning its workflow', async () => {
    const { service, messageQueueService, workspaceCacheService } =
      buildService([
        { id: 'run-a', coreWorkflowId: 'workflow-a' },
        { id: 'run-b', coreWorkflowId: 'workflow-b' },
      ]);

    await service.enqueueRunsForWorkspace({
      workspaceId: WORKSPACE_ID,
      isCacheMode: true,
    });

    expect(workspaceCacheService.getOrRecompute).toHaveBeenCalledTimes(1);
    expect(messageQueueService.add).toHaveBeenCalledWith(
      RUN_WORKFLOW_JOB_NAME,
      { workflowRunId: 'run-a', workspaceId: WORKSPACE_ID },
      {
        id: 'run-a',
        doNotCheckDuplicatesBasedOnPrefix: true,
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: 'application-a-universal-id',
      },
    );
    expect(messageQueueService.add).toHaveBeenCalledWith(
      RUN_WORKFLOW_JOB_NAME,
      { workflowRunId: 'run-b', workspaceId: WORKSPACE_ID },
      {
        id: 'run-b',
        doNotCheckDuplicatesBasedOnPrefix: true,
        workspaceId: WORKSPACE_ID,
        applicationUniversalIdentifier: 'application-b-universal-id',
      },
    );
  });

  it('falls back to the workspace scope for a run whose workflow cannot be resolved', async () => {
    const { service, messageQueueService } = buildService([
      { id: 'run-without-workflow', coreWorkflowId: null },
      { id: 'run-of-deleted-workflow', coreWorkflowId: 'deleted-workflow' },
    ]);

    await service.enqueueRunsForWorkspace({
      workspaceId: WORKSPACE_ID,
      isCacheMode: true,
    });

    expect(
      messageQueueService.add.mock.calls.map(([, , options]) => options),
    ).toEqual([
      {
        id: 'run-without-workflow',
        doNotCheckDuplicatesBasedOnPrefix: true,
        workspaceId: WORKSPACE_ID,
        isWorkspaceJob: true,
      },
      {
        id: 'run-of-deleted-workflow',
        doNotCheckDuplicatesBasedOnPrefix: true,
        workspaceId: WORKSPACE_ID,
        isWorkspaceJob: true,
      },
    ]);
  });
});
