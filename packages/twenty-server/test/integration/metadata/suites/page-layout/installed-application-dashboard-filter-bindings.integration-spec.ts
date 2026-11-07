import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-dashboard-filter-bindings-gql-fields.constant';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type DashboardFilterBinding,
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget-with-id.input';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '3c9a1e5f-7b2d-4f8a-9c6e-1d2e3f4a5b01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

const UPDATE_FILTER: PageLayoutFilter = {
  id: '3c9a1e5f-7b2d-4f8a-9c6e-1d2e3f4a5b02',
  label: 'Last update',
  type: PageLayoutFilterType.DATE,
  position: 1,
  defaultValue: null,
};

const findInstalledDashboard = async (dashboardUniversalIdentifier: string) => {
  const [pageLayout] = await globalThis.testDataSource.query(
    `SELECT id, name FROM core."pageLayout" WHERE "universalIdentifier" = $1`,
    [dashboardUniversalIdentifier],
  );
  const tabs = await globalThis.testDataSource.query(
    `SELECT id, title, position FROM core."pageLayoutTab" WHERE "pageLayoutId" = $1`,
    [pageLayout.id],
  );
  const widgets: UpdatePageLayoutWidgetWithIdInput[] =
    await globalThis.testDataSource.query(
      `SELECT id, "pageLayoutTabId", title, type, "objectMetadataId", position, configuration
       FROM core."pageLayoutWidget" WHERE "pageLayoutTabId" = $1`,
      [tabs[0].id],
    );

  return { pageLayout, tab: tabs[0], widget: widgets[0] };
};

describe('Installed application dashboard filter bindings', () => {
  const applicationUniversalIdentifier = v4();
  const dashboardUniversalIdentifier = v4();
  const widgetUniversalIdentifier = v4();

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier,
      name: 'Dashboard Filter Bindings Application',
      description: 'App shipping a dashboard whose widget follows its filters',
      sourcePath: 'test-dashboard-filter-bindings',
    });

    await syncApplication({
      expectToFail: false,
      manifest: buildBaseManifest({
        appId: applicationUniversalIdentifier,
        roleId: v4(),
        overrides: {
          pageLayouts: [
            {
              universalIdentifier: dashboardUniversalIdentifier,
              name: 'Installed Dashboard',
              type: PageLayoutType.DASHBOARD,
              filters: [PERIOD_FILTER, UPDATE_FILTER],
              tabs: [
                {
                  universalIdentifier: v4(),
                  title: 'Tab 1',
                  position: 0,
                  layoutMode: PageLayoutTabLayoutMode.GRID,
                  widgets: [
                    {
                      universalIdentifier: widgetUniversalIdentifier,
                      title: 'People',
                      type: WidgetType.RECORD_TABLE,
                      objectUniversalIdentifier:
                        STANDARD_OBJECTS.person.universalIdentifier,
                      position: {
                        layoutMode: PageLayoutTabLayoutMode.GRID,
                        row: 0,
                        column: 0,
                        rowSpan: 4,
                        columnSpan: 6,
                      },
                      configuration: {
                        configurationType: 'RECORD_TABLE',
                        dashboardFilterBindings: [
                          {
                            pageLayoutFilterId: PERIOD_FILTER.id,
                            fieldMetadataUniversalIdentifier:
                              STANDARD_OBJECTS.person.fields.createdAt
                                .universalIdentifier,
                          },
                          {
                            pageLayoutFilterId: UPDATE_FILTER.id,
                            fieldMetadataUniversalIdentifier:
                              STANDARD_OBJECTS.person.fields.updatedAt
                                .universalIdentifier,
                          },
                        ],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      }),
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier,
    });
  });

  const saveInstalledDashboard = async ({
    reorderDashboardFilterBindings,
    expectToFail,
  }: {
    reorderDashboardFilterBindings: (
      dashboardFilterBindings: DashboardFilterBinding[],
    ) => DashboardFilterBinding[];
    expectToFail: boolean;
  }) => {
    const { pageLayout, tab, widget } = await findInstalledDashboard(
      dashboardUniversalIdentifier,
    );
    const storedConfiguration = widget.configuration;

    const response = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail,
      gqlFields: PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS,
      input: {
        id: pageLayout.id,
        name: pageLayout.name,
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs: [
          {
            ...tab,
            widgets: [
              {
                ...widget,
                configuration:
                  'dashboardFilterBindings' in storedConfiguration
                    ? {
                        ...storedConfiguration,
                        dashboardFilterBindings: reorderDashboardFilterBindings(
                          storedConfiguration.dashboardFilterBindings ?? [],
                        ),
                      }
                    : storedConfiguration,
              },
            ],
          },
        ],
      },
    });

    return {
      ...response,
      pageLayout,
      storedConfiguration,
      widgetId: widget.id,
    };
  };

  it('should resolve the bindings the manifest declares by universal identifier', async () => {
    const { widget } = await findInstalledDashboard(
      dashboardUniversalIdentifier,
    );
    const [createdAtField, updatedAtField] =
      await globalThis.testDataSource.query(
        `SELECT id FROM core."fieldMetadata"
         WHERE "universalIdentifier" = ANY($1) AND "objectMetadataId" = $2
         ORDER BY name`,
        [
          [
            STANDARD_OBJECTS.person.fields.createdAt.universalIdentifier,
            STANDARD_OBJECTS.person.fields.updatedAt.universalIdentifier,
          ],
          widget.objectMetadataId,
        ],
      );

    expect(widget.configuration).toMatchObject({
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataId: createdAtField.id,
        },
        {
          pageLayoutFilterId: UPDATE_FILTER.id,
          fieldMetadataId: updatedAtField.id,
        },
      ],
    });
  });

  it('should keep the stored bindings when the workspace saves them back in another order', async () => {
    const { errors, storedConfiguration, widgetId } =
      await saveInstalledDashboard({
        reorderDashboardFilterBindings: (dashboardFilterBindings) =>
          [...dashboardFilterBindings].reverse(),
        expectToFail: false,
      });

    expect(errors).toBeUndefined();

    const [widget] = await globalThis.testDataSource.query(
      `SELECT configuration FROM core."pageLayoutWidget" WHERE id = $1`,
      [widgetId],
    );

    expect(widget.configuration).toEqual(storedConfiguration);
  });

  it('should reject a workspace save that changes the bindings', async () => {
    const { errors, pageLayout } = await saveInstalledDashboard({
      reorderDashboardFilterBindings: (dashboardFilterBindings) =>
        dashboardFilterBindings.slice(0, 1),
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: (message) =>
        message.replace(pageLayout.id, '<pageLayoutId>'),
    });
  });
});
