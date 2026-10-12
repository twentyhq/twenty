import { HTTPMethod } from 'twenty-shared/types';
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
const EXISTING_LOGIC_FUNCTION_ID = uuidv4();

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

const buildHttpRouteTriggerSettings = (forwardedRequestHeaders: string[]) => ({
  path: '/forwarded-headers',
  httpMethod: HTTPMethod.POST,
  isAuthRequired: false,
  forwardedRequestHeaders,
});

const buildExistingLogicFunction = (forwardedRequestHeaders: string[]) =>
  buildLogicFunction({
    universalIdentifier: EXISTING_LOGIC_FUNCTION_ID,
    httpRouteTriggerSettings: buildHttpRouteTriggerSettings(
      forwardedRequestHeaders,
    ),
  });

const buildManifest = (logicFunctions: LogicFunctionManifest[]): Manifest =>
  buildBaseManifest({
    appId: TEST_APP_ID,
    roleId: TEST_ROLE_ID,
    overrides: { logicFunctions },
  });

type TestContext = {
  manifest: Manifest;
};

const FAILING_FORWARDED_CREDENTIAL_HEADERS_TEST_CASES: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when a created http route forwards the authorization header',
      context: {
        manifest: buildManifest([
          buildExistingLogicFunction(['x-custom-header']),
          buildLogicFunction({
            httpRouteTriggerSettings: buildHttpRouteTriggerSettings([
              'authorization',
            ]),
          }),
        ]),
      },
    },
    {
      title:
        'when a created http route forwards the cookie header with a different case',
      context: {
        manifest: buildManifest([
          buildExistingLogicFunction(['x-custom-header']),
          buildLogicFunction({
            httpRouteTriggerSettings: buildHttpRouteTriggerSettings([
              'x-custom-header',
              'Cookie',
            ]),
          }),
        ]),
      },
    },
    {
      title:
        'when a created server route forwards the proxy-authorization header',
      context: {
        manifest: buildManifest([
          buildExistingLogicFunction(['x-custom-header']),
          buildLogicFunction({
            serverRouteTriggerSettings: {
              forwardedRequestHeaders: ['proxy-authorization'],
            },
          }),
        ]),
      },
    },
    {
      title:
        'when an existing http route is updated to forward the authorization header',
      context: {
        manifest: buildManifest([
          buildExistingLogicFunction(['x-custom-header', 'authorization']),
        ]),
      },
    },
    {
      title: 'when a created http route forwards headers as a string',
      context: {
        manifest: buildManifest([
          buildExistingLogicFunction(['x-custom-header']),
          buildLogicFunction({
            httpRouteTriggerSettings: buildHttpRouteTriggerSettings(
              'authorization' as unknown as string[],
            ),
          }),
        ]),
      },
    },
    {
      title: 'when a created http route forwards headers as an object',
      context: {
        manifest: buildManifest([
          buildExistingLogicFunction(['x-custom-header']),
          buildLogicFunction({
            httpRouteTriggerSettings: buildHttpRouteTriggerSettings({
              0: 'authorization',
            } as unknown as string[]),
          }),
        ]),
      },
    },
    {
      title: 'when an existing server route is updated with a null header',
      context: {
        manifest: buildManifest([
          buildLogicFunction({
            universalIdentifier: EXISTING_LOGIC_FUNCTION_ID,
            httpRouteTriggerSettings: buildHttpRouteTriggerSettings([
              'x-custom-header',
            ]),
            serverRouteTriggerSettings: {
              forwardedRequestHeaders: [null] as unknown as string[],
            },
          }),
        ]),
      },
    },
  ];

describe('Logic function sync should fail when a route trigger forwards credential headers', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Forwarded Credential Headers Logic App',
      description:
        'App for testing forwarded request header validation on logic functions',
      sourcePath: 'test-forwarded-credential-headers-logic',
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
      manifest: buildManifest([
        buildExistingLogicFunction(['x-custom-header']),
      ]),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it.each(
    eachTestingContextFilter(FAILING_FORWARDED_CREDENTIAL_HEADERS_TEST_CASES),
  )(
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
