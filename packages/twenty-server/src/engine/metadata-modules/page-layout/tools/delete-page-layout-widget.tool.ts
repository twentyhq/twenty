import { z } from 'zod';

import { type PageLayoutToolContext } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-context.type';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const deletePageLayoutWidgetSchema = z.object({
  widgetId: z.string().uuid().describe('Id of the widget to delete'),
});

type DeletePageLayoutWidgetParams = z.infer<
  typeof deletePageLayoutWidgetSchema
>;

export const createDeletePageLayoutWidgetTool = (
  deps: Pick<PageLayoutToolDependencies, 'pageLayoutWidgetService'>,
  context: PageLayoutToolContext,
) => ({
  name: 'delete_page_layout_widget' as const,
  description: `Delete a widget from a page layout.`,
  inputSchema: deletePageLayoutWidgetSchema,
  execute: async (parameters: DeletePageLayoutWidgetParams) => {
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
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to delete widget: ${message}`,
        error: message,
      };
    }
  },
});
