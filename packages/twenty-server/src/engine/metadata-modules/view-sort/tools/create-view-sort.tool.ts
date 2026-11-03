import { ToolCategory } from 'twenty-shared/ai';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { createViewSortInputSchema } from 'src/engine/metadata-modules/view-sort/tools/schemas/create-view-sort-input.schema';
import { ViewToolAccessService } from 'src/engine/metadata-modules/view/tools/services/view-tool-access.service';
import { VIEW_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/view/constants/view-write-access-policy.constant';

@DefineTool({
  name: 'create_view_sort',
  category: ToolCategory.VIEW,
  accessPolicy: VIEW_WRITE_ACCESS_POLICY,
  description:
    'Add a sort to a view. Use get_field_metadata to get fieldMetadataId values.',
})
export class CreateViewSortTool extends BaseTool<
  typeof createViewSortInputSchema
> {
  readonly inputSchema = createViewSortInputSchema;

  constructor(
    private readonly viewSortService: ViewSortService,
    private readonly viewToolAccessService: ViewToolAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof createViewSortInputSchema>): Promise<ToolOutput> {
    await this.viewToolAccessService.findViewEditableByUserOrThrow({
      viewId: input.viewId,
      workspaceId,
      userWorkspaceId,
      operation: 'update',
    });

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
