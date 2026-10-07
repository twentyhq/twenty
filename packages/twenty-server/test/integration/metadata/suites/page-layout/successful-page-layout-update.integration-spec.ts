import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type DashboardFilterSlot, PageLayoutType } from 'twenty-shared/types';

type TestContext = {
  input: {
    name?: string;
    type?: PageLayoutType;
  };
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'update page layout name',
    context: {
      input: {
        name: 'Updated Page Layout Name',
      },
    },
  },
  {
    title: 'update page layout type',
    context: {
      input: {
        type: PageLayoutType.DASHBOARD,
      },
    },
  },
];

describe('Page layout update should succeed', () => {
  let testPageLayoutId: string;

  beforeEach(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Original Page Layout',
        type: PageLayoutType.RECORD_PAGE,
      },
    });

    testPageLayoutId = data.createPageLayout.id;
  });

  afterEach(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { input } }) => {
      const { data } = await updateOnePageLayout({
        expectToFail: false,
        input: {
          id: testPageLayoutId,
          ...input,
        },
      });

      expect(data.updatePageLayout).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...data.updatePageLayout }),
      );
    },
  );
  it('should keep dashboard filters when omitted and clear them on an explicit null', async () => {
    const dashboardFilters: DashboardFilterSlot[] = [
      { id: 'date', label: 'Date', filterType: 'DATE_TIME' },
    ];

    const { data: createData } = await createOnePageLayout({
      expectToFail: false,
      input: {
        name: 'Dashboard with filters',
        type: PageLayoutType.DASHBOARD,
        dashboardFilters,
      },
    });

    const dashboardPageLayoutId = createData.createPageLayout.id;

    try {
      const { data: renamedData } = await updateOnePageLayout({
        expectToFail: false,
        input: { id: dashboardPageLayoutId, name: 'Renamed dashboard' },
      });

      expect(renamedData.updatePageLayout.dashboardFilters).toEqual(
        dashboardFilters,
      );

      const { data: clearedData } = await updateOnePageLayout({
        expectToFail: false,
        input: { id: dashboardPageLayoutId, dashboardFilters: null },
      });

      expect(clearedData.updatePageLayout.dashboardFilters).toBeNull();
    } finally {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: dashboardPageLayoutId },
      });
    }
  });
});
