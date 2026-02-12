import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/delete-one-core-view-filter-group.util';
import { v4 } from 'uuid';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

type TestContext = {
  id: string;
};

const failingViewFilterGroupDeletionTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when view filter group id does not exist',
      context: {
        id: v4(),
      },
    },
  ];

describe('View Filter Group deletion should fail', () => {
  it.each(eachTestingContextFilter(failingViewFilterGroupDeletionTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await deleteOneCoreViewFilterGroup({
        id: context.id,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
