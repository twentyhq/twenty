import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AggregateOperations } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';

export const createViewFieldInputSchema = z.object({
  viewId: z.string().uuid().describe('The ID of the view to add the field to.'),
  fieldMetadataId: z
    .uuid()
    .describe(
      'The ID of the field metadata to add. Use get_field_metadata to find available fields.',
    ),
  isVisible: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether the field is visible in the view.'),
  size: z
    .number()
    .int()
    .optional()
    .default(150)
    .describe('Column width in pixels.'),
  position: z
    .number()
    .optional()
    .default(0)
    .describe('Position of the field in the view (0-based).'),
  aggregateOperation: z
    .enum(AggregateOperations)
    .optional()
    .describe(
      'Aggregate operation for this field (e.g., "SUM", "AVG", "COUNT").',
    ),
});

@DefineTool({
  name: 'create_view_field',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Add a new column to a view. View fields define which columns are shown in table or kanban views. First call get_field_metadata to find the fieldMetadataId of the column to add, and get_views to find the target viewId.',
})
export class CreateViewFieldTool extends BaseTool<
  typeof createViewFieldInputSchema
> {
  readonly inputSchema = createViewFieldInputSchema;

  constructor(private readonly viewFieldService: ViewFieldService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof createViewFieldInputSchema>): Promise<ToolOutput> {
    const viewField = await this.viewFieldService.createOne({
      createViewFieldInput: {
        viewId: input.viewId,
        fieldMetadataId: input.fieldMetadataId,
        isVisible: input.isVisible,
        size: input.size,
        position: input.position,
        aggregateOperation: input.aggregateOperation,
      },
      workspaceId,
    });

    return {
      success: true,
      message: `View field ${viewField.id} created`,
      result: {
        id: viewField.id,
        fieldMetadataId: viewField.fieldMetadataId,
        viewId: viewField.viewId,
        isVisible: viewField.isVisible,
        size: viewField.size,
        position: viewField.position,
        aggregateOperation: viewField.aggregateOperation,
      },
    };
  }
}
