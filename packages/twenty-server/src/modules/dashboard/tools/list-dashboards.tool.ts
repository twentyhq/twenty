import { z } from 'zod';

import {
  type DashboardToolContextWithPermissions,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const listDashboardsSchema = z.object({
  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .describe('Maximum number of dashboards to return (default: 20, max: 100)'),
});

export const createListDashboardsTool = (
  deps: {
    workspaceOrmManager: Pick<
      DashboardToolDependencies['workspaceOrmManager'],
      'executeInWorkspaceContext' | 'getRepository'
    >;
  },
  context: DashboardToolContextWithPermissions,
) => ({
  name: 'list_dashboards' as const,
  description: `List all dashboards in the workspace. Use get_dashboard to retrieve full layout structure.`,
  inputSchema: listDashboardsSchema,
  execute: async (parameters: { limit?: number }) => {
    try {
      const limit = parameters.limit ?? 20;

      const dashboards =
        await deps.workspaceOrmManager.executeInWorkspaceContext(async () => {
          const repo = deps.workspaceOrmManager.getRepository('dashboard');

          return repo.find({ take: limit, order: { position: 'ASC' } });
        }, context.authContext);

      const dashboardList = dashboards.map((d) => ({
        id: d.id,
        title: d.title,
        pageLayoutId: d.pageLayoutId,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));

      return {
        success: true,
        message: `Found ${dashboardList.length} dashboard(s)`,
        result: { dashboards: dashboardList, count: dashboardList.length },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to list dashboards: ${error.message}`,
        error: error.message,
      };
    }
  },
});
