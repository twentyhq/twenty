import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { deleteOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/delete-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { restoreOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/restore-one-page-layout.util';
import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

type TestContext = {
  name: string;
  operation: 'soft-delete-restore' | 'hard-delete';
};

const SUCCESSFUL_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'soft delete and restore a page layout',
    context: {
      name: 'Page Layout To Delete',
      operation: 'soft-delete-restore',
    },
  },
  {
    title: 'hard delete a page layout',
    context: {
      name: 'Page Layout To Destroy',
      operation: 'hard-delete',
    },
  },
];

describe('Page layout deletion should succeed', () => {
  it.each(eachTestingContextFilter(SUCCESSFUL_TEST_CASES))(
    'should $title',
    async ({ context: { name, operation } }) => {
      const { data: createData } = await createOnePageLayout({
        expectToFail: false,
        input: { name },
      });

      const pageLayoutId = createData.createPageLayout.id;

      if (operation === 'soft-delete-restore') {
        const { data: deleteData } = await deleteOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });

        expect(deleteData.deletePageLayout).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({
            ...deleteData.deletePageLayout,
          }),
        );

        const { data: restoreData } = await restoreOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });

        expect(restoreData.restorePageLayout).toMatchSnapshot(
          extractRecordIdsAndDatesAsExpectAny({
            ...restoreData.restorePageLayout,
          }),
        );

        await destroyOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });
      } else {
        const { data: destroyData } = await destroyOnePageLayout({
          expectToFail: false,
          input: { id: pageLayoutId },
        });

        expect(destroyData.destroyPageLayout).toBe(true);
      }
    },
  );
});
