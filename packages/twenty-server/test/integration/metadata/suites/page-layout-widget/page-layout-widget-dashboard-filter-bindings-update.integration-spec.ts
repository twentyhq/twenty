import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { fetchDashboardFilterBindingFieldIds } from 'test/integration/metadata/suites/page-layout/utils/fetch-dashboard-filter-binding-field-ids.util';
import { saveDashboardWithAggregateWidget } from 'test/integration/metadata/suites/page-layout/utils/save-dashboard-with-aggregate-widget.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  AggregateOperations,
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '5d1e2f3a-4b5c-4d6e-8f70-81a2b3c4d501',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

const findStoredConfiguration = async (widgetId: string) => {
  const [widget] = await globalThis.testDataSource.query(
    `SELECT configuration FROM core."pageLayoutWidget" WHERE id = $1`,
    [widgetId],
  );

  return widget?.configuration;
};

describe('Page layout widget update should apply the dashboard filter binding rules', () => {
  describe('on a workspace widget', () => {
    let pageLayoutId: string;

    afterEach(async () => {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: pageLayoutId },
      });
    });

    it('should keep the stored bindings when the configuration omits them', async () => {
      const fieldIds = await fetchDashboardFilterBindingFieldIds();
      const { data: layoutData } = await createOnePageLayout({
        expectToFail: false,
        input: { name: 'Bound Dashboard', type: PageLayoutType.DASHBOARD },
      });

      pageLayoutId = layoutData.createPageLayout.id;

      const { data: tabData } = await createOnePageLayoutTab({
        expectToFail: false,
        input: { title: 'Tab 1', pageLayoutId },
      });
      const widgetId = v4();
      const dashboardFilterBindings = [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataId: fieldIds.companyCreatedAtFieldId,
        },
      ];

      await saveDashboardWithAggregateWidget({
        pageLayoutId,
        tabId: tabData.createPageLayoutTab.id,
        widgetId,
        objectMetadataId: fieldIds.companyObjectMetadataId,
        aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
        filters: [PERIOD_FILTER],
        dashboardFilterBindings,
      });

      const { errors } = await updateOnePageLayoutWidget({
        expectToFail: false,
        gqlFields: 'id',
        input: {
          id: widgetId,
          configuration: {
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
            aggregateOperation: AggregateOperations.SUM,
          },
        },
      });

      expect(errors).toBeUndefined();
      expect(await findStoredConfiguration(widgetId)).toMatchObject({
        aggregateOperation: AggregateOperations.SUM,
        dashboardFilterBindings,
      });
    });
  });

  describe('on a widget installed by an application', () => {
    const applicationUniversalIdentifier = v4();
    const widgetUniversalIdentifier = v4();
    let installedWidget: { id: string; configuration: Record<string, unknown> };

    beforeAll(async () => {
      await setupApplicationForSync({
        applicationUniversalIdentifier,
        name: 'Widget Dashboard Filter Bindings Application',
        description: 'App shipping a widget that follows a dashboard filter',
        sourcePath: 'test-widget-dashboard-filter-bindings',
      });

      await syncApplication({
        expectToFail: false,
        manifest: buildBaseManifest({
          appId: applicationUniversalIdentifier,
          roleId: v4(),
          overrides: {
            pageLayouts: [
              {
                universalIdentifier: v4(),
                name: 'Installed Dashboard',
                type: PageLayoutType.DASHBOARD,
                filters: [PERIOD_FILTER],
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

      [installedWidget] = await globalThis.testDataSource.query(
        `SELECT id, configuration FROM core."pageLayoutWidget" WHERE "universalIdentifier" = $1`,
        [widgetUniversalIdentifier],
      );
    }, 60000);

    afterAll(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    });

    it('should reject a change to the bindings', async () => {
      const { errors } = await updateOnePageLayoutWidget({
        expectToFail: true,
        gqlFields: 'id',
        input: {
          id: installedWidget.id,
          configuration: {
            ...installedWidget.configuration,
            dashboardFilterBindings: [],
          },
        },
      });

      expect(errors).toHaveLength(1);
      expect(errors?.[0].extensions?.code).toBe(ErrorCode.BAD_USER_INPUT);
      expect(errors?.[0].message).toContain('cannot be changed');
      expect(await findStoredConfiguration(installedWidget.id)).toEqual(
        installedWidget.configuration,
      );
    });

    it('should accept a save that keeps the bindings unchanged', async () => {
      const { errors } = await updateOnePageLayoutWidget({
        expectToFail: false,
        gqlFields: 'id',
        input: {
          id: installedWidget.id,
          configuration: installedWidget.configuration,
        },
      });

      expect(errors).toBeUndefined();
      expect(await findStoredConfiguration(installedWidget.id)).toEqual(
        installedWidget.configuration,
      );
    });
  });
});
