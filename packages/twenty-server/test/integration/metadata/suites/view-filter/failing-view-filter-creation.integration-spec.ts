import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneCoreViewFilter } from 'test/integration/metadata/suites/view-filter/utils/create-one-core-view-filter.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { ViewFilterOperand } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type CreateViewFilterInput } from 'src/engine/metadata-modules/view-filter/dtos/inputs/create-view-filter.input';

type TestContext = {
  input: CreateViewFilterInput;
};

const failingViewFilterCreationTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when viewId does not exist',
    context: {
      input: {
        viewId: v4(),
        fieldMetadataId: v4(),
        value: 'test',
        operand: ViewFilterOperand.CONTAINS,
      },
    },
  },
  {
    title: 'when fieldMetadataId does not exist',
    context: {
      input: {
        viewId: v4(),
        fieldMetadataId: v4(),
        value: 'test',
        operand: ViewFilterOperand.CONTAINS,
      },
    },
  },
  {
    title: 'when viewFilterGroupId does not exist',
    context: {
      input: {
        viewId: v4(),
        fieldMetadataId: v4(),
        value: 'test',
        operand: ViewFilterOperand.CONTAINS,
        viewFilterGroupId: v4(),
      },
    },
  },
];

describe('View Filter creation should fail', () => {
  it.each(eachTestingContextFilter(failingViewFilterCreationTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await createOneCoreViewFilter({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
