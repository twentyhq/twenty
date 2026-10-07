import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { DASHBOARD_FILTER_PAGE_LAYOUT_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/utils/dashboard-filter-page-layout-gql-fields.constant';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import {
  type DashboardFilterTestFieldMetadataIds,
  fetchDashboardFilterTestFieldMetadataIds,
} from 'test/integration/metadata/suites/page-layout/utils/fetch-dashboard-filter-test-field-metadata-ids.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import {
  AggregateOperations,
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  ViewFilterOperand,
  WidgetType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

const DASHBOARD_FILTERS: DashboardFilterSlot[] = [
  {
    id: 'date',
    label: 'Date',
    filterType: 'DATE_TIME',
    defaultOperand: ViewFilterOperand.IS_RELATIVE,
    defaultValue: 'THIS_1_MONTH',
  },
  {
    id: 'owner',
    label: 'Owner',
    filterType: 'RELATION',
    isRequired: false,
  },
];

const GRID_POSITION = {
  layoutMode: PageLayoutTabLayoutMode.GRID as const,
  row: 0,
  column: 0,
  rowSpan: 1,
  columnSpan: 1,
};

type ChartConfigurationFromResponse = {
  configurationType: WidgetConfigurationType;
  dashboardFilterBindings?: Record<
    string,
    DashboardFilterBinding | null
  > | null;
};

describe('Page layout dashboard filters persistence should succeed', () => {
  let fieldMetadataIds: DashboardFilterTestFieldMetadataIds;
  let testPageLayoutId: string;
  let testTabId: string;

  beforeAll(async () => {
    fieldMetadataIds = await fetchDashboardFilterTestFieldMetadataIds();
  });

  beforeEach(async () => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard with filters',
        type: PageLayoutType.DASHBOARD,
      },
    });

    testPageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: {
        title: 'Overview',
        pageLayoutId: testPageLayoutId,
      },
    });

    testTabId = tabData.createPageLayoutTab.id;
  });

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  const buildTabs = ({
    barChartWidgetId,
    aggregateChartWidgetId,
    barChartBindings,
    aggregateChartBindings,
  }: {
    barChartWidgetId: string;
    aggregateChartWidgetId: string;
    barChartBindings: Record<string, DashboardFilterBinding | null>;
    aggregateChartBindings: Record<string, DashboardFilterBinding | null>;
  }) => [
    {
      id: testTabId,
      title: 'Overview',
      position: 0,
      widgets: [
        {
          id: barChartWidgetId,
          pageLayoutTabId: testTabId,
          title: 'Companies per name',
          type: WidgetType.GRAPH,
          objectMetadataId: fieldMetadataIds.companyObjectMetadataId,
          position: GRID_POSITION,
          configuration: {
            configurationType: WidgetConfigurationType.BAR_CHART,
            layout: BarChartLayout.VERTICAL,
            aggregateFieldMetadataId:
              fieldMetadataIds.companyPositionFieldMetadataId,
            aggregateOperation: AggregateOperations.COUNT,
            primaryAxisGroupByFieldMetadataId:
              fieldMetadataIds.companyNameFieldMetadataId,
            dashboardFilterBindings: barChartBindings,
          } satisfies AllPageLayoutWidgetConfiguration,
        },
        {
          id: aggregateChartWidgetId,
          pageLayoutTabId: testTabId,
          title: 'Company count',
          type: WidgetType.GRAPH,
          objectMetadataId: fieldMetadataIds.companyObjectMetadataId,
          position: { ...GRID_POSITION, column: 1 },
          configuration: {
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId:
              fieldMetadataIds.companyPositionFieldMetadataId,
            aggregateOperation: AggregateOperations.COUNT,
            dashboardFilterBindings: aggregateChartBindings,
          } satisfies AllPageLayoutWidgetConfiguration,
        },
      ],
    },
  ];

  const getWidgetBindings = (
    pageLayout: {
      tabs?:
        | { widgets?: { id: string; configuration: unknown }[] | null }[]
        | null;
    },
    widgetId: string,
  ) => {
    const widget = pageLayout.tabs
      ?.flatMap((tab) => tab.widgets ?? [])
      .find((tabWidget) => tabWidget.id === widgetId);

    return (widget?.configuration as ChartConfigurationFromResponse | undefined)
      ?.dashboardFilterBindings;
  };

  it('should save slots on the layout and bindings on chart widgets, then read them back', async () => {
    const barChartWidgetId = v4();
    const aggregateChartWidgetId = v4();

    const barChartBindings: Record<string, DashboardFilterBinding | null> = {
      date: {
        fieldMetadataId: fieldMetadataIds.companyCreatedAtFieldMetadataId,
      },
      owner: {
        fieldMetadataId: fieldMetadataIds.companyAccountOwnerFieldMetadataId,
      },
    };
    // null opts the widget out of the owner slot
    const aggregateChartBindings: Record<
      string,
      DashboardFilterBinding | null
    > = {
      date: {
        fieldMetadataId: fieldMetadataIds.companyCreatedAtFieldMetadataId,
      },
      owner: null,
    };

    const { data, errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with filters',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        dashboardFilters: DASHBOARD_FILTERS,
        tabs: buildTabs({
          barChartWidgetId,
          aggregateChartWidgetId,
          barChartBindings,
          aggregateChartBindings,
        }),
      },
      gqlFields: DASHBOARD_FILTER_PAGE_LAYOUT_GQL_FIELDS,
    });

    expect(errors).toBeUndefined();

    const updatedPageLayout = data.updatePageLayoutWithTabsAndWidgets;

    expect(updatedPageLayout.dashboardFilters).toEqual(DASHBOARD_FILTERS);
    expect(getWidgetBindings(updatedPageLayout, barChartWidgetId)).toEqual(
      barChartBindings,
    );
    expect(
      getWidgetBindings(updatedPageLayout, aggregateChartWidgetId),
    ).toEqual(aggregateChartBindings);

    const { data: readData } = await findOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
      gqlFields: DASHBOARD_FILTER_PAGE_LAYOUT_GQL_FIELDS,
    });

    const persistedPageLayout = readData.getPageLayout;

    expect(persistedPageLayout).not.toBeNull();
    expect(persistedPageLayout?.dashboardFilters).toEqual(DASHBOARD_FILTERS);
    expect(
      getWidgetBindings(persistedPageLayout ?? {}, barChartWidgetId),
    ).toEqual(barChartBindings);
    expect(
      getWidgetBindings(persistedPageLayout ?? {}, aggregateChartWidgetId),
    ).toEqual(aggregateChartBindings);
  });

  it('should keep the slots when the update omits dashboardFilters and clear them on an explicit null', async () => {
    const barChartWidgetId = v4();
    const aggregateChartWidgetId = v4();
    const tabs = buildTabs({
      barChartWidgetId,
      aggregateChartWidgetId,
      barChartBindings: {},
      aggregateChartBindings: {},
    });

    await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with filters',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        dashboardFilters: DASHBOARD_FILTERS,
        tabs,
      },
    });

    const { data: keptData } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with filters, renamed',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        tabs,
      },
    });

    expect(
      keptData.updatePageLayoutWithTabsAndWidgets.dashboardFilters,
    ).toEqual(DASHBOARD_FILTERS);

    const { data: clearedData } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      input: {
        id: testPageLayoutId,
        name: 'Dashboard with filters, cleared',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        dashboardFilters: null,
        tabs,
      },
    });

    expect(
      clearedData.updatePageLayoutWithTabsAndWidgets.dashboardFilters,
    ).toBeNull();

    const { data: readData } = await findOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });

    expect(readData.getPageLayout?.dashboardFilters).toBeNull();
  });

  it('should accept slots on page layout creation', async () => {
    const { data, errors } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard created with filters',
        type: PageLayoutType.DASHBOARD,
        dashboardFilters: DASHBOARD_FILTERS,
      },
    });

    expect(errors).toBeUndefined();
    expect(data.createPageLayout.dashboardFilters).toEqual(DASHBOARD_FILTERS);

    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: data.createPageLayout.id },
    });
  });
});
