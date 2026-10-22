import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';

const deleteViewFieldInputSchema = z.object({
  id: z
    .string()
    .uuid()
    .describe(
      'The ID of the view field to delete. Obtain this from get_view_fields.',
    ),
});

@DefineTool({
  name: 'delete_view_field',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description:
    "Remove a column from a view. This removes the field from the view's displayed columns. Use get_view_fields to find the view field ID to delete.",
})
export class DeleteViewFieldTool extends BaseTool<
  typeof deleteViewFieldInputSchema
> {
  readonly inputSchema = deleteViewFieldInputSchema;

  constructor(private readonly viewFieldService: ViewFieldService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId },
  }: ToolExecuteArgs<typeof deleteViewFieldInputSchema>): Promise<ToolOutput> {
    const viewField = await this.viewFieldService.deleteOne({
      deleteViewFieldInput: { id: input.id },
      workspaceId,
    });

    return {
      success: true,
      message: `View field ${viewField.id} deleted`,
      result: { id: viewField.id, deleted: true },
    };
  }
}
