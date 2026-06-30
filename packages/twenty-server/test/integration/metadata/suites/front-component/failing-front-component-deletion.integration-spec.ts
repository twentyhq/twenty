import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deleteFrontComponent } from 'test/integration/metadata/suites/front-component/utils/delete-front-component.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';

type TestContext = {
  id: string;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when front component does not exist',
    context: {
      id: v4(),
    },
  },
];

describe('Front component deletion should fail', () => {
  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context }) => {
      const { errors } = await deleteFrontComponent({
        expectToFail: true,
        input: { id: context.id },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
