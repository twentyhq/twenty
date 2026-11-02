import { FieldActorSource } from 'twenty-shared/types';

import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
import { WorkflowRunEnqueueJob } from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-run-enqueue.job';
import { WorkflowRunJobScopeWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-job-scope.workspace-service';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const WORKSPACE_ID = 'workspace-id';

const WORKFLOWS = {
  'workflow-a': { id: 'workflow-a', applicationId: 'application-a' },
  'workflow-b': { id: 'workflow-b', applicationId: 'application-b' },
};

const buildService = (triggerType: WorkflowTriggerType) => {
  const messageQueueService = { add: jest.fn() };
  const workflowRunWorkspaceService = {
    createCoreWorkflowRun: jest
      .fn()
      .mockImplementation(
        async ({ coreWorkflowId }: { coreWorkflowId: string }) =>
          `run-of-${coreWorkflowId}`,
      ),
  };
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
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

  const service = new CoreWorkflowRunnerService(
    {
      findCoreWorkflowById: jest
        .fn()
        .mockImplementation(
          async (_workspaceId, coreWorkflowId: keyof typeof WORKFLOWS) => ({
            ...WORKFLOWS[coreWorkflowId],
            workspaceWorkflowId: null,
            name: coreWorkflowId,
          }),
        ),
    } as never,
    {
      findCoreVersionById: jest
        .fn()
        .mockImplementation(async (_workspaceId, versionId: string) => ({
          id: versionId,
          coreWorkflowId: versionId.replace('version-of-', ''),
          workflowId: null,
          workspaceWorkflowVersionId: null,
          triggers: [{ type: triggerType }],
          steps: [],
        })),
    } as never,
    workflowRunWorkspaceService as never,
    {
      getSubscriptionInactiveReason: jest.fn().mockResolvedValue(undefined),
    } as never,
    {
      throttleOrThrowIfHardLimitReached: jest.fn(),
      increaseWorkflowRunNotStartedCount: jest.fn(),
    } as never,
    {} as never,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          workspaceCustomFlatApplication: { id: 'workspace-custom-app' },
        }),
    } as never,
    new WorkflowRunJobScopeWorkspaceService(
      workspaceCacheService as never,
      {} as never,
    ),
    messageQueueService as never,
  );

  const runBothWorkflows = async () => {
    for (const coreWorkflowId of Object.keys(WORKFLOWS)) {
      await service.run({
        workspaceId: WORKSPACE_ID,
        coreWorkflowVersionId: `version-of-${coreWorkflowId}`,
        payload: {},
        source: {
          source: FieldActorSource.MANUAL,
          name: 'Tim',
          workspaceMemberId: null,
          context: {},
        },
      });
    }
  };

  return { runBothWorkflows, messageQueueService };
};

describe('CoreWorkflowRunnerService', () => {
  it('scopes the run job of each workflow to the application owning it', async () => {
    const { runBothWorkflows, messageQueueService } = buildService(
      WorkflowTriggerType.MANUAL,
    );

    await runBothWorkflows();

    expect(messageQueueService.add.mock.calls).toEqual([
      [
        RUN_WORKFLOW_JOB_NAME,
        { workspaceId: WORKSPACE_ID, workflowRunId: 'run-of-workflow-a' },
        {
          id: 'run-of-workflow-a',
          doNotCheckDuplicatesBasedOnPrefix: true,
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'application-a-universal-id',
        },
      ],
      [
        RUN_WORKFLOW_JOB_NAME,
        { workspaceId: WORKSPACE_ID, workflowRunId: 'run-of-workflow-b' },
        {
          id: 'run-of-workflow-b',
          doNotCheckDuplicatesBasedOnPrefix: true,
          workspaceId: WORKSPACE_ID,
          applicationUniversalIdentifier: 'application-b-universal-id',
        },
      ],
    ]);
  });

  it('keeps the workspace dispatcher of queued runs out of any application scope', async () => {
    const { runBothWorkflows, messageQueueService } = buildService(
      WorkflowTriggerType.DATABASE_EVENT,
    );

    await runBothWorkflows();

    expect(messageQueueService.add.mock.calls).toEqual([
      [
        WorkflowRunEnqueueJob.name,
        { workspaceId: WORKSPACE_ID, isCacheMode: true },
        { workspaceId: WORKSPACE_ID, isWorkspaceJob: true },
      ],
      [
        WorkflowRunEnqueueJob.name,
        { workspaceId: WORKSPACE_ID, isCacheMode: true },
        { workspaceId: WORKSPACE_ID, isWorkspaceJob: true },
      ],
    ]);
  });
});
