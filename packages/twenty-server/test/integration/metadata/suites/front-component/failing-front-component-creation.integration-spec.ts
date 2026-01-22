import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';

type TestContext = {
  name: string | null;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when name is empty',
    context: {
      name: '',
    },
  },
  {
    title: 'when name is whitespace-only',
    context: {
      name: '   ',
    },
  },
  {
    title: 'when name is too long',
    context: {
      name: null,
    },
  },
];

describe('Front component creation should fail', () => {
  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context }) => {
      const { errors } = await createFrontComponent({
        expectToFail: true,
        input: {
          name: context.name,
        } as CreateFrontComponentInput,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
