import { ToolCategory } from 'twenty-shared/ai';
import {
  FeatureFlagKey,
  NavigationMenuItemType,
  NATIVE_PAGE_KEYS,
} from 'twenty-shared/types';
import { z } from 'zod';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DefineTool } from 'src/engine/core-modules/tool-provider/decorators/define-tool.decorator';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolExecuteArgs } from 'src/engine/core-modules/tool-provider/types/tool-execute-args.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY } from 'src/engine/metadata-modules/navigation-menu-item/constants/navigation-menu-item-write-access-policy.constant';
import { type CreateNavigationMenuItemInput } from 'src/engine/metadata-modules/navigation-menu-item/dtos/create-navigation-menu-item.input';
import { NavigationMenuItemService } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.service';
import { navigationMenuItemScopeSchema } from 'src/engine/metadata-modules/navigation-menu-item/tools/schemas/navigation-menu-item-scope.schema';

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
  parentId: z
    .uuid()
    .optional()
    .describe(
      'Parent id: a folder, a section or a tab the item should live inside. A tab takes no parent, a section only a tab, and a folder a tab or a section.',
    ),
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

const createNavigationMenuItemInputSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(NavigationMenuItemType.TAB),
    scope: navigationMenuItemScopeSchema,
    name: requiredNameField,
    ...commonOptionalFields,
  }),
  z.object({
    type: z.literal(NavigationMenuItemType.SECTION),
    scope: navigationMenuItemScopeSchema,
    name: requiredNameField,
    ...commonOptionalFields,
  }),
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
    pageLayoutId: z.string().describe('Id of the page layout to pin'),
    name: requiredNameField,
    ...commonOptionalFields,
  }),
  z.object({
    type: z.literal(NavigationMenuItemType.NATIVE_PAGE),
    scope: navigationMenuItemScopeSchema,
    nativePageKey: z
      .enum(NATIVE_PAGE_KEYS)
      .describe('Built-in page to pin: workflows or agents'),
    name: derivedNameField,
    ...commonOptionalFields,
  }),
]);

type CreateNavigationMenuItemParams = z.infer<
  typeof createNavigationMenuItemInputSchema
>;

const toServiceInput = (
  params: CreateNavigationMenuItemParams,
  userWorkspaceId: string | undefined,
): CreateNavigationMenuItemInput => {
  const resolvedUserWorkspaceId =
    params.scope === 'user' ? userWorkspaceId : undefined;
  const base = {
    type: params.type,
    userWorkspaceId: resolvedUserWorkspaceId,
    icon: params.icon,
    color: params.color,
    position: params.position,
    parentId: params.parentId,
  };

  switch (params.type) {
    case NavigationMenuItemType.TAB:
    case NavigationMenuItemType.SECTION:
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
    case NavigationMenuItemType.NATIVE_PAGE:
      return {
        ...base,
        name: params.name,
        nativePageKey: params.nativePageKey,
      };
  }
};

@DefineTool({
  name: 'create_navigation_menu_item',
  category: ToolCategory.NAVIGATION_MENU_ITEM,
  accessPolicy: NAVIGATION_MENU_ITEM_WRITE_ACCESS_POLICY,
  description: `Create a navigation menu item. With scope='user' it becomes a personal favorite for the current user; with scope='workspace' it is shared with everyone (requires LAYOUTS permission).

Type chooses the variant:
- TAB: a sidebar tab next to Home, holding sections and items (name required, workspace scope, no parent). Only available when the customizable sidebar is enabled for the workspace.
- SECTION: a titled group inside a tab or on Home (name required, workspace scope). Only available when the customizable sidebar is enabled.
- FOLDER: a group to nest other items into (name required).
- LINK: an external URL pinned in the sidebar (name + link required).
- OBJECT: pins an object's standard view (label auto-derived from the object's plural name; only pass 'name' if the user wants a custom label).
- VIEW: pins a saved view (label auto-derived from the view's name; only pass 'name' for a custom label).
- RECORD: pins a single record (label auto-derived from the record's identifier; only pass 'name' for a custom label).
- PAGE_LAYOUT: pins a standalone page layout (name required — no auto-derivation). The referenced page layout must be of type STANDALONE_PAGE; dashboards and record/index page layouts are not reachable this way.
- NATIVE_PAGE: pins a built-in page, Workflows or Agents (label auto-derived; only pass 'name' for a custom label).

Note: creating a new custom object via create_object_metadata already auto-creates an OBJECT navigation menu item — do not double-create.`,
})
export class CreateNavigationMenuItemTool extends BaseTool<
  typeof createNavigationMenuItemInputSchema
> {
  readonly inputSchema = createNavigationMenuItemInputSchema;

  constructor(
    private readonly navigationMenuItemService: NavigationMenuItemService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    super();
  }

  async execute({
    input,
    context: { workspaceId, userWorkspaceId },
  }: ToolExecuteArgs<
    typeof createNavigationMenuItemInputSchema
  >): Promise<ToolOutput> {
    try {
      if (
        input.type === NavigationMenuItemType.TAB ||
        input.type === NavigationMenuItemType.SECTION
      ) {
        const isCustomizableSidebarEnabled =
          await this.featureFlagService.isFeatureEnabled(
            FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
            workspaceId,
          );

        if (!isCustomizableSidebarEnabled) {
          return {
            success: false,
            message:
              'Tabs and sections need the customizable sidebar to be enabled for this workspace.',
            error: 'customizable_sidebar_disabled',
          };
        }

        if (input.scope !== 'workspace') {
          return {
            success: false,
            message:
              "Tabs and sections are shared with the workspace: use scope='workspace'.",
            error: 'tab_or_section_requires_workspace_scope',
          };
        }
      }

      if (input.scope === 'user' && !userWorkspaceId) {
        return {
          success: false,
          message:
            'Cannot create a user-scoped favorite without an authenticated user context.',
          error: 'missing_user_workspace_id',
        };
      }

      const created = await this.navigationMenuItemService.create({
        input: toServiceInput(input, userWorkspaceId),
        workspaceId,
        authUserWorkspaceId: userWorkspaceId,
      });

      return {
        success: true,
        message: `Navigation menu item ${created.id} (${created.type}) created`,
        result: {
          id: created.id,
          type: created.type,
          name: created.name,
          scope: created.userWorkspaceId ? 'user' : 'workspace',
          parentId: created.parentId,
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
  }
}
