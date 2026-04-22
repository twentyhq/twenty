import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { type Manifest } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FOLDER_ID = uuidv4();
const TEST_CHILD_ID = uuidv4();

const NAV_ITEM_GQL_FIELDS = `
  id
  type
  name
  icon
  link
  position
  folderId
  applicationId
`;

let testApplicationId: string;

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'navigationMenuItems'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const findAppNavigationMenuItems = async () => {
  const { data } = await findNavigationMenuItems({
    gqlFields: NAV_ITEM_GQL_FIELDS,
    expectToFail: false,
    input: undefined,
  });

  return data.navigationMenuItems.filter(
    (item) => item.applicationId === testApplicationId,
  );
};

describe('Manifest update - navigation menu items', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing navigation menu item manifest updates',
      sourcePath: 'test-manifest-update-nav',
    });

    const result = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    testApplicationId = result[0].id;
  }, 60000);

  afterEach(async () => {
    try {
      await uninstallApplication({
        universalIdentifier: TEST_APP_ID,
        expectToFail: false,
      });
    } catch {
      // May fail if the test didn't fully install/sync
    }

    await globalThis.testDataSource.query(
      `DELETE FROM core."role" WHERE "universalIdentifier" = $1`,
      [TEST_ROLE_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE "applicationId" IN (
        SELECT id FROM core."application" WHERE "universalIdentifier" = $1
      )`,
      [TEST_APP_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."application"
       WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."applicationRegistration"
       WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );
  });

  it('should create a folder and a child item when child is listed BEFORE folder in manifest', async () => {
    await syncApplication({
      manifest: buildManifest({
        navigationMenuItems: [
          {
            universalIdentifier: TEST_CHILD_ID,
            type: NavigationMenuItemType.LINK,
            name: 'Child Link',
            icon: 'IconLink',
            position: 1,
            link: 'https://example.com',
            folderUniversalIdentifier: TEST_FOLDER_ID,
          },
          {
            universalIdentifier: TEST_FOLDER_ID,
            type: NavigationMenuItemType.FOLDER,
            name: 'Test Folder',
            icon: 'IconFolder',
            position: 0,
          },
        ],
      }),
      expectToFail: false,
    });

    const items = await findAppNavigationMenuItems();

    expect(items).toHaveLength(2);

    const folder = items.find(
      (item) => item.type === NavigationMenuItemType.FOLDER,
    );
    const child = items.find(
      (item) => item.type === NavigationMenuItemType.LINK,
    );

    expect(folder).toBeDefined();
    expect(folder).toMatchObject({
      type: NavigationMenuItemType.FOLDER,
      name: 'Test Folder',
    });

    expect(child).toBeDefined();
    expect(child).toMatchObject({
      type: NavigationMenuItemType.LINK,
      name: 'Child Link',
      folderId: folder!.id,
    });
  }, 60000);

  it('should update navigation menu item properties on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        navigationMenuItems: [
          {
            universalIdentifier: TEST_FOLDER_ID,
            type: NavigationMenuItemType.FOLDER,
            name: 'Test Folder',
            icon: 'IconFolder',
            position: 0,
          },
        ],
      }),
      expectToFail: false,
    });

    const itemsAfterFirstSync = await findAppNavigationMenuItems();

    expect(itemsAfterFirstSync).toHaveLength(1);
    expect(itemsAfterFirstSync[0]).toMatchObject({
      name: 'Test Folder',
      icon: 'IconFolder',
    });

    await syncApplication({
      manifest: buildManifest({
        navigationMenuItems: [
          {
            universalIdentifier: TEST_FOLDER_ID,
            type: NavigationMenuItemType.FOLDER,
            name: 'Renamed Folder',
            icon: 'IconFolderOpen',
            position: 0,
          },
        ],
      }),
      expectToFail: false,
    });

    const itemsAfterSecondSync = await findAppNavigationMenuItems();

    expect(itemsAfterSecondSync).toHaveLength(1);
    expect(itemsAfterSecondSync[0]).toMatchObject({
      name: 'Renamed Folder',
      icon: 'IconFolderOpen',
    });
  }, 60000);

  it('should delete navigation menu items when removed from manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        navigationMenuItems: [
          {
            universalIdentifier: TEST_FOLDER_ID,
            type: NavigationMenuItemType.FOLDER,
            name: 'Test Folder',
            icon: 'IconFolder',
            position: 0,
          },
          {
            universalIdentifier: TEST_CHILD_ID,
            type: NavigationMenuItemType.LINK,
            name: 'Child Link',
            icon: 'IconLink',
            position: 1,
            link: 'https://example.com',
            folderUniversalIdentifier: TEST_FOLDER_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    const itemsAfterFirstSync = await findAppNavigationMenuItems();

    expect(itemsAfterFirstSync).toHaveLength(2);

    await syncApplication({
      manifest: buildManifest({
        navigationMenuItems: [
          {
            universalIdentifier: TEST_FOLDER_ID,
            type: NavigationMenuItemType.FOLDER,
            name: 'Test Folder',
            icon: 'IconFolder',
            position: 0,
          },
        ],
      }),
      expectToFail: false,
    });

    const itemsAfterSecondSync = await findAppNavigationMenuItems();

    expect(itemsAfterSecondSync).toHaveLength(1);
    expect(itemsAfterSecondSync[0]).toMatchObject({
      type: NavigationMenuItemType.FOLDER,
      name: 'Test Folder',
    });
  }, 60000);
});
