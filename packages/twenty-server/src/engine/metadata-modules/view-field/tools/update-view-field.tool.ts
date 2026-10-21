import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { updateViewFieldInputSchema } from 'src/engine/metadata-modules/view-field/tools/schemas/update-view-field-input.schema';

@DefineTool({
  name: 'update_view_field',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    "Update properties of a column in a view. You can change its visibility, width (size in pixels), display position, or aggregate operation. Use get_view_fields to find the view field ID. Constraints: position must not be -1, must not precede the label identifier field, and must not conflict with another field's position.",
})
export class UpdateViewFieldTool extends BaseTool<
  typeof updateViewFieldInputSchema
> {
  readonly inputSchema = updateViewFieldInputSchema;

  constructor(private readonly viewFieldService: ViewFieldService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof updateViewFieldInputSchema>): Promise<ToolOutput> {
    const viewField = await this.viewFieldService.updateOne({
      updateViewFieldInput: {
        id: input.id,
        update: {
          isVisible: input.isVisible,
          size: input.size,
          position: input.position,
          aggregateOperation: input.aggregateOperation,
        },
      },
      workspaceId,
    });

    return {
      success: true,
      message: `View field ${viewField.id} updated`,
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
