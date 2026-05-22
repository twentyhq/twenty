import { z } from 'zod';

import { type PageLayoutToolContext } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-context.type';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const deletePageLayoutSchema = z.object({
  pageLayoutId: z.string().uuid().describe('Id of the page layout to delete'),
});

type DeletePageLayoutParams = z.infer<typeof deletePageLayoutSchema>;

export const createDeletePageLayoutTool = (
  deps: Pick<PageLayoutToolDependencies, 'pageLayoutService'>,
  context: PageLayoutToolContext,
) => ({
  name: 'delete_page_layout' as const,
  description: `Delete a page layout. Removes all of its tabs and widgets as well.`,
  inputSchema: deletePageLayoutSchema,
  execute: async (parameters: DeletePageLayoutParams) => {
    try {
      const layout = await deps.pageLayoutService.findByIdOrThrow({
        id: parameters.pageLayoutId,
        workspaceId: context.workspaceId,
      });

      await deps.pageLayoutService.destroy({
        id: parameters.pageLayoutId,
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: `Page layout "${layout.name}" deleted`,
        result: { deletedId: layout.id, deletedName: layout.name },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to delete page layout: ${message}`,
        error: message,
      };
    }
  },
});
