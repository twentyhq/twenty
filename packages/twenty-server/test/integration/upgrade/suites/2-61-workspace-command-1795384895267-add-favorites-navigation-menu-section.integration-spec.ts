import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { isDefined } from 'twenty-shared/utils';

import { type AddFavoritesNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795384895267-add-favorites-navigation-menu-section.command';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

const FAVORITES_SECTION_UNIVERSAL_IDENTIFIER =
  STANDARD_NAVIGATION_MENU_ITEMS.favoritesSection.universalIdentifier;

type NavigationMenuItemRow = {
  id: string;
  universalIdentifier: string;
  parentId: string | null;
  userWorkspaceId: string | null;
  builtInSectionKey: string | null;
  position: number;
};

const readNavigationMenuItems = async (): Promise<NavigationMenuItemRow[]> =>
  global.testDataSource.query(
    `SELECT "id", "universalIdentifier", "parentId", "userWorkspaceId",
            "builtInSectionKey", "position"
     FROM core."navigationMenuItem"
     WHERE "workspaceId" = $1
     ORDER BY "universalIdentifier"`,
    [SEED_APPLE_WORKSPACE_ID],
  );

const removeFavoritesSection = async () => {
  await getCoreRepository<NavigationMenuItemEntity>(
    NavigationMenuItemEntity,
  ).delete({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    universalIdentifier: FAVORITES_SECTION_UNIVERSAL_IDENTIFIER,
  });

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatNavigationMenuItemMaps',
  ]);
};

describe('2-61 workspace command - add favorites navigation menu section (integration)', () => {
  let command: AddFavoritesNavigationMenuSectionCommand;
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
      getAppProviderByClassName<AddFavoritesNavigationMenuSectionCommand>(
        'AddFavoritesNavigationMenuSectionCommand',
      );
    await removeFavoritesSection();
    navigationMenuItemsBefore = await readNavigationMenuItems();
  });

  it('leaves the sidebar untouched on a dry run', async () => {
    await runCommand({ dryRun: true });

    expect(await readNavigationMenuItems()).toEqual(navigationMenuItemsBefore);
  });

  it('adds one Favorites section above every Home root item, once', async () => {
    await runCommand();
    await runCommand();

    const navigationMenuItemsAfter = await readNavigationMenuItems();
    const favoritesSections = navigationMenuItemsAfter.filter(
      ({ universalIdentifier }) =>
        universalIdentifier === FAVORITES_SECTION_UNIVERSAL_IDENTIFIER,
    );

    expect(favoritesSections).toHaveLength(1);

    const [favoritesSection] = favoritesSections;

    expect(favoritesSection).toMatchObject({
      parentId: null,
      userWorkspaceId: null,
      builtInSectionKey: 'favorites',
    });

    const otherHomeRootPositions = navigationMenuItemsBefore
      .filter(
        ({ parentId, userWorkspaceId }) =>
          !isDefined(parentId) && !isDefined(userWorkspaceId),
      )
      .map(({ position }) => position);

    expect(favoritesSection.position).toBeLessThan(
      Math.min(0, ...otherHomeRootPositions),
    );
  });
});
