import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { updateFrontComponent } from 'test/integration/metadata/suites/front-component/utils/update-front-component.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 } from 'uuid';

type TestContext = {
  id: string;
  name: string;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when front component does not exist',
    context: {
      id: v4(),
      name: 'updatedName',
    },
  },
];

describe('Front component update should fail', () => {
  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context }) => {
      const { errors } = await updateFrontComponent({
        expectToFail: true,
        input: {
          id: context.id,
          update: {
            name: context.name,
          },
        },
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
