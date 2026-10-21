import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { createViewFieldInputSchema } from 'src/engine/metadata-modules/view-field/tools/schemas/create-view-field-input.schema';

const createManyViewFieldsInputSchema = z.object({
  viewFields: z
    .array(createViewFieldInputSchema)
    .min(1)
    .max(50)
    .describe('Array of view fields to create (1-50 items).'),
});

@DefineTool({
  name: 'create_many_view_fields',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Add multiple columns to a view at once. More efficient than calling create_view_field multiple times. Each item follows the same schema as create_view_field. All view fields can target the same or different views.',
})
export class CreateManyViewFieldsTool extends BaseTool<
  typeof createManyViewFieldsInputSchema
> {
  readonly inputSchema = createManyViewFieldsInputSchema;

  constructor(private readonly viewFieldService: ViewFieldService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof createManyViewFieldsInputSchema
  >): Promise<ToolOutput> {
    await this.viewFieldService.createMany({
      createViewFieldInputs: input.viewFields.map((viewField) => ({
        viewId: viewField.viewId,
        fieldMetadataId: viewField.fieldMetadataId,
        isVisible: viewField.isVisible,
        size: viewField.size,
        position: viewField.position,
        aggregateOperation: viewField.aggregateOperation,
      })),
      workspaceId,
    });

    return {
      success: true,
      message: `Created ${input.viewFields.length} view field(s)`,
    };
  }
}
