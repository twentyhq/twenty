import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ViewService } from 'src/engine/metadata-modules/view/services/view.service';
import { ViewToolAccessService } from 'src/engine/metadata-modules/view/tools/services/view-tool-access.service';

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

  constructor(
    private readonly viewService: ViewService,
    private readonly viewToolAccessService: ViewToolAccessService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<typeof updateViewInputSchema>): Promise<ToolOutput> {
    await this.viewToolAccessService.findViewEditableByUserOrThrow({
      viewId: input.id,
      workspaceId,
      userWorkspaceId,
      operation: 'update',
    });

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
