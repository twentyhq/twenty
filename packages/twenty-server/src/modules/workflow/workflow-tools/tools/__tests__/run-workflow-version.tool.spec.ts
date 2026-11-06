import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

import { createRunWorkflowVersionTool } from '../run-workflow-version.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const CUSTOM_APPLICATION_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';
const USER_WORKSPACE_ID = '20202020-dddd-4d02-bf25-6aeccf7ea419';
const WORKFLOW_VERSION_ID = '20202020-eeee-4d02-bf25-6aeccf7ea419';
const WORKFLOW_RUN_ID = '20202020-ffff-4d02-bf25-6aeccf7ea419';

const WORKSPACE_MEMBER = {
  id: '20202020-1111-4d02-bf25-6aeccf7ea419',
  name: { firstName: 'Ada', lastName: 'Lovelace' },
};

const USER_AUTH_CONTEXT = {
  type: 'user',
  workspace: {
    id: WORKSPACE_ID,
    workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
  },
  workspaceMember: WORKSPACE_MEMBER,
} as unknown as WorkspaceAuthContext;

const buildDeps = (
  runAsWorkspaceMember: jest.Mock = jest
    .fn()
    .mockResolvedValue({ workflowRunId: WORKFLOW_RUN_ID }),
) => ({
  coreWorkflowVersionRunService: {
    runAsWorkspaceMember,
  } as never,
});

describe('run_workflow_version tool', () => {
  it('should run the version as the calling workspace member', async () => {
    const runAsWorkspaceMember = jest
      .fn()
      .mockResolvedValue({ workflowRunId: WORKFLOW_RUN_ID });
    const tool = createRunWorkflowVersionTool(buildDeps(runAsWorkspaceMember), {
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      authContext: USER_AUTH_CONTEXT,
    });

    const result = await tool.execute({
      coreWorkflowVersionId: WORKFLOW_VERSION_ID,
      payload: { properties: { after: { name: 'Acme' } } },
    });

    expect(runAsWorkspaceMember).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
      callerApplication: undefined,
      workspaceMember: WORKSPACE_MEMBER,
      coreWorkflowVersionId: WORKFLOW_VERSION_ID,
      payload: { properties: { after: { name: 'Acme' } } },
    });
    expect(result).toMatchObject({
      success: true,
      workflowRunId: WORKFLOW_RUN_ID,
    });
  });

  it('should refuse callers that are not a workspace member', async () => {
    const runAsWorkspaceMember = jest.fn();
    const tool = createRunWorkflowVersionTool(buildDeps(runAsWorkspaceMember), {
      workspaceId: WORKSPACE_ID,
      authContext: {
        type: 'apiKey',
        workspace: { id: WORKSPACE_ID },
      } as unknown as WorkspaceAuthContext,
    });

    const result = await tool.execute({
      coreWorkflowVersionId: WORKFLOW_VERSION_ID,
    });

    expect(runAsWorkspaceMember).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
  });

  it('should return the error when the run is refused', async () => {
    const tool = createRunWorkflowVersionTool(
      buildDeps(
        jest.fn().mockRejectedValue(new Error('Workflow version not found')),
      ),
      {
        workspaceId: WORKSPACE_ID,
        userWorkspaceId: USER_WORKSPACE_ID,
        authContext: USER_AUTH_CONTEXT,
      },
    );

    const result = await tool.execute({
      coreWorkflowVersionId: WORKFLOW_VERSION_ID,
    });

    expect(result).toMatchObject({
      success: false,
      error: 'Workflow version not found',
    });
  });
});
