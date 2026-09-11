import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { findPageLayoutWidgets } from 'test/integration/metadata/suites/page-layout-widget/utils/find-page-layout-widgets.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type Manifest } from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { MigrateCanvasTabsToVerticalListSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-instance-command-slow-1789128969287-migrate-canvas-tabs-to-vertical-list';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_TAB_ID = uuidv4();
const TEST_WIDGET_ID = uuidv4();

const STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage
    .universalIdentifier;

const PAGE_LAYOUT_TAB_GQL_FIELDS = `
  id
  universalIdentifier
  title
  position
  layoutMode
  pageLayoutId
  applicationId
`;

const PAGE_LAYOUT_WIDGET_GQL_FIELDS = `
  id
  universalIdentifier
  applicationId
  pageLayoutTabId
  title
  type
  position {
    ... on PageLayoutWidgetCanvasPosition {
      layoutMode
    }
  }
  configuration {
    ... on TimelineConfiguration {
      configurationType
    }
  }
`;

let testApplicationId: string;
let standardPersonPageLayoutId: string;

const buildManifest = (overrides?: Partial<Pick<Manifest, 'pageLayoutTabs'>>) =>
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
      description:
        'App for testing standalone page layout tab manifest updates',
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

  describe.each(['nested', 'standalone'])('invalid %s tab', (location) => {
    it.each([
      {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        heightBehavior: 'TAB_VIEPORT',
        message: 'unsupported heightBehavior "TAB_VIEPORT"',
      },
      {
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
        heightBehavior: 'TAB_VIEWPORT',
        message: 'heightBehavior is only supported for VERTICAL_LIST tabs',
      },
    ])(
      'returns an input error for $layoutMode with $heightBehavior',
      async ({ layoutMode, heightBehavior, message }) => {
        const pageLayoutTab = {
          universalIdentifier: TEST_TAB_ID,
          title: 'Invalid tab',
          position: 1000,
          layoutMode,
          widgets: [
            {
              universalIdentifier: TEST_WIDGET_ID,
              title: 'Timeline',
              type: 'TIMELINE',
              heightBehavior,
              configuration: { configurationType: 'TIMELINE' },
            },
          ],
        };
        const manifest: Manifest = JSON.parse(
          JSON.stringify({
            ...buildManifest(),
            pageLayouts:
              location === 'nested'
                ? [
                    {
                      universalIdentifier: uuidv4(),
                      name: 'Invalid page',
                      type: 'STANDALONE_PAGE',
                      tabs: [pageLayoutTab],
                    },
                  ]
                : [],
            pageLayoutTabs:
              location === 'standalone'
                ? [
                    {
                      ...pageLayoutTab,
                      pageLayoutUniversalIdentifier:
                        STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
                    },
                  ]
                : [],
          }),
        );

        const { errors } = await syncApplication({
          manifest,
          expectToFail: true,
        });

        expect(errors).toEqual([
          expect.objectContaining({
            message: expect.stringContaining(message),
            extensions: expect.objectContaining({ code: 'BAD_USER_INPUT' }),
          }),
        ]);
        const applicationTabs = await globalThis.testDataSource.query(
          `SELECT id FROM core."pageLayoutTab" WHERE "applicationId" = $1`,
          [testApplicationId],
        );

        expect(applicationTabs).toHaveLength(0);
      },
    );
  });

  it('should preserve a legacy Canvas manifest and position override through migration and sync', async () => {
    const widgetOverrides = { position: { layoutMode: 'CANVAS' } };
    const buildLegacyCanvasPageLayoutTab = () => ({
      universalIdentifier: TEST_TAB_ID,
      pageLayoutUniversalIdentifier: STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
      title: 'Timeline',
      position: 1000,
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: TEST_WIDGET_ID,
          title: 'Timeline',
          type: 'TIMELINE' as const,
          configuration: {
            configurationType: 'TIMELINE' as const,
          },
        },
      ],
    });

    await syncApplication({
      manifest: buildManifest({
        pageLayoutTabs: [buildLegacyCanvasPageLayoutTab()],
      }),
      expectToFail: false,
    });

    const tabsAfterFirstSync = await findStandardPersonPageLayoutTabs();

    expect(tabsAfterFirstSync).toHaveLength(1);

    const tabAfterFirstSync = tabsAfterFirstSync[0];

    expect(tabAfterFirstSync).toMatchObject({
      universalIdentifier: TEST_TAB_ID,
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
    });

    const { data: widgetsAfterFirstSyncData } = await findPageLayoutWidgets({
      gqlFields: PAGE_LAYOUT_WIDGET_GQL_FIELDS,
      expectToFail: false,
      input: { pageLayoutTabId: tabAfterFirstSync.id },
    });

    expect(widgetsAfterFirstSyncData.getPageLayoutWidgets).toHaveLength(1);

    const widgetAfterFirstSync =
      widgetsAfterFirstSyncData.getPageLayoutWidgets[0];

    expect(widgetAfterFirstSync).toMatchObject({
      universalIdentifier: TEST_WIDGET_ID,
      applicationId: testApplicationId,
      pageLayoutTabId: tabAfterFirstSync.id,
      title: 'Timeline',
      type: 'TIMELINE',
      position: {
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      },
      configuration: {
        configurationType: 'TIMELINE',
      },
    });

    await globalThis.testDataSource.query(
      `UPDATE core."pageLayoutWidget" SET "overrides" = $1 WHERE "id" = $2`,
      [JSON.stringify(widgetOverrides), widgetAfterFirstSync.id],
    );

    const workspaceCacheService =
      getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');
    const command = new MigrateCanvasTabsToVerticalListSlowInstanceCommand(
      workspaceCacheService,
    );

    await command.runDataMigration(globalThis.testDataSource);

    await syncApplication({
      manifest: buildManifest({
        pageLayoutTabs: [buildLegacyCanvasPageLayoutTab()],
      }),
      expectToFail: false,
    });

    const tabsAfterSecondSync = await findStandardPersonPageLayoutTabs();

    expect(tabsAfterSecondSync).toHaveLength(1);

    const tabAfterSecondSync = tabsAfterSecondSync[0];

    expect(tabAfterSecondSync).toMatchObject({
      id: tabAfterFirstSync.id,
      universalIdentifier: TEST_TAB_ID,
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
    });

    const { data: widgetsAfterSecondSyncData } = await findPageLayoutWidgets({
      gqlFields: PAGE_LAYOUT_WIDGET_GQL_FIELDS,
      expectToFail: false,
      input: { pageLayoutTabId: tabAfterSecondSync.id },
    });

    expect(widgetsAfterSecondSyncData.getPageLayoutWidgets).toEqual([
      expect.objectContaining({
        id: widgetAfterFirstSync.id,
        universalIdentifier: TEST_WIDGET_ID,
        applicationId: testApplicationId,
        pageLayoutTabId: tabAfterSecondSync.id,
        title: 'Timeline',
        type: 'TIMELINE',
        position: {
          layoutMode: PageLayoutTabLayoutMode.CANVAS,
        },
        configuration: {
          configurationType: 'TIMELINE',
        },
      }),
    ]);
    const [widgetAfterMigrationAndSync] = await globalThis.testDataSource.query(
      `SELECT "overrides" FROM core."pageLayoutWidget" WHERE "id" = $1`,
      [widgetAfterFirstSync.id],
    );

    expect(widgetAfterMigrationAndSync.overrides).toEqual(widgetOverrides);
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
