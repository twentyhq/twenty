import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewVisibility } from 'twenty-shared/types';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

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

  constructor(private readonly viewService: ViewService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof deleteViewInputSchema>): Promise<ToolOutput> {
    const existingView = await this.viewService.findById(input.id, workspaceId);

    if (!existingView) {
      throw new ViewException(
        `View with id ${input.id} not found`,
        ViewExceptionCode.VIEW_NOT_FOUND,
      );
    }

    if (
      existingView.visibility === ViewVisibility.UNLISTED &&
      existingView.createdByUserWorkspaceId !== userWorkspaceId
    ) {
      throw new ViewException(
        'You can only delete your own unlisted views',
        ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
      );
    }

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
