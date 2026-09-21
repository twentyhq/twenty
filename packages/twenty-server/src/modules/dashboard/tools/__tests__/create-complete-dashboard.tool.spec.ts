import { createCreateCompleteDashboardTool } from 'src/modules/dashboard/tools/create-complete-dashboard.tool';
import { type DashboardToolDependencies } from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const WORKSPACE_ID = '20202020-aaaa-4d02-bf25-6aeccf7ea419';
const ROLE_ID = '20202020-bbbb-4d02-bf25-6aeccf7ea419';
const PAGE_LAYOUT_ID = '20202020-cccc-4d02-bf25-6aeccf7ea419';

const buildDeps = ({ insert }: { insert: jest.Mock }) => {
  const destroy = jest.fn().mockResolvedValue(true);

  return {
    destroy,
    deps: {
      pageLayoutService: {
        create: jest.fn().mockResolvedValue({ id: PAGE_LAYOUT_ID }),
        destroy,
      },
      pageLayoutTabService: {
        create: jest.fn().mockResolvedValue({ id: 'tab-id' }),
      },
      recordPositionService: {
        buildRecordPosition: jest.fn().mockResolvedValue(1),
      },
      workspaceOrmManager: {
        executeInWorkspaceContext: jest
          .fn()
          .mockImplementation(async (fn) => fn()),
        getRepository: jest.fn().mockReturnValue({ insert }),
      },
    } as unknown as DashboardToolDependencies,
  };
};

describe('createCreateCompleteDashboardTool', () => {
  it('destroys the page layout when the permission-checked dashboard insert fails', async () => {
    const insert = jest.fn().mockRejectedValue(new Error('Permission denied'));
    const { deps, destroy } = buildDeps({ insert });

    const tool = createCreateCompleteDashboardTool(deps, {
      workspaceId: WORKSPACE_ID,
      rolePermissionConfig: { intersectionOf: [ROLE_ID] },
    });

    const result = await tool.execute({ title: 'Revenue' });

    expect(result.success).toBe(false);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(destroy).toHaveBeenCalledWith({
      id: PAGE_LAYOUT_ID,
      workspaceId: WORKSPACE_ID,
      isLinkedDashboardAlreadyDestroyed: true,
    });
  });

  it('leaves the page layout in place when the dashboard insert succeeds', async () => {
    const insert = jest.fn().mockResolvedValue(undefined);
    const { deps, destroy } = buildDeps({ insert });

    const tool = createCreateCompleteDashboardTool(deps, {
      workspaceId: WORKSPACE_ID,
      rolePermissionConfig: { intersectionOf: [ROLE_ID] },
    });

    const result = await tool.execute({ title: 'Revenue' });

    expect(result.success).toBe(true);
    expect(destroy).not.toHaveBeenCalled();
  });
});
