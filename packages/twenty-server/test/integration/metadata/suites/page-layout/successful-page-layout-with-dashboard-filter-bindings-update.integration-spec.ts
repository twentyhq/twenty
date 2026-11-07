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
import { saveDashboardWithAggregateWidget } from 'test/integration/metadata/suites/page-layout/utils/save-dashboard-with-aggregate-widget.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  type DashboardFilterBinding,
  FieldMetadataType,
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '8d6c1f3a-2b4e-4c5d-9e7f-0a1b2c3d4e01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

const CLOSE_DATE_FILTER: PageLayoutFilter = {
  id: '8d6c1f3a-2b4e-4c5d-9e7f-0a1b2c3d4e02',
  label: 'Close date',
  type: PageLayoutFilterType.DATE,
  position: 1,
  defaultValue: null,
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

const findStoredDashboardFilterBindings = async (widgetId: string) => {
  const [widget] = await globalThis.testDataSource.query(
    `SELECT configuration FROM core."pageLayoutWidget" WHERE id = $1`,
    [widgetId],
  );

  return widget?.configuration?.dashboardFilterBindings;
};

describe('Dashboard filter bindings', () => {
  let fieldIds: DashboardFilterBindingFieldIds;
  let pageLayoutId: string;
  let tabId: string;
  let widgetId: string;

  const saveDashboard = ({
    filters,
    dashboardFilterBindings,
  }: {
    filters: PageLayoutFilter[];
    dashboardFilterBindings: DashboardFilterBinding[];
  }) =>
    saveDashboardWithAggregateWidget({
      pageLayoutId,
      tabId,
      widgetId,
      objectMetadataId: fieldIds.companyObjectMetadataId,
      aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
      filters,
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

  it('should save bindings with the filters they bind and read them back', async () => {
    const dashboardFilterBindings = [
      {
        pageLayoutFilterId: PERIOD_FILTER.id,
        fieldMetadataId: fieldIds.companyCreatedAtFieldId,
      },
      {
        pageLayoutFilterId: CLOSE_DATE_FILTER.id,
        fieldMetadataId: fieldIds.companyUpdatedAtFieldId,
      },
    ];

    const { data } = await saveDashboard({
      filters: [PERIOD_FILTER, CLOSE_DATE_FILTER],
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

  it('should remove a filter together with the bindings to it in one save', async () => {
    const periodBinding = {
      pageLayoutFilterId: PERIOD_FILTER.id,
      fieldMetadataId: fieldIds.companyCreatedAtFieldId,
    };

    await saveDashboard({
      filters: [PERIOD_FILTER, CLOSE_DATE_FILTER],
      dashboardFilterBindings: [
        periodBinding,
        {
          pageLayoutFilterId: CLOSE_DATE_FILTER.id,
          fieldMetadataId: fieldIds.companyUpdatedAtFieldId,
        },
      ],
    });

    await saveDashboard({
      filters: [PERIOD_FILTER],
      dashboardFilterBindings: [periodBinding],
    });

    expect(await findStoredDashboardFilterBindings(widgetId)).toEqual([
      periodBinding,
    ]);
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

    const periodBinding = () => ({
      pageLayoutFilterId: PERIOD_FILTER.id,
      fieldMetadataId: fieldIds.companyCreatedAtFieldId,
    });

    const renewalDateBinding = () => ({
      pageLayoutFilterId: CLOSE_DATE_FILTER.id,
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
        filters: [PERIOD_FILTER, CLOSE_DATE_FILTER],
        dashboardFilterBindings: [periodBinding(), renewalDateBinding()],
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
        periodBinding(),
        renewalDateBinding(),
      ]);

      const { errors } = await saveDashboard({
        filters: [PERIOD_FILTER, CLOSE_DATE_FILTER],
        dashboardFilterBindings: [periodBinding(), renewalDateBinding()],
      });

      expect(errors).toBeUndefined();
    });

    it('should drop the bindings to a deleted field and keep the widget', async () => {
      await deactivateRenewalDateField();
      await deleteOneFieldMetadata({
        expectToFail: false,
        input: { idToDelete: renewalDateFieldId },
      });
      isRenewalDateFieldDeleted = true;

      expect(await findStoredDashboardFilterBindings(widgetId)).toEqual([
        periodBinding(),
      ]);
    });
  });
});

describe('Dashboard duplication should keep the filter bindings resolving', () => {
  const dashboardId = '8d6c1f3a-2b4e-4c5d-9e7f-0a1b2c3d4e10';
  let duplicatedDashboardId: string | undefined;

  afterEach(async () => {
    await destroyDashboardWithGraphQL(dashboardId);

    if (isDefined(duplicatedDashboardId)) {
      await destroyDashboardWithGraphQL(duplicatedDashboardId);
    }
  });

  it('should bind the duplicated widget to the duplicated filters', async () => {
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
