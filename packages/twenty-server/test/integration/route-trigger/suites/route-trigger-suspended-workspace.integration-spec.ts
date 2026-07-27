import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APP_UNIVERSAL_IDENTIFIER = '6a6f983f-5c1a-4c60-a3c8-7d0e2a4a66a6';
const ROLE_UNIVERSAL_IDENTIFIER = '7b7f983f-5c1a-4c60-a3c8-7d0e2a4a77b7';
const ROUTE_FUNCTION_UNIVERSAL_IDENTIFIER =
  '8c8f983f-5c1a-4c60-a3c8-7d0e2a4a88c8';

const ROUTE_FUNCTION_RESPONSE = { greeting: 'hello from route function' };

const UNSAFE_JS_CHAR_MAP: Record<string, string> = {
  '<': '\\u003C',
  '>': '\\u003E',
  '/': '\\u002F',
  '\\': '\\\\',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\0': '\\0',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

const escapeUnsafeChars = (value: string): string =>
  value.replace(/[<>/\\\b\f\n\r\t\0\u2028\u2029]/g, (char) => {
    return UNSAFE_JS_CHAR_MAP[char] ?? char;
  });

const ROUTE_BUILT_HANDLER_CODE = `export const main = async () => (${escapeUnsafeChars(
  JSON.stringify(ROUTE_FUNCTION_RESPONSE),
)});
`;

const routeFunctionManifest: LogicFunctionManifest = {
  universalIdentifier: ROUTE_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'suspended-workspace-route',
  handlerName: 'main',
  sourceHandlerPath: 'src/suspended-workspace-route.ts',
  builtHandlerPath: 'dist/suspended-workspace-route.mjs',
  builtHandlerChecksum: 'checksum-suspended-workspace-route',
  httpRouteTriggerSettings: {
    path: '/suspended-workspace-route',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
};

const uploadBuiltHandlerFile = async ({
  builtHandlerPath,
  builtHandlerCode,
}: {
  builtHandlerPath: string;
  builtHandlerCode: string;
}) => {
  jest.useRealTimers();

  await uploadApplicationFile({
    applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    fileFolder: 'BuiltLogicFunction',
    filePath: builtHandlerPath,
    fileBuffer: Buffer.from(builtHandlerCode),
    filename: builtHandlerPath.split('/').pop() as string,
    contentType: 'application/javascript',
    expectToFail: false,
  });

  jest.useFakeTimers();
};

describe('RouteTrigger suspended workspace (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const workspaceHost = `apple.localhost:${APP_PORT}`;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Route Trigger Suspended Workspace Test App',
      description: 'App for testing route triggers on a suspended workspace',
      sourcePath: 'route-trigger-suspended-workspace-test-app',
    });

    await uploadBuiltHandlerFile({
      builtHandlerPath: 'dist/suspended-workspace-route.mjs',
      builtHandlerCode: ROUTE_BUILT_HANDLER_CODE,
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          logicFunctions: [routeFunctionManifest],
        },
      }),
      expectToFail: false,
    });

    jest.useRealTimers();
  }, 60000);

  afterAll(async () => {
    await getCoreRepository<WorkspaceEntity>(WorkspaceEntity).update(
      SEED_APPLE_WORKSPACE_ID,
      {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
        suspendedAt: null,
      },
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  describe('GET /s/suspended-workspace-route', () => {
    it('serves the route trigger while the workspace is active', async () => {
      const response = await request(baseUrl)
        .get('/s/suspended-workspace-route')
        .set('Host', workspaceHost);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(ROUTE_FUNCTION_RESPONSE);
    }, 60000);

    it('rejects the route trigger with 403 once the workspace is suspended', async () => {
      await getCoreRepository<WorkspaceEntity>(WorkspaceEntity).update(
        SEED_APPLE_WORKSPACE_ID,
        {
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
          suspendedAt: new Date(),
        },
      );

      const response = await request(baseUrl)
        .get('/s/suspended-workspace-route')
        .set('Host', workspaceHost);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('WORKSPACE_SUSPENDED');
      expectOneNotInternalServerErrorHttpResponseSnapshot({
        status: response.status,
        body: response.body,
      });
    }, 60000);
  });
});
