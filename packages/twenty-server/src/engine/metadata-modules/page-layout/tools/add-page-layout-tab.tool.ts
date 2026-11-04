import { z } from 'zod';

import {
  type PageLayoutToolContext,
  type PageLayoutToolDependencies,
} from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

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

export const createAddPageLayoutTabTool = (
  deps: Pick<
    PageLayoutToolDependencies,
    'pageLayoutTabService' | 'pageLayoutService'
  >,
  context: PageLayoutToolContext,
) => ({
  name: 'add_page_layout_tab' as const,
  description: `Add a new tab to an existing page layout (dashboard or record page).

Use get_dashboard or list_record_page_layouts first to get the pageLayoutId and see existing tabs. Record-page changes affect the shared layout for that object, not only the currently open record.
After creating a tab, use add_page_layout_widget with the returned tab ID to add widgets.`,
  inputSchema: addPageLayoutTabSchema,
  execute: async (parameters: {
    pageLayoutId: string;
    title: string;
    position?: number;
  }) => {
    try {
      const pageLayout = await deps.pageLayoutService.findByIdOrThrow({
        id: parameters.pageLayoutId,
        workspaceId: context.workspaceId,
      });

      const existingTabCount = pageLayout.tabs?.length ?? 0;
      const position = parameters.position ?? existingTabCount;

      const tab = await deps.pageLayoutTabService.create({
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
  },
});
