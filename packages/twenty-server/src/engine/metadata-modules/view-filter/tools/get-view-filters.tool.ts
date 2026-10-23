import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';

const getViewFiltersInputSchema = z.object({
  viewId: z
    .string()
    .uuid()
    .describe(
      'ID of the view to list filters for. Obtain this from get_views.',
    ),
});

@DefineTool({
  name: 'get_view_filters',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [],
  description:
    'List all filters applied to a view. Each filter defines a condition that records must match to appear in the view.',
})
export class GetViewFiltersTool extends BaseTool<
  typeof getViewFiltersInputSchema
> {
  readonly inputSchema = getViewFiltersInputSchema;

  constructor(private readonly viewFilterService: ViewFilterService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof getViewFiltersInputSchema>): Promise<ToolOutput> {
    const filters = await this.viewFilterService.findByViewId(
      workspaceId,
      input.viewId,
    );

    return {
      success: true,
      message: `Found ${filters.length} view filter(s)`,
      result: {
        viewFilters: filters.map((filter) => ({
          id: filter.id,
          viewId: filter.viewId,
          fieldMetadataId: filter.fieldMetadataId,
          operand: filter.operand,
          value: filter.value,
          subFieldName: filter.subFieldName,
          positionInViewFilterGroup: filter.positionInViewFilterGroup,
        })),
      },
    };
  }
}
