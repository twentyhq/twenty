import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { createListDashboardsTool } from 'src/modules/dashboard/tools/list-dashboards.tool';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
} as WorkspaceAuthContext;

const buildDependencies = () => {
  const getRepository = jest.fn().mockReturnValue({
    find: jest.fn().mockResolvedValue([]),
  });

  return {
    getRepository,
    dependencies: {
      workspaceOrmManager: {
        executeInWorkspaceContext: jest
          .fn()
          .mockImplementation(async (fn) => fn()),
        getRepository,
      },
    },
  };
};

describe('createListDashboardsTool', () => {
  it('reads dashboards as the caller rather than bypassing permissions', async () => {
    const { dependencies, getRepository } = buildDependencies();

    const tool = createListDashboardsTool({
      dependencies,
      context: {
        workspaceId: WORKSPACE_ID,
        authContext: AUTH_CONTEXT,
      },
    });

    const result = await tool.execute({});

    expect(result.success).toBe(true);
    expect(getRepository).toHaveBeenCalledTimes(1);
    expect(getRepository).toHaveBeenCalledWith('dashboard');
    expect(
      dependencies.workspaceOrmManager.executeInWorkspaceContext,
    ).toHaveBeenCalledWith(expect.any(Function), AUTH_CONTEXT);
  });
});
