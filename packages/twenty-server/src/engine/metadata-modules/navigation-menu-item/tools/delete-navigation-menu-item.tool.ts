import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';

const deleteNavigationMenuItemInputSchema = z.object({
  id: z.uuid().describe('Id of the navigation menu item to delete'),
});

@DefineTool({
  name: 'delete_navigation_menu_item',
  category: ToolCategory.NAVIGATION_MENU_ITEM,
  requiredPermissionFlags: [],
  description: `Delete a navigation menu item. Deleting a folder also deletes everything inside it.`,
})
export class DeleteNavigationMenuItemTool extends BaseTool<
  typeof deleteNavigationMenuItemInputSchema
> {
  readonly inputSchema = deleteNavigationMenuItemInputSchema;

  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
  ) {
    super();
  }

  async execute(
    parameters: z.infer<typeof deleteNavigationMenuItemInputSchema>,
    { workspaceId, userWorkspaceId, application, agentId }: ToolProviderContext,
  ): Promise<ToolOutput> {
    try {
      const deleted = await this.navigationMenuItemService.delete({
        id: parameters.id,
        workspaceId,
        authUserWorkspaceId: userWorkspaceId,
        authApplicationId: application?.id,
        authAgentId: agentId,
      });

      return {
        success: true,
        message: `Navigation menu item ${deleted.id} deleted`,
        result: {
          deletedId: deleted.id,
          type: deleted.type,
          name: deleted.name,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to delete navigation menu item: ${message}`,
        error: message,
      };
    }
  }
}
