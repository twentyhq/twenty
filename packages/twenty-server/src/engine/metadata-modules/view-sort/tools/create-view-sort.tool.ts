import { ToolCategory } from 'twenty-shared/ai';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewSortService } from 'src/engine/metadata-modules/view-sort/services/view-sort.service';
import { createViewSortInputSchema } from 'src/engine/metadata-modules/view-sort/tools/schemas/create-view-sort-input.schema';
import { ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';
import { VIEW_SORT_ACCESS_POLICY } from 'src/engine/metadata-modules/view-sort/constants/view-sort-access-policy.constant';

@DefineTool({
  name: 'create_view_sort',
  category: ToolCategory.VIEW,
  accessPolicy: VIEW_SORT_ACCESS_POLICY,
  description:
    'Add a sort to a view. Use get_field_metadata to get fieldMetadataId values.',
})
export class CreateViewSortTool extends BaseTool<
  typeof createViewSortInputSchema
> {
  readonly inputSchema = createViewSortInputSchema;

  constructor(
    private readonly viewSortService: ViewSortService,
    private readonly viewAccessService: ViewAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId, authContext },
  }: ToolExecuteArgs<typeof createViewSortInputSchema>): Promise<ToolOutput> {
    await this.viewAccessService.findModifiableViewOrThrow({
      viewId: input.viewId,
      accessContext: { workspaceId, userWorkspaceId, authContext },
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
