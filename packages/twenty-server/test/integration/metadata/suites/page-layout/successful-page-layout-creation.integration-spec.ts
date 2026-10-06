import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import {
  type DashboardFilterSlot,
  PageLayoutType,
  ViewFilterOperand,
} from 'twenty-shared/types';

type TestContext = {
  input: {
    name: string;
    type?: PageLayoutType;
    dashboardFilters?: DashboardFilterSlot[] | null;
  };
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'create a page layout with minimal input',
    context: {
      input: {
        name: 'Test Page Layout',
      },
    },
  },
  {
    title: 'create a page layout with DASHBOARD type',
    context: {
      input: {
        name: 'Dashboard Layout',
        type: PageLayoutType.DASHBOARD,
      },
    },
  },
  {
    title: 'create a page layout with DASHBOARD type and dashboard filters',
    context: {
      input: {
        name: 'Dashboard Layout With Filters',
        type: PageLayoutType.DASHBOARD,
        dashboardFilters: [
          {
            id: 'created',
            label: 'Created',
            filterType: 'DATE_TIME',
            defaultValue: {
              operand: ViewFilterOperand.IS_NOT_EMPTY,
              value: '',
            },
          },
          {
            id: 'owner',
            label: 'Owner',
            filterType: 'RELATION',
            isRequired: false,
          },
        ],
      },
    },
  },
];

describe('Page layout creation should succeed', () => {
  let createdPageLayoutId: string;

  afterEach(async () => {
    if (createdPageLayoutId) {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: createdPageLayoutId },
      });

      createdPageLayoutId = '';
    }
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await createOnePageLayout({
        expectToFail: false,
        input,
      });

      createdPageLayoutId = data?.createPageLayout?.id;

      expect(data.createPageLayout).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.createPageLayout }),
      );
    },
  );
});
