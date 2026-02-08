import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';

type TestContext = {
  input: CreateFrontComponentInput;
};

const FAILING_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when name is empty',
    context: {
      input: {
        name: '',
        componentName: 'TestComponent',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    },
  },
  {
    title: 'when name is whitespace-only',
    context: {
      input: {
        name: '   ',
        componentName: 'TestComponent',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    },
  },
];

describe('Front component creation should fail', () => {
  it.each(eachTestingContextFilter(FAILING_TEST_CASES))(
    '$title',
    async ({ context }) => {
      const { errors } = await createFrontComponent({
        expectToFail: true,
        input: context.input,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
