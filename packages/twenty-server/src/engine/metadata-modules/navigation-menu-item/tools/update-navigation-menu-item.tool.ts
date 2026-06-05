import { z } from 'zod';

import { type UpdateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import { type NavigationMenuItemToolContext } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-context.type';
import { type NavigationMenuItemToolDependencies } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-dependencies.type';

const updateNavigationMenuItemSchema = z.object({
  id: z.uuid().describe('Id of the navigation menu item to update'),
  name: z
    .string()
    .trim()
    .min(1)
    .optional()
    .describe(
      "New display name. For OBJECT/VIEW/RECORD items the sidebar normally shows the target entity's own name — only set this if the user wants a custom label.",
    ),
  icon: z.string().optional().describe('New icon identifier'),
  color: z.string().optional().describe('New hex colour'),
  position: z.number().optional().describe('New position among siblings'),
  folderId: z
    .string()
    .nullable()
    .optional()
    .describe(
      'Move into a different folder. Pass null to move to the top level.',
    ),
  link: z
    .string()
    .url()
    .optional()
    .describe('New URL (only meaningful for LINK items)'),
  pageLayoutId: z
    .string()
    .optional()
    .describe('New page layout id (only meaningful for PAGE_LAYOUT items)'),
});

type UpdateNavigationMenuItemParams = z.infer<
  typeof updateNavigationMenuItemSchema
>;

export const createUpdateNavigationMenuItemTool = (
  deps: Pick<NavigationMenuItemToolDependencies, 'navigationMenuItemService'>,
  context: NavigationMenuItemToolContext,
) => ({
  name: 'update_navigation_menu_item' as const,
  description: `Update a navigation menu item (rename, recolor, move between folders, reorder). Type and target ids are immutable — delete and recreate to convert one variant into another.`,
  inputSchema: updateNavigationMenuItemSchema,
  execute: async (parameters: UpdateNavigationMenuItemParams) => {
    try {
      const update: Partial<UpdateNavigationMenuItemInput> = {};

      if (parameters.name !== undefined) update.name = parameters.name;
      if (parameters.icon !== undefined) update.icon = parameters.icon;
      if (parameters.color !== undefined) update.color = parameters.color;
      if (parameters.position !== undefined)
        update.position = parameters.position;
      if (parameters.folderId !== undefined)
        update.folderId = parameters.folderId;
      if (parameters.link !== undefined) update.link = parameters.link;
      if (parameters.pageLayoutId !== undefined)
        update.pageLayoutId = parameters.pageLayoutId;

      const updated = await deps.navigationMenuItemService.update({
        input: { id: parameters.id, ...update },
        workspaceId: context.workspaceId,
        authUserWorkspaceId: context.userWorkspaceId,
      });

      return {
        success: true,
        message: `Navigation menu item ${updated.id} updated`,
        result: {
          id: updated.id,
          type: updated.type,
          name: updated.name,
          folderId: updated.folderId,
          position: updated.position,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to update navigation menu item: ${message}`,
        error: message,
      };
    }
  },
});
