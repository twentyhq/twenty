import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import {
  type LogicFunctionManifest,
  type Manifest,
} from 'twenty-shared/application';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { v4 as uuidv4 } from 'uuid';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();

const VALID_BUILT_PATH = 'src/logic-functions/handler.mjs';

const buildLogicFunction = (
  overrides: Partial<LogicFunctionManifest> = {},
): LogicFunctionManifest => ({
  universalIdentifier: uuidv4(),
  name: 'TestLogicFunction',
  description: 'A test logic function',
  sourceHandlerPath: 'src/logic-functions/handler.ts',
  builtHandlerPath: VALID_BUILT_PATH,
  builtHandlerChecksum: 'valid-checksum',
  handlerName: 'handler',
  ...overrides,
});

const buildManifest = (
  logicFunctionOverrides: Partial<LogicFunctionManifest> = {},
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      logicFunctions: [buildLogicFunction(logicFunctionOverrides)],
    },
  });

type TestContext = {
  manifest: Manifest;
};

const FAILING_CREATION_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when builtHandlerPath contains path traversal',
    context: {
      manifest: buildManifest({
        builtHandlerPath:
          '../../../other-workspace/other-app/built-logic-function/stolen.mjs',
      }),
    },
  },
  {
    title: 'when sourceHandlerPath contains path traversal',
    context: {
      manifest: buildManifest({
        sourceHandlerPath: '../../etc/passwd',
      }),
    },
  },
  {
    title: 'when builtHandlerPath is an absolute path',
    context: {
      manifest: buildManifest({
        builtHandlerPath: '/etc/passwd',
      }),
    },
  },
  {
    title: 'when builtHandlerPath contains backslash path traversal',
    context: {
      manifest: buildManifest({
        builtHandlerPath: '..\\..\\..\\etc\\passwd',
      }),
    },
  },
  {
    title: 'when builtHandlerPath is a folder path without extension (bare UUID)',
    context: {
      manifest: buildManifest({
        builtHandlerPath: '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58',
      }),
    },
  },
  {
    title: 'when sourceHandlerPath is a folder path without extension',
    context: {
      manifest: buildManifest({
        sourceHandlerPath: 'src/logic-functions/my-handler',
      }),
    },
  },
  {
    title:
      'when builtHandlerPath has an invalid extension (.js instead of .mjs)',
    context: {
      manifest: buildManifest({
        builtHandlerPath: 'src/logic-functions/handler.js',
      }),
    },
  },
  {
    title:
      'when sourceHandlerPath has an invalid extension (.mjs instead of .ts/.tsx)',
    context: {
      manifest: buildManifest({
        sourceHandlerPath: 'src/logic-functions/handler.mjs',
      }),
    },
  },
  {
    title: 'when builtHandlerPath has a completely unrelated extension (.pdf)',
    context: {
      manifest: buildManifest({
        builtHandlerPath: 'src/logic-functions/handler.pdf',
      }),
    },
  },
];

describe('Logic function creation via manifest sync should fail for path traversal', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Path Traversal Logic App',
      description: 'App for testing path traversal validation on creation',
      sourcePath: 'test-path-traversal-logic',
    });

    jest.useRealTimers();

    await uploadApplicationFile({
      applicationUniversalIdentifier: TEST_APP_ID,
      fileFolder: 'BuiltLogicFunction',
      filePath: VALID_BUILT_PATH,
      fileBuffer: Buffer.from('dummy built handler content'),
      filename: 'handler.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });

    jest.useFakeTimers();
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(eachTestingContextFilter(FAILING_CREATION_TEST_CASES))(
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
