import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';
import { findPageLayoutWidgets } from 'test/integration/metadata/suites/page-layout-widget/utils/find-page-layout-widgets.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import {
  type Manifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_TAB_ID = uuidv4();
const FIRST_WIDGET_ID = uuidv4();
const SECOND_WIDGET_ID = uuidv4();

const STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID =
  '20202020-a102-4002-8002-ae0a1ea11002';

const PAGE_LAYOUT_TAB_GQL_FIELDS = `
  id
  applicationId
`;

const PAGE_LAYOUT_WIDGET_GQL_FIELDS = `
  id
  title
  gridPosition {
    row
    column
    rowSpan
    columnSpan
  }
  position {
    ... on PageLayoutWidgetVerticalListPosition {
      layoutMode
      index
    }
    ... on PageLayoutWidgetGridPosition {
      layoutMode
      row
      column
      rowSpan
      columnSpan
    }
    ... on PageLayoutWidgetCanvasPosition {
      layoutMode
    }
  }
`;

let testApplicationId: string;
let standardPersonPageLayoutId: string;

// A manifest built before the SDK resolved widget positions declares placement
// through the widgets array order alone
const buildLegacyWidget = (
  universalIdentifier: string,
  title: string,
): PageLayoutWidgetManifest => ({
  universalIdentifier,
  title,
  type: 'IFRAME',
  configuration: {
    configurationType: 'IFRAME',
    url: 'https://example.com',
  },
});

const buildManifest = (pageLayoutTabs: Manifest['pageLayoutTabs']): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { pageLayoutTabs },
  });

const findTestApplicationTabId = async () => {
  const { data } = await findPageLayoutTabs({
    gqlFields: PAGE_LAYOUT_TAB_GQL_FIELDS,
    expectToFail: false,
    input: { pageLayoutId: standardPersonPageLayoutId },
  });

  const tab = data.getPageLayoutTabs.find(
    (pageLayoutTab) => pageLayoutTab.applicationId === testApplicationId,
  );

  return tab?.id;
};

const findTestApplicationWidgets = async () => {
  const pageLayoutTabId = await findTestApplicationTabId();

  const { data } = await findPageLayoutWidgets({
    gqlFields: PAGE_LAYOUT_WIDGET_GQL_FIELDS,
    expectToFail: false,
    input: { pageLayoutTabId: pageLayoutTabId as string },
  });

  return data.getPageLayoutWidgets;
};

describe('Manifest sync - page layout widget position', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing page layout widget position resolution',
      sourcePath: 'test-manifest-sync-page-layout-widget-position',
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

  it('should index positionless vertical list widgets in declaration order', async () => {
    await syncApplication({
      manifest: buildManifest([
        {
          universalIdentifier: TEST_TAB_ID,
          pageLayoutUniversalIdentifier:
            STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
          title: 'Insights',
          position: 1000,
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgets: [
            buildLegacyWidget(FIRST_WIDGET_ID, 'First'),
            buildLegacyWidget(SECOND_WIDGET_ID, 'Second'),
          ],
        },
      ]),
      expectToFail: false,
    });

    const widgets = await findTestApplicationWidgets();

    expect(widgets).toHaveLength(2);
    expect(widgets.map(({ title, position }) => ({ title, position }))).toEqual(
      expect.arrayContaining([
        {
          title: 'First',
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 0,
          },
        },
        {
          title: 'Second',
          position: {
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            index: 1,
          },
        },
      ]),
    );
  }, 60000);

  it('should mirror the grid position of positionless grid widgets', async () => {
    await syncApplication({
      manifest: buildManifest([
        {
          universalIdentifier: TEST_TAB_ID,
          pageLayoutUniversalIdentifier:
            STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
          title: 'Insights',
          position: 1000,
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgets: [
            {
              ...buildLegacyWidget(FIRST_WIDGET_ID, 'First'),
              gridPosition: { row: 2, column: 6, rowSpan: 4, columnSpan: 6 },
            },
          ],
        },
      ]),
      expectToFail: false,
    });

    const widgets = await findTestApplicationWidgets();

    expect(widgets).toHaveLength(1);
    expect(widgets[0].position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 2,
      column: 6,
      rowSpan: 4,
      columnSpan: 6,
    });
  }, 60000);

  it('should keep the position declared by the manifest', async () => {
    await syncApplication({
      manifest: buildManifest([
        {
          universalIdentifier: TEST_TAB_ID,
          pageLayoutUniversalIdentifier:
            STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
          title: 'Insights',
          position: 1000,
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgets: [
            {
              ...buildLegacyWidget(FIRST_WIDGET_ID, 'First'),
              position: {
                layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                index: 42,
              },
            },
          ],
        },
      ]),
      expectToFail: false,
    });

    const widgets = await findTestApplicationWidgets();

    expect(widgets).toHaveLength(1);
    expect(widgets[0].position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 42,
    });
  }, 60000);

  it('should stamp a position on widgets left positionless by an earlier sync', async () => {
    const legacyTab = {
      universalIdentifier: TEST_TAB_ID,
      pageLayoutUniversalIdentifier: STANDARD_PERSON_PAGE_LAYOUT_UNIVERSAL_ID,
      title: 'Insights',
      position: 1000,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      widgets: [
        buildLegacyWidget(FIRST_WIDGET_ID, 'First'),
        buildLegacyWidget(SECOND_WIDGET_ID, 'Second'),
      ],
    };

    await syncApplication({
      manifest: buildManifest([legacyTab]),
      expectToFail: false,
    });

    const pageLayoutTabId = await findTestApplicationTabId();

    await globalThis.testDataSource.query(
      `UPDATE core."pageLayoutWidget" SET "position" = NULL WHERE "pageLayoutTabId" = $1`,
      [pageLayoutTabId],
    );

    // The metadata cache still holds the positions written by the first sync, while a
    // workspace installed by an older server would have them null on both sides
    await getAppProviderByClassName<WorkspaceManyOrAllFlatEntityMapsCacheService>(
      'WorkspaceManyOrAllFlatEntityMapsCacheService',
    ).flushFlatEntityMaps({ workspaceId: SEED_APPLE_WORKSPACE_ID });

    await syncApplication({
      manifest: buildManifest([legacyTab]),
      expectToFail: false,
    });

    const widgetRows = await globalThis.testDataSource.query(
      `SELECT title, position FROM core."pageLayoutWidget" WHERE "pageLayoutTabId" = $1 ORDER BY title`,
      [pageLayoutTabId],
    );

    expect(widgetRows).toEqual([
      {
        title: 'First',
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
        },
      },
      {
        title: 'Second',
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 1,
        },
      },
    ]);
  }, 60000);
});
