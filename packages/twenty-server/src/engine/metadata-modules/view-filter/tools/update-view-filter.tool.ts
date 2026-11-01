import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewFilterOperand } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFilterService } from 'src/engine/metadata-modules/view-filter/services/view-filter.service';

const updateViewFilterInputSchema = z.object({
  id: z.string().uuid().describe('ID of the view filter to update'),
  operand: z.enum(ViewFilterOperand).optional().describe('New filter operator'),
  value: z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(z.string()),
      z.record(z.string(), z.unknown()),
    ])
    .optional()
    .describe(
      'New filter value. Use array of option values for SELECT/MULTI_SELECT (e.g. ["OPTION_1"]).',
    ),
  subFieldName: z
    .string()
    .optional()
    .describe('New sub-field name for composite fields'),
});

@DefineTool({
  name: 'update_view_filter',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Update a filter on a view. Use get_view_filters to find the filter ID.',
})
export class UpdateViewFilterTool extends BaseTool<
  typeof updateViewFilterInputSchema
> {
  readonly inputSchema = updateViewFilterInputSchema;

  constructor(private readonly viewFilterService: ViewFilterService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof updateViewFilterInputSchema>): Promise<ToolOutput> {
    const filter = await this.viewFilterService.updateOne({
      updateViewFilterInput: {
        id: input.id,
        update: {
          operand: input.operand,
          value: input.value,
          subFieldName: input.subFieldName,
        },
      },
      workspaceId,
    });

    return {
      success: true,
      message: `View filter ${filter.id} updated`,
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
