import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneCoreViewFilterGroup } from 'test/integration/metadata/suites/view-filter-group/utils/create-one-core-view-filter-group.util';
import { v4 } from 'uuid';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';

import { type CreateViewFilterGroupInput } from 'src/engine/metadata-modules/view-filter-group/dtos/inputs/create-view-filter-group.input';

type TestContext = {
  input: CreateViewFilterGroupInput;
};

const failingViewFilterGroupCreationTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when viewId is not a valid UUID',
      context: {
        input: {
          viewId: 'invalid-uuid',
        },
      },
    },
    {
      title: 'when viewId does not exist',
      context: {
        input: {
          viewId: v4(),
        },
      },
    },
    {
      title: 'when parentViewFilterGroupId does not exist',
      context: {
        input: {
          viewId: v4(),
          parentViewFilterGroupId: v4(),
        },
      },
    },
  ];

describe('View Filter Group creation should fail', () => {
  it.each(eachTestingContextFilter(failingViewFilterGroupCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneCoreViewFilterGroup({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});

