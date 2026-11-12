import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PAGE_LAYOUT_TOOL_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/tools/constants/page-layout-tool-access-policy.constant';
import { PageLayoutWidgetService } from 'src/engine/metadata-modules/page-layout-widget/services/page-layout-widget.service';

const deletePageLayoutWidgetSchema = z.object({
  widgetId: z.string().uuid().describe('The UUID of the widget to delete'),
});

@DefineTool({
  name: 'delete_page_layout_widget',
  description: `Delete a widget from a page layout (dashboard or record page). Use get_dashboard or list_record_page_layouts first to find the widgetId. Record-page changes affect the shared layout for that object, not only the currently open record.`,
  category: ToolCategory.PAGE_LAYOUT,
  accessPolicy: PAGE_LAYOUT_TOOL_ACCESS_POLICY,
  icon: 'IconAppWindow',
})
export class DeletePageLayoutWidgetTool extends BaseTool<
  typeof deletePageLayoutWidgetSchema
> {
  readonly inputSchema = deletePageLayoutWidgetSchema;

  constructor(
    private readonly pageLayoutWidgetService: PageLayoutWidgetService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<
    typeof deletePageLayoutWidgetSchema
  >): Promise<ToolOutput> {
    try {
      const widget = await this.pageLayoutWidgetService.findByIdOrThrow({
        id: parameters.widgetId,
        workspaceId: context.workspaceId,
      });

      await this.pageLayoutWidgetService.destroy({
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
  }
}
