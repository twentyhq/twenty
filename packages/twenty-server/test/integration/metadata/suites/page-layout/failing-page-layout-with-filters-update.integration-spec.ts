import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS } from 'test/integration/metadata/suites/page-layout/constants/page-layout-with-filters-gql-fields.constant';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { findPageLayouts } from 'test/integration/metadata/suites/page-layout/utils/find-page-layouts.util';
import { updateOnePageLayoutWithTabsAndWidgets } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout-with-tabs-and-widgets.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import {
  type PageLayoutFilter,
  PageLayoutFilterType,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

const PERIOD_FILTER: PageLayoutFilter = {
  id: '9c1e5b7a-3d2f-4e6a-8b9c-0d1e2f3a4b01',
  label: 'Period',
  type: PageLayoutFilterType.DATE,
  position: 0,
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
    title: 'when two filters share an id',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [PERIOD_FILTER, { ...PERIOD_FILTER, label: 'Close date' }],
    },
  },
  {
    title: 'when a filter label is blank',
    context: {
      pageLayoutType: PageLayoutType.DASHBOARD,
      filters: [{ ...PERIOD_FILTER, label: '   ' }],
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

describe('Application page layout filters update should fail', () => {
  it('when the workspace changes the filters of a standard dashboard', async () => {
    const { data } = await findPageLayouts({
      expectToFail: false,
      input: undefined,
      gqlFields: 'id universalIdentifier tabs { id title position }',
    });

    const standardDashboard = data.getPageLayouts.find(
      ({ universalIdentifier }) =>
        universalIdentifier ===
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.myFirstDashboard
          .universalIdentifier,
    );

    jestExpectToBeDefined(standardDashboard);

    const { errors } = await updateOnePageLayoutWithTabsAndWidgets({
      expectToFail: true,
      gqlFields: PAGE_LAYOUT_WITH_FILTERS_GQL_FIELDS,
      input: {
        id: standardDashboard.id,
        name: 'My First Dashboard',
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        filters: [PERIOD_FILTER],
        tabs: (standardDashboard.tabs ?? []).map(({ id, title, position }) => ({
          id,
          title,
          position,
          widgets: [],
        })),
      },
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: (message) =>
        message.replace(standardDashboard.id, '<pageLayoutId>'),
    });
  });
});
