import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { createViewSortInputSchema } from 'src/engine/metadata-modules/view-sort/tools/schemas/create-view-sort-input.schema';

@DefineTool({
  name: 'create_view_sort',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Add a sort to a view. Use get_field_metadata to get fieldMetadataId values.',
})
export class CreateViewSortTool extends BaseTool<
  typeof createViewSortInputSchema
> {
  readonly inputSchema = createViewSortInputSchema;

  constructor(private readonly viewSortService: ViewSortService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof createViewSortInputSchema>): Promise<ToolOutput> {
    const sort = await this.viewSortService.createOne({
      createViewSortInput: {
        viewId: input.viewId,
        fieldMetadataId: input.fieldMetadataId,
        direction: input.direction,
      },
      workspaceId,
    });

    return {
      success: true,
      message: `View sort ${sort.id} created`,
      result: {
        id: sort.id,
        viewId: sort.viewId,
        fieldMetadataId: sort.fieldMetadataId,
        direction: sort.direction,
      },
    };
  }
}
