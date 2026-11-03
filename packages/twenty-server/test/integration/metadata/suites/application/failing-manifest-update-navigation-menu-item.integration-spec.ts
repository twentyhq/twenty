import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type NavigationMenuItemManifest } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_FOLDER_ID = uuidv4();
const TEST_CHILD_ID = uuidv4();

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

const buildManifest = (navigationMenuItems: NavigationMenuItemManifest[]) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { navigationMenuItems },
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
});
