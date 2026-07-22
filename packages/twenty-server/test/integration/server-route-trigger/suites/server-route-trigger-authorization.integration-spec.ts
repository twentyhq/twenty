import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OWNER_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

const APP_UNIVERSAL_IDENTIFIER = 'd41340eb-6cc9-4383-8b04-9be7dc794bb1';
const ROLE_UNIVERSAL_IDENTIFIER = 'e5b19f77-3e1c-4a10-9c2e-56d6b0f8a3d2';

const NON_EXPOSED_FUNCTION_UNIVERSAL_IDENTIFIER =
  '1a1f983f-5c1a-4c60-a3c8-7d0e2a4a11a1';
const EXPOSED_RESOLVER_UNIVERSAL_IDENTIFIER =
  '2b2f983f-5c1a-4c60-a3c8-7d0e2a4a22b2';
const AUTH_REQUIRED_RESOLVER_UNIVERSAL_IDENTIFIER =
  '3c3f983f-5c1a-4c60-a3c8-7d0e2a4a33c3';
const TARGET_FUNCTION_UNIVERSAL_IDENTIFIER =
  '4d4f983f-5c1a-4c60-a3c8-7d0e2a4a44d4';

const TARGET_FUNCTION_RESPONSE = { greeting: 'hello from target function' };

// Built (ESM) handler code executed by the logic function driver. The resolver
// routes the public request to the target function in the owner workspace.
const RESOLVER_BUILT_HANDLER_CODE = `export const main = async () => ({
  workspaceId: '${OWNER_WORKSPACE_ID}',
  targetLogicFunctionUniversalIdentifier: '${TARGET_FUNCTION_UNIVERSAL_IDENTIFIER}',
});
`;

const TARGET_BUILT_HANDLER_CODE = `export const main = async () => (${JSON.stringify(
  TARGET_FUNCTION_RESPONSE,
)});
`;

const buildLogicFunctionManifest = ({
  universalIdentifier,
  name,
  serverRouteExposed,
  authRequired,
}: {
  universalIdentifier: string;
  name: string;
  serverRouteExposed: boolean;
  authRequired: boolean;
}): LogicFunctionManifest => ({
  universalIdentifier,
  name,
  handlerName: 'main',
  sourceHandlerPath: `src/${name}.ts`,
  builtHandlerPath: `dist/${name}.mjs`,
  builtHandlerChecksum: `checksum-${name}`,
  ...(authRequired
    ? {
        httpRouteTriggerSettings: {
          path: `/${name}`,
          httpMethod: 'POST',
          isAuthRequired: true,
        },
      }
    : {}),
  ...(serverRouteExposed
    ? { serverRouteTriggerSettings: { forwardedRequestHeaders: [] } }
    : {}),
});

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

describe('ServerRouteTrigger authorization (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Server Route Auth Test App',
      description: 'App for testing server route trigger authorization',
      sourcePath: 'server-route-auth-test-app',
    });

    await uploadBuiltHandlerFile({
      builtHandlerPath: 'dist/exposed-resolver.mjs',
      builtHandlerCode: RESOLVER_BUILT_HANDLER_CODE,
    });

    await uploadBuiltHandlerFile({
      builtHandlerPath: 'dist/target-function.mjs',
      builtHandlerCode: TARGET_BUILT_HANDLER_CODE,
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          logicFunctions: [
            buildLogicFunctionManifest({
              universalIdentifier: NON_EXPOSED_FUNCTION_UNIVERSAL_IDENTIFIER,
              name: 'non-exposed-function',
              serverRouteExposed: false,
              authRequired: true,
            }),
            buildLogicFunctionManifest({
              universalIdentifier: EXPOSED_RESOLVER_UNIVERSAL_IDENTIFIER,
              name: 'exposed-resolver',
              serverRouteExposed: true,
              authRequired: false,
            }),
            buildLogicFunctionManifest({
              universalIdentifier: AUTH_REQUIRED_RESOLVER_UNIVERSAL_IDENTIFIER,
              name: 'auth-required-resolver',
              serverRouteExposed: true,
              authRequired: true,
            }),
            buildLogicFunctionManifest({
              universalIdentifier: TARGET_FUNCTION_UNIVERSAL_IDENTIFIER,
              name: 'target-function',
              serverRouteExposed: false,
              authRequired: false,
            }),
          ],
        },
      }),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  describe('POST /webhooks/server/:universalIdentifier (public, unauthenticated)', () => {
    it('rejects an owner-workspace function without serverRouteTriggerSettings before executing it', async () => {
      const response = await request(baseUrl)
        .post(`/webhooks/server/${NON_EXPOSED_FUNCTION_UNIVERSAL_IDENTIFIER}`)
        .send({ any: 'payload' });

      expect(response.status).toBe(404);
      expectOneNotInternalServerErrorHttpResponseSnapshot({
        status: response.status,
        body: response.body,
      });
    });

    it('dispatches a server-route-exposed resolver, queues the target, and acks with 202', async () => {
      const response = await request(baseUrl)
        .post(`/webhooks/server/${EXPOSED_RESOLVER_UNIVERSAL_IDENTIFIER}`)
        .send({ any: 'payload' });

      expect(response.status).toBe(202);
      expect(response.body).toEqual({ queued: true });
    }, 60000);

    it('rejects a server-route-exposed resolver that requires authentication before executing it', async () => {
      const response = await request(baseUrl)
        .post(`/webhooks/server/${AUTH_REQUIRED_RESOLVER_UNIVERSAL_IDENTIFIER}`)
        .send({ any: 'payload' });

      expect(response.status).toBe(403);
      expectOneNotInternalServerErrorHttpResponseSnapshot({
        status: response.status,
        body: response.body,
      });
    });
  });
});
