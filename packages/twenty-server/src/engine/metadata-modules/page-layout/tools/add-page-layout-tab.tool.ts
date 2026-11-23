import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PAGE_LAYOUT_TOOL_ACCESS_POLICY } from 'src/engine/metadata-modules/page-layout/tools/constants/page-layout-tool-access-policy.constant';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';

const addPageLayoutTabSchema = z.object({
  pageLayoutId: z
    .string()
    .uuid()
    .describe(
      'Page layout UUID from get_dashboard or list_record_page_layouts',
    ),
  title: z.string().describe('Title for the new tab'),
  position: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      'Tab position (0-based). Defaults to after the last existing tab.',
    ),
});

@DefineTool({
  name: 'add_page_layout_tab',
  description: `Add a new tab to an existing page layout (dashboard or record page).

Use get_dashboard or list_record_page_layouts first to get the pageLayoutId and see existing tabs. Record-page changes affect the shared layout for that object, not only the currently open record.
After creating a tab, use add_page_layout_widget with the returned tab ID to add widgets.`,
  category: ToolCategory.PAGE_LAYOUT,
  accessPolicy: PAGE_LAYOUT_TOOL_ACCESS_POLICY,
  icon: 'IconAppWindow',
})
export class AddPageLayoutTabTool extends BaseTool<
  typeof addPageLayoutTabSchema
> {
  readonly inputSchema = addPageLayoutTabSchema;

  constructor(
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
  ) {
    super();
  }

  async execute({
    input: parameters,
    context,
  }: ToolExecuteArgs<typeof addPageLayoutTabSchema>): Promise<ToolOutput> {
    try {
      const pageLayout = await this.pageLayoutService.findByIdOrThrow({
        id: parameters.pageLayoutId,
        workspaceId: context.workspaceId,
      });

      const existingTabCount = pageLayout.tabs?.length ?? 0;
      const position = parameters.position ?? existingTabCount;

      const tab = await this.pageLayoutTabService.create({
        createPageLayoutTabInput: {
          title: parameters.title,
          pageLayoutId: parameters.pageLayoutId,
          position,
        },
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: `Tab "${parameters.title}" added to page layout`,
        result: {
          pageLayoutTabId: tab.id,
          title: tab.title,
          position: tab.position,
          pageLayoutId: parameters.pageLayoutId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to add tab: ${errorMessage}`,
        error: errorMessage,
      };
    }
  }
}
