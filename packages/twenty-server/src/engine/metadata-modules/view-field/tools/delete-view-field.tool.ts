import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewFieldService } from 'src/engine/metadata-modules/view-field/services/view-field.service';
import { ViewAccessService } from 'src/engine/permissions/metadata-permissions/services/view-access.service';
import { VIEW_FIELD_ACCESS_POLICY } from 'src/engine/metadata-modules/view-field/constants/view-field-access-policy.constant';

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
  accessPolicy: VIEW_FIELD_ACCESS_POLICY,
  description:
    "Remove a column from a view. This removes the field from the view's displayed columns. Use get_view_fields to find the view field ID to delete.",
})
export class DeleteViewFieldTool extends BaseTool<
  typeof deleteViewFieldInputSchema
> {
  readonly inputSchema = deleteViewFieldInputSchema;

  constructor(
    private readonly viewFieldService: ViewFieldService,
    private readonly viewAccessService: ViewAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId, authContext },
  }: ToolExecuteArgs<typeof deleteViewFieldInputSchema>): Promise<ToolOutput> {
    await this.viewAccessService.findModifiableParentViewOrThrow({
      kind: 'viewField',
      entityId: input.id,
      accessContext: { workspaceId, userWorkspaceId, authContext },
    });

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
