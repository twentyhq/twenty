import crypto from 'crypto';

import gql from 'graphql-tag';
import IORedis from 'ioredis';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { base64UrlEncode } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CODE_VERIFIER = 'integration-verifier';
const CHATGPT_CONNECTION_CALLBACK =
  'https://chatgpt.com/connector/oauth/integration-test';

const clearTokenBuckets = async (keyPattern: string) => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    const keys = await redis.keys(
      `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:${keyPattern}`,
    );

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } finally {
    redis.disconnect();
  }
};

const authorizeAppMutation = gql`
  mutation AuthorizeApp(
    $clientId: String!
    $redirectUrl: String!
    $codeChallenge: String
  ) {
    authorizeApp(
      clientId: $clientId
      redirectUrl: $redirectUrl
      codeChallenge: $codeChallenge
    ) {
      redirectUrl
    }
  }
`;

describe('OAuth well-known clients (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let ds: DataSource;
  let claudeClientId: string;
  let chatGptClientId: string;
  const createdRegistrationClientIds: string[] = [];
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update(CODE_VERIFIER).digest(),
  );

  const register = (body: Record<string, unknown>) =>
    request(baseUrl).post('/oauth/register').send(body);

  const requestAuthorization = ({
    clientId,
    token,
    redirectUrl = CLAUDE_CALLBACK,
  }: {
    clientId: string;
    token: string;
    redirectUrl?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: authorizeAppMutation,
        variables: { clientId, redirectUrl, codeChallenge },
      },
      token,
    );

  const authorizeAsMember = async (params: {
    clientId: string;
    token: string;
    redirectUrl?: string;
  }) => {
    const response = await requestAuthorization(params);

    return new URL(
      response.body.data.authorizeApp.redirectUrl,
    ).searchParams.get('code');
  };

  const exchangeCode = ({
    clientId,
    code,
    redirectUri = CLAUDE_CALLBACK,
  }: {
    clientId: string;
    code: string | null;
    redirectUri?: string;
  }) =>
    request(baseUrl).post('/oauth/token').send({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      code_verifier: CODE_VERIFIER,
      redirect_uri: redirectUri,
    });

  beforeAll(async () => {
    ds = global.testDataSource;

    const claudeRegistration = await register({
      client_name: 'Claude',
      redirect_uris: [CLAUDE_CALLBACK],
    }).expect(201);
    const chatGptRegistration = await register({
      client_name: 'ChatGPT',
      redirect_uris: [CHATGPT_CONNECTION_CALLBACK],
    }).expect(201);

    claudeClientId = claudeRegistration.body.client_id;
    chatGptClientId = chatGptRegistration.body.client_id;
  });

  beforeEach(() => clearTokenBuckets('oauth:*'));

  afterAll(async () => {
    if (createdRegistrationClientIds.length > 0) {
      await ds.query(
        `DELETE FROM core."application" application
         USING core."applicationRegistration" registration
         WHERE registration.id = application."applicationRegistrationId"
           AND registration."oAuthClientId" = ANY($1)`,
        [createdRegistrationClientIds],
      );
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE "oAuthClientId" = ANY($1)`,
        [createdRegistrationClientIds],
      );
    }

    await ds.query(
      `DELETE FROM core."application" application
       USING core."applicationRegistration" registration
       WHERE registration.id = application."applicationRegistrationId"
         AND registration."universalIdentifier" = ANY($1)`,
      [Object.values(WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS)],
    );

    await ds.query(
      `DELETE FROM core."appToken" WHERE context->>'redirectUri' = ANY($1)`,
      [[CLAUDE_CALLBACK, CHATGPT_CONNECTION_CALLBACK]],
    );
  });

  describe('Dynamic client registration', () => {
    it('should hand every Claude connection the seeded Claude client', async () => {
      const secondRegistration = await register({
        client_name: 'claudeai',
        redirect_uris: [CLAUDE_CALLBACK],
      }).expect(201);

      expect(secondRegistration.body.client_id).toBe(claudeClientId);
      expect(secondRegistration.body.client_name).toBe('Claude');

      const [seededRegistration] = await ds.query(
        `SELECT "oAuthClientId", "sourceType" FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
        [WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE],
      );

      expect(seededRegistration.oAuthClientId).toBe(claudeClientId);
      expect(seededRegistration.sourceType).toBe('oauth-only');
    });

    it('should keep registering a new client when one callback is foreign', async () => {
      const response = await register({
        client_name: 'Claude',
        redirect_uris: [CLAUDE_CALLBACK, 'https://example.com/callback'],
      }).expect(201);

      createdRegistrationClientIds.push(response.body.client_id);

      expect(response.body.client_id).not.toBe(claudeClientId);
      expect(response.body.client_name).toBe('Claude');
    });

    it('should accept a per-connection ChatGPT callback on the seeded ChatGPT client', async () => {
      const response = await makeMetadataApiRequest({
        query: authorizeAppMutation,
        variables: {
          clientId: chatGptClientId,
          redirectUrl: CHATGPT_CONNECTION_CALLBACK,
          codeChallenge,
        },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.authorizeApp.redirectUrl).toContain(
        `${CHATGPT_CONNECTION_CALLBACK}?`,
      );
    });

    it('should reject a callback the seeded client does not allow', async () => {
      const response = await makeMetadataApiRequest({
        query: authorizeAppMutation,
        variables: {
          clientId: claudeClientId,
          redirectUrl: 'https://example.com/callback',
          codeChallenge,
        },
      });

      expect(response.body.errors?.[0]?.message).toContain(
        'redirectUrl mismatch',
      );
    });
  });

  describe('Shared installation', () => {
    it('should give two members connecting at once one Claude application', async () => {
      const [janeCode, jonyCode] = await Promise.all([
        authorizeAsMember({
          clientId: claudeClientId,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        }),
        authorizeAsMember({
          clientId: claudeClientId,
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        }),
      ]);

      const [janeExchange, jonyExchange] = await Promise.all([
        exchangeCode({ clientId: claudeClientId, code: janeCode }),
        exchangeCode({ clientId: claudeClientId, code: jonyCode }),
      ]);

      expect(janeExchange.status).toBe(200);
      expect(jonyExchange.status).toBe(200);

      const claudeApplications = await ds.query(
        `SELECT application.id FROM core."application" application
         JOIN core."applicationRegistration" registration ON registration.id = application."applicationRegistrationId"
         WHERE registration."universalIdentifier" = $1 AND application."workspaceId" = $2 AND application."deletedAt" IS NULL`,
        [
          WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
          SEED_APPLE_WORKSPACE_ID,
        ],
      );

      expect(claudeApplications).toHaveLength(1);
    });
  });
});
