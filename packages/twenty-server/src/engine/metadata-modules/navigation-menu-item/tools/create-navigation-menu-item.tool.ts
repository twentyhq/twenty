import { z } from 'zod';

import { NavigationMenuItemType } from 'twenty-shared/types';

import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import { navigationMenuItemScopeSchema } from 'src/engine/metadata-modules/navigation-menu-item/tools/schemas/navigation-menu-item-scope.schema';
import { type NavigationMenuItemToolContext } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-context.type';
import { type NavigationMenuItemToolDependencies } from 'src/engine/metadata-modules/navigation-menu-item/tools/types/navigation-menu-item-tool-dependencies.type';

const commonOptionalFields = {
  icon: z
    .string()
    .optional()
    .describe('Icon identifier (e.g. "IconStar", "IconFolder")'),
  color: z.string().optional().describe('Optional hex colour'),
  position: z
    .number()
    .optional()
    .describe('Position among siblings; defaults to the end.'),
  folderId: z
    .string()
    .uuid()
    .optional()
    .describe('Parent folder id, if the item should live inside a folder.'),
};

const requiredNameField = z
  .string()
  .trim()
  .min(1)
  .describe('Label shown in the sidebar.');

const derivedNameField = z
  .string()
  .trim()
  .min(1)
  .optional()
  .describe(
    "Optional custom label. If omitted, the sidebar shows the target's own name (object's plural label / view name / record identifier). Only pass this if the user explicitly wants a different label.",
  );

const createNavigationMenuItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(NavigationMenuItemType.FOLDER),
    scope: navigationMenuItemScopeSchema,
    name: requiredNameField,
    ...commonOptionalFields,
  }),
  z.object({
    type: z.literal(NavigationMenuItemType.LINK),
    scope: navigationMenuItemScopeSchema,
    name: requiredNameField,
    link: z.string().url().describe('Target URL'),
    ...commonOptionalFields,
  }),
  z.object({
    type: z.literal(NavigationMenuItemType.OBJECT),
    scope: navigationMenuItemScopeSchema,
    targetObjectMetadataId: z
      .string()
      .uuid()
      .describe('Id of the object to pin'),
    name: derivedNameField,
    ...commonOptionalFields,
  }),
  z.object({
    type: z.literal(NavigationMenuItemType.VIEW),
    scope: navigationMenuItemScopeSchema,
    viewId: z.string().uuid().describe('Id of the view to pin'),
    name: derivedNameField,
    ...commonOptionalFields,
  }),
  z.object({
    type: z.literal(NavigationMenuItemType.RECORD),
    scope: navigationMenuItemScopeSchema,
    targetRecordId: z.string().uuid().describe('Id of the record to pin'),
    targetObjectMetadataId: z
      .string()
      .uuid()
      .describe("Id of the record's object metadata"),
    name: derivedNameField,
    ...commonOptionalFields,
  }),
  z.object({
    type: z.literal(NavigationMenuItemType.PAGE_LAYOUT),
    scope: navigationMenuItemScopeSchema,
    pageLayoutId: z.string().uuid().describe('Id of the page layout to pin'),
    name: requiredNameField,
    ...commonOptionalFields,
  }),
]);

type CreateNavigationMenuItemParams = z.infer<
  typeof createNavigationMenuItemSchema
>;

const toServiceInput = (
  params: CreateNavigationMenuItemParams,
  userWorkspaceId: string | undefined,
): CreateNavigationMenuItemInput => {
  const resolvedUserWorkspaceId =
    params.scope === 'user' ? userWorkspaceId : undefined;
  const base = {
    type: params.type as NavigationMenuItemType,
    userWorkspaceId: resolvedUserWorkspaceId,
    icon: params.icon,
    color: params.color,
    position: params.position,
    folderId: params.folderId,
  };

  switch (params.type) {
    case NavigationMenuItemType.FOLDER:
      return { ...base, name: params.name };
    case NavigationMenuItemType.LINK:
      return { ...base, name: params.name, link: params.link };
    case NavigationMenuItemType.OBJECT:
      return {
        ...base,
        name: params.name,
        targetObjectMetadataId: params.targetObjectMetadataId,
      };
    case NavigationMenuItemType.VIEW:
      return { ...base, name: params.name, viewId: params.viewId };
    case NavigationMenuItemType.RECORD:
      return {
        ...base,
        name: params.name,
        targetRecordId: params.targetRecordId,
        targetObjectMetadataId: params.targetObjectMetadataId,
      };
    case NavigationMenuItemType.PAGE_LAYOUT:
      return {
        ...base,
        name: params.name,
        pageLayoutId: params.pageLayoutId,
      };
  }
};

export const createCreateNavigationMenuItemTool = (
  deps: Pick<NavigationMenuItemToolDependencies, 'navigationMenuItemService'>,
  context: NavigationMenuItemToolContext,
) => ({
  name: 'create_navigation_menu_item' as const,
  description: `Create a navigation menu item. With scope='user' it becomes a personal favorite for the current user; with scope='workspace' it is shared with everyone (requires LAYOUTS permission).

Type chooses the variant:
- FOLDER: a group to nest other items into (name required).
- LINK: an external URL pinned in the sidebar (name + link required).
- OBJECT: pins an object's standard view (label auto-derived from the object's plural name; only pass 'name' if the user wants a custom label).
- VIEW: pins a saved view (label auto-derived from the view's name; only pass 'name' for a custom label).
- RECORD: pins a single record (label auto-derived from the record's identifier; only pass 'name' for a custom label).
- PAGE_LAYOUT: pins a page layout, e.g. a dashboard (name required — no auto-derivation).

Note: creating a new custom object via create_object_metadata already auto-creates an OBJECT navigation menu item — do not double-create.`,
  inputSchema: createNavigationMenuItemSchema,
  execute: async (parameters: CreateNavigationMenuItemParams) => {
    try {
      if (parameters.scope === 'user' && !context.userWorkspaceId) {
        return {
          success: false,
          message:
            'Cannot create a user-scoped favorite without an authenticated user context.',
          error: 'missing_user_workspace_id',
        };
      }

      const created = await deps.navigationMenuItemService.create({
        input: toServiceInput(parameters, context.userWorkspaceId),
        workspaceId: context.workspaceId,
        authUserWorkspaceId: context.userWorkspaceId,
      });

      return {
        success: true,
        message: `Navigation menu item ${created.id} (${created.type}) created`,
        result: {
          id: created.id,
          type: created.type,
          name: created.name,
          scope: created.userWorkspaceId ? 'user' : 'workspace',
          folderId: created.folderId,
          position: created.position,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to create navigation menu item: ${message}`,
        error: message,
      };
    }
  },
});
