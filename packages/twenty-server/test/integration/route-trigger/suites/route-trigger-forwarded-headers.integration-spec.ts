import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APP_UNIVERSAL_IDENTIFIER = '2a6d62ef-1192-49a7-a256-f1c2368fed90';
const ROLE_UNIVERSAL_IDENTIFIER = '31f59169-74ca-493f-b25f-0b6285fb4f07';
const ROUTE_FUNCTION_UNIVERSAL_IDENTIFIER =
  'd898f20d-c214-4b30-aed0-f09ebc8d34d7';

const APPLICATION_PUBLIC_DOMAIN = 'forwarded-headers-app.example.com';

const CUSTOM_HEADER_NAME = 'x-custom-header';
const CUSTOM_HEADER_VALUE = 'custom-value';
const SESSION_COOKIE = 'twenty_session=raw-session-token';

const ECHO_HEADERS_BUILT_HANDLER_CODE = `export const main = async (event) => event.headers;
`;

const echoHeadersRouteTriggerSettings = {
  path: '/echo-headers-route',
  httpMethod: 'GET' as const,
  isAuthRequired: true,
  forwardedRequestHeaders: [CUSTOM_HEADER_NAME],
};

const echoHeadersRouteFunctionManifest: LogicFunctionManifest = {
  universalIdentifier: ROUTE_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'echo-headers-route',
  handlerName: 'main',
  sourceHandlerPath: 'src/echo-headers-route.ts',
  builtHandlerPath: 'dist/echo-headers-route.mjs',
  builtHandlerChecksum: 'checksum-echo-headers-route',
  httpRouteTriggerSettings: echoHeadersRouteTriggerSettings,
};

describe('RouteTrigger forwarded request headers (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const bareHost = `localhost:${APP_PORT}`;
  const applicationPublicDomainHost = `${APPLICATION_PUBLIC_DOMAIN}:${APP_PORT}`;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Route Trigger Forwarded Headers Test App',
      description: 'App for testing which request headers reach app code',
      sourcePath: 'route-trigger-forwarded-headers-test-app',
    });

    jest.useRealTimers();
    await uploadApplicationFile({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/echo-headers-route.mjs',
      fileBuffer: Buffer.from(ECHO_HEADERS_BUILT_HANDLER_CODE),
      filename: 'echo-headers-route.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });
    jest.useFakeTimers();

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { logicFunctions: [echoHeadersRouteFunctionManifest] },
      }),
      expectToFail: false,
    });

    // Sync now rejects credential headers, so this stands in for a route
    // stored before that validation existed.
    await globalThis.testDataSource.query(
      `UPDATE core."logicFunction" SET "httpRouteTriggerSettings" = $1
       WHERE "universalIdentifier" = $2 AND "workspaceId" = $3`,
      [
        JSON.stringify({
          ...echoHeadersRouteTriggerSettings,
          forwardedRequestHeaders: [
            'authorization',
            'cookie',
            CUSTOM_HEADER_NAME,
          ],
        }),
        ROUTE_FUNCTION_UNIVERSAL_IDENTIFIER,
        SEED_APPLE_WORKSPACE_ID,
      ],
    );

    const [{ id: applicationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."application"
       WHERE "universalIdentifier" = $1 AND "workspaceId" = $2`,
      [APP_UNIVERSAL_IDENTIFIER, SEED_APPLE_WORKSPACE_ID],
    );

    await globalThis.testDataSource.query(
      `INSERT INTO core."publicDomain"
         (domain, "isValidated", "applicationId", "workspaceId")
       VALUES ($1, true, $2, $3)`,
      [APPLICATION_PUBLIC_DOMAIN, applicationId, SEED_APPLE_WORKSPACE_ID],
    );

    jest.useRealTimers();
  }, 60000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."publicDomain" WHERE domain = $1`,
      [APPLICATION_PUBLIC_DOMAIN],
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('does not deliver the caller credentials to app code when the manifest forwards them', async () => {
    const response = await request(baseUrl)
      .get('/s/echo-headers-route')
      .set('Host', bareHost)
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .set('Cookie', SESSION_COOKIE)
      .set(CUSTOM_HEADER_NAME, CUSTOM_HEADER_VALUE);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      [CUSTOM_HEADER_NAME]: CUSTOM_HEADER_VALUE,
    });
  }, 60000);

  it('does not deliver the caller credentials to app code on the application public domain', async () => {
    const response = await request(baseUrl)
      .get('/s/echo-headers-route')
      .set('Host', applicationPublicDomainHost)
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .set('Cookie', SESSION_COOKIE)
      .set(CUSTOM_HEADER_NAME, CUSTOM_HEADER_VALUE);

    expect(response.status).toBe(200);
    expect(response.body).not.toHaveProperty('authorization');
    expect(response.body).not.toHaveProperty('cookie');
    expect(response.body).toHaveProperty(
      CUSTOM_HEADER_NAME,
      CUSTOM_HEADER_VALUE,
    );
  }, 60000);
});
