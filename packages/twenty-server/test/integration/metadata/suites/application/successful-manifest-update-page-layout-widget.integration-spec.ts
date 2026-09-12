import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { WIDGET_POSITION_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout-widget/constants/widget-position-gql-fields.constant';
import { findPageLayoutWidgets } from 'test/integration/metadata/suites/page-layout-widget/utils/find-page-layout-widgets.util';
import {
  type Manifest,
  type StandalonePageLayoutWidgetManifest,
} from 'twenty-shared/application';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_WIDGET_ID = uuidv4();

const STANDARD_PERSON_HOME_TAB_UNIVERSAL_ID =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
    .universalIdentifier;

const PAGE_LAYOUT_WIDGET_GQL_FIELDS = `
  id
  universalIdentifier
  applicationId
  pageLayoutTabId
  title
  type
  position {
    ${WIDGET_POSITION_GQL_FIELDS}
  }
  configuration {
    ... on TimelineConfiguration {
      configurationType
    }
  }
`;

let testApplicationId: string;
let standardPersonHomeTabId: string;

const buildManifest = (
  overrides?: Partial<Pick<Manifest, 'pageLayoutWidgets'>>,
) =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides,
  });

const buildTimelineWidget = ({
  title,
  index,
}: {
  title: string;
  index: number;
}): StandalonePageLayoutWidgetManifest => ({
  universalIdentifier: TEST_WIDGET_ID,
  pageLayoutTabUniversalIdentifier: STANDARD_PERSON_HOME_TAB_UNIVERSAL_ID,
  title,
  type: 'TIMELINE',
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index },
  configuration: { configurationType: 'TIMELINE' },
});

const findStandardPersonHomeTabWidgets = async () => {
  const { data } = await findPageLayoutWidgets({
    gqlFields: PAGE_LAYOUT_WIDGET_GQL_FIELDS,
    expectToFail: false,
    input: { pageLayoutTabId: standardPersonHomeTabId },
  });

  return data.getPageLayoutWidgets.filter(
    (widget) => widget.applicationId === testApplicationId,
  );
};

describe('Manifest update - page layout widgets (standalone)', () => {
  beforeEach(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description:
        'App for testing standalone page layout widget manifest updates',
      sourcePath: 'test-manifest-update-page-layout-widget',
    });

    const applicationRow = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    testApplicationId = applicationRow[0].id;

    const pageLayoutTabRow = await globalThis.testDataSource.query(
      `SELECT id FROM core."pageLayoutTab" WHERE "universalIdentifier" = $1`,
      [STANDARD_PERSON_HOME_TAB_UNIVERSAL_ID],
    );

    standardPersonHomeTabId = pageLayoutTabRow[0].id;
  }, 60000);

  afterEach(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('should attach a standalone widget to a standard page layout tab', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayoutWidgets: [
          buildTimelineWidget({ title: 'Activity', index: 1000 }),
        ],
      }),
      expectToFail: false,
    });

    const widgets = await findStandardPersonHomeTabWidgets();

    expect(widgets).toHaveLength(1);
    expect(widgets[0]).toMatchObject({
      universalIdentifier: TEST_WIDGET_ID,
      applicationId: testApplicationId,
      pageLayoutTabId: standardPersonHomeTabId,
      title: 'Activity',
      type: 'TIMELINE',
      position: {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 1000,
      },
      configuration: { configurationType: 'TIMELINE' },
    });
  }, 60000);

  it('should rename and reposition a standalone widget on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayoutWidgets: [
          buildTimelineWidget({ title: 'Activity', index: 1000 }),
        ],
      }),
      expectToFail: false,
    });

    const widgetsAfterFirstSync = await findStandardPersonHomeTabWidgets();

    expect(widgetsAfterFirstSync).toHaveLength(1);

    await syncApplication({
      manifest: buildManifest({
        pageLayoutWidgets: [
          buildTimelineWidget({ title: 'Recent activity', index: 1500 }),
        ],
      }),
      expectToFail: false,
    });

    const widgetsAfterSecondSync = await findStandardPersonHomeTabWidgets();

    expect(widgetsAfterSecondSync).toHaveLength(1);
    expect(widgetsAfterSecondSync[0]).toMatchObject({
      id: widgetsAfterFirstSync[0].id,
      title: 'Recent activity',
      position: {
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        index: 1500,
      },
    });
  }, 60000);

  it('should delete a standalone widget when removed from manifest on second sync', async () => {
    await syncApplication({
      manifest: buildManifest({
        pageLayoutWidgets: [
          buildTimelineWidget({ title: 'Activity', index: 1000 }),
        ],
      }),
      expectToFail: false,
    });

    expect(await findStandardPersonHomeTabWidgets()).toHaveLength(1);

    await syncApplication({
      manifest: buildManifest({ pageLayoutWidgets: [] }),
      expectToFail: false,
    });

    expect(await findStandardPersonHomeTabWidgets()).toHaveLength(0);
  }, 60000);

  it('should fail to sync when a standalone widget references a non-existent tab', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        pageLayoutWidgets: [
          {
            ...buildTimelineWidget({ title: 'Activity', index: 1000 }),
            pageLayoutTabUniversalIdentifier: uuidv4(),
          },
        ],
      }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
  }, 60000);

  it('should fail to sync when a standalone widget is positioned for another layout mode than its tab', async () => {
    const { errors } = await syncApplication({
      manifest: buildManifest({
        pageLayoutWidgets: [
          {
            ...buildTimelineWidget({ title: 'Activity', index: 1000 }),
            position: {
              layoutMode: PageLayoutTabLayoutMode.GRID,
              row: 0,
              column: 0,
              rowSpan: 4,
              columnSpan: 4,
            },
          },
        ],
      }),
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors?.length).toBeGreaterThan(0);
  }, 60000);
});
