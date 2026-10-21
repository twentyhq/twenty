import { ToolCategory } from 'twenty-shared/ai';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { navigationMenuItemTypeSchema } from 'src/engine/metadata-modules/navigation-menu-item/tools/schemas/navigation-menu-item-type.schema';

const listNavigationMenuItemsInputSchema = z.object({
  scope: z
    .enum(['workspace', 'user', 'all'])
    .optional()
    .default('all')
    .describe(
      "'workspace' = shared navigation, 'user' = current user's favorites, 'all' = both merged (default).",
    ),
  folderId: z
    .uuid()
    .optional()
    .describe('Only return items inside this folder.'),
  type: navigationMenuItemTypeSchema
    .optional()
    .describe(
      'Filter by item type (FOLDER, LINK, OBJECT, VIEW, RECORD, PAGE_LAYOUT).',
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(200)
    .optional()
    .default(100)
    .describe('Max number of items to return.'),
});

@DefineTool({
  name: 'list_navigation_menu_items',
  category: ToolCategory.NAVIGATION_MENU_ITEM,
  requiredPermissionFlags: [],
  description: `List navigation menu items (shared workspace navigation and/or the current user's personal favorites). Returns items sorted by position.`,
})
export class ListNavigationMenuItemsTool extends BaseTool<
  typeof listNavigationMenuItemsInputSchema
> {
  readonly inputSchema = listNavigationMenuItemsInputSchema;

  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
  ) {
    super();
  }

  async execute(
    parameters: z.infer<typeof listNavigationMenuItemsInputSchema>,
    { workspaceId, userWorkspaceId }: ToolProviderContext,
  ): Promise<ToolOutput> {
    try {
      const items = await this.navigationMenuItemService.findAll({
        workspaceId,
        userWorkspaceId,
        scope: parameters.scope,
        folderId: parameters.folderId,
        type: parameters.type as NavigationMenuItemType | undefined,
        limit: parameters.limit,
      });

      return {
        success: true,
        message: `Found ${items.length} navigation menu item(s)`,
        result: {
          items: items.map((item) => ({
            id: item.id,
            type: item.type,
            name: item.name,
            scope: isDefined(item.userWorkspaceId) ? 'user' : 'workspace',
            folderId: item.folderId,
            position: item.position,
            icon: item.icon,
            color: item.color,
            link: item.link,
            targetObjectMetadataId: item.targetObjectMetadataId,
            targetRecordId: item.targetRecordId,
            viewId: item.viewId,
            pageLayoutId: item.pageLayoutId,
          })),
          count: items.length,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to list navigation menu items: ${message}`,
        error: message,
      };
    }
  }
}
