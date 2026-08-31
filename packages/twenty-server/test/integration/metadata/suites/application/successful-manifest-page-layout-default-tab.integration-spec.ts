import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { type Manifest } from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_PAGE_LAYOUT_ID = uuidv4();
const TEST_FIRST_TAB_ID = uuidv4();
const TEST_SECOND_TAB_ID = uuidv4();

const buildManifest = (overrides?: Partial<Pick<Manifest, 'pageLayouts'>>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const findTestPageLayoutRow = async () => {
  const pageLayoutRows = await globalThis.testDataSource.query(
    `SELECT id, "defaultTabToFocusOnMobileAndSidePanelId" FROM core."pageLayout" WHERE "universalIdentifier" = $1`,
    [TEST_PAGE_LAYOUT_ID],
  );

  return pageLayoutRows[0];
};

const findTestPageLayoutTabRow = async (tabUniversalIdentifier: string) => {
  const pageLayoutTabRows = await globalThis.testDataSource.query(
    `SELECT id, "pageLayoutId" FROM core."pageLayoutTab" WHERE "universalIdentifier" = $1`,
    [tabUniversalIdentifier],
  );

  return pageLayoutTabRows[0];
};

describe('Manifest sync - page layout default tab', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing page layout default tab manifest sync',
      sourcePath: 'test-manifest-page-layout-default-tab',
    });
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should resolve defaultTabToFocusOnMobileAndSidePanel to a tab created in the same first sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayouts: [
          {
            universalIdentifier: TEST_PAGE_LAYOUT_ID,
            name: 'Test Page',
            type: PageLayoutType.STANDALONE_PAGE,
            defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
              TEST_FIRST_TAB_ID,
            tabs: [
              {
                universalIdentifier: TEST_FIRST_TAB_ID,
                title: 'Overview',
                position: 0,
              },
            ],
          },
        ],
      }),
      expectToFail: false,
    });

    const pageLayoutRow = await findTestPageLayoutRow();
    const firstTabRow = await findTestPageLayoutTabRow(TEST_FIRST_TAB_ID);

    expect(pageLayoutRow).toBeDefined();
    expect(firstTabRow).toBeDefined();
    expect(firstTabRow.pageLayoutId).toBe(pageLayoutRow.id);
    expect(pageLayoutRow.defaultTabToFocusOnMobileAndSidePanelId).toBe(
      firstTabRow.id,
    );
  }, 60000);

  it('should resolve defaultTabToFocusOnMobileAndSidePanel to a tab added in the same second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayouts: [
          {
            universalIdentifier: TEST_PAGE_LAYOUT_ID,
            name: 'Test Page',
            type: PageLayoutType.STANDALONE_PAGE,
            defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
              TEST_FIRST_TAB_ID,
            tabs: [
              {
                universalIdentifier: TEST_FIRST_TAB_ID,
                title: 'Overview',
                position: 0,
              },
            ],
          },
        ],
      }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest({
        pageLayouts: [
          {
            universalIdentifier: TEST_PAGE_LAYOUT_ID,
            name: 'Test Page',
            type: PageLayoutType.STANDALONE_PAGE,
            defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
              TEST_SECOND_TAB_ID,
            tabs: [
              {
                universalIdentifier: TEST_FIRST_TAB_ID,
                title: 'Overview',
                position: 0,
              },
              {
                universalIdentifier: TEST_SECOND_TAB_ID,
                title: 'Insights',
                position: 1,
              },
            ],
          },
        ],
      }),
      expectToFail: false,
    });

    const pageLayoutRow = await findTestPageLayoutRow();
    const secondTabRow = await findTestPageLayoutTabRow(TEST_SECOND_TAB_ID);

    expect(secondTabRow).toBeDefined();
    expect(secondTabRow.pageLayoutId).toBe(pageLayoutRow.id);
    expect(pageLayoutRow.defaultTabToFocusOnMobileAndSidePanelId).toBe(
      secondTabRow.id,
    );
  }, 60000);

  it('should clear defaultTabToFocusOnMobileAndSidePanel when a second sync removes it from the manifest', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayouts: [
          {
            universalIdentifier: TEST_PAGE_LAYOUT_ID,
            name: 'Test Page',
            type: PageLayoutType.STANDALONE_PAGE,
            defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier:
              TEST_FIRST_TAB_ID,
            tabs: [
              {
                universalIdentifier: TEST_FIRST_TAB_ID,
                title: 'Overview',
                position: 0,
              },
            ],
          },
        ],
      }),
      expectToFail: false,
    });

    await syncApplication({
      manifest: buildManifest({
        pageLayouts: [
          {
            universalIdentifier: TEST_PAGE_LAYOUT_ID,
            name: 'Test Page',
            type: PageLayoutType.STANDALONE_PAGE,
            tabs: [
              {
                universalIdentifier: TEST_FIRST_TAB_ID,
                title: 'Overview',
                position: 0,
              },
            ],
          },
        ],
      }),
      expectToFail: false,
    });

    const pageLayoutRow = await findTestPageLayoutRow();

    expect(pageLayoutRow.defaultTabToFocusOnMobileAndSidePanelId).toBeNull();
  }, 60000);
});
