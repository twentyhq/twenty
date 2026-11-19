import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AddWorkspaceNavigationMenuSectionCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795087915474-add-workspace-navigation-menu-section.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WORKSPACE_NAVIGATION_MENU_SECTION_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/workspace-navigation-menu-section-universal-identifier.constant';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type NavigationMenuItemRow = {
  id: string;
  universalIdentifier: string;
  type: string;
  parentId: string | null;
  userWorkspaceId: string | null;
  applicationId: string;
  name: string | null;
  position: number;
};

const readNavigationMenuItems = async (): Promise<NavigationMenuItemRow[]> =>
  global.testDataSource.query(
    `SELECT "id", "universalIdentifier", "type", "parentId", "userWorkspaceId",
            "applicationId", "name", "position"
     FROM core."navigationMenuItem"
     WHERE "workspaceId" = $1
     ORDER BY "universalIdentifier"`,
    [SEED_APPLE_WORKSPACE_ID],
  );

const setCustomizableSidebar = (value: boolean) =>
  updateFeatureFlag({
    featureFlag: FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
    value,
    expectToFail: false,
  });

const removeWorkspaceSection = async () => {
  const navigationMenuItemRepository =
    getCoreRepository<NavigationMenuItemEntity>(NavigationMenuItemEntity);
  const section = await navigationMenuItemRepository.findOne({
    where: {
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      universalIdentifier:
        WORKSPACE_NAVIGATION_MENU_SECTION_UNIVERSAL_IDENTIFIER,
    },
  });

  if (isDefined(section)) {
    await navigationMenuItemRepository.update(
      { workspaceId: SEED_APPLE_WORKSPACE_ID, parentId: section.id },
      { parentId: null },
    );
    await navigationMenuItemRepository.delete({ id: section.id });
  }

  await getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatNavigationMenuItemMaps',
  ]);
};

describe('2-61 workspace command - add workspace navigation menu section (integration)', () => {
  let command: AddWorkspaceNavigationMenuSectionCommand;
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
      getAppProviderByClassName<AddWorkspaceNavigationMenuSectionCommand>(
        'AddWorkspaceNavigationMenuSectionCommand',
      );
    await setCustomizableSidebar(false);
    navigationMenuItemsBefore = await readNavigationMenuItems();
  });

  afterAll(async () => {
    await setCustomizableSidebar(false);
    await removeWorkspaceSection();
  });

  it('leaves the sidebar untouched while the flag is off and on a dry run', async () => {
    expect(
      navigationMenuItemsBefore.some(
        ({ universalIdentifier }) =>
          universalIdentifier ===
          WORKSPACE_NAVIGATION_MENU_SECTION_UNIVERSAL_IDENTIFIER,
      ),
    ).toBe(false);

    await runCommand();

    expect(await readNavigationMenuItems()).toEqual(navigationMenuItemsBefore);

    await setCustomizableSidebar(true);
    await runCommand({ dryRun: true });

    expect(await readNavigationMenuItems()).toEqual(navigationMenuItemsBefore);
  });

  it('moves the shared top-level items into one custom-app section, once', async () => {
    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await getAppProviderByClassName<ApplicationService>(
        'ApplicationService',
      ).findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });
    const movedItemIds = navigationMenuItemsBefore
      .filter(
        ({ userWorkspaceId, parentId, applicationId }) =>
          !isDefined(userWorkspaceId) &&
          !isDefined(parentId) &&
          [
            twentyStandardFlatApplication.id,
            workspaceCustomFlatApplication.id,
          ].includes(applicationId),
      )
      .map(({ id }) => id);

    await runCommand();
    await runCommand();

    const navigationMenuItemsAfter = await readNavigationMenuItems();
    const sections = navigationMenuItemsAfter.filter(
      ({ universalIdentifier }) =>
        universalIdentifier ===
        WORKSPACE_NAVIGATION_MENU_SECTION_UNIVERSAL_IDENTIFIER,
    );
    const [section] = sections;

    expect(sections).toHaveLength(1);
    expect(section).toMatchObject({
      type: 'SECTION',
      name: 'Workspace',
      parentId: null,
      userWorkspaceId: null,
      applicationId: workspaceCustomFlatApplication.id,
    });
    expect(movedItemIds.length).toBeGreaterThan(0);
    expect(
      navigationMenuItemsAfter
        .filter(({ id }) => movedItemIds.includes(id))
        .map(({ parentId }) => parentId),
    ).toEqual(movedItemIds.map(() => section.id));
    expect(
      navigationMenuItemsAfter.filter(
        ({ id }) => id !== section.id && !movedItemIds.includes(id),
      ),
    ).toEqual(
      navigationMenuItemsBefore.filter(({ id }) => !movedItemIds.includes(id)),
    );
  });
});
