import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { type Manifest } from 'twenty-shared/application';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_TAB_ID = uuidv4();

const STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID =
  '20202020-a102-4002-8002-ae0a1ea11002';

const PAGE_LAYOUT_TAB_GQL_FIELDS = `
  id
  title
  position
  pageLayoutId
  applicationId
`;

let testApplicationId: string;
let standardPersonPageLayoutId: string;

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'pageLayoutTabs'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const findStandardPersonPageLayoutTabs = async () => {
  const { data } = await findPageLayoutTabs({
    gqlFields: PAGE_LAYOUT_TAB_GQL_FIELDS,
    expectToFail: false,
    input: { pageLayoutId: standardPersonPageLayoutId },
  });

  return data.getPageLayoutTabs.filter(
    (tab) => tab.applicationId === testApplicationId,
  );
};

describe('Manifest update - page layout tabs (standalone)', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing standalone page layout tab manifest updates',
      sourcePath: 'test-manifest-update-page-layout-tab',
    });

    const applicationRow = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    testApplicationId = applicationRow[0].id;

    const pageLayoutRow = await globalThis.testDataSource.query(
      `SELECT id FROM core."pageLayout" WHERE "universalIdentifier" = $1`,
      [STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID],
    );

    standardPersonPageLayoutId = pageLayoutRow[0].id;
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should attach a standalone tab to a standard page layout', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayoutTabs: [
          {
            universalIdentifier: TEST_TAB_ID,
            pageLayoutUniversalIdentifier:
              STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
            title: 'Insights',
            position: 1000,
            icon: 'IconChartBar',
            layoutMode: PageLayoutTabLayoutMode.CANVAS,
          },
        ],
      }),
      expectToFail: false,
    });

    const tabs = await findStandardPersonPageLayoutTabs();

    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toMatchObject({
      title: 'Insights',
      position: 1000,
      pageLayoutId: standardPersonPageLayoutId,
      applicationId: testApplicationId,
    });
  }, 60000);

  it('should rename and reposition a standalone tab on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayoutTabs: [
          {
            universalIdentifier: TEST_TAB_ID,
            pageLayoutUniversalIdentifier:
              STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
            title: 'Insights',
            position: 1000,
            layoutMode: PageLayoutTabLayoutMode.CANVAS,
          },
        ],
      }),
      expectToFail: false,
    });

    const tabsAfterFirstSync = await findStandardPersonPageLayoutTabs();

    expect(tabsAfterFirstSync).toHaveLength(1);
    expect(tabsAfterFirstSync[0]).toMatchObject({
      title: 'Insights',
      position: 1000,
    });

    await syncApplication({
      manifest: buildManifest({
        pageLayoutTabs: [
          {
            universalIdentifier: TEST_TAB_ID,
            pageLayoutUniversalIdentifier:
              STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
            title: 'Renamed Insights',
            position: 1500,
            layoutMode: PageLayoutTabLayoutMode.CANVAS,
          },
        ],
      }),
      expectToFail: false,
    });

    const tabsAfterSecondSync = await findStandardPersonPageLayoutTabs();

    expect(tabsAfterSecondSync).toHaveLength(1);
    expect(tabsAfterSecondSync[0]).toMatchObject({
      title: 'Renamed Insights',
      position: 1500,
    });
  }, 60000);

  it('should delete a standalone tab when removed from manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayoutTabs: [
          {
            universalIdentifier: TEST_TAB_ID,
            pageLayoutUniversalIdentifier:
              STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
            title: 'Insights',
            position: 1000,
            layoutMode: PageLayoutTabLayoutMode.CANVAS,
          },
        ],
      }),
      expectToFail: false,
    });

    const tabsAfterFirstSync = await findStandardPersonPageLayoutTabs();

    expect(tabsAfterFirstSync).toHaveLength(1);

    await syncApplication({
      manifest: buildManifest({ pageLayoutTabs: [] }),
      expectToFail: false,
    });

    const tabsAfterSecondSync = await findStandardPersonPageLayoutTabs();

    expect(tabsAfterSecondSync).toHaveLength(0);
  }, 60000);

  it('should fail to sync when standalone tab references a non-existent page layout', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        pageLayoutTabs: [
          {
            universalIdentifier: TEST_TAB_ID,
            pageLayoutUniversalIdentifier: uuidv4(),
            title: 'Insights',
            position: 1000,
            layoutMode: PageLayoutTabLayoutMode.CANVAS,
          },
        ],
      }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
  }, 60000);
});
