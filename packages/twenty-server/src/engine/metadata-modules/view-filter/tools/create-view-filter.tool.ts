import { ToolCategory } from 'twenty-shared/ai';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { createViewFilterInputSchema } from 'src/engine/metadata-modules/view-filter/tools/schemas/create-view-filter-input.schema';
import { ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';
import { VIEW_FILTER_ACCESS_POLICY } from 'src/engine/metadata-modules/view-filter/constants/view-filter-access-policy.constant';

@DefineTool({
  name: 'create_view_filter',
  category: ToolCategory.VIEW,
  accessPolicy: VIEW_FILTER_ACCESS_POLICY,
  description:
    'Add a filter to a view. Use get_field_metadata to get fieldMetadataId values.',
})
export class CreateViewFilterTool extends BaseTool<
  typeof createViewFilterInputSchema
> {
  readonly inputSchema = createViewFilterInputSchema;

  constructor(
    private readonly viewFilterService: ViewFilterService,
    private readonly viewAccessService: ViewAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId, authContext },
  }: ToolExecuteArgs<typeof createViewFilterInputSchema>): Promise<ToolOutput> {
    await this.viewAccessService.findModifiableViewOrThrow({
      viewId: input.viewId,
      accessContext: { workspaceId, userWorkspaceId, authContext },
    });

    const filter = await this.viewFilterService.createOne({
      createViewFilterInput: {
        viewId: input.viewId,
        fieldMetadataId: input.fieldMetadataId,
        operand: input.operand,
        value: input.value,
        subFieldName: input.subFieldName,
      },
      workspaceId,
    });

    return {
      success: true,
      message: `View filter ${filter.id} created`,
      result: {
        id: filter.id,
        viewId: filter.viewId,
        fieldMetadataId: filter.fieldMetadataId,
        operand: filter.operand,
        value: filter.value,
      },
    };
  }
}
