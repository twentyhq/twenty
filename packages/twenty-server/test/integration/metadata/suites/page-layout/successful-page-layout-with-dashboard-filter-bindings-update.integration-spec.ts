import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { duplicateOneDashboard } from 'test/integration/metadata/suites/dashboard/utils/duplicate-one-dashboard.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-dashboard-filter-bindings-gql-fields.constant';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import {
  type DashboardFilterBindingFieldIds,
  fetchDashboardFilterBindingFieldIds,
} from 'test/integration/metadata/suites/page-layout/utils/fetch-dashboard-filter-binding-field-ids.util';
import { findOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/find-one-page-layout.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import { saveDashboardWithAggregateWidget } from 'test/integration/metadata/suites/page-layout/utils/save-dashboard-with-aggregate-widget.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  type ChartFilter,
  type DashboardFilterBinding,
  FieldMetadataType,
  type PageLayoutFilter,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UpdatePageLayoutWidgetWithIdInput } from 'src/engine/metadata-modules/page-layout-widget/dtos/inputs/update-page-layout-widget-with-id.input';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UpdatePageLayoutWithTabsInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout-with-tabs.input';

const PERIOD_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

const createDashboardPageLayoutWithTab = async () => {
  const { data: layoutData } = await createOnePageLayout({
    expectToFail: false,
    input: {
      name: 'Dashboard With Filter Bindings',
      type: PageLayoutType.DASHBOARD,
    },
  });

  const pageLayoutId = layoutData.createPageLayout.id;

  const { data: tabData } = await createOnePageLayoutTab({
    expectToFail: false,
    input: { title: 'Tab 1', pageLayoutId },
  });

  return { pageLayoutId, tabId: tabData.createPageLayoutTab.id };
};

const findStoredConfiguration = async (widgetId: string) => {
  const [widget] = await globalThis.testDataSource.query(
    `SELECT configuration FROM core."pageLayoutWidget" WHERE id = $1`,
    [widgetId],
  );

  return widget?.configuration;
};

const findStoredDashboardFilterBindings = async (widgetId: string) =>
  (await findStoredConfiguration(widgetId))?.dashboardFilterBindings;

const findStoredPageLayoutFilters = async (pageLayoutId: string) => {
  const [{ filters }] = await globalThis.testDataSource.query(
    `SELECT filters FROM core."pageLayout" WHERE id = $1`,
    [pageLayoutId],
  );

  return filters;
};

describe('Dashboard filter bindings', () => {
  let fieldIds: DashboardFilterBindingFieldIds;
  let pageLayoutId: string;
  let tabId: string;
  let widgetId: string;

  const saveDashboard = ({
    filters,
    chartFilter,
    dashboardFilterBindings,
  }: {
    filters?: PageLayoutFilter[] | null;
    chartFilter?: ChartFilter;
    dashboardFilterBindings: DashboardFilterBinding[] | null | undefined;
  }) =>
    saveDashboardWithAggregateWidget({
      pageLayoutId,
      tabId,
      widgetId,
      objectMetadataId: fieldIds.companyObjectMetadataId,
      aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
      filters,
      chartFilter,
      dashboardFilterBindings,
    });

  beforeAll(async () => {
    fieldIds = await fetchDashboardFilterBindingFieldIds();
  });

  beforeEach(async () => {
    ({ pageLayoutId, tabId } = await createDashboardPageLayoutWithTab());
    widgetId = v4();
  });

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it('should save a binding to the built-in Date range filter and read it back', async () => {
    const dashboardFilterBindings = [
      {
        pageLayoutFilterId: PERIOD_FILTER.id,
        fieldMetadataId: fieldIds.companyCreatedAtFieldId,
      },
    ];

    const { data } = await saveDashboard({
      filters: [PERIOD_FILTER],
      dashboardFilterBindings,
    });

    const expectedTabs = [
      {
        widgets: [{ id: widgetId, configuration: { dashboardFilterBindings } }],
      },
    ];

    expect(data.updatePageLayoutWithTabsAndWidgets.tabs).toMatchObject(
      expectedTabs,
    );

    const { data: foundData } = await findOnePageLayout({
      expectToFail: false,
      gqlFields: PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS,
      input: { id: pageLayoutId },
    });

    expect(foundData.getPageLayout?.tabs).toMatchObject(expectedTabs);
  });

  it('should save a binding to the built-in Date range filter while nothing is stored', async () => {
    const dashboardFilterBindings = [
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER.id,
        fieldMetadataId: fieldIds.companyUpdatedAtFieldId,
      },
    ];

    const { errors } = await saveDashboard({ dashboardFilterBindings });

    expect(errors).toBeUndefined();
    expect(await findStoredPageLayoutFilters(pageLayoutId)).toBeNull();
    expect(await findStoredDashboardFilterBindings(widgetId)).toEqual(
      dashboardFilterBindings,
    );
  });

  it('should save a binding that excludes the widget from a filter and read it back', async () => {
    const dashboardFilterBindings = [
      { pageLayoutFilterId: PERIOD_FILTER.id, fieldMetadataId: null },
    ];

    const { errors } = await saveDashboard({ dashboardFilterBindings });

    expect(errors).toBeUndefined();

    const { data } = await findOnePageLayout({
      expectToFail: false,
      gqlFields: PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS,
      input: { id: pageLayoutId },
    });

    expect(data.getPageLayout?.tabs).toMatchObject([
      {
        widgets: [{ id: widgetId, configuration: { dashboardFilterBindings } }],
      },
    ]);
    expect(await findStoredDashboardFilterBindings(widgetId)).toEqual(
      dashboardFilterBindings,
    );
  });

  it('should keep the bindings to the built-in filter when its default range is cleared', async () => {
    const periodBinding = {
      pageLayoutFilterId: PERIOD_FILTER.id,
      fieldMetadataId: fieldIds.companyCreatedAtFieldId,
    };

    await saveDashboard({
      filters: [PERIOD_FILTER],
      dashboardFilterBindings: [periodBinding],
    });

    const { errors } = await saveDashboard({
      filters: null,
      dashboardFilterBindings: [periodBinding],
    });

    expect(errors).toBeUndefined();
    expect(await findStoredPageLayoutFilters(pageLayoutId)).toBeNull();
    expect(await findStoredDashboardFilterBindings(widgetId)).toEqual([
      periodBinding,
    ]);
  });

  it('should keep the stored bindings when a save omits them, and clear them on null', async () => {
    const periodBinding = {
      pageLayoutFilterId: PERIOD_FILTER.id,
      fieldMetadataId: fieldIds.companyCreatedAtFieldId,
    };

    await saveDashboard({
      filters: [PERIOD_FILTER],
      dashboardFilterBindings: [periodBinding],
    });

    const { errors } = await saveDashboard({
      filters: [PERIOD_FILTER],
      dashboardFilterBindings: undefined,
    });

    expect(errors).toBeUndefined();
    expect(await findStoredDashboardFilterBindings(widgetId)).toEqual([
      periodBinding,
    ]);

    await saveDashboard({
      filters: [PERIOD_FILTER],
      dashboardFilterBindings: null,
    });

    expect(await findStoredDashboardFilterBindings(widgetId)).toBeNull();
  });

  describe('when the bound field changes', () => {
    let renewalDateFieldId: string;
    let isRenewalDateFieldDeleted: boolean;

    const deactivateRenewalDateField = () =>
      updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: renewalDateFieldId,
          updatePayload: { isActive: false },
        },
        gqlFields: 'id',
      });

    const renewalDateBinding = () => ({
      pageLayoutFilterId: PERIOD_FILTER.id,
      fieldMetadataId: renewalDateFieldId,
    });

    beforeEach(async () => {
      const { data } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId: fieldIds.companyObjectMetadataId,
          name: 'renewalDate',
          label: 'Renewal date',
          type: FieldMetadataType.DATE,
        },
        gqlFields: 'id',
      });

      renewalDateFieldId = data.createOneField.id;
      isRenewalDateFieldDeleted = false;

      await saveDashboard({
        filters: [PERIOD_FILTER],
        dashboardFilterBindings: [renewalDateBinding()],
      });
    });

    afterEach(async () => {
      if (isRenewalDateFieldDeleted) {
        return;
      }

      await deactivateRenewalDateField();
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: renewalDateFieldId },
      });
    });

    it('should keep the bindings to a deactivated field', async () => {
      await deactivateRenewalDateField();

      expect(await findStoredDashboardFilterBindings(widgetId)).toEqual([
        renewalDateBinding(),
      ]);

      const { errors } = await saveDashboard({
        filters: [PERIOD_FILTER],
        dashboardFilterBindings: [renewalDateBinding()],
      });

      expect(errors).toBeUndefined();
    });

    const deleteField = async (fieldMetadataId: string) => {
      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: fieldMetadataId,
          updatePayload: { isActive: false },
        },
        gqlFields: 'id',
      });

      return deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: fieldMetadataId },
      });
    };

    const buildChartFilter = (fieldMetadataId: string): ChartFilter => ({
      recordFilters: [
        {
          id: v4(),
          fieldMetadataId,
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          value: '',
        },
      ],
    });

    it('should drop the bindings to a deleted field and keep the widget', async () => {
      await deleteField(renewalDateFieldId);
      isRenewalDateFieldDeleted = true;

      expect(await findStoredDashboardFilterBindings(widgetId)).toEqual([]);
    });

    it('should drop the binding and the chart filter on a deleted field, and keep the dashboard saving', async () => {
      await saveDashboard({
        filters: [PERIOD_FILTER],
        chartFilter: buildChartFilter(renewalDateFieldId),
        dashboardFilterBindings: [renewalDateBinding()],
      });

      const { errors: deletionErrors } = await deleteField(renewalDateFieldId);

      isRenewalDateFieldDeleted = true;
      expect(deletionErrors).toBeUndefined();
      expect(await findStoredConfiguration(widgetId)).toMatchObject({
        filter: { recordFilters: [] },
        dashboardFilterBindings: [],
      });

      const { errors } = await saveDashboard({
        filters: [PERIOD_FILTER],
        chartFilter: { recordFilters: [] },
        dashboardFilterBindings: [],
      });

      expect(errors).toBeUndefined();
    });

    it('should delete the bound field of a widget whose chart filter already dangles', async () => {
      const { data } = await createOneFieldMetadata({
        expectToFail: false,
        input: {
          objectMetadataId: fieldIds.companyObjectMetadataId,
          name: 'churnDate',
          label: 'Churn date',
          type: FieldMetadataType.DATE,
        },
        gqlFields: 'id',
      });

      await saveDashboard({
        filters: [PERIOD_FILTER],
        chartFilter: buildChartFilter(data.createOneField.id),
        dashboardFilterBindings: [renewalDateBinding()],
      });
      await deleteField(data.createOneField.id);

      const { errors: deletionErrors } = await deleteField(renewalDateFieldId);

      isRenewalDateFieldDeleted = true;
      expect(deletionErrors).toBeUndefined();
      expect(await findStoredConfiguration(widgetId)).toMatchObject({
        filter: { recordFilters: [] },
        dashboardFilterBindings: [],
      });

      const { errors } = await saveDashboard({
        filters: [PERIOD_FILTER],
        dashboardFilterBindings: [],
      });

      expect(errors).toBeUndefined();
    });
  });
});

describe('Dashboard duplication should keep the filter bindings', () => {
  const dashboardId = '8d6c1f3a-2b4e-4c5d-9e7f-0a1b2c3d4e10';
  let duplicatedDashboardId: string | undefined;

  afterEach(async () => {
    await destroyDashboardWithGraphQL(dashboardId);

    if (isDefined(duplicatedDashboardId)) {
      await destroyDashboardWithGraphQL(duplicatedDashboardId);
    }
  });

  it("should keep the widget's bindings on the duplicate", async () => {
    const fieldIds = await fetchDashboardFilterBindingFieldIds();
    const { pageLayoutId, tabId } = await createDashboardPageLayoutWithTab();
    const dashboardFilterBindings = [
      {
        pageLayoutFilterId: PERIOD_FILTER.id,
        fieldMetadataId: fieldIds.companyCreatedAtFieldId,
      },
    ];

    await saveDashboardWithAggregateWidget({
      pageLayoutId,
      tabId,
      widgetId: v4(),
      objectMetadataId: fieldIds.companyObjectMetadataId,
      aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
      filters: [PERIOD_FILTER],
      dashboardFilterBindings,
    });
    await createTestDashboardWithGraphQL({
      id: dashboardId,
      title: 'Dashboard With Filter Bindings',
      pageLayoutId,
    });

    const { data } = await duplicateOneDashboard({
      expectToFail: false,
      input: { id: dashboardId },
    });

    duplicatedDashboardId = data.duplicateDashboard.id;

    const duplicatedPageLayoutId = data.duplicateDashboard.pageLayoutId;

    jestExpectToBeDefined(duplicatedPageLayoutId);
    expect(duplicatedPageLayoutId).not.toBe(pageLayoutId);

    const { data: duplicatedData } = await findOnePageLayout({
      expectToFail: false,
      gqlFields: PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS,
      input: { id: duplicatedPageLayoutId },
    });

    const duplicatedPageLayout = duplicatedData.getPageLayout;

    jestExpectToBeDefined(duplicatedPageLayout);
    expect(duplicatedPageLayout.filters).toEqual([{ id: PERIOD_FILTER.id }]);
    expect(duplicatedPageLayout.tabs).toMatchObject([
      { widgets: [{ configuration: { dashboardFilterBindings } }] },
    ]);
  });
});

describe('Standard dashboard filter bindings', () => {
  let standardDashboardId: string;
  let standardDashboardTabs: UpdatePageLayoutWithTabsInput['tabs'];
  let boundWidgetId: string;
  let periodBinding: DashboardFilterBinding;

  const saveStandardDashboard = ({
    filters,
    dashboardFilterBindings,
    isBoundWidgetRemoved = false,
    tabs = standardDashboardTabs,
  }: {
    filters: PageLayoutFilter[] | null;
    dashboardFilterBindings: DashboardFilterBinding[] | null;
    isBoundWidgetRemoved?: boolean;
    tabs?: UpdatePageLayoutWithTabsInput['tabs'];
  }) =>
    updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: false,
      gqlFields: PAGE_LAYOUT_WITH_DASHBOARD_FILTER_BINDINGS_GQL_FIELDS,
      input: {
        id: standardDashboardId,
        name: 'My First Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        filters,
        tabs: tabs.map((tab) => ({
          ...tab,
          widgets: tab.widgets
            .filter(
              (widget) => !isBoundWidgetRemoved || widget.id !== boundWidgetId,
            )
            .map((widget) =>
              widget.id === boundWidgetId &&
              widget.configuration.configurationType ===
                WidgetConfigurationType.AGGREGATE_CHART
                ? {
                    ...widget,
                    configuration: {
                      ...widget.configuration,
                      dashboardFilterBindings,
                    },
                  }
                : widget,
            ),
        })),
      },
    });

  beforeAll(async () => {
    const { data } = await findPageLayouts({
      expectToFail: false,
      input: undefined,
      gqlFields: 'id universalIdentifier',
    });

    const standardDashboard = data.getPageLayouts.find(
      ({ universalIdentifier }) =>
        universalIdentifier ===
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard
          .universalIdentifier,
    );

    jestExpectToBeDefined(standardDashboard);
    standardDashboardId = standardDashboard.id;

    const tabs = await globalThis.testDataSource.query(
      `SELECT id, title, position, icon, "layoutMode" FROM core."pageLayoutTab"
       WHERE "pageLayoutId" = $1 AND "deletedAt" IS NULL AND "isActive"`,
      [standardDashboardId],
    );
    const widgets: UpdatePageLayoutWidgetWithIdInput[] =
      await globalThis.testDataSource.query(
        `SELECT id, "pageLayoutTabId", title, type, "objectMetadataId", position,
         configuration, "conditionalDisplay", "conditionalAvailabilityExpression"
         FROM core."pageLayoutWidget"
         WHERE "pageLayoutTabId" = ANY($1) AND "deletedAt" IS NULL AND "isActive"`,
        [tabs.map(({ id }: { id: string }) => id)],
      );

    const boundWidget = widgets.find(
      ({ configuration }) =>
        configuration.configurationType ===
        WidgetConfigurationType.AGGREGATE_CHART,
    );

    jestExpectToBeDefined(boundWidget);
    boundWidgetId = boundWidget.id;

    const [createdAtField] = await globalThis.testDataSource.query(
      `SELECT id FROM core."fieldMetadata" WHERE "objectMetadataId" = $1 AND name = 'createdAt'`,
      [boundWidget.objectMetadataId],
    );

    periodBinding = {
      pageLayoutFilterId: PERIOD_FILTER.id,
      fieldMetadataId: createdAtField.id,
    };

    standardDashboardTabs = tabs.map((tab: { id: string }) => ({
      ...tab,
      widgets: widgets.filter(
        ({ pageLayoutTabId }) => pageLayoutTabId === tab.id,
      ),
    }));
  });

  beforeEach(async () => {
    await saveStandardDashboard({
      filters: [PERIOD_FILTER],
      dashboardFilterBindings: [periodBinding],
    });

    expect(await findStoredDashboardFilterBindings(boundWidgetId)).toEqual([
      periodBinding,
    ]);
  });

  afterEach(async () => {
    const { errors } = await saveStandardDashboard({
      filters: null,
      dashboardFilterBindings: null,
    });

    expect(errors).toBeUndefined();
  });

  it('should remove the bound widget and clear the default range in one save', async () => {
    const { errors } = await saveStandardDashboard({
      filters: null,
      dashboardFilterBindings: [periodBinding],
      isBoundWidgetRemoved: true,
    });

    expect(errors).toBeUndefined();
  });
});
