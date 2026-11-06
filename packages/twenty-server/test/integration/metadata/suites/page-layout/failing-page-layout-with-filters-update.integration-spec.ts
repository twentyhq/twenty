import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-filters-gql-fields.constant';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import {
  type PageLayoutFilter,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

const PERIOD_FILTER: PageLayoutFilter = {
  ...DASHBOARD_DATE_RANGE_FILTER,
  defaultValue: {
    conditions: [
      { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
    ],
  },
};

type TestContext = {
  pageLayoutType: PageLayoutType;
  filters: PageLayoutFilter[];
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when filters are set on a record page layout',
    context: {
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      filters: [PERIOD_FILTER],
    },
  },
  {
    title: 'when a filter is not the built-in Date range filter',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [
        { ...PERIOD_FILTER, id: '9c1e5b7a-3d2f-4e6a-8b9c-0d1e2f3a4b02' },
      ],
    },
  },
  {
    title: 'when a second filter comes with the built-in Date range filter',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [
        PERIOD_FILTER,
        { ...PERIOD_FILTER, id: '9c1e5b7a-3d2f-4e6a-8b9c-0d1e2f3a4b02' },
      ],
    },
  },
  {
    title: 'when a default value uses an operand date fields do not support',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [
        {
          ...PERIOD_FILTER,
          defaultValue: {
            conditions: [
              { operand: ViewFilterOperand.CONTAINS, value: '2026' },
            ],
          },
        },
      ],
    },
  },
  {
    title: 'when a default value holds the object form of a relative date',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [
        {
          ...PERIOD_FILTER,
          defaultValue: {
            conditions: [
              {
                operand: ViewFilterOperand.IS_RELATIVE,
                value: JSON.stringify({
                  direction: 'PAST',
                  amount: 1,
                  unit: 'MONTH',
                }),
              },
            ],
          },
        },
      ],
    },
  },
];

describe('Page layout with filters update should fail', () => {
  let pageLayoutId: string;

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: pageLayoutId },
    });
  });

  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context: { pageLayoutType, filters } }) => {
      const { data: layoutData } = await createOnePageLayout({
        expectToFail: false,
        input: { name: 'Layout With Invalid Filters', type: pageLayoutType },
      });

      pageLayoutId = layoutData.createPageLayout.id;

      const { data: tabData } = await createOnePageLayoutTab({
        expectToFail: false,
        input: { title: 'Tab 1', pageLayoutId },
      });

      const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
        expectToFail: true,
        gqlFields: PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS,
        input: {
          id: pageLayoutId,
          name: 'Layout With Invalid Filters',
          type: pageLayoutType,
          objectMetadataId: null,
          filters,
          tabs: [
            {
              id: tabData.createPageLayoutTab.id,
              title: 'Tab 1',
              position: 0,
              widgets: [],
            },
          ],
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
