import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { deleteOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/delete-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { restoreOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/restore-one-page-layout-tab.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

type TestContext = {
  title: string;
  operation: 'soft-delete-restore' | 'hard-delete';
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'soft delete and restore a page layout tab',
    context: {
      title: 'Tab To Delete',
      operation: 'soft-delete-restore',
    },
  },
  {
    title: 'hard delete a page layout tab',
    context: {
      title: 'Tab To Destroy',
      operation: 'hard-delete',
    },
  },
];

describe('Page layout tab deletion should succeed', () => {
  let testPageLayoutId: string;

  beforeAll(async () => {
    const { data } = await createOnePageLayout({
      expectToFail: false,
      input: { name: 'Test Page Layout For Tab Deletions' },
    });

    testPageLayoutId = data.createPageLayout.id;
  });

  afterAll(async () => {
    await destroyOnePageLayout({
      expectToFail: false,
      input: { id: testPageLayoutId },
    });
  });

  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { title, operation } }) => {
      const { data: createData } = await createOnePageLayoutTab({
        expectToFail: false,
        input: {
          title,
          pageLayoutId: testPageLayoutId,
        },
      });

      const tabId = createData.createPageLayoutTab.id;

      if (operation === 'soft-delete-restore') {
        const { data: deleteData } = await deleteOnePageLayoutTab({
          expectToFail: false,
          input: { id: tabId },
        });

        expect(deleteData.deletePageLayoutTab).toBe(true);

        const { data: restoreData } = await restoreOnePageLayoutTab({
          expectToFail: false,
          input: { id: tabId },
        });

        expect(restoreData.restorePageLayoutTab).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({
            ...restoreData.restorePageLayoutTab,
          }),
        );

        await destroyOnePageLayoutTab({
          expectToFail: false,
          input: { id: tabId },
        });
      } else {
        const { data: destroyData } = await destroyOnePageLayoutTab({
          expectToFail: false,
          input: { id: tabId },
        });

        expect(destroyData.destroyPageLayoutTab).toBe(true);
      }
    },
  );
});
