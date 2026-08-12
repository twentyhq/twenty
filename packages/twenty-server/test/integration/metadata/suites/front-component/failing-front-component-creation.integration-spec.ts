import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createFrontComponent } from 'test/integration/metadata/suites/front-component/utils/create-front-component.util';
import { seedBuiltFrontComponentFile } from 'test/integration/metadata/suites/front-component/utils/seed-built-front-component-file.util';
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
  {
    title: 'when builtComponentPath contains path traversal',
    context: {
      input: {
        name: 'TraversalTest',
        componentName: 'TraversalTest',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath:
          '../../../other-workspace/other-app/BuiltFrontComponent/stolen.mjs',
        builtComponentChecksum: 'abc123',
      },
    },
  },
  {
    title: 'when sourceComponentPath contains path traversal',
    context: {
      input: {
        name: 'TraversalTest',
        componentName: 'TraversalTest',
        sourceComponentPath: '../../etc/passwd',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    },
  },
  {
    title: 'when builtComponentPath is an absolute path',
    context: {
      input: {
        name: 'AbsolutePathTest',
        componentName: 'AbsolutePathTest',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: '/etc/passwd',
        builtComponentChecksum: 'abc123',
      },
    },
  },
  {
    title:
      'when builtComponentPath is a folder path without extension (bare UUID)',
    context: {
      input: {
        name: 'FolderPathTest',
        componentName: 'FolderPathTest',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58',
        builtComponentChecksum: 'abc123',
      },
    },
  },
  {
    title:
      'when sourceComponentPath is a folder path without extension',
    context: {
      input: {
        name: 'FolderSourcePathTest',
        componentName: 'FolderSourcePathTest',
        sourceComponentPath: 'src/front-components/my-component',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    },
  },
  {
    title:
      'when builtComponentPath has an invalid extension (.js instead of .mjs)',
    context: {
      input: {
        name: 'InvalidExtTest',
        componentName: 'InvalidExtTest',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.js',
        builtComponentChecksum: 'abc123',
      },
    },
  },
  {
    title:
      'when sourceComponentPath has an invalid extension (.mjs instead of .ts/.tsx)',
    context: {
      input: {
        name: 'InvalidSourceExtTest',
        componentName: 'InvalidSourceExtTest',
        sourceComponentPath: 'src/front-components/index.mjs',
        builtComponentPath: 'src/front-components/index.mjs',
        builtComponentChecksum: 'abc123',
      },
    },
  },
  {
    title:
      'when builtComponentPath has a completely unrelated extension (.pdf)',
    context: {
      input: {
        name: 'PdfExtTest',
        componentName: 'PdfExtTest',
        sourceComponentPath: 'src/front-components/index.tsx',
        builtComponentPath: 'src/front-components/index.pdf',
        builtComponentChecksum: 'abc123',
      },
    },
  },
];

describe('Front component creation should fail', () => {
  let cleanupBuiltFile: (() => void) | undefined;

  beforeAll(async () => {
    const { cleanup } = await seedBuiltFrontComponentFile({
      builtComponentPath: 'src/front-components/index.mjs',
    });

    cleanupBuiltFile = cleanup;
  });

  afterAll(() => {
    cleanupBuiltFile?.();
  });

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
