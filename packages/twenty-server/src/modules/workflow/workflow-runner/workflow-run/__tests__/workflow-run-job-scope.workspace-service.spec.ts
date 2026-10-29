import { WorkflowRunJobScopeWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-job-scope.workspace-service';

const WORKSPACE_ID = 'workspace-id';

const buildService = () => {
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue({
      flatWorkflowMaps: {
        byUniversalIdentifier: {
          'workflow-a-universal-id': {
            id: 'workflow-a',
            applicationId: 'application-a',
          },
          'workflow-of-uninstalled-application-universal-id': {
            id: 'workflow-of-uninstalled-application',
            applicationId: 'uninstalled-application',
          },
        },
        universalIdentifierById: {
          'workflow-a': 'workflow-a-universal-id',
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
    });
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
      ).resolves.toEqual({ workspaceId: WORKSPACE_ID, isWorkspaceJob: true });
    },
  );

  it('falls back to the workspace scope for an unknown application', async () => {
    await expect(
      buildService().resolveForApplication({
        workspaceId: WORKSPACE_ID,
        applicationId: 'unknown-application',
      }),
    ).resolves.toEqual({ workspaceId: WORKSPACE_ID, isWorkspaceJob: true });
  });
});
