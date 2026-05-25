import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type FrontComponentManifest,
  type Manifest,
} from 'twenty-shared/application';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const FRONT_COMPONENT_ID = uuidv4();

const VALID_BUILT_PATH = 'src/front-components/test.mjs';

const buildValidFrontComponent = (): FrontComponentManifest => ({
  universalIdentifier: FRONT_COMPONENT_ID,
  name: 'TestComponent',
  description: 'A test front component',
  sourceComponentPath: 'src/front-components/test.tsx',
  builtComponentPath: VALID_BUILT_PATH,
  builtComponentChecksum: 'valid-checksum',
  componentName: 'TestComponent',
  isHeadless: false,
});

const buildManifest = (
  frontComponentOverrides: Partial<FrontComponentManifest> = {},
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      frontComponents: [
        {
          ...buildValidFrontComponent(),
          ...frontComponentOverrides,
        },
      ],
    },
  });

type TestContext = {
  manifest: Manifest;
};

const FAILING_UPDATE_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title:
      'when builtComponentPath is updated with path traversal via manifest sync',
    context: {
      manifest: buildManifest({
        builtComponentPath:
          '../../../other-workspace/other-app/BuiltFrontComponent/stolen.mjs',
      }),
    },
  },
  {
    title:
      'when sourceComponentPath is updated with path traversal via manifest sync',
    context: {
      manifest: buildManifest({
        sourceComponentPath: '../../etc/passwd',
      }),
    },
  },
  {
    title:
      'when builtComponentPath is updated with absolute path via manifest sync',
    context: {
      manifest: buildManifest({
        builtComponentPath: '/etc/passwd',
      }),
    },
  },
  {
    title:
      'when builtComponentPath is updated with backslash path via manifest sync',
    context: {
      manifest: buildManifest({
        builtComponentPath: '..\\..\\..\\etc\\passwd',
      }),
    },
  },
  {
    title:
      'when builtComponentPath is a folder path without extension (bare UUID)',
    context: {
      manifest: buildManifest({
        builtComponentPath: '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58',
      }),
    },
  },
  {
    title:
      'when sourceComponentPath is a folder path without extension',
    context: {
      manifest: buildManifest({
        sourceComponentPath: 'src/front-components/my-component',
      }),
    },
  },
  {
    title:
      'when builtComponentPath is updated with invalid extension (.js instead of .mjs)',
    context: {
      manifest: buildManifest({
        builtComponentPath: 'src/front-components/test.js',
      }),
    },
  },
  {
    title:
      'when sourceComponentPath is updated with invalid extension (.mjs instead of .ts/.tsx)',
    context: {
      manifest: buildManifest({
        sourceComponentPath: 'src/front-components/test.mjs',
      }),
    },
  },
  {
    title:
      'when builtComponentPath is updated with a completely unrelated extension (.pdf)',
    context: {
      manifest: buildManifest({
        builtComponentPath: 'src/front-components/test.pdf',
      }),
    },
  },
];

describe('Front component update via manifest sync should fail for path traversal', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Path Traversal App',
      description: 'App for testing path traversal validation on update',
      sourcePath: 'test-path-traversal',
    });

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltFrontComponent',
      filePath: VALID_BUILT_PATH,
      fileBuffer: Buffer.from('dummy built component content'),
      filename: 'test.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });

    jest.useFakeTimers();

    await syncApplication({
      manifest: buildManifest(),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(FAILING_UPDATE_TEST_CASES))(
    '$title',
    async ({ context }) => {
      const { errors } = await syncApplication({
        manifest: context.manifest,
        expectToFail: true,
      });

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
    60000,
  );
});
