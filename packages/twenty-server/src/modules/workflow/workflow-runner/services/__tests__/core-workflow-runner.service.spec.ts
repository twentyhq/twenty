import { FieldActorSource } from 'twenty-shared/types';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { CoreWorkflowRunnerService } from 'src/modules/workflow/workflow-runner/services/core-workflow-runner.service';
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

  return { runBothWorkflows, messageQueueService, workflowRunWorkspaceService };
};

describe('CoreWorkflowRunnerService', () => {
  it.each([WorkflowTriggerType.MANUAL, WorkflowTriggerType.DATABASE_EVENT])(
    'enqueues each %s run right away, scoped to the application owning its workflow',
    async (triggerType) => {
      const {
        runBothWorkflows,
        messageQueueService,
        workflowRunWorkspaceService,
      } = buildService(triggerType);

      await runBothWorkflows();

      expect(
        workflowRunWorkspaceService.createCoreWorkflowRun.mock.calls.map(
          ([{ status }]) => status,
        ),
      ).toEqual([WorkflowRunStatus.ENQUEUED, WorkflowRunStatus.ENQUEUED]);
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
    },
  );
});
