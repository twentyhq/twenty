import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { destroyOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/destroy-one-core-view-filter-group.util';
import { v4 } from 'uuid';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

type TestContext = {
  id: string;
};

const failingViewFilterGroupDestroyTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when view filter group id does not exist',
      context: {
        id: v4(),
      },
    },
  ];

describe('View Filter Group destroy should fail', () => {
  it.each(eachTestingContextFilter(failingViewFilterGroupDestroyTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await destroyOneCoreViewFilterGroup({
        id: context.id,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
