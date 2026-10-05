import { HTTPMethod } from 'twenty-shared/types';
import request from 'supertest';
import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';

const APP_UNIVERSAL_IDENTIFIER = '4e1b6a52-7c1f-4b0e-9a55-27255a1c0001';
const ROLE_UNIVERSAL_IDENTIFIER = '4e1b6a52-7c1f-4b0e-9a55-27255a1c0002';
const ROUTE_FUNCTION_UNIVERSAL_IDENTIFIER =
  '4e1b6a52-7c1f-4b0e-9a55-27255a1c0003';

const ROUTE_BUILT_HANDLER_CODE =
  'export const main = async () => ({ executed: true });\n';

const authRequiredRouteManifest: LogicFunctionManifest = {
  universalIdentifier: ROUTE_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'auth-required-route',
  handlerName: 'main',
  sourceHandlerPath: 'src/auth-required-route.ts',
  builtHandlerPath: 'dist/auth-required-route.mjs',
  builtHandlerChecksum: 'checksum-auth-required-route',
  httpRouteTriggerSettings: {
    path: '/auth-required-route',
    httpMethod: HTTPMethod.GET,
    isAuthRequired: true,
  },
};

describe('RouteTrigger authentication (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const workspaceHost = `apple.localhost:${APP_PORT}`;
  let applicationAccessToken: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Route Trigger Authentication Test App',
      description: 'App for testing authentication on route triggers',
      sourcePath: 'route-trigger-authentication-test-app',
    });

    jest.useRealTimers();
    await uploadApplicationFile({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/auth-required-route.mjs',
      fileBuffer: Buffer.from(ROUTE_BUILT_HANDLER_CODE),
      filename: 'auth-required-route.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });
    jest.useFakeTimers();

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { logicFunctions: [authRequiredRouteManifest] },
      }),
      expectToFail: false,
    });

    const { data } = await findManyApplications({ expectToFail: false });
    const application = data.findManyApplications.find(
      ({ universalIdentifier }) =>
        universalIdentifier === APP_UNIVERSAL_IDENTIFIER,
    );

    expect(application).toBeDefined();

    const tokenPair = await generateAppleAdminApplicationTokenPair({
      applicationId: application!.id,
    });

    applicationAccessToken = tokenPair.applicationAccessToken.token;

    jest.useRealTimers();
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('serves an auth-required route when the token is valid', async () => {
    const response = await request(baseUrl)
      .get('/s/auth-required-route')
      .set('Host', workspaceHost)
      .set('Authorization', `Bearer ${applicationAccessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ executed: true });
  }, 60000);

  it('rejects an auth-required route with 401 when no credentials are sent', async () => {
    const response = await request(baseUrl)
      .get('/s/auth-required-route')
      .set('Host', workspaceHost);

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHENTICATED');
  }, 60000);

  it('rejects an auth-required route with 401 when the token is invalid', async () => {
    const response = await request(baseUrl)
      .get('/s/auth-required-route')
      .set('Host', workspaceHost)
      .set('Authorization', 'Bearer not-a-jwt');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('UNAUTHENTICATED');
  }, 60000);
});
