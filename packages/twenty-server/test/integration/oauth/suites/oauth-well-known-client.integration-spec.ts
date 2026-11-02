import crypto from 'crypto';

import gql from 'graphql-tag';
import IORedis from 'ioredis';
import request from 'supertest';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { base64UrlEncode } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { type ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-fetch-rate-limit.constant';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CODE_VERIFIER = 'integration-verifier';
const CHATGPT_CONNECTION_CALLBACK =
  'https://chatgpt.com/connector/oauth/integration-test';
const CHATGPT_PLATFORM_CALLBACK =
  'https://chatgpt.com/connector_platform_oauth_redirect';
const CHATGPT_DOCUMENT = {
  clientId: 'https://chatgpt.com/oauth/integration-test-client.json',
  clientName: 'ChatGPT',
  logoUri: null,
  redirectUris: [CHATGPT_PLATFORM_CALLBACK],
};

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

const findApplicationRegistrationByClientIdQuery = gql`
  query FindApplicationRegistrationByClientId($clientId: String!) {
    findApplicationRegistrationByClientId(clientId: $clientId) {
      name
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

  const refresh = ({
    clientId,
    refreshToken,
  }: {
    clientId: string;
    refreshToken: string;
  }) =>
    request(baseUrl).post('/oauth/token').send({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
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
      [
        [
          CLAUDE_CALLBACK,
          CHATGPT_CONNECTION_CALLBACK,
          CHATGPT_PLATFORM_CALLBACK,
        ],
      ],
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

    it('should show the registration logo on its install, which has no bundle of its own', async () => {
      const [{ logo: previousLogo }] = await ds.query(
        `SELECT logo FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
        [WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE],
      );
      const logoUrl = 'https://claude.ai/logo.png';

      await ds.query(
        `UPDATE core."applicationRegistration" SET logo = $1 WHERE "universalIdentifier" = $2`,
        [logoUrl, WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE],
      );

      try {
        const response = await makeMetadataApiRequest(
          {
            query: gql`
              query FindManyApplications {
                findManyApplications {
                  universalIdentifier
                  logoUrl
                }
              }
            `,
          },
          APPLE_JANE_ADMIN_ACCESS_TOKEN,
        );

        const claudeApplication = response.body.data.findManyApplications.find(
          ({ universalIdentifier }: { universalIdentifier: string }) =>
            universalIdentifier ===
            WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
        );

        expect(claudeApplication.logoUrl).toBe(logoUrl);
      } finally {
        await ds.query(
          `UPDATE core."applicationRegistration" SET logo = $1 WHERE "universalIdentifier" = $2`,
          [previousLogo, WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE],
        );
      }
    });
  });

  describe('Client ID metadata document of a well-known client', () => {
    let findDocumentSpy: jest.SpyInstance;
    let isFetchDueSpy: jest.SpyInstance;

    beforeEach(() => {
      const clientIdMetadataDocumentService =
        getAppProviderByClassName<ClientIdMetadataDocumentService>(
          'ClientIdMetadataDocumentService',
        );

      findDocumentSpy = jest
        .spyOn(clientIdMetadataDocumentService, 'findDocument')
        .mockResolvedValue(CHATGPT_DOCUMENT);
      isFetchDueSpy = jest
        .spyOn(clientIdMetadataDocumentService, 'isFetchDue')
        .mockResolvedValue(false);
    });

    afterEach(() => {
      findDocumentSpy.mockRestore();
      isFetchDueSpy.mockRestore();
    });

    it('should exchange and refresh with the document URL it authorized with', async () => {
      const code = await authorizeAsMember({
        clientId: CHATGPT_DOCUMENT.clientId,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        redirectUrl: CHATGPT_PLATFORM_CALLBACK,
      });

      const exchangeResponse = await exchangeCode({
        clientId: CHATGPT_DOCUMENT.clientId,
        code,
        redirectUri: CHATGPT_PLATFORM_CALLBACK,
      });

      expect(exchangeResponse.status).toBe(200);

      const refreshResponse = await refresh({
        clientId: CHATGPT_DOCUMENT.clientId,
        refreshToken: exchangeResponse.body.refresh_token,
      });

      expect(refreshResponse.status).toBe(200);
    });

    it('should reject a vendor callback that the document does not list', async () => {
      const response = await requestAuthorization({
        clientId: CHATGPT_DOCUMENT.clientId,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        redirectUrl: CHATGPT_CONNECTION_CALLBACK,
      });

      expect(response.body.errors?.[0]?.message).toContain(
        'redirectUrl mismatch',
      );
    });
  });

  describe('Client ID metadata document lookups', () => {
    const clearFetchRateLimit = () =>
      clearTokenBuckets('oauth-client-metadata-document-fetch:*');

    const buildUnreachableDocumentUrl = () =>
      `https://10.255.255.1/${crypto.randomUUID()}`;

    const lookUp = (clientId: string) =>
      makeMetadataApiRequest(
        {
          query: findApplicationRegistrationByClientIdQuery,
          variables: { clientId },
        },
        null,
      );

    const exhaustFetchRateLimitWithLookups = async (): Promise<string> => {
      const cachedDocumentUrl = buildUnreachableDocumentUrl();

      for (
        let lookup = 0;
        lookup < CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX;
        lookup++
      ) {
        const response = await lookUp(
          lookup === 0 ? cachedDocumentUrl : buildUnreachableDocumentUrl(),
        );

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.findApplicationRegistrationByClientId,
        ).toBeNull();
      }

      return cachedDocumentUrl;
    };

    beforeEach(clearFetchRateLimit);
    afterAll(clearFetchRateLimit);

    it('should rate limit the lookups that fetch a document, not the cached or registered ones', async () => {
      const cachedDocumentUrl = await exhaustFetchRateLimitWithLookups();

      const throttledResponse = await lookUp(buildUnreachableDocumentUrl());

      expect(throttledResponse.body.errors?.[0]?.extensions?.subCode).toBe(
        'LIMIT_REACHED',
      );

      const cachedResponse = await lookUp(cachedDocumentUrl);

      expect(cachedResponse.body.errors).toBeUndefined();

      const registeredClientResponse = await lookUp(claudeClientId);

      expect(registeredClientResponse.body.errors).toBeUndefined();
      expect(
        registeredClientResponse.body.data
          .findApplicationRegistrationByClientId,
      ).toEqual({ name: 'Claude' });
    });

    it('should spend the same fetch allowance on the token, revoke and introspect endpoints', async () => {
      const cachedDocumentUrl = await exhaustFetchRateLimitWithLookups();

      const throttledResponses = await Promise.all([
        request(baseUrl).post('/oauth/token').send({
          grant_type: 'refresh_token',
          refresh_token: 'not-a-refresh-token',
          client_id: buildUnreachableDocumentUrl(),
        }),
        request(baseUrl).post('/oauth/revoke').send({
          token: 'not-a-token',
          client_id: buildUnreachableDocumentUrl(),
        }),
        request(baseUrl).post('/oauth/introspect').send({
          token: 'not-a-token',
          client_id: buildUnreachableDocumentUrl(),
        }),
      ]);

      for (const throttledResponse of throttledResponses) {
        expect(throttledResponse.status).toBe(429);
        expect(throttledResponse.body.error).toBe('rate_limit_exceeded');
      }

      const cachedDocumentResponse = await refresh({
        clientId: cachedDocumentUrl,
        refreshToken: 'not-a-refresh-token',
      });

      expect(cachedDocumentResponse.status).toBe(401);
      expect(cachedDocumentResponse.body.error).toBe('invalid_client');

      const registeredClientResponse = await exchangeCode({
        clientId: claudeClientId,
        code: await authorizeAsMember({
          clientId: claudeClientId,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        }),
      });

      expect(registeredClientResponse.status).toBe(200);
    });
  });
});
