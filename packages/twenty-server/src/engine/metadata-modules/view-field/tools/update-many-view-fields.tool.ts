import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { updateViewFieldInputSchema } from 'src/engine/metadata-modules/view-field/tools/schemas/update-view-field-input.schema';

const updateManyViewFieldsInputSchema = z.object({
  viewFields: z
    .array(updateViewFieldInputSchema)
    .min(1)
    .max(50)
    .describe('Array of view field updates to apply (1-50 items).'),
});

@DefineTool({
  name: 'update_many_view_fields',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    'Update multiple columns in a view at once. More efficient than calling update_view_field multiple times. Each item must include the view field ID and properties to update. Same constraints as update_view_field apply to each item.',
})
export class UpdateManyViewFieldsTool extends BaseTool<
  typeof updateManyViewFieldsInputSchema
> {
  readonly inputSchema = updateManyViewFieldsInputSchema;

  constructor(private readonly viewFieldService: ViewFieldService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<
    typeof updateManyViewFieldsInputSchema
  >): Promise<ToolOutput> {
    await Promise.all(
      input.viewFields.map(async (viewField) => {
        await this.viewFieldService.updateOne({
          updateViewFieldInput: {
            id: viewField.id,
            update: {
              isVisible: viewField.isVisible,
              size: viewField.size,
              position: viewField.position,
              aggregateOperation: viewField.aggregateOperation,
            },
          },
          workspaceId,
        });
      }),
    );

    return {
      success: true,
      message: `Updated ${input.viewFields.length} view field(s)`,
    };
  }
}
