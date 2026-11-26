import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';
import { v4 } from 'uuid';

import { type AddFavoritesNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-64/2-64-workspace-command-1795527933153-add-favorites-navigation-menu-section.command';
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

const getNavigationMenuItemRepository = () =>
  getCoreRepository<NavigationMenuItemEntity>(NavigationMenuItemEntity);

const recomputeNavigationMenuItemCache = () =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatNavigationMenuItemMaps',
  ]);

const removeFavoritesSection = async () => {
  await getNavigationMenuItemRepository().delete({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    universalIdentifier: FAVORITES_SECTION_UNIVERSAL_IDENTIFIER,
  });

  await recomputeNavigationMenuItemCache();
};

describe('2-64 workspace command - add favorites navigation menu section (integration)', () => {
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

  it('skips a workspace whose Favorites section was moved into a tab', async () => {
    await removeFavoritesSection();

    const repository = getNavigationMenuItemRepository();
    const referenceItem = await repository.findOneOrFail({
      where: {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId: IsNull(),
      },
    });
    const tab = await repository.save({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: referenceItem.applicationId,
      universalIdentifier: v4(),
      type: NavigationMenuItemType.TAB,
      name: 'Tab',
      position: 100,
    });

    await repository.save({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: referenceItem.applicationId,
      universalIdentifier: v4(),
      type: NavigationMenuItemType.SECTION,
      builtInSectionKey: 'favorites',
      parentId: tab.id,
      position: 0,
    });
    await recomputeNavigationMenuItemCache();

    await runCommand();

    const favoritesSections = (await readNavigationMenuItems()).filter(
      ({ builtInSectionKey }) => builtInSectionKey === 'favorites',
    );

    expect(favoritesSections).toHaveLength(1);
    expect(favoritesSections[0].parentId).toBe(tab.id);

    await repository.delete({ id: tab.id });
    await recomputeNavigationMenuItemCache();
    await runCommand();
  });
});
