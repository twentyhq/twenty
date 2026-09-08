import { createListDashboardsTool } from 'src/modules/dashboard/tools/list-dashboards.tool';
import { type DashboardToolDependencies } from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const ROLE_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';

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
  it('reads dashboards through the caller role rather than bypassing permissions', async () => {
    const { deps, getRepository } = buildDeps();

    const tool = createListDashboardsTool(deps, {
      workspaceId: WORKSPACE_ID,
      rolePermissionConfig: { intersectionOf: [ROLE_ID] },
    });

    const result = await tool.execute({});

    expect(result.success).toBe(true);
    expect(getRepository).toHaveBeenCalledWith('dashboard', {
      intersectionOf: [ROLE_ID],
    });
  });
});
