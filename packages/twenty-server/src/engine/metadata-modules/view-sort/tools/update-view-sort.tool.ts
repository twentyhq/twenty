import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewSortDirection } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';

const updateViewSortInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view sort to update'),
  direction: z
    .enum(ViewSortDirection)
    .optional()
    .describe('New sort direction: ASC or DESC'),
});

@DefineTool({
  name: 'update_view_sort',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Update a sort on a view. Use get_view_sorts to find the sort ID.',
})
export class UpdateViewSortTool extends BaseTool<
  typeof updateViewSortInputSchema
> {
  readonly inputSchema = updateViewSortInputSchema;

  constructor(private readonly viewSortService: ViewSortService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof updateViewSortInputSchema>): Promise<ToolOutput> {
    const sort = await this.viewSortService.updateOne({
      updateViewSortInput: {
        id: input.id,
        update: {
          direction: input.direction,
        },
      },
      workspaceId,
    });

    return {
      success: true,
      message: `View sort ${sort.id} updated`,
      result: {
        id: sort.id,
        viewId: sort.viewId,
        fieldMetadataId: sort.fieldMetadataId,
        direction: sort.direction,
      },
    };
  }
}
