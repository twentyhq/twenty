import { z } from 'zod';

import { type PageLayoutToolContext } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-context.type';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const getPageLayoutSchema = z.object({
  pageLayoutId: z.string().uuid().describe('The id of the page layout'),
});

type GetPageLayoutParams = z.infer<typeof getPageLayoutSchema>;

export const createGetPageLayoutTool = (
  deps: Pick<PageLayoutToolDependencies, 'pageLayoutService'>,
  context: PageLayoutToolContext,
) => ({
  name: 'get_page_layout' as const,
  description: `Fetch a page layout with the full tree of tabs and widgets. Use this before adding to or modifying an existing layout so you know its current structure.`,
  inputSchema: getPageLayoutSchema,
  execute: async (parameters: GetPageLayoutParams) => {
    try {
      const layout = await deps.pageLayoutService.findByIdOrThrow({
        id: parameters.pageLayoutId,
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: `Page layout ${layout.id}`,
        result: {
          id: layout.id,
          name: layout.name,
          type: layout.type,
          objectMetadataId: layout.objectMetadataId,
          tabs:
            layout.tabs?.map((tab) => ({
              id: tab.id,
              title: tab.title,
              position: tab.position,
              layoutMode: tab.layoutMode,
              widgets:
                tab.widgets?.map((widget) => ({
                  id: widget.id,
                  title: widget.title,
                  type: widget.type,
                  objectMetadataId: widget.objectMetadataId,
                  position: widget.position ?? null,
                  gridPosition: widget.gridPosition,
                  configuration: widget.configuration,
                })) ?? [],
            })) ?? [],
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to get page layout: ${message}`,
        error: message,
      };
    }
  },
});
