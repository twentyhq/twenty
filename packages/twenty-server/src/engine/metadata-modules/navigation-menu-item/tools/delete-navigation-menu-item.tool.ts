import { z } from 'zod';

import { type NavigationMenuItemToolContext } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-context.type';
import { type NavigationMenuItemToolDependencies } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-dependencies.type';

const deleteNavigationMenuItemSchema = z.object({
  id: z.string().uuid().describe('Id of the navigation menu item to delete'),
});

type DeleteNavigationMenuItemParams = z.infer<
  typeof deleteNavigationMenuItemSchema
>;

export const createDeleteNavigationMenuItemTool = (
  deps: Pick<NavigationMenuItemToolDependencies, 'navigationMenuItemService'>,
  context: NavigationMenuItemToolContext,
) => ({
  name: 'delete_navigation_menu_item' as const,
  description: `Delete a navigation menu item. Deleting a folder also deletes everything inside it.`,
  inputSchema: deleteNavigationMenuItemSchema,
  execute: async (parameters: DeleteNavigationMenuItemParams) => {
    try {
      const deleted = await deps.navigationMenuItemService.delete({
        id: parameters.id,
        workspaceId: context.workspaceId,
        authUserWorkspaceId: context.userWorkspaceId,
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
  },
});
