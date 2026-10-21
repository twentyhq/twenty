import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';
import { createViewFilterInputSchema } from 'src/engine/metadata-modules/view-filter/tools/schemas/create-view-filter-input.schema';

const createManyViewFiltersInputSchema = z.object({
  filters: z
    .array(createViewFilterInputSchema)
    .min(1)
    .max(20)
    .describe('Array of filters to create (1-20 items)'),
});

@DefineTool({
  name: 'create_many_view_filters',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Add multiple filters to a view in one call. Use get_field_metadata to get fieldMetadataId values.',
})
export class CreateManyViewFiltersTool extends BaseTool<
  typeof createManyViewFiltersInputSchema
> {
  readonly inputSchema = createManyViewFiltersInputSchema;

  constructor(private readonly viewFilterService: ViewFilterService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof createManyViewFiltersInputSchema
  >): Promise<ToolOutput> {
    const results = [];

    for (const filterInput of input.filters) {
      const filter = await this.viewFilterService.createOne({
        createViewFilterInput: {
          viewId: filterInput.viewId,
          fieldMetadataId: filterInput.fieldMetadataId,
          operand: filterInput.operand,
          value: filterInput.value,
          subFieldName: filterInput.subFieldName,
        },
        workspaceId,
      });

      results.push({
        id: filter.id,
        viewId: filter.viewId,
        fieldMetadataId: filter.fieldMetadataId,
        operand: filter.operand,
      });
    }

    return {
      success: true,
      message: `Created ${results.length} view filter(s)`,
      result: { created: results },
    };
  }
}
