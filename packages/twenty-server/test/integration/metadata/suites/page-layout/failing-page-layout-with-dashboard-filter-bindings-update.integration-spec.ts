import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { MALFORMED_DASHBOARD_FILTER_BINDINGS } from 'test/integration/metadata/suites/page-layout/constants/malformed-dashboard-filter-bindings.constant';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import {
  type DashboardFilterBindingFieldIds,
  fetchDashboardFilterBindingFieldIds,
} from 'test/integration/metadata/suites/page-layout/utils/fetch-dashboard-filter-binding-field-ids.util';
import { saveDashboardWithAggregateWidget } from 'test/integration/metadata/suites/page-layout/utils/save-dashboard-with-aggregate-widget.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '5b2e7c4d-1a3f-4e6b-8c9d-0e1f2a3b4c01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
  defaultValue: null,
};

const CLOSE_DATE_FILTER: PageLayoutFilter = {
  id: '5b2e7c4d-1a3f-4e6b-8c9d-0e1f2a3b4c02',
  label: 'Close date',
  type: PageLayoutFilterType.DATE,
  position: 1,
  defaultValue: null,
};

const UNKNOWN_FIELD_ID = '5b2e7c4d-1a3f-4e6b-8c9d-0e1f2a3b4c99';

type TestContext = {
  pageLayoutType?: PageLayoutType;
  buildDashboardFilterBindings: (
    fieldIds: DashboardFilterBindingFieldIds,
  ) => unknown;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when the bindings are not a list',
    context: {
      buildDashboardFilterBindings: ({ companyCreatedAtFieldId }) => ({
        pageLayoutFilterId: PERIOD_FILTER.id,
        fieldMetadataId: companyCreatedAtFieldId,
      }),
    },
  },
  ...MALFORMED_DASHBOARD_FILTER_BINDINGS.map(
    ([malformedValueTitle, malformedDashboardFilterBindings]) => ({
      title: `when the bindings are ${malformedValueTitle}`,
      context: {
        buildDashboardFilterBindings: () => malformedDashboardFilterBindings,
      },
    }),
  ),
  {
    title: 'when a binding has no filter id',
    context: {
      buildDashboardFilterBindings: ({ companyCreatedAtFieldId }) => [
        { fieldMetadataId: companyCreatedAtFieldId },
      ],
    },
  },
  {
    title: 'when a binding points at a filter the dashboard does not have',
    context: {
      buildDashboardFilterBindings: ({ companyCreatedAtFieldId }) => [
        {
          pageLayoutFilterId: '5b2e7c4d-1a3f-4e6b-8c9d-0e1f2a3b4c03',
          fieldMetadataId: companyCreatedAtFieldId,
        },
      ],
    },
  },
  {
    title: 'when a widget binds the same filter twice',
    context: {
      buildDashboardFilterBindings: ({
        companyCreatedAtFieldId,
        companyUpdatedAtFieldId,
      }) => [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataId: companyCreatedAtFieldId,
        },
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataId: companyUpdatedAtFieldId,
        },
      ],
    },
  },
  {
    title: 'when a binding points at a field that does not exist',
    context: {
      buildDashboardFilterBindings: () => [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataId: UNKNOWN_FIELD_ID,
        },
      ],
    },
  },
  {
    title:
      "when a binding points at a field of another object than the widget's",
    context: {
      buildDashboardFilterBindings: ({ personCreatedAtFieldId }) => [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataId: personCreatedAtFieldId,
        },
      ],
    },
  },
  {
    title: 'when a date filter is bound to a text field',
    context: {
      buildDashboardFilterBindings: ({ companyNameFieldId }) => [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataId: companyNameFieldId,
        },
      ],
    },
  },
  {
    title: 'when the widget is not on a dashboard',
    context: {
      pageLayoutType: PageLayoutType.STANDALONE_PAGE,
      buildDashboardFilterBindings: ({ companyCreatedAtFieldId }) => [
        {
          pageLayoutFilterId: PERIOD_FILTER.id,
          fieldMetadataId: companyCreatedAtFieldId,
        },
      ],
    },
  },
];

describe('Dashboard filter bindings update should fail', () => {
  let fieldIds: DashboardFilterBindingFieldIds;
  let pageLayoutId: string;

  const createPageLayoutWithTab = async (pageLayoutType: PageLayoutType) => {
    const { data: layoutData } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Dashboard With Filter Bindings', type: pageLayoutType },
    });

    pageLayoutId = layoutData.createPageLayout.id;

    const { data: tabData } = await createOnePageLayoutTab({
      expectToFail: false,
      input: { title: 'Tab 1', pageLayoutId },
    });

    return tabData.createPageLayoutTab.id;
  };

  beforeAll(async () => {
    fieldIds = await fetchDashboardFilterBindingFieldIds();
  });

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({
      context: {
        pageLayoutType = PageLayoutType.DASHBOARD,
        buildDashboardFilterBindings,
      },
    }) => {
      const tabId = await createPageLayoutWithTab(pageLayoutType);

      const { errors } = await saveDashboardWithAggregateWidget({
        pageLayoutId,
        pageLayoutType,
        tabId,
        widgetId: v4(),
        objectMetadataId: fieldIds.companyObjectMetadataId,
        aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
        filters:
          pageLayoutType === PageLayoutType.DASHBOARD
            ? [PERIOD_FILTER, CLOSE_DATE_FILTER]
            : null,
        dashboardFilterBindings: buildDashboardFilterBindings(fieldIds),
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );

  it('when a filter is removed while an unchanged widget still binds it', async () => {
    const tabId = await createPageLayoutWithTab(PageLayoutType.DASHBOARD);
    const widgetId = v4();

    const saveDashboard = ({
      filters,
      expectToFail,
    }: {
      filters: PageLayoutFilter[];
      expectToFail: boolean;
    }) =>
      saveDashboardWithAggregateWidget({
        pageLayoutId,
        tabId,
        widgetId,
        objectMetadataId: fieldIds.companyObjectMetadataId,
        aggregateFieldMetadataId: fieldIds.companyPositionFieldId,
        filters,
        dashboardFilterBindings: [
          {
            pageLayoutFilterId: CLOSE_DATE_FILTER.id,
            fieldMetadataId: fieldIds.companyCreatedAtFieldId,
          },
        ],
        expectToFail,
      });

    await saveDashboard({
      filters: [PERIOD_FILTER, CLOSE_DATE_FILTER],
      expectToFail: false,
    });

    const { errors } = await saveDashboard({
      filters: [PERIOD_FILTER],
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
