import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
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

const updateViewInputSchema = z.object({
  id: z.string().uuid().describe('View ID to update'),
  name: z.string().optional().describe('New view name'),
  icon: z.string().optional().describe('New icon identifier'),
});

@DefineTool({
  name: 'update_view',
  category: ToolCategory.VIEW,
  requiredPermissionFlags: [PermissionFlagType.VIEWS],
  description: 'Update an existing view. You can change the name and icon.',
})
export class UpdateViewTool extends BaseTool<typeof updateViewInputSchema> {
  readonly inputSchema = updateViewInputSchema;

  constructor(private readonly viewService: ViewService) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof updateViewInputSchema>): Promise<ToolOutput> {
    const existingView = await this.viewService.findById(input.id, workspaceId);

    if (!isDefined(existingView)) {
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
        'You can only update your own unlisted views',
        ViewExceptionCode.VIEW_MODIFY_PERMISSION_DENIED,
      );
    }

    const view = await this.viewService.updateOne({
      updateViewInput: {
        id: input.id,
        name: input.name,
        icon: input.icon,
      },
      workspaceId,
      userWorkspaceId,
    });

    return {
      success: true,
      message: `View "${view.name}" updated`,
      result: {
        id: view.id,
        name: view.name,
        objectMetadataId: view.objectMetadataId,
        type: view.type,
        icon: view.icon,
        visibility: view.visibility,
      },
    };
  }
}
