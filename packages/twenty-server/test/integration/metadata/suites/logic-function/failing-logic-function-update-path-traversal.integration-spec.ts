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
const LOGIC_FUNCTION_ID = uuidv4();

const VALID_BUILT_PATH = 'src/logic-functions/handler.mjs';

const buildValidLogicFunction = (): LogicFunctionManifest => ({
  universalIdentifier: LOGIC_FUNCTION_ID,
  name: 'TestLogicFunction',
  description: 'A test logic function',
  sourceHandlerPath: 'src/logic-functions/handler.ts',
  builtHandlerPath: VALID_BUILT_PATH,
  builtHandlerChecksum: 'valid-checksum',
  handlerName: 'handler',
});

const buildManifest = (
  logicFunctionOverrides: Partial<LogicFunctionManifest> = {},
): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: {
      logicFunctions: [
        {
          ...buildValidLogicFunction(),
          ...logicFunctionOverrides,
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
      'when builtHandlerPath is updated with path traversal via manifest sync',
    context: {
      manifest: buildManifest({
        builtHandlerPath:
          '../../../other-workspace/other-app/built-logic-function/stolen.mjs',
      }),
    },
  },
  {
    title:
      'when sourceHandlerPath is updated with path traversal via manifest sync',
    context: {
      manifest: buildManifest({
        sourceHandlerPath: '../../etc/passwd',
      }),
    },
  },
  {
    title:
      'when builtHandlerPath is updated with absolute path via manifest sync',
    context: {
      manifest: buildManifest({
        builtHandlerPath: '/etc/passwd',
      }),
    },
  },
  {
    title:
      'when builtHandlerPath is updated with backslash path via manifest sync',
    context: {
      manifest: buildManifest({
        builtHandlerPath: '..\\..\\..\\etc\\passwd',
      }),
    },
  },
  {
    title:
      'when builtHandlerPath is a folder path without extension (bare UUID)',
    context: {
      manifest: buildManifest({
        builtHandlerPath: '8b2df3cc-23ad-4e1b-87fd-f880d4cefd58',
      }),
    },
  },
  {
    title:
      'when sourceHandlerPath is a folder path without extension',
    context: {
      manifest: buildManifest({
        sourceHandlerPath: 'src/logic-functions/my-handler',
      }),
    },
  },
  {
    title:
      'when builtHandlerPath is updated with invalid extension (.js instead of .mjs)',
    context: {
      manifest: buildManifest({
        builtHandlerPath: 'src/logic-functions/handler.js',
      }),
    },
  },
  {
    title:
      'when sourceHandlerPath is updated with invalid extension (.mjs instead of .ts/.tsx)',
    context: {
      manifest: buildManifest({
        sourceHandlerPath: 'src/logic-functions/handler.mjs',
      }),
    },
  },
  {
    title:
      'when builtHandlerPath is updated with a completely unrelated extension (.pdf)',
    context: {
      manifest: buildManifest({
        builtHandlerPath: 'src/logic-functions/handler.pdf',
      }),
    },
  },
];

describe('Logic function update via manifest sync should fail for path traversal', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Path Traversal Logic App',
      description:
        'App for testing path traversal validation on logic function update',
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
