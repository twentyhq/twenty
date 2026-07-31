import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type NavigationMenuItemManifest } from 'twenty-shared/application';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { NavigationMenuItemType } from 'twenty-shared/types';

const TEST_APP_ID = 'c1b2c3d4-0001-4000-a000-000000000001';
const TEST_ROLE_ID = 'c1b2c3d4-0002-4000-a000-000000000002';
const TEST_NAVIGATION_MENU_ITEM_ID = 'c1b2c3d4-0003-4000-a000-000000000003';

type TestContext = {
  navigationMenuItem: NavigationMenuItemManifest;
};

const failingNavigationMenuItemSyncTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when syncing a FOLDER item without name',
      context: {
        navigationMenuItem: {
          universalIdentifier: TEST_NAVIGATION_MENU_ITEM_ID,
          type: NavigationMenuItemType.FOLDER,
          position: 0,
          icon: 'IconFolder',
        },
      },
    },
    {
      title: 'when syncing a FOLDER item with a blank name',
      context: {
        navigationMenuItem: {
          universalIdentifier: TEST_NAVIGATION_MENU_ITEM_ID,
          type: NavigationMenuItemType.FOLDER,
          position: 0,
          name: '   ',
        },
      },
    },
    {
      title: 'when syncing a LINK item without link',
      context: {
        navigationMenuItem: {
          universalIdentifier: TEST_NAVIGATION_MENU_ITEM_ID,
          type: NavigationMenuItemType.LINK,
          position: 0,
          name: 'Link without url',
        },
      },
    },
    {
      title: 'when syncing a LINK item with a link that is not a valid url',
      context: {
        navigationMenuItem: {
          universalIdentifier: TEST_NAVIGATION_MENU_ITEM_ID,
          type: NavigationMenuItemType.LINK,
          position: 0,
          name: 'Link with invalid url',
          link: 'not a link',
        },
      },
    },
    {
      title:
        'when syncing an OBJECT item without targetObjectUniversalIdentifier',
      context: {
        navigationMenuItem: {
          universalIdentifier: TEST_NAVIGATION_MENU_ITEM_ID,
          type: NavigationMenuItemType.OBJECT,
          position: 0,
          name: 'Object without target',
        },
      },
    },
    {
      title:
        'when syncing an OBJECT item with a targetObjectUniversalIdentifier that is not a uuid',
      context: {
        navigationMenuItem: {
          universalIdentifier: TEST_NAVIGATION_MENU_ITEM_ID,
          type: NavigationMenuItemType.OBJECT,
          position: 0,
          name: 'Object with malformed target',
          targetObjectUniversalIdentifier: 'not-a-uuid',
        },
      },
    },
    {
      title:
        'when syncing a VIEW item with a viewUniversalIdentifier that is not a uuid',
      context: {
        navigationMenuItem: {
          universalIdentifier: TEST_NAVIGATION_MENU_ITEM_ID,
          type: NavigationMenuItemType.VIEW,
          position: 0,
          name: 'View with malformed identifier',
          viewUniversalIdentifier: 'not-a-uuid',
        },
      },
    },
    {
      title:
        'when syncing a PAGE_LAYOUT item with a pageLayoutUniversalIdentifier that is not a uuid',
      context: {
        navigationMenuItem: {
          universalIdentifier: TEST_NAVIGATION_MENU_ITEM_ID,
          type: NavigationMenuItemType.PAGE_LAYOUT,
          position: 0,
          name: 'Page layout with malformed identifier',
          pageLayoutUniversalIdentifier: 'not-a-uuid',
        },
      },
    },
  ];

describe('Sync application should fail on invalid navigation menu items', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Invalid Navigation Menu Item App',
      description: 'App for testing navigation menu item manifest validation',
      sourcePath: 'test-invalid-navigation-menu-item',
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(failingNavigationMenuItemSyncTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: buildBaseManifest({
          appId: TEST_APP_ID,
          roleId: TEST_ROLE_ID,
          overrides: {
            navigationMenuItems: [context.navigationMenuItem],
          },
        }),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );
});
