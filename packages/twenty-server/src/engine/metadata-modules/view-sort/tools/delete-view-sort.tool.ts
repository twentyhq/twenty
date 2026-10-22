import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';

const deleteViewSortInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view sort to delete'),
});

@DefineTool({
  name: 'delete_view_sort',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Remove a sort from a view. Use get_view_sorts to find the sort ID.',
})
export class DeleteViewSortTool extends BaseTool<
  typeof deleteViewSortInputSchema
> {
  readonly inputSchema = deleteViewSortInputSchema;

  constructor(private readonly viewSortService: ViewSortService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof deleteViewSortInputSchema>): Promise<ToolOutput> {
    const sort = await this.viewSortService.deleteOne({
      deleteViewSortInput: { id: input.id },
      workspaceId,
    });

    return {
      success: true,
      message: `View sort ${sort.id} deleted`,
      result: { id: sort.id, deleted: true },
    };
  }
}
