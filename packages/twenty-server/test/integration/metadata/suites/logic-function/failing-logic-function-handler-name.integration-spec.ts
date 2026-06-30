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

const FAILING_HANDLER_NAME_TEST_CASES: EachTestingContext<TestContext>[] = [
  {
    title: 'when handlerName injects a statement via semicolon',
    context: {
      manifest: buildManifest({
        handlerName: 'handler; process.exit(1)',
      }),
    },
  },
  {
    title: 'when handlerName contains an invalid identifier character',
    context: {
      manifest: buildManifest({
        handlerName: 'my-handler',
      }),
    },
  },
  {
    title: 'when handlerName is a malformed dotted path (consecutive dots)',
    context: {
      manifest: buildManifest({
        handlerName: 'default..handler',
      }),
    },
  },
  {
    title: 'when handlerName is empty',
    context: {
      manifest: buildManifest({
        handlerName: '',
      }),
    },
  },
];

describe('Logic function creation via manifest sync should fail for invalid handlerName', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Handler Name Logic App',
      description: 'App for testing handlerName validation on creation',
      sourcePath: 'test-handler-name-logic',
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

  it.each(eachTestingContextFilter(FAILING_HANDLER_NAME_TEST_CASES))(
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
