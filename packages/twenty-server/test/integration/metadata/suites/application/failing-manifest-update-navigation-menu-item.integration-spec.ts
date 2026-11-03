import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  type Manifest,
  type NavigationMenuItemManifest,
} from 'twenty-shared/application';
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

const buildView = (name: string): Manifest['views'][number] => ({
  universalIdentifier: uuidv4(),
  name,
  objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconBuildingSkyscraper',
  position: 1,
});

const buildStandalonePage = (
  name: string,
): Manifest['pageLayouts'][number] => ({
  universalIdentifier: uuidv4(),
  name,
  type: PageLayoutType.STANDALONE_PAGE,
  tabs: [{ universalIdentifier: uuidv4(), title: 'Overview', position: 0 }],
});

const findItemRows = (universalIdentifier: string) =>
  globalThis.testDataSource.query(
    `SELECT id FROM core."navigationMenuItem" WHERE "universalIdentifier" = $1`,
    [universalIdentifier],
  );

const FOLDER: NavigationMenuItemManifest = {
  universalIdentifier: TEST_FOLDER_ID,
  type: NavigationMenuItemType.FOLDER,
  name: 'Test Folder',
  position: 0,
};

const CHILD: NavigationMenuItemManifest = {
  universalIdentifier: TEST_CHILD_ID,
  type: NavigationMenuItemType.LINK,
  name: 'Child Link',
  position: 0,
  link: 'https://example.com',
  folderUniversalIdentifier: TEST_FOLDER_ID,
};

const buildManifest = (
  navigationMenuItems: NavigationMenuItemManifest[],
  overrides?: Partial<Pick<Manifest, 'views' | 'pageLayouts'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { navigationMenuItems, ...overrides },
  });

describe('Manifest update - navigation menu items should fail', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing failing navigation menu item updates',
      sourcePath: 'test-failing-manifest-update-nav',
    });

    await syncApplication({
      manifest: buildManifest([FOLDER, CHILD]),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('when a folder that still contains items changes type', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest([
        {
          ...FOLDER,
          type: NavigationMenuItemType.LINK,
          link: 'https://example.com/folder',
        },
        CHILD,
      ]),
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'A folder that still contains items cannot change type',
    );

    const [folderRow] = await globalThis.testDataSource.query(
      `SELECT type FROM core."navigationMenuItem" WHERE "universalIdentifier" = $1`,
      [TEST_FOLDER_ID],
    );

    expect(folderRow.type).toBe(NavigationMenuItemType.FOLDER);
  }, 60000);

  // The delete runs before the update and cascades to the item, which the update then misses.
  it('when an item is re-pointed away from a view deleted in the same sync', async () => {
    const itemUniversalIdentifier = uuidv4();
    const oldView = buildView('Old companies');
    const newView = buildView('New companies');
    const itemPointingTo = (viewUniversalIdentifier: string) => ({
      universalIdentifier: itemUniversalIdentifier,
      type: NavigationMenuItemType.VIEW,
      name: 'Companies',
      position: 1,
      viewUniversalIdentifier,
    });

    await syncApplication({
      manifest: buildManifest(
        [FOLDER, CHILD, itemPointingTo(oldView.universalIdentifier)],
        { views: [oldView] },
      ),
      expectToFail: false,
    });

    const { errors } = await syncApplication({
      manifest: buildManifest(
        [FOLDER, CHILD, itemPointingTo(newView.universalIdentifier)],
        { views: [newView] },
      ),
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'Cannot re-point a navigation menu item away from a target deleted in the same sync',
    );
    expect(await findItemRows(itemUniversalIdentifier)).toHaveLength(1);
  }, 60000);

  it('when an item is re-pointed away from a page layout deleted in the same sync', async () => {
    const itemUniversalIdentifier = uuidv4();
    const oldPage = buildStandalonePage('Old funnel');
    const newPage = buildStandalonePage('New funnel');
    const itemPointingTo = (pageLayoutUniversalIdentifier: string) => ({
      universalIdentifier: itemUniversalIdentifier,
      type: NavigationMenuItemType.PAGE_LAYOUT,
      name: 'Funnel',
      position: 1,
      pageLayoutUniversalIdentifier,
    });

    await syncApplication({
      manifest: buildManifest(
        [FOLDER, CHILD, itemPointingTo(oldPage.universalIdentifier)],
        { pageLayouts: [oldPage] },
      ),
      expectToFail: false,
    });

    const { errors } = await syncApplication({
      manifest: buildManifest(
        [FOLDER, CHILD, itemPointingTo(newPage.universalIdentifier)],
        { pageLayouts: [newPage] },
      ),
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'Cannot re-point a navigation menu item away from a target deleted in the same sync',
    );
    expect(await findItemRows(itemUniversalIdentifier)).toHaveLength(1);
  }, 60000);
});
