import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import gql from 'graphql-tag';
import { MALFORMED_DASHBOARD_FILTER_BINDINGS } from 'test/integration/metadata/suites/page-layout/constants/malformed-dashboard-filter-bindings.constant';
import { PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-dashboard-filter-bindings-gql-fields.constant';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type DashboardFilterBinding,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  type RecordTableConfiguration,
  WidgetType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

import { type UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget-with-id.input';

type StoredWidget = Omit<UpdatePageLayoutWidgetWithIdInput, 'configuration'> & {
  configuration: RecordTableConfiguration;
};

const findInstalledDashboard = async ({
  dashboardUniversalIdentifier,
  widgetUniversalIdentifier,
}: {
  dashboardUniversalIdentifier: string;
  widgetUniversalIdentifier: string;
}) => {
  const [pageLayout] = await globalThis.testDataSource.query(
    `SELECT id, name FROM core."pageLayout" WHERE "universalIdentifier" = $1`,
    [dashboardUniversalIdentifier],
  );
  const tabs = await globalThis.testDataSource.query(
    `SELECT id, title, position FROM core."pageLayoutTab" WHERE "pageLayoutId" = $1`,
    [pageLayout.id],
  );
  const [widget]: StoredWidget[] = await globalThis.testDataSource.query(
    `SELECT id, "pageLayoutTabId", title, type, "objectMetadataId", position, configuration
     FROM core."pageLayoutWidget" WHERE "universalIdentifier" = $1`,
    [widgetUniversalIdentifier],
  );

  return { pageLayout, tab: tabs[0], widget };
};

const findStoredConfiguration = async (widgetId: string) => {
  const [widget] = await globalThis.testDataSource.query(
    `SELECT configuration FROM core."pageLayoutWidget" WHERE id = $1`,
    [widgetId],
  );

  return widget?.configuration;
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
                            pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
                            fieldMetadataUniversalIdentifier:
                              STANDARD_OBJECTS.person.fields.createdAt
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

  const saveInstalledDashboard = async (
    buildWidgets: (storedWidget: StoredWidget) => unknown[],
  ) => {
    const { pageLayout, tab, widget } = await findInstalledDashboard({
      dashboardUniversalIdentifier,
      widgetUniversalIdentifier,
    });

    const response = await makeMetadataApiRequest({
      query: gql`
        mutation UpdatePageLayoutWithTabsAndWidgets($id: String!, $input: UpdatePageLayoutWithTabsInput!) {
          updatePageLayoutWithTabsAndWidgets(id: $id, input: $input) {
            ${PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS}
          }
        }
      `,
      variables: {
        id: pageLayout.id,
        input: {
          name: pageLayout.name,
          type: PageLayoutType.DASHBOARD,
          objectMetadataId: null,
          tabs: [{ ...tab, widgets: buildWidgets(widget) }],
        },
      },
    });

    return { errors: response.body.errors, storedWidget: widget };
  };

  const withDashboardFilterBindings = (
    storedWidget: StoredWidget,
    buildDashboardFilterBindings: (
      dashboardFilterBindings: DashboardFilterBinding[],
    ) => unknown,
  ) => ({
    ...storedWidget,
    configuration: {
      ...storedWidget.configuration,
      dashboardFilterBindings: buildDashboardFilterBindings(
        storedWidget.configuration.dashboardFilterBindings ?? [],
      ),
    },
  });

  it('should resolve the bindings the manifest declares to the built-in filter without shipping filters', async () => {
    const { widget } = await findInstalledDashboard({
      dashboardUniversalIdentifier,
      widgetUniversalIdentifier,
    });
    const [createdAtField] = await globalThis.testDataSource.query(
      `SELECT id FROM core."fieldMetadata"
       WHERE "universalIdentifier" = $1 AND "objectMetadataId" = $2`,
      [
        STANDARD_OBJECTS.person.fields.createdAt.universalIdentifier,
        widget.objectMetadataId,
      ],
    );

    expect(widget.configuration).toMatchObject({
      dashboardFilterBindings: [
        {
          pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER_ID,
          fieldMetadataId: createdAtField.id,
        },
      ],
    });
  });

  it('should keep the stored bindings when the workspace saves them back unchanged', async () => {
    const { errors, storedWidget } = await saveInstalledDashboard((widget) => [
      withDashboardFilterBindings(widget, (dashboardFilterBindings) =>
        dashboardFilterBindings.map((binding) => ({ ...binding })),
      ),
    ]);

    expect(errors).toBeUndefined();
    expect(await findStoredConfiguration(storedWidget.id)).toEqual(
      storedWidget.configuration,
    );
  });

  it('should keep the stored bindings when a save omits them', async () => {
    const { errors, storedWidget } = await saveInstalledDashboard((widget) => {
      const {
        dashboardFilterBindings: _dashboardFilterBindings,
        ...configuration
      } = widget.configuration;

      return [{ ...widget, configuration }];
    });

    expect(errors).toBeUndefined();
    expect(await findStoredConfiguration(storedWidget.id)).toEqual(
      storedWidget.configuration,
    );
  });

  it('should reject a workspace save that changes the bindings', async () => {
    const { errors, storedWidget } = await saveInstalledDashboard((widget) => [
      withDashboardFilterBindings(widget, (dashboardFilterBindings) =>
        dashboardFilterBindings.map((binding) => ({
          ...binding,
          fieldMetadataId: null,
        })),
      ),
    ]);

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: (message) =>
        message.replace(storedWidget.id, '<widgetId>'),
    });
  });

  it.each(MALFORMED_DASHBOARD_FILTER_BINDINGS)(
    'should reject a workspace save that replaces the bindings with %s',
    async (_title, malformedDashboardFilterBindings) => {
      const { errors } = await saveInstalledDashboard((widget) => [
        withDashboardFilterBindings(
          widget,
          () => malformedDashboardFilterBindings,
        ),
      ]);

      expect(errors).toHaveLength(1);
      expect(errors?.[0].extensions?.code).toBe(ErrorCode.BAD_USER_INPUT);
      expect(errors?.[0].message).toContain(
        'Dashboard filter bindings are malformed',
      );
    },
  );

  it('should let the workspace keep the bindings of a widget it duplicates', async () => {
    const duplicatedWidgetId = v4();

    const { errors, storedWidget } = await saveInstalledDashboard((widget) => [
      widget,
      {
        ...widget,
        id: duplicatedWidgetId,
        title: 'People (copy)',
        position: { ...widget.position, row: 4 },
      },
    ]);

    expect(errors).toBeUndefined();
    expect(await findStoredConfiguration(duplicatedWidgetId)).toMatchObject({
      dashboardFilterBindings:
        storedWidget.configuration.dashboardFilterBindings,
    });

    const { errors: removalErrors } = await saveInstalledDashboard((widget) => [
      widget,
    ]);

    expect(removalErrors).toBeUndefined();
  });
});
