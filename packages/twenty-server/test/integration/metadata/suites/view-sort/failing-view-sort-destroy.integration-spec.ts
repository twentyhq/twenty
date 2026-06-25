import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { v4 } from 'uuid';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { destroyOneViewSort } from 'test/integration/metadata/suites/view-sort/utils/destroy-one-view-sort.util';

type TestContext = {
  id: string;
};

const failingViewSortDestroyTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when viewSortId does not exist',
    context: {
      id: v4(),
    },
  },
];

describe('View Sort destroy should fail', () => {
  it.each(eachTestingContextFilter(failingViewSortDestroyTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await destroyOneViewSort({
        input: { id: context.id },
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
