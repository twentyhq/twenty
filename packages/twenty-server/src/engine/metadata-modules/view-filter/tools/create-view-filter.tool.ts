import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { createViewFilterInputSchema } from 'src/engine/metadata-modules/view-filter/tools/schemas/create-view-filter-input.schema';

@DefineTool({
  name: 'create_view_filter',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Add a filter to a view. Use get_field_metadata to get fieldMetadataId values.',
})
export class CreateViewFilterTool extends BaseTool<
  typeof createViewFilterInputSchema
> {
  readonly inputSchema = createViewFilterInputSchema;

  constructor(private readonly viewFilterService: ViewFilterService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof createViewFilterInputSchema>): Promise<ToolOutput> {
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
