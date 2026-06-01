import { z } from 'zod';

import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { navigationMenuItemTypeSchema } from 'src/engine/metadata-modules/navigation-menu-item/tools/schemas/navigation-menu-item-type.schema';
import { type NavigationMenuItemToolContext } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-context.type';
import { type NavigationMenuItemToolDependencies } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-dependencies.type';

const listNavigationMenuItemsSchema = z.object({
  scope: z
    .enum(['workspace', 'user', 'all'])
    .optional()
    .default('all')
    .describe(
      "'workspace' = shared navigation, 'user' = current user's favorites, 'all' = both merged (default).",
    ),
  folderId: z
    .string()
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

type ListNavigationMenuItemsParams = z.infer<
  typeof listNavigationMenuItemsSchema
>;

export const createListNavigationMenuItemsTool = (
  deps: Pick<NavigationMenuItemToolDependencies, 'navigationMenuItemService'>,
  context: NavigationMenuItemToolContext,
) => ({
  name: 'list_navigation_menu_items' as const,
  description: `List navigation menu items (shared workspace navigation and/or the current user's personal favorites). Returns items sorted by position.`,
  inputSchema: listNavigationMenuItemsSchema,
  execute: async (parameters: ListNavigationMenuItemsParams) => {
    try {
      const items = await deps.navigationMenuItemService.findAll({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
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
  },
});
