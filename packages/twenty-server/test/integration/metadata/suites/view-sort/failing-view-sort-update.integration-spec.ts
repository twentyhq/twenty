import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateOneCoreViewSort } from 'test/integration/metadata/suites/view-sort/utils/update-one-core-view-sort.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';

import { type UpdateViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/update-view-sort.input';
import { ViewSortDirection } from 'src/engine/metadata-modules/view-sort/enums/view-sort-direction';

type TestContext = {
  input: UpdateViewSortInput;
};

const failingViewSortUpdateTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'when viewSortId does not exist',
    context: {
      input: {
        id: v4(),
        update: {
          direction: ViewSortDirection.DESC,
        },
      },
    },
  },
];

describe('View Sort update should fail', () => {
  it.each(eachTestingContextFilter(failingViewSortUpdateTestCases))(
    '$title',
    async ({ context }) => {
      const { errors } = await updateOneCoreViewSort({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
