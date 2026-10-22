import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';

const deleteViewFilterInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view filter to delete'),
});

@DefineTool({
  name: 'delete_view_filter',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Remove a filter from a view. Use get_view_filters to find the filter ID.',
})
export class DeleteViewFilterTool extends BaseTool<
  typeof deleteViewFilterInputSchema
> {
  readonly inputSchema = deleteViewFilterInputSchema;

  constructor(private readonly viewFilterService: ViewFilterService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof deleteViewFilterInputSchema>): Promise<ToolOutput> {
    const filter = await this.viewFilterService.deleteOne({
      deleteViewFilterInput: { id: input.id },
      workspaceId,
    });

    return {
      success: true,
      message: `View filter ${filter.id} deleted`,
      result: { id: filter.id, deleted: true },
    };
  }
}
