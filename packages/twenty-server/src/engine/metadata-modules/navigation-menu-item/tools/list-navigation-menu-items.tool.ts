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
      const scope = parameters.scope ?? 'all';
      const all = await deps.navigationMenuItemService.findAll({
        workspaceId: context.workspaceId,
        userWorkspaceId: context.userWorkspaceId,
      });

      const filtered = all.filter((item) => {
        if (scope === 'workspace' && isDefined(item.userWorkspaceId)) {
          return false;
        }
        if (scope === 'user' && !isDefined(item.userWorkspaceId)) {
          return false;
        }
        if (
          isDefined(parameters.folderId) &&
          item.folderId !== parameters.folderId
        ) {
          return false;
        }
        if (
          isDefined(parameters.type) &&
          item.type !== (parameters.type as NavigationMenuItemType)
        ) {
          return false;
        }

        return true;
      });

      const limited = filtered.slice(0, parameters.limit ?? 100);

      return {
        success: true,
        message: `Found ${limited.length} navigation menu item(s)`,
        result: {
          items: limited.map((item) => ({
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
          count: limited.length,
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
