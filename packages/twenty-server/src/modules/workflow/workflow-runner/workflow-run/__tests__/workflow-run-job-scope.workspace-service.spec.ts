import { WorkflowRunJobScopeWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-job-scope.workspace-service';

const WORKSPACE_ID = 'workspace-id';
const WORKFLOW_GROUP_LIMITER = {
  key: 'jobGroup:workflow',
  max: 100,
  durationMs: 60_000,
};

const buildService = () => {
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatWorkflowMaps: {
        byUniversalIdentifier: {
          'workflow-a-universal-id': {
            id: 'workflow-a',
            applicationId: 'application-a',
            jobGroupKeys: ['workflow'],
          },
          'workflow-cached-before-job-groups-universal-id': {
            id: 'workflow-cached-before-job-groups',
            applicationId: 'application-a',
          },
          'workflow-without-job-group-universal-id': {
            id: 'workflow-without-job-group',
            applicationId: 'application-a',
            jobGroupKeys: [],
          },
          'workflow-of-uninstalled-application-universal-id': {
            id: 'workflow-of-uninstalled-application',
            applicationId: 'uninstalled-application',
          },
        },
        universalIdentifierById: {
          'workflow-a': 'workflow-a-universal-id',
          'workflow-cached-before-job-groups':
            'workflow-cached-before-job-groups-universal-id',
          'workflow-without-job-group':
            'workflow-without-job-group-universal-id',
          'workflow-of-uninstalled-application':
            'workflow-of-uninstalled-application-universal-id',
        },
        universalIdentifiersByApplicationId: {},
      },
      flatApplicationMaps: {
        byId: {
          'application-a': {
            id: 'application-a',
            universalIdentifier: 'application-a-universal-id',
          },
          'uninstalled-application': {
            id: 'uninstalled-application',
            universalIdentifier: 'uninstalled-application-universal-id',
            deletedAt: '2026-01-01T00:00:00.000Z',
          },
        },
        idByUniversalIdentifier: {},
      },
      jobGroupConfigByKey: {},
    }),
  };
  const workflowRunWorkspaceService = {
    getWorkflowRunCoreWorkflowId: jest.fn().mockResolvedValue('workflow-a'),
  };

  return new WorkflowRunJobScopeWorkspaceService(
    workspaceCacheService as never,
    workflowRunWorkspaceService as never,
  );
};

describe('WorkflowRunJobScopeWorkspaceService', () => {
  it('scopes a run to the application owning its workflow', async () => {
    await expect(
      buildService().resolveForWorkflowRun({
        workspaceId: WORKSPACE_ID,
        workflowRunId: 'run-a',
      }),
    ).resolves.toEqual({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: 'application-a-universal-id',
      limiters: [WORKFLOW_GROUP_LIMITER],
    });
  });

  it('keeps the workflow limiter for a workflow cached before it had job groups', async () => {
    await expect(
      buildService().resolveForCoreWorkflow({
        workspaceId: WORKSPACE_ID,
        coreWorkflowId: 'workflow-cached-before-job-groups',
      }),
    ).resolves.toMatchObject({ limiters: [WORKFLOW_GROUP_LIMITER] });
  });

  it('does not limit a workflow that belongs to no job group', async () => {
    await expect(
      buildService().resolveForCoreWorkflow({
        workspaceId: WORKSPACE_ID,
        coreWorkflowId: 'workflow-without-job-group',
      }),
    ).resolves.toMatchObject({ limiters: [] });
  });

  it.each([
    ['no core workflow', null],
    ['a workflow missing from the cache', 'unknown-workflow'],
    [
      'a workflow of an uninstalled application',
      'workflow-of-uninstalled-application',
    ],
  ])(
    'falls back to the workspace scope for %s',
    async (_case, coreWorkflowId) => {
      await expect(
        buildService().resolveForCoreWorkflow({
          workspaceId: WORKSPACE_ID,
          coreWorkflowId,
        }),
      ).resolves.toMatchObject({
        workspaceId: WORKSPACE_ID,
        isWorkspaceJob: true,
      });
    },
  );
});
