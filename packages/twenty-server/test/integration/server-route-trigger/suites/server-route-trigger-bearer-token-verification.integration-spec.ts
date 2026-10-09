import { generateKeyPairSync } from 'crypto';

import { sign } from 'jsonwebtoken';
import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import {
  type LogicFunctionManifest,
  type ServerRouteBearerTokenVerification,
} from 'twenty-shared/application';
import { LOGIC_FUNCTION_HTTP_RESPONSE_MARKER } from 'twenty-shared/types';

const APP_UNIVERSAL_IDENTIFIER = '7a7f983f-5c1a-4c60-a3c8-7d0e2a4a77a7';
const ROLE_UNIVERSAL_IDENTIFIER = '8b8f983f-5c1a-4c60-a3c8-7d0e2a4a88b8';
const VERIFIED_RESOLVER_UNIVERSAL_IDENTIFIER =
  '9c9f983f-5c1a-4c60-a3c8-7d0e2a4a99c9';
const UNCONFIGURED_RESOLVER_UNIVERSAL_IDENTIFIER =
  'adaf983f-5c1a-4c60-a3c8-7d0e2a4aadad';

const JWKS_URL = 'https://login.bearer-token-test.example.com/keys';
const ISSUER = 'https://api.bearer-token-test.example.com';
const AUDIENCE = 'bearer-token-test-bot-app-id';
const AUDIENCE_SERVER_VARIABLE = 'BOT_APP_ID';
const KEY_ID = 'bearer-token-test-key';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const PUBLISHED_KEYS = {
  keys: [
    {
      ...publicKey.export({ format: 'jwk' }),
      kid: KEY_ID,
      use: 'sig',
      endorsements: ['msteams'],
    },
  ],
};

const signToken = ({ audience = AUDIENCE }: { audience?: string } = {}) =>
  sign({ serviceurl: 'https://smba.trafficmanager.net/emea/' }, privateKey, {
    algorithm: 'RS256',
    issuer: ISSUER,
    audience,
    keyid: KEY_ID,
    expiresIn: '5m',
  });

const ECHO_RESOLVER_BUILT_HANDLER_CODE = `export const main = async (event) => ({
  ${LOGIC_FUNCTION_HTTP_RESPONSE_MARKER}: true,
  status: 200,
  body: {
    headers: event.headers,
    verifiedBearerTokenClaims: event.verifiedBearerTokenClaims ?? null,
  },
});
`;

const buildResolverManifest = ({
  universalIdentifier,
  name,
  bearerTokenVerification,
}: {
  universalIdentifier: string;
  name: string;
  bearerTokenVerification: ServerRouteBearerTokenVerification;
}): LogicFunctionManifest => ({
  universalIdentifier,
  name,
  handlerName: 'main',
  sourceHandlerPath: `src/${name}.ts`,
  builtHandlerPath: 'dist/echo-resolver.mjs',
  builtHandlerChecksum: 'checksum-echo-resolver',
  serverRouteTriggerSettings: {
    forwardedRequestHeaders: ['x-request-id'],
    bearerTokenVerification,
  },
});

const findApplicationRegistrationId = async (): Promise<string> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT id FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
    [APP_UNIVERSAL_IDENTIFIER],
  );

  return row.id;
};

describe('ServerRouteTrigger bearer token verification (integration)', () => {
  setupHttpMock(http.get(JWKS_URL, () => HttpResponse.json(PUBLISHED_KEYS)));

  const baseUrl = `http://localhost:${APP_PORT}`;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Server Route Bearer Token Test App',
      description: 'App for testing server route bearer token verification',
      sourcePath: 'server-route-bearer-token-test-app',
    });

    jest.useRealTimers();
    await uploadApplicationFile({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/echo-resolver.mjs',
      fileBuffer: Buffer.from(ECHO_RESOLVER_BUILT_HANDLER_CODE),
      filename: 'echo-resolver.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });
    jest.useFakeTimers();

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: {
          logicFunctions: [
            buildResolverManifest({
              universalIdentifier: VERIFIED_RESOLVER_UNIVERSAL_IDENTIFIER,
              name: 'verified-resolver',
              bearerTokenVerification: {
                jwksUrl: JWKS_URL,
                issuer: ISSUER,
                audienceServerVariable: AUDIENCE_SERVER_VARIABLE,
                requiredKeyEndorsement: 'msteams',
              },
            }),
            buildResolverManifest({
              universalIdentifier: UNCONFIGURED_RESOLVER_UNIVERSAL_IDENTIFIER,
              name: 'unconfigured-resolver',
              bearerTokenVerification: {
                jwksUrl: JWKS_URL,
                issuer: ISSUER,
                audienceServerVariable: 'UNSET_BOT_APP_ID',
              },
            }),
          ],
        },
      }),
      expectToFail: false,
    });

    await insertApplicationRegistrationVariable({
      applicationRegistrationId: await findApplicationRegistrationId(),
      key: AUDIENCE_SERVER_VARIABLE,
      value: AUDIENCE,
    });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('hands the verified claims to the resolver and never the token', async () => {
    const token = signToken();

    const response = await request(baseUrl)
      .post(`/webhooks/server/${VERIFIED_RESOLVER_UNIVERSAL_IDENTIFIER}`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Request-Id', 'request-1')
      .send({ type: 'message' });

    expect(response.status).toBe(200);
    expect(response.body.headers).toEqual({ 'x-request-id': 'request-1' });
    expect(JSON.stringify(response.body)).not.toContain(token);
    expect(response.body.verifiedBearerTokenClaims).toMatchObject({
      iss: ISSUER,
      aud: AUDIENCE,
      serviceurl: 'https://smba.trafficmanager.net/emea/',
    });
  }, 60000);

  it('rejects a request without a bearer token before running the resolver', async () => {
    const response = await request(baseUrl)
      .post(`/webhooks/server/${VERIFIED_RESOLVER_UNIVERSAL_IDENTIFIER}`)
      .send({ type: 'message' });

    expect(response.status).toBe(401);
    expectOneNotInternalServerErrorHttpResponseSnapshot({
      status: response.status,
      body: response.body,
    });
  });

  it('rejects a token addressed to another audience without naming the expected one', async () => {
    const response = await request(baseUrl)
      .post(`/webhooks/server/${VERIFIED_RESOLVER_UNIVERSAL_IDENTIFIER}`)
      .set('Authorization', `Bearer ${signToken({ audience: 'other-bot' })}`)
      .send({ type: 'message' });

    expect(response.status).toBe(401);
    expect(JSON.stringify(response.body)).not.toContain(AUDIENCE);
  });

  it('answers 503 when the audience server variable is not set', async () => {
    const response = await request(baseUrl)
      .post(`/webhooks/server/${UNCONFIGURED_RESOLVER_UNIVERSAL_IDENTIFIER}`)
      .set('Authorization', `Bearer ${signToken()}`)
      .send({ type: 'message' });

    expect(response.status).toBe(503);
    expectOneNotInternalServerErrorHttpResponseSnapshot({
      status: response.status,
      body: response.body,
    });
  });
});
