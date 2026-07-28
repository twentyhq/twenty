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
  layoutMode
  pageLayoutId
  applicationId
`;

let testApplicationId: string;
let standardPersonPageLayoutId: string;

const buildManifest = (overrides?: Partial<Pick<Manifest, 'pageLayoutTabs'>>) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const buildTabManifest = ({
  title,
  layoutMode,
}: {
  title: string;
  layoutMode: PageLayoutTabLayoutMode;
}) => ({
  universalIdentifier: TEST_TAB_ID,
  pageLayoutUniversalIdentifier: STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
  title,
  position: 1000,
  layoutMode,
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

describe('Manifest sync - page layout tab layoutMode', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing page layout tab layoutMode manifest sync',
      sourcePath: 'test-manifest-sync-page-layout-tab-layout-mode',
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

  it('should persist layoutMode on tab creation', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayoutTabs: [
          buildTabManifest({
            title: 'Insights',
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          }),
        ],
      }),
      expectToFail: false,
    });

    const tabs = await findStandardPersonPageLayoutTabs();

    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toMatchObject({
      title: 'Insights',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    });
  }, 60000);

  // Documents https://github.com/twentyhq/twenty/issues/23402: layoutMode has
  // toCompare: false in ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME,
  // so the migration builder never emits an update for it. Marked as failing:
  // these tests assert the desired behavior and start passing once fixed.
  it.failing(
    'should update layoutMode when it is the only changed property on second sync',
    async () => {
      await syncApplication({
        manifest: buildManifest({
          pageLayoutTabs: [
            buildTabManifest({
              title: 'Insights',
              layoutMode: PageLayoutTabLayoutMode.GRID,
            }),
          ],
        }),
        expectToFail: false,
      });

      const tabsAfterFirstSync = await findStandardPersonPageLayoutTabs();

      expect(tabsAfterFirstSync).toHaveLength(1);
      expect(tabsAfterFirstSync[0].layoutMode).toBe(
        PageLayoutTabLayoutMode.GRID,
      );

      await syncApplication({
        manifest: buildManifest({
          pageLayoutTabs: [
            buildTabManifest({
              title: 'Insights',
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            }),
          ],
        }),
        expectToFail: false,
      });

      const tabsAfterSecondSync = await findStandardPersonPageLayoutTabs();

      expect(tabsAfterSecondSync).toHaveLength(1);
      expect(tabsAfterSecondSync[0].layoutMode).toBe(
        PageLayoutTabLayoutMode.VERTICAL_LIST,
      );
    },
    60000,
  );

  it.failing(
    'should update layoutMode alongside another changed property on second sync',
    async () => {
      await syncApplication({
        manifest: buildManifest({
          pageLayoutTabs: [
            buildTabManifest({
              title: 'Insights',
              layoutMode: PageLayoutTabLayoutMode.GRID,
            }),
          ],
        }),
        expectToFail: false,
      });

      await syncApplication({
        manifest: buildManifest({
          pageLayoutTabs: [
            buildTabManifest({
              title: 'Renamed Insights',
              layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            }),
          ],
        }),
        expectToFail: false,
      });

      const tabsAfterSecondSync = await findStandardPersonPageLayoutTabs();

      expect(tabsAfterSecondSync).toHaveLength(1);
      expect(tabsAfterSecondSync[0]).toMatchObject({
        title: 'Renamed Insights',
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      });
    },
    60000,
  );
});
