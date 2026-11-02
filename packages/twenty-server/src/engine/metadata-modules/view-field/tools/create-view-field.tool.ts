import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { createViewFieldInputSchema } from 'src/engine/metadata-modules/view-field/tools/schemas/create-view-field-input.schema';
import { ViewToolAccessService } from 'src/engine/metadata-modules/view/tools/services/view-tool-access.service';

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

  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly viewToolAccessService: ViewToolAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof createViewFieldInputSchema>): Promise<ToolOutput> {
    await this.viewToolAccessService.findViewEditableByUserOrThrow({
      viewId: input.viewId,
      workspaceId,
      userWorkspaceId,
      operation: 'update',
    });

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
