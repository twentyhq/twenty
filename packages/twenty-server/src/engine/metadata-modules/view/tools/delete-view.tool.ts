import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewToolAccessService } from 'src/engine/metadata-modules/view/tools/services/view-tool-access.service';

const deleteViewInputSchema = z.object({
  id: z.string().uuid().describe('View ID to delete'),
});

@DefineTool({
  name: 'delete_view',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description: 'Delete a view by its ID.',
})
export class DeleteViewTool extends BaseTool<typeof deleteViewInputSchema> {
  readonly inputSchema = deleteViewInputSchema;

  constructor(
    private readonly viewService: ViewService,
    private readonly viewToolAccessService: ViewToolAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof deleteViewInputSchema>): Promise<ToolOutput> {
    await this.viewToolAccessService.findViewEditableByUserOrThrow({
      viewId: input.id,
      workspaceId,
      userWorkspaceId,
      operation: 'delete',
    });

    const view = await this.viewService.deleteOne({
      deleteViewInput: { id: input.id },
      workspaceId,
    });

    return {
      success: true,
      message: `View "${view.name}" deleted`,
      result: { id: view.id, name: view.name, deleted: true },
    };
  }
}
