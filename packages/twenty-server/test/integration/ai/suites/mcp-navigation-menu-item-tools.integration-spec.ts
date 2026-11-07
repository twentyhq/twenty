import { executeToolThroughMcp } from 'test/integration/ai/utils/execute-tool-through-mcp.util';
import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

const NAVIGATION_MENU_ITEM_TOOL_NAMES = [
  'list_navigation_menu_items',
  'create_navigation_menu_item',
  'update_navigation_menu_item',
  'delete_navigation_menu_item',
];

const ITEM_NAME_PREFIX = 'MCP navigation tools';

type NavigationMenuItemSummary = {
  id: string;
  name: string | null;
  scope: 'user' | 'workspace';
  folderId: string | null;
};

const listItemsThroughMcp = async ({
  token,
  folderId,
}: {
  token: string;
  folderId?: string;
}): Promise<NavigationMenuItemSummary[]> => {
  const output = await executeToolThroughMcp<{
    items: NavigationMenuItemSummary[];
  }>({
    toolName: 'list_navigation_menu_items',
    toolArguments: { folderId },
    token,
  });

  expect(output.success).toBe(true);

  return output.result?.items ?? [];
};

const createItemThroughMcp = (
  token: string,
  toolArguments: Record<string, unknown>,
) =>
  executeToolThroughMcp<NavigationMenuItemSummary>({
    toolName: 'create_navigation_menu_item',
    toolArguments,
    token,
  });

const deleteItemThroughMcp = (token: string, id: string) =>
  executeToolThroughMcp({
    toolName: 'delete_navigation_menu_item',
    toolArguments: { id },
    token,
  });

describe('MCP navigation menu item tools (integration)', () => {
  afterAll(async () => {
    for (const token of [
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    ]) {
      const leakedItems = (await listItemsThroughMcp({ token })).filter(
        ({ name }) => name?.startsWith(ITEM_NAME_PREFIX),
      );

      for (const { id } of leakedItems) {
        await deleteItemThroughMcp(token, id);
      }
    }
  });

  it('should describe the navigation menu item tools to the model', async () => {
    const result = await callMcpTool({
      toolName: 'learn_tools',
      toolArguments: { toolNames: NAVIGATION_MENU_ITEM_TOOL_NAMES },
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(result.isError).toBe(false);

    const payload = JSON.parse(result.content[0].text);

    expect(payload.notFound).toEqual([]);
    expect(payload.tools).toMatchSnapshot();
  });

  it('should create, move and delete workspace items', async () => {
    const folder = await createItemThroughMcp(APPLE_JANE_ADMIN_ACCESS_TOKEN, {
      type: 'FOLDER',
      scope: 'workspace',
      name: `${ITEM_NAME_PREFIX} folder`,
    });

    expect(folder).toMatchObject({
      success: true,
      result: { name: `${ITEM_NAME_PREFIX} folder`, scope: 'workspace' },
    });

    const folderId = folder.result?.id;

    jestExpectToBeDefined(folderId);

    const link = await createItemThroughMcp(APPLE_JANE_ADMIN_ACCESS_TOKEN, {
      type: 'LINK',
      scope: 'workspace',
      name: `${ITEM_NAME_PREFIX} link`,
      link: 'https://twenty.com',
      folderId,
    });

    expect(link).toMatchObject({
      success: true,
      result: { name: `${ITEM_NAME_PREFIX} link`, folderId },
    });

    const linkId = link.result?.id;

    jestExpectToBeDefined(linkId);
    expect(
      (
        await listItemsThroughMcp({
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
          folderId,
        })
      ).map(({ id }) => id),
    ).toEqual([linkId]);

    const moved = await executeToolThroughMcp({
      toolName: 'update_navigation_menu_item',
      toolArguments: {
        id: linkId,
        name: `${ITEM_NAME_PREFIX} moved link`,
        folderId: null,
      },
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(moved).toMatchObject({
      success: true,
      message: `Navigation menu item ${linkId} updated`,
      result: { id: linkId, name: `${ITEM_NAME_PREFIX} moved link` },
    });

    for (const id of [linkId, folderId]) {
      expect(
        await deleteItemThroughMcp(APPLE_JANE_ADMIN_ACCESS_TOKEN, id),
      ).toMatchObject({
        success: true,
        message: `Navigation menu item ${id} deleted`,
      });
    }

    const remainingIds = (
      await listItemsThroughMcp({ token: APPLE_JANE_ADMIN_ACCESS_TOKEN })
    ).map(({ id }) => id);

    expect(remainingIds).not.toContain(linkId);
    expect(remainingIds).not.toContain(folderId);
  });

  it('should refuse a personal favorite to a caller without a user', async () => {
    const output = await createItemThroughMcp(API_KEY_ACCESS_TOKEN, {
      type: 'FOLDER',
      scope: 'user',
      name: `${ITEM_NAME_PREFIX} api key favorite`,
    });

    expect(output).toEqual({
      success: false,
      message:
        'Cannot create a user-scoped favorite without an authenticated user context.',
      error: 'missing_user_workspace_id',
    });
  });

  // The seeded member role holds no settings flag, so it lacks LAYOUTS
  describe('for a member without LAYOUTS', () => {
    it('should create and delete a personal favorite', async () => {
      const favorite = await createItemThroughMcp(
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
        {
          type: 'FOLDER',
          scope: 'user',
          name: `${ITEM_NAME_PREFIX} member favorite`,
        },
      );

      expect(favorite).toMatchObject({
        success: true,
        result: { scope: 'user' },
      });

      const favoriteId = favorite.result?.id;

      jestExpectToBeDefined(favoriteId);
      expect(
        await deleteItemThroughMcp(APPLE_JONY_MEMBER_ACCESS_TOKEN, favoriteId),
      ).toMatchObject({ success: true });
    });

    it('should refuse a workspace item', async () => {
      const output = await createItemThroughMcp(
        APPLE_JONY_MEMBER_ACCESS_TOKEN,
        {
          type: 'FOLDER',
          scope: 'workspace',
          name: `${ITEM_NAME_PREFIX} member workspace folder`,
        },
      );

      expect(output).toMatchObject({
        success: false,
        message: expect.stringMatching(
          /^Failed to create navigation menu item: /,
        ),
      });
    });
  });
});
