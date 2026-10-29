import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { In } from 'typeorm';

import { type AddCampaignsNavigationFolderCommand } from 'src/database/commands/upgrade-version-command/2-54/2-54-workspace-command-1793266210456-add-campaigns-navigation-folder.command';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

const CAMPAIGNS_FOLDER_UNIVERSAL_IDENTIFIER =
  STANDARD_NAVIGATION_MENU_ITEMS.campaignsFolder.universalIdentifier;

const LISTS_UNIVERSAL_IDENTIFIER =
  STANDARD_NAVIGATION_MENU_ITEMS.allMessageLists.universalIdentifier;

const CAMPAIGNS_NAVIGATION_UNIVERSAL_IDENTIFIERS: string[] = [
  CAMPAIGNS_FOLDER_UNIVERSAL_IDENTIFIER,
  STANDARD_NAVIGATION_MENU_ITEMS.allMessageCampaigns.universalIdentifier,
  LISTS_UNIVERSAL_IDENTIFIER,
];

type NavigationMenuItemRow = {
  id: string;
  universalIdentifier: string;
  type: string;
  folderId: string | null;
  targetObjectNameSingular: string | null;
  name: string | null;
  position: number;
};

const readNavigationMenuItems = async (): Promise<NavigationMenuItemRow[]> =>
  global.testDataSource.query(
    `SELECT n."id", n."universalIdentifier", n."type", n."folderId", n."name",
            n."position", o."nameSingular" AS "targetObjectNameSingular"
     FROM core."navigationMenuItem" n
     LEFT JOIN core."objectMetadata" o ON o."id" = n."targetObjectMetadataId"
     WHERE n."workspaceId" = $1
     ORDER BY n."universalIdentifier"`,
    [SEED_APPLE_WORKSPACE_ID],
  );

const isCampaignsNavigationMenuItem = ({
  universalIdentifier,
}: Pick<NavigationMenuItemRow, 'universalIdentifier'>) =>
  CAMPAIGNS_NAVIGATION_UNIVERSAL_IDENTIFIERS.includes(universalIdentifier);

const deleteNavigationMenuItems = async (universalIdentifiers: string[]) => {
  await getCoreRepository<NavigationMenuItemEntity>(
    NavigationMenuItemEntity,
  ).delete({
    workspaceId: SEED_APPLE_WORKSPACE_ID,
    universalIdentifier: In(universalIdentifiers),
  });

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatNavigationMenuItemMaps',
  ]);
};

describe('2-54 workspace command - add campaigns navigation folder (integration)', () => {
  let command: AddCampaignsNavigationFolderCommand;

  const runCommand = () =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: {},
      index: 0,
      total: 1,
    });

  beforeAll(() => {
    command = getAppProviderByClassName<AddCampaignsNavigationFolderCommand>(
      'AddCampaignsNavigationFolderCommand',
    );
  });

  afterAll(async () => {
    await runCommand();
  });

  it('creates the folder linked to the real campaign and list objects, once', async () => {
    const otherNavigationMenuItemsBefore = (
      await readNavigationMenuItems()
    ).filter(
      (navigationMenuItem) =>
        !isCampaignsNavigationMenuItem(navigationMenuItem),
    );

    await deleteNavigationMenuItems(CAMPAIGNS_NAVIGATION_UNIVERSAL_IDENTIFIERS);

    await runCommand();
    await runCommand();

    const navigationMenuItemsAfter = await readNavigationMenuItems();
    const campaignsNavigationMenuItems = navigationMenuItemsAfter.filter(
      isCampaignsNavigationMenuItem,
    );
    const folder = campaignsNavigationMenuItems.find(
      ({ universalIdentifier }) =>
        universalIdentifier === CAMPAIGNS_FOLDER_UNIVERSAL_IDENTIFIER,
    );

    expect(
      navigationMenuItemsAfter.filter(
        (navigationMenuItem) =>
          !isCampaignsNavigationMenuItem(navigationMenuItem),
      ),
    ).toEqual(otherNavigationMenuItemsBefore);
    expect(folder).toMatchObject({
      type: 'FOLDER',
      name: 'Campaigns',
      folderId: null,
    });
    expect(
      campaignsNavigationMenuItems
        .filter(({ type }) => type === 'OBJECT')
        .map(({ folderId, targetObjectNameSingular, position }) => ({
          folderId,
          targetObjectNameSingular,
          position,
        })),
    ).toEqual(
      expect.arrayContaining([
        {
          folderId: folder?.id,
          targetObjectNameSingular: 'messageCampaign',
          position: 0,
        },
        {
          folderId: folder?.id,
          targetObjectNameSingular: 'messageList',
          position: 1,
        },
      ]),
    );
    expect(campaignsNavigationMenuItems).toHaveLength(3);
  });

  it('puts a missing Lists item back into the existing folder', async () => {
    const folderBefore = (await readNavigationMenuItems()).find(
      ({ universalIdentifier }) =>
        universalIdentifier === CAMPAIGNS_FOLDER_UNIVERSAL_IDENTIFIER,
    );

    await deleteNavigationMenuItems([LISTS_UNIVERSAL_IDENTIFIER]);

    await runCommand();

    const campaignsNavigationMenuItems = (
      await readNavigationMenuItems()
    ).filter(isCampaignsNavigationMenuItem);

    expect(
      campaignsNavigationMenuItems.find(
        ({ universalIdentifier }) =>
          universalIdentifier === LISTS_UNIVERSAL_IDENTIFIER,
      ),
    ).toMatchObject({
      folderId: folderBefore?.id,
      targetObjectNameSingular: 'messageList',
      position: 1,
    });
    expect(campaignsNavigationMenuItems).toHaveLength(3);
  });
});
