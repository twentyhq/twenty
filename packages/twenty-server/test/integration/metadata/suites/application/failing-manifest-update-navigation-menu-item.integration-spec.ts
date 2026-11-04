import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import {
  type Manifest,
  type NavigationMenuItemManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  NavigationMenuItemType,
  PageLayoutType,
  ViewType,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_VIEW_ITEM_ID = uuidv4();
const TEST_PAGE_LAYOUT_ITEM_ID = uuidv4();

const NAVIGATION_MENU_ITEM_GQL_FIELDS = `
  id
  type
  name
  link
  position
  folderId
  viewId
  pageLayoutId
  targetObjectMetadataId
  applicationId
`;

const FOLDER: NavigationMenuItemManifest = {
  universalIdentifier: uuidv4(),
  type: NavigationMenuItemType.FOLDER,
  name: 'Test Folder',
  position: 0,
};

const CHILD: NavigationMenuItemManifest = {
  universalIdentifier: uuidv4(),
  type: NavigationMenuItemType.LINK,
  name: 'Child Link',
  position: 1,
  link: 'https://example.com',
  folderUniversalIdentifier: FOLDER.universalIdentifier,
};

const buildView = (name: string): Manifest['views'][number] => ({
  universalIdentifier: uuidv4(),
  name,
  objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
  type: ViewType.TABLE,
  icon: 'IconBuildingSkyscraper',
  position: 1,
});

const buildStandalonePageLayout = (
  name: string,
): Manifest['pageLayouts'][number] => ({
  universalIdentifier: uuidv4(),
  name,
  type: PageLayoutType.STANDALONE_PAGE,
  tabs: [{ universalIdentifier: uuidv4(), title: 'Overview', position: 0 }],
});

const OLD_VIEW = buildView('Old companies');
const NEW_VIEW = buildView('New companies');
const OLD_PAGE_LAYOUT = buildStandalonePageLayout('Old funnel');
const NEW_PAGE_LAYOUT = buildStandalonePageLayout('New funnel');

const buildViewItem = (
  view: Manifest['views'][number],
): NavigationMenuItemManifest => ({
  universalIdentifier: TEST_VIEW_ITEM_ID,
  type: NavigationMenuItemType.VIEW,
  name: 'Companies',
  position: 2,
  viewUniversalIdentifier: view.universalIdentifier,
});

const buildPageLayoutItem = (
  pageLayout: Manifest['pageLayouts'][number],
): NavigationMenuItemManifest => ({
  universalIdentifier: TEST_PAGE_LAYOUT_ITEM_ID,
  type: NavigationMenuItemType.PAGE_LAYOUT,
  name: 'Funnel',
  position: 2,
  pageLayoutUniversalIdentifier: pageLayout.universalIdentifier,
});

type ManifestOverrides = Partial<
  Pick<Manifest, 'navigationMenuItems' | 'views' | 'pageLayouts'>
>;

type TestContext = {
  initialManifestOverrides: ManifestOverrides;
  failingManifestOverrides: ManifestOverrides;
};

const failingNavigationMenuItemUpdateTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when a folder that still contains items changes type',
      context: {
        initialManifestOverrides: { navigationMenuItems: [FOLDER, CHILD] },
        failingManifestOverrides: {
          navigationMenuItems: [
            {
              ...FOLDER,
              type: NavigationMenuItemType.LINK,
              link: 'https://example.com/folder',
            },
            CHILD,
          ],
        },
      },
    },
    {
      title:
        'when an item is re-pointed away from a view deleted in the same sync',
      context: {
        initialManifestOverrides: {
          navigationMenuItems: [buildViewItem(OLD_VIEW)],
          views: [OLD_VIEW],
        },
        failingManifestOverrides: {
          navigationMenuItems: [buildViewItem(NEW_VIEW)],
          views: [NEW_VIEW],
        },
      },
    },
    {
      title:
        'when an item is re-pointed away from a page layout deleted in the same sync',
      context: {
        initialManifestOverrides: {
          navigationMenuItems: [buildPageLayoutItem(OLD_PAGE_LAYOUT)],
          pageLayouts: [OLD_PAGE_LAYOUT],
        },
        failingManifestOverrides: {
          navigationMenuItems: [buildPageLayoutItem(NEW_PAGE_LAYOUT)],
          pageLayouts: [NEW_PAGE_LAYOUT],
        },
      },
    },
  ];

const buildManifest = (overrides: ManifestOverrides) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const findApplicationNavigationMenuItems = async (applicationId: string) => {
  const { data } = await findNavigationMenuItems({
    gqlFields: NAVIGATION_MENU_ITEM_GQL_FIELDS,
    expectToFail: false,
    input: undefined,
  });

  return data.navigationMenuItems.filter(
    (navigationMenuItem) => navigationMenuItem.applicationId === applicationId,
  );
};

describe('Failing manifest update - navigation menu items', () => {
  let testApplicationId: string;

  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing failing navigation menu item updates',
      sourcePath: 'test-failing-manifest-update-nav',
    });

    const { data } = await findOneApplication({
      input: { universalIdentifier: TEST_APP_ID },
      gqlFields: 'id',
      expectToFail: false,
    });

    testApplicationId = data.findOneApplication.id;
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(failingNavigationMenuItemUpdateTestCases))(
    '$title',
    async ({ context }) => {
      await syncApplication({
        manifest: buildManifest(context.initialManifestOverrides),
        expectToFail: false,
      });

      const navigationMenuItemsBeforeFailingSync =
        await findApplicationNavigationMenuItems(testApplicationId);

      const { errors } = await syncApplication({
        manifest: buildManifest(context.failingManifestOverrides),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
      expect(
        await findApplicationNavigationMenuItems(testApplicationId),
      ).toEqual(navigationMenuItemsBeforeFailingSync);
    },
    60000,
  );
});
