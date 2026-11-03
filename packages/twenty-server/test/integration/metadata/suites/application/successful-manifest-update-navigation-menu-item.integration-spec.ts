import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  NavigationMenuItemType,
  PageLayoutType,
  ViewType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FOLDER_ID = uuidv4();
const TEST_CHILD_ID = uuidv4();
const TEST_ITEM_ID = uuidv4();
const TEST_VIEW_ID = uuidv4();
const TEST_PAGE_LAYOUT_ID = uuidv4();

const TEST_VIEW: Manifest['views'][number] = {
  universalIdentifier: TEST_VIEW_ID,
  name: 'Paying companies',
  objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconCreditCard',
  position: 1,
};

const TEST_PAGE_LAYOUT: Manifest['pageLayouts'][number] = {
  universalIdentifier: TEST_PAGE_LAYOUT_ID,
  name: 'Funnel',
  type: PageLayoutType.STANDALONE_PAGE,
  tabs: [{ universalIdentifier: uuidv4(), title: 'Overview', position: 0 }],
};

const NAV_ITEM_GQL_FIELDS = `
  id
  type
  name
  icon
  link
  position
  folderId
  viewId
  pageLayoutId
  targetObjectMetadataId
  applicationId
`;

let testApplicationId: string;

const buildManifest = (
  overrides?: Partial<
    Pick<Manifest, 'navigationMenuItems' | 'views' | 'pageLayouts'>
  >,
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
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
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

  it('should move existing menu items into a folder created in the same sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        navigationMenuItems: [
          {
            universalIdentifier: TEST_CHILD_ID,
            type: NavigationMenuItemType.LINK,
            name: 'Child Link',
            icon: 'IconLink',
            position: 0,
            link: 'https://example.com',
          },
        ],
      }),
      expectToFail: false,
    });

    const itemsAfterFirstSync = await findAppNavigationMenuItems();

    expect(itemsAfterFirstSync).toHaveLength(1);
    expect(itemsAfterFirstSync[0]).toMatchObject({
      type: NavigationMenuItemType.LINK,
      name: 'Child Link',
      folderId: null,
    });

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
            position: 0,
            link: 'https://example.com',
            folderUniversalIdentifier: TEST_FOLDER_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    const itemsAfterSecondSync = await findAppNavigationMenuItems();

    expect(itemsAfterSecondSync).toHaveLength(2);

    const folder = itemsAfterSecondSync.find(
      (item) => item.type === NavigationMenuItemType.FOLDER,
    );
    const child = itemsAfterSecondSync.find(
      (item) => item.type === NavigationMenuItemType.LINK,
    );

    expect(folder).toBeDefined();
    expect(child).toBeDefined();
    expect(child).toMatchObject({
      type: NavigationMenuItemType.LINK,
      name: 'Child Link',
      folderId: folder!.id,
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
  it('should re-point an object item to a view on the same item', async () => {
    await syncApplication({
      manifest: buildManifest({
        views: [TEST_VIEW],
        navigationMenuItems: [
          {
            universalIdentifier: TEST_ITEM_ID,
            type: NavigationMenuItemType.OBJECT,
            name: 'Companies',
            position: 0,
            targetObjectUniversalIdentifier:
              STANDARD_OBJECTS.company.universalIdentifier,
          },
        ],
      }),
      expectToFail: false,
    });

    const [itemAfterFirstSync] = await findAppNavigationMenuItems();

    const { errors } = await syncApplication({
      manifest: buildManifest({
        views: [TEST_VIEW],
        navigationMenuItems: [
          {
            universalIdentifier: TEST_ITEM_ID,
            type: NavigationMenuItemType.VIEW,
            name: 'Paying',
            position: 0,
            viewUniversalIdentifier: TEST_VIEW_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const [viewRow] = await globalThis.testDataSource.query(
      `SELECT id FROM core."view" WHERE "universalIdentifier" = $1`,
      [TEST_VIEW_ID],
    );
    const itemsAfterSecondSync = await findAppNavigationMenuItems();

    expect(itemsAfterSecondSync).toHaveLength(1);
    expect(itemsAfterSecondSync[0]).toMatchObject({
      id: itemAfterFirstSync.id,
      type: NavigationMenuItemType.VIEW,
      name: 'Paying',
      viewId: viewRow.id,
      targetObjectMetadataId: null,
    });
  }, 60000);

  it('should re-point a link item to a page layout on the same item', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayouts: [TEST_PAGE_LAYOUT],
        navigationMenuItems: [
          {
            universalIdentifier: TEST_ITEM_ID,
            type: NavigationMenuItemType.LINK,
            name: 'Funnel',
            position: 0,
            link: 'https://example.com/dashboard',
          },
        ],
      }),
      expectToFail: false,
    });

    const [itemAfterFirstSync] = await findAppNavigationMenuItems();

    const { errors } = await syncApplication({
      manifest: buildManifest({
        pageLayouts: [TEST_PAGE_LAYOUT],
        navigationMenuItems: [
          {
            universalIdentifier: TEST_ITEM_ID,
            type: NavigationMenuItemType.PAGE_LAYOUT,
            name: 'Funnel',
            position: 0,
            pageLayoutUniversalIdentifier: TEST_PAGE_LAYOUT_ID,
          },
        ],
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const [pageLayoutRow] = await globalThis.testDataSource.query(
      `SELECT id FROM core."pageLayout" WHERE "universalIdentifier" = $1`,
      [TEST_PAGE_LAYOUT_ID],
    );
    const itemsAfterSecondSync = await findAppNavigationMenuItems();

    expect(itemsAfterSecondSync).toHaveLength(1);
    expect(itemsAfterSecondSync[0]).toMatchObject({
      id: itemAfterFirstSync.id,
      type: NavigationMenuItemType.PAGE_LAYOUT,
      link: null,
      pageLayoutId: pageLayoutRow.id,
    });
  }, 60000);
});
