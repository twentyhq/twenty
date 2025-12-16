import { z } from 'zod';

import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const deleteDashboardWidgetSchema = z.object({
  widgetId: z.string().uuid().describe('The UUID of the widget to delete'),
});

export const createDeleteDashboardWidgetTool = (
  deps: Pick<DashboardToolDependencies, 'pageLayoutWidgetService'>,
  context: DashboardToolContext,
) => ({
  name: 'delete_dashboard_widget' as const,
  description: `Delete a widget from a dashboard. Use get_dashboard first to find the widgetId.`,
  inputSchema: deleteDashboardWidgetSchema,
  execute: async (parameters: { widgetId: string }) => {
    try {
      const widget = await deps.pageLayoutWidgetService.findByIdOrThrow(
        parameters.widgetId,
        context.workspaceId,
      );

      await deps.pageLayoutWidgetService.destroy(
        parameters.widgetId,
        context.workspaceId,
      );

      return {
        success: true,
        message: `Widget "${widget.title}" deleted`,
        result: {
          deletedWidgetId: parameters.widgetId,
          deletedWidgetTitle: widget.title,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete widget: ${error.message}`,
        error: error.message,
      };
    }
  },
});
