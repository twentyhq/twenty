import { ToolCategory } from 'twenty-shared/ai';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type UpdateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/update-navigation-menu-item.input';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';

const updateNavigationMenuItemInputSchema = z.object({
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

@DefineTool({
  name: 'update_navigation_menu_item',
  category: ToolCategory.NAVIGATION_MENU_ITEM,
  requiredPermissionFlags: [],
  description: `Update a navigation menu item (rename, recolor, move between folders, reorder). Type and target ids are immutable — delete and recreate to convert one variant into another.`,
})
export class UpdateNavigationMenuItemTool extends BaseTool<
  typeof updateNavigationMenuItemInputSchema
> {
  readonly inputSchema = updateNavigationMenuItemInputSchema;

  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
  ) {
    super();
  }

  async execute(
    parameters: z.infer<typeof updateNavigationMenuItemInputSchema>,
    { workspaceId, userWorkspaceId, application, agentId }: ToolProviderContext,
  ): Promise<ToolOutput> {
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

      const updated = await this.navigationMenuItemService.update({
        input: { id: parameters.id, ...update },
        workspaceId,
        authUserWorkspaceId: userWorkspaceId,
        authApplicationId: application?.id,
        authAgentId: agentId,
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
  }
}
