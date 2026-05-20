import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { z } from 'zod';

import { pageLayoutTabLayoutModeSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/page-layout-widget.schema';
import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const addPageLayoutTabSchema = z.object({
  pageLayoutId: z
    .string()
    .uuid()
    .describe('Id of the parent page layout (from list_page_layouts)'),
  title: z.string().describe('Tab title'),
  position: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe('Position among tabs (defaults to after the last)'),
  layoutMode: pageLayoutTabLayoutModeSchema
    .optional()
    .describe('Tab layout mode (defaults to GRID)'),
});

type AddPageLayoutTabParams = z.infer<typeof addPageLayoutTabSchema>;

export const createAddPageLayoutTabTool = (
  deps: Pick<
    PageLayoutToolDependencies,
    'pageLayoutTabService' | 'pageLayoutService'
  >,
  context: PageLayoutToolContext,
) => ({
  name: 'add_page_layout_tab' as const,
  description: `Add a new tab to an existing page layout. After creating, use add_page_layout_widget with the returned tab id.`,
  inputSchema: addPageLayoutTabSchema,
  execute: async (parameters: AddPageLayoutTabParams) => {
    try {
      const layout = await deps.pageLayoutService.findByIdOrThrow({
        id: parameters.pageLayoutId,
        workspaceId: context.workspaceId,
      });
      const existingCount = layout.tabs?.length ?? 0;

      const tab = await deps.pageLayoutTabService.create({
        createPageLayoutTabInput: {
          pageLayoutId: parameters.pageLayoutId,
          title: parameters.title,
          position: parameters.position ?? existingCount,
          layoutMode:
            (parameters.layoutMode as PageLayoutTabLayoutMode | undefined) ??
            undefined,
        },
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: `Tab "${tab.title}" added`,
        result: {
          pageLayoutTabId: tab.id,
          title: tab.title,
          position: tab.position,
          pageLayoutId: parameters.pageLayoutId,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to add tab: ${message}`,
        error: message,
      };
    }
  },
});
