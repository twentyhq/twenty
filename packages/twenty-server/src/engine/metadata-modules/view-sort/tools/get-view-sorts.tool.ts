import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';

const getViewSortsInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe('ID of the view to list sorts for. Obtain this from get_views.'),
});

@DefineTool({
  name: 'get_view_sorts',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [],
  description:
    'List all sorts applied to a view. Each sort defines a field and direction that determines the order records appear in the view.',
})
export class GetViewSortsTool extends BaseTool<typeof getViewSortsInputSchema> {
  readonly inputSchema = getViewSortsInputSchema;

  constructor(private readonly viewSortService: ViewSortService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof getViewSortsInputSchema>): Promise<ToolOutput> {
    const sorts = await this.viewSortService.findByViewId(
      workspaceId,
      input.viewId,
    );

    return {
      success: true,
      message: `Found ${sorts.length} view sort(s)`,
      result: {
        viewSorts: sorts.map((sort) => ({
          id: sort.id,
          viewId: sort.viewId,
          fieldMetadataId: sort.fieldMetadataId,
          direction: sort.direction,
        })),
      },
    };
  }
}
