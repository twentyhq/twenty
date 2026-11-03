import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { createListDashboardsTool } from 'src/modules/dashboard/tools/list-dashboards.tool';
import { type DashboardToolDependencies } from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const AUTH_CONTEXT = {
  type: 'user',
  workspace: { id: WORKSPACE_ID },
} as WorkspaceAuthContext;

const buildDeps = () => {
  const getRepository = jest.fn().mockReturnValue({
    find: jest.fn().mockResolvedValue([]),
  });

  return {
    getRepository,
    deps: {
      workspaceOrmManager: {
        executeInWorkspaceContext: jest
          .fn()
          .mockImplementation(async (fn) => fn()),
        getRepository,
      },
    } as unknown as Pick<DashboardToolDependencies, 'workspaceOrmManager'>,
  };
};

describe('createListDashboardsTool', () => {
  it('reads dashboards as the caller rather than bypassing permissions', async () => {
    const { deps, getRepository } = buildDeps();

    const tool = createListDashboardsTool(deps, {
      workspaceId: WORKSPACE_ID,
      authContext: AUTH_CONTEXT,
    });

    const result = await tool.execute({});

    expect(result.success).toBe(true);
    expect(getRepository).toHaveBeenCalledTimes(1);
    expect(getRepository).toHaveBeenCalledWith('dashboard');
    expect(
      deps.workspaceOrmManager.executeInWorkspaceContext,
    ).toHaveBeenCalledWith(expect.any(Function), AUTH_CONTEXT);
  });
});
