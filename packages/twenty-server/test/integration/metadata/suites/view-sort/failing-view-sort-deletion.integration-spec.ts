import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/delete-one-core-view-sort.util';
import { destroyOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-core-view-sort.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';

type TestContext = {
  viewSortId: string;
};

const failingViewSortDeletionTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when viewSortId does not exist',
    context: {
      viewSortId: v4(),
    },
  },
];

describe('View Sort deletion should fail', () => {
  it.each(eachTestingContextFilter(failingViewSortDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await deleteOneCoreViewSort({
        expectToFail: true,
        viewSortId: context.viewSortId,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );

  it('should fail when destroying non-existent view sort', async () => {
    const { errors } = await destroyOneCoreViewSort({
      expectToFail: true,
      viewSortId: v4(),
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
    });
  });
});
