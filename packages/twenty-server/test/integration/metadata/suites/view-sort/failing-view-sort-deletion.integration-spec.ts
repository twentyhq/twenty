import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/delete-one-core-view-sort.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';

type TestContext = {
  id: string;
};

const failingViewSortDeletionTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when viewSortId does not exist',
    context: {
      id: v4(),
    },
  },
];

describe('View Sort deletion should fail', () => {
  it.each(eachTestingContextFilter(failingViewSortDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await deleteOneCoreViewSort({
        input: { id: context.id },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
