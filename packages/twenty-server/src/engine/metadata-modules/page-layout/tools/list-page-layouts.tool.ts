import { z } from 'zod';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { pageLayoutTypeSchema } from 'src/engine/metadata-modules/page-layout/tools/schemas/page-layout-type.schema';
import { type PageLayoutToolContext } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-context.type';
import { type PageLayoutToolDependencies } from 'src/engine/metadata-modules/page-layout/tools/types/page-layout-tool-dependencies.type';

const listPageLayoutsSchema = z.object({
  type: pageLayoutTypeSchema
    .optional()
    .describe(
      'Filter by layout type (RECORD_PAGE, RECORD_INDEX, STANDALONE_PAGE, DASHBOARD).',
    ),
  objectMetadataId: z
    .string()
    .uuid()
    .optional()
    .describe('Filter to layouts attached to a specific object.'),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(50)
    .describe('Maximum number of layouts to return (default 50).'),
});

type ListPageLayoutsParams = z.infer<typeof listPageLayoutsSchema>;

export const createListPageLayoutsTool = (
  deps: Pick<PageLayoutToolDependencies, 'pageLayoutService'>,
  context: PageLayoutToolContext,
) => ({
  name: 'list_page_layouts' as const,
  description: `List page layouts in the workspace. Returns metadata only; use get_page_layout to fetch tabs and widgets.

Page layout types:
- RECORD_PAGE: the detail page shown when opening a single record.
- RECORD_INDEX: the index/list page for an object.
- STANDALONE_PAGE: a free-standing page.
- DASHBOARD: layouts backing a dashboard (prefer the dashboard tools for these).`,
  inputSchema: listPageLayoutsSchema,
  execute: async (parameters: ListPageLayoutsParams) => {
    try {
      const layouts = await deps.pageLayoutService.findBy({
        workspaceId: context.workspaceId,
        filter: {
          objectMetadataId: parameters.objectMetadataId,
          pageLayoutType: parameters.type as PageLayoutType | undefined,
        },
      });

      const limit = parameters.limit ?? 50;
      const limited = layouts.slice(0, limit);

      return {
        success: true,
        message: `Found ${limited.length} page layout(s)`,
        result: {
          layouts: limited.map((layout) => ({
            id: layout.id,
            name: layout.name,
            type: layout.type,
            objectMetadataId: layout.objectMetadataId,
            tabCount: layout.tabs?.length ?? 0,
          })),
          count: limited.length,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to list page layouts: ${message}`,
        error: message,
      };
    }
  },
});
