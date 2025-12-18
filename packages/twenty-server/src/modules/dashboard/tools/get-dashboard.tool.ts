import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const getDashboardSchema = z.object({
  dashboardId: z.string().uuid().describe('The UUID of the dashboard to fetch'),
});

export const createGetDashboardTool = (
  deps: Pick<
    DashboardToolDependencies,
    'pageLayoutService' | 'globalWorkspaceOrmManager'
  >,
  context: DashboardToolContext,
) => ({
  name: 'get_dashboard' as const,
  description: `Get a dashboard with its full layout structure including tabs and widgets.`,
  inputSchema: getDashboardSchema,
  execute: async (parameters: { dashboardId: string }) => {
    try {
      const authContext = buildSystemAuthContext(context.workspaceId);

      const dashboard =
        await deps.globalWorkspaceOrmManager.executeInWorkspaceContext(
          authContext,
          async () => {
            const repo = await deps.globalWorkspaceOrmManager.getRepository(
              context.workspaceId,
              'dashboard',
              { shouldBypassPermissionChecks: true },
            );

            return repo.findOne({ where: { id: parameters.dashboardId } });
          },
        );

      if (!isDefined(dashboard)) {
        return {
          success: false,
          message: `Dashboard "${parameters.dashboardId}" not found`,
          error: 'DASHBOARD_NOT_FOUND',
        };
      }

      if (!isDefined(dashboard.pageLayoutId)) {
        return {
          success: false,
          message: `Dashboard "${dashboard.title}" has no page layout`,
          error: 'PAGE_LAYOUT_NOT_FOUND',
        };
      }

      const pageLayout = await deps.pageLayoutService.findByIdOrThrow(
        dashboard.pageLayoutId,
        context.workspaceId,
      );

      const tabs =
        pageLayout.tabs?.map((tab) => ({
          id: tab.id,
          title: tab.title,
          position: tab.position,
          widgets:
            tab.widgets?.map((w) => ({
              id: w.id,
              title: w.title,
              type: w.type,
              gridPosition: w.gridPosition,
              objectMetadataId: w.objectMetadataId,
              configuration: w.configuration,
            })) ?? [],
        })) ?? [];

      return {
        success: true,
        message: `Retrieved dashboard "${dashboard.title}" with ${tabs.length} tab(s)`,
        result: {
          dashboard: {
            id: dashboard.id,
            title: dashboard.title,
            pageLayoutId: dashboard.pageLayoutId,
            createdAt: dashboard.createdAt,
            updatedAt: dashboard.updatedAt,
          },
          layout: { id: pageLayout.id, name: pageLayout.name, tabs },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to get dashboard: ${error.message}`,
        error: error.message,
      };
    }
  },
});
