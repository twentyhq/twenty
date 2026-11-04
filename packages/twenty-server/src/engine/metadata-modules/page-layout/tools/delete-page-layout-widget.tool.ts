import { z } from 'zod';

import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const deletePageLayoutWidgetSchema = z.object({
  widgetId: z.string().uuid().describe('The UUID of the widget to delete'),
});

export const createDeletePageLayoutWidgetTool = (
  deps: Pick<PageLayoutToolDependencies, 'pageLayoutWidgetService'>,
  context: PageLayoutToolContext,
) => ({
  name: 'delete_page_layout_widget' as const,
  description: `Delete a widget from a page layout (dashboard or record page). Use get_dashboard or list_record_page_layouts first to find the widgetId. Record-page changes affect the shared layout for that object, not only the currently open record.`,
  inputSchema: deletePageLayoutWidgetSchema,
  execute: async (parameters: { widgetId: string }) => {
    try {
      const widget = await deps.pageLayoutWidgetService.findByIdOrThrow({
        id: parameters.widgetId,
        workspaceId: context.workspaceId,
      });

      await deps.pageLayoutWidgetService.destroy({
        id: parameters.widgetId,
        workspaceId: context.workspaceId,
      });

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
