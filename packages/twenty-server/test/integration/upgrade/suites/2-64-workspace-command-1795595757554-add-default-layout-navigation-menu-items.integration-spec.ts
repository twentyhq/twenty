import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { In } from 'typeorm';

import { type AddDefaultLayoutNavigationMenuItemsCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795595757554-add-default-layout-navigation-menu-items.command';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

const INBOX_SECTION_UNIVERSAL_IDENTIFIER =
  STANDARD_NAVIGATION_MENU_ITEMS.inboxSection.universalIdentifier;
const CHATS_TAB_UNIVERSAL_IDENTIFIER =
  STANDARD_NAVIGATION_MENU_ITEMS.chatsTab.universalIdentifier;

type NavigationMenuItemRow = {
  id: string;
  universalIdentifier: string;
  type: string;
  parentId: string | null;
  builtInSectionKey: string | null;
  position: number;
};

const readNavigationMenuItems = async (): Promise<NavigationMenuItemRow[]> =>
  global.testDataSource.query(
    `SELECT "id", "universalIdentifier", "type", "parentId",
            "builtInSectionKey", "position"
     FROM core."navigationMenuItem"
     WHERE "workspaceId" = $1 AND "userWorkspaceId" IS NULL
     ORDER BY "universalIdentifier"`,
    [SEED_APPLE_WORKSPACE_ID],
  );

const removeDefaultLayoutItems = async () => {
  await getCoreRepository<NavigationMenuItemEntity>(
    NavigationMenuItemEntity,
  ).delete({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    universalIdentifier: In([
      INBOX_SECTION_UNIVERSAL_IDENTIFIER,
      CHATS_TAB_UNIVERSAL_IDENTIFIER,
    ]),
  });

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatNavigationMenuItemMaps',
  ]);
};

describe('2-64 workspace command - add default layout navigation menu items (integration)', () => {
  let command: AddDefaultLayoutNavigationMenuItemsCommand;
  let navigationMenuItemsBefore: NavigationMenuItemRow[];

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
    });

  beforeAll(async () => {
    command =
      getAppProviderByClassName<AddDefaultLayoutNavigationMenuItemsCommand>(
        'AddDefaultLayoutNavigationMenuItemsCommand',
      );
    await removeDefaultLayoutItems();
    navigationMenuItemsBefore = await readNavigationMenuItems();
  });

  it('leaves the sidebar untouched on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await readNavigationMenuItems()).toEqual(navigationMenuItemsBefore);
  });

  it('adds Inbox at the top of Home and the Chats tab, once', async () => {
    await runCommand();
    await runCommand();

    const navigationMenuItemsAfter = await readNavigationMenuItems();
    const inboxSections = navigationMenuItemsAfter.filter(
      ({ builtInSectionKey }) => builtInSectionKey === 'aiChatInbox',
    );
    const chatsTabs = navigationMenuItemsAfter.filter(
      ({ universalIdentifier }) =>
        universalIdentifier === CHATS_TAB_UNIVERSAL_IDENTIFIER,
    );

    expect(inboxSections).toHaveLength(1);
    expect(inboxSections[0].parentId).toBeNull();
    expect(inboxSections[0].position).toBeLessThan(
      Math.min(
        0,
        ...navigationMenuItemsBefore
          .filter(({ parentId, type }) => parentId === null && type !== 'TAB')
          .map(({ position }) => position),
      ),
    );

    expect(chatsTabs).toHaveLength(1);
    expect(
      navigationMenuItemsAfter
        .filter(({ parentId }) => parentId === chatsTabs[0].id)
        .sort((first, second) => first.position - second.position)
        .map(({ builtInSectionKey }) => builtInSectionKey),
    ).toEqual(['aiChatFavorites', 'aiChatChannels', 'aiChatRecents']);
  });
});
