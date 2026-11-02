import crypto from 'crypto';

import { Queue } from 'bullmq';
import gql from 'graphql-tag';
import IORedis from 'ioredis';
import request from 'supertest';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { triggerUninstallApplication } from 'test/integration/metadata/suites/application/utils/trigger-uninstall-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { base64UrlEncode } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-fetch-rate-limit.constant';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/twenty-public-app-universal-identifiers.constant';
import { APPLICATION_OAUTH_IDENTITIES_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-oauth-identity/constants/application-oauth-identities-cache-entity-id.constant';

const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CODE_VERIFIER = 'integration-verifier';
const CHATGPT_CONNECTION_CALLBACK =
  'https://chatgpt.com/connector/oauth/integration-test';
const CHATGPT_PLATFORM_CALLBACK =
  'https://chatgpt.com/connector_platform_oauth_redirect';
const CLAUDE_UNIVERSAL_IDENTIFIER = TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CLAUDE;
const CHATGPT_UNIVERSAL_IDENTIFIER =
  TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CHATGPT;
const OAUTH_IDENTITY_APP_UNIVERSAL_IDENTIFIERS = [
  CLAUDE_UNIVERSAL_IDENTIFIER,
  CHATGPT_UNIVERSAL_IDENTIFIER,
];
const OAUTH_IDENTITY_APPS = [
  {
    universalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER,
    name: 'Claude',
    sourcePackage: '@twentyhq/claude',
    oAuthIdentity: {
      redirectUris: [CLAUDE_CALLBACK],
      clientIdMetadataDocumentHostnames: ['claude.ai'],
      connectUrl:
        'https://claude.ai/customize/connectors?connectorUrl={mcpServerUrl}',
    },
  },
  {
    universalIdentifier: CHATGPT_UNIVERSAL_IDENTIFIER,
    name: 'ChatGPT',
    sourcePackage: '@twentyhq/chatgpt',
    oAuthIdentity: {
      redirectUris: [
        'https://chatgpt.com/connector_platform_oauth_redirect',
        'https://chatgpt.com/connector/oauth/*',
      ],
      clientIdMetadataDocumentHostnames: ['chatgpt.com'],
      connectUrl: 'https://chatgpt.com/apps/twenty',
    },
  },
];
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
      oAuthIdentityUniversalIdentifier
      claimsVerifiedClientName
    }
  }
`;

describe('OAuth identity apps (integration)', () => {
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

  const invalidateCatalogCaches = async () => {
    const coreEntityCacheService =
      getAppProviderByClassName<CoreEntityCacheService>(
        'CoreEntityCacheService',
      );

    await coreEntityCacheService.invalidate(
      'marketplaceCatalog',
      MARKETPLACE_CATALOG_CACHE_ENTITY_ID,
    );
    await coreEntityCacheService.invalidate(
      'applicationOAuthIdentities',
      APPLICATION_OAUTH_IDENTITIES_CACHE_ENTITY_ID,
    );
  };

  beforeAll(async () => {
    ds = global.testDataSource;

    for (const app of OAUTH_IDENTITY_APPS) {
      await ds.query(
        `INSERT INTO core."applicationRegistration"
          ("universalIdentifier", name, "oAuthClientId", "oAuthScopes", "sourceType", "sourcePackage", "latestAvailableVersion", "isListed", manifest)
         VALUES ($1, $2, $3, $4, 'npm', $5, '0.1.0', true, $6)`,
        [
          app.universalIdentifier,
          app.name,
          crypto.randomUUID(),
          [...ALL_OAUTH_SCOPES],
          app.sourcePackage,
          {
            application: {
              universalIdentifier: app.universalIdentifier,
              displayName: app.name,
              description: `Work with Twenty from ${app.name}`,
              oAuthIdentity: app.oAuthIdentity,
            },
          },
        ],
      );
    }

    await invalidateCatalogCaches();

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
      [OAUTH_IDENTITY_APP_UNIVERSAL_IDENTIFIERS],
    );
    await ds.query(
      `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = ANY($1)`,
      [OAUTH_IDENTITY_APP_UNIVERSAL_IDENTIFIERS],
    );
    await invalidateCatalogCaches();

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
    it("should hand every Claude connection the Claude app's client", async () => {
      const secondRegistration = await register({
        client_name: 'claudeai',
        redirect_uris: [CLAUDE_CALLBACK],
      }).expect(201);

      expect(secondRegistration.body.client_id).toBe(claudeClientId);
      expect(secondRegistration.body.client_name).toBe('Claude');

      const [claudeAppRegistration] = await ds.query(
        `SELECT "oAuthClientId", "sourceType" FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
        [CLAUDE_UNIVERSAL_IDENTIFIER],
      );

      expect(claudeAppRegistration.oAuthClientId).toBe(claudeClientId);
      expect(claudeAppRegistration.sourceType).toBe('npm');
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

    it("should accept a per-connection ChatGPT callback on the ChatGPT app's client", async () => {
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

    it("should reject a callback the app's OAuth identity does not allow", async () => {
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

  describe('Marketplace', () => {
    it('should list ChatGPT and Claude with where a member connects them', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          query FindManyMarketplaceApps {
            findManyMarketplaceApps {
              id
              name
              isListed
              connectUrl
            }
          }
        `,
      });

      expect(response.body.data.findManyMarketplaceApps).toEqual(
        expect.arrayContaining([
          {
            id: CHATGPT_UNIVERSAL_IDENTIFIER,
            name: 'ChatGPT',
            isListed: true,
            connectUrl: 'https://chatgpt.com/apps/twenty',
          },
          {
            id: CLAUDE_UNIVERSAL_IDENTIFIER,
            name: 'Claude',
            isListed: true,
            connectUrl:
              'https://claude.ai/customize/connectors?connectorUrl={mcpServerUrl}',
          },
        ]),
      );
    });

    it('should tell the marketplace page that Claude is connected, not installed', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          query FindMarketplaceAppDetail($universalIdentifier: String!) {
            findMarketplaceAppDetail(
              universalIdentifier: $universalIdentifier
            ) {
              name
              sourceType
              connectUrl
            }
          }
        `,
        variables: {
          universalIdentifier:
            CLAUDE_UNIVERSAL_IDENTIFIER,
        },
      });

      expect(response.body.data.findMarketplaceAppDetail).toEqual({
        name: 'Claude',
        sourceType: 'NPM',
        connectUrl:
          'https://claude.ai/customize/connectors?connectorUrl={mcpServerUrl}',
      });
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
        `SELECT application.id, application."sourceType" FROM core."application" application
         JOIN core."applicationRegistration" registration ON registration.id = application."applicationRegistrationId"
         WHERE registration."universalIdentifier" = $1 AND application."workspaceId" = $2 AND application."deletedAt" IS NULL`,
        [
          CLAUDE_UNIVERSAL_IDENTIFIER,
          SEED_APPLE_WORKSPACE_ID,
        ],
      );

      // An OAuth-only install acts with each member's permissions
      expect(claudeApplications).toEqual([
        { id: expect.any(String), sourceType: 'oauth-only' },
      ]);
    });

    it('should show the registration logo on its install, which has no bundle of its own', async () => {
      const [{ logo: previousLogo }] = await ds.query(
        `SELECT logo FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
        [CLAUDE_UNIVERSAL_IDENTIFIER],
      );
      const logoUrl = 'https://claude.ai/logo.png';

      await ds.query(
        `UPDATE core."applicationRegistration" SET logo = $1 WHERE "universalIdentifier" = $2`,
        [logoUrl, CLAUDE_UNIVERSAL_IDENTIFIER],
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
            CLAUDE_UNIVERSAL_IDENTIFIER,
        );

        expect(claudeApplication.logoUrl).toBe(logoUrl);
      } finally {
        await ds.query(
          `UPDATE core."applicationRegistration" SET logo = $1 WHERE "universalIdentifier" = $2`,
          [previousLogo, CLAUDE_UNIVERSAL_IDENTIFIER],
        );
      }
    });
  });

  describe("Client ID metadata document of an app's OAuth identity", () => {
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

  describe('Consent screen', () => {
    it('should identify the app by its OAuth identity, not by its name', async () => {
      const response = await makeMetadataApiRequest({
        query: findApplicationRegistrationByClientIdQuery,
        variables: { clientId: claudeClientId },
      });

      expect(response.body.data.findApplicationRegistrationByClientId).toEqual({
        name: 'Claude',
        oAuthIdentityUniversalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER,
        claimsVerifiedClientName: false,
      });
    });

    it('should flag a client that only borrows the name', async () => {
      const registration = await register({
        client_name: 'Claude',
        redirect_uris: ['https://example.com/claude-callback'],
      }).expect(201);

      createdRegistrationClientIds.push(registration.body.client_id);

      const response = await makeMetadataApiRequest({
        query: findApplicationRegistrationByClientIdQuery,
        variables: { clientId: registration.body.client_id },
      });

      expect(response.body.data.findApplicationRegistrationByClientId).toEqual({
        name: 'Claude',
        oAuthIdentityUniversalIdentifier: null,
        claimsVerifiedClientName: true,
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
        ).toEqual({
          name: 'Claude',
          oAuthIdentityUniversalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER,
          claimsVerifiedClientName: false,
        });
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

  describe('Uninstall', () => {
    let redisConnection: IORedis;
    let workspaceQueue: Queue;

    const setAppPreferencesEnabled = (value: boolean) =>
      updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
        value,
        expectToFail: false,
      });

    beforeAll(async () => {
      redisConnection = new IORedis(
        process.env.REDIS_QUEUE_URL ??
          process.env.REDIS_URL ??
          'redis://localhost:6379',
        { maxRetriesPerRequest: null },
      );
      workspaceQueue = new Queue(MessageQueue.workspaceQueue, {
        connection: redisConnection,
      });

      await setAppPreferencesEnabled(true);
    });

    afterAll(async () => {
      await setAppPreferencesEnabled(false);
      await workspaceQueue.close();
      await redisConnection.quit();
    });

    const registerLegacyClaudeClient = async (): Promise<string> => {
      const legacyClaudeClientId = crypto.randomUUID();

      await ds.query(
        `INSERT INTO core."applicationRegistration"
          ("universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris", "oAuthScopes", "sourceType")
         VALUES ($1, 'claudeai', $2, $3, $4, 'oauth-only')`,
        [
          crypto.randomUUID(),
          legacyClaudeClientId,
          [CLAUDE_CALLBACK],
          [...ALL_OAUTH_SCOPES],
        ],
      );
      createdRegistrationClientIds.push(legacyClaudeClientId);

      return legacyClaudeClientId;
    };

    const connect = async ({
      clientId,
      token,
    }: {
      clientId: string;
      token: string;
    }): Promise<string> => {
      const exchange = await exchangeCode({
        clientId,
        code: await authorizeAsMember({ clientId, token }),
      }).expect(200);

      const refreshed = await refresh({
        clientId,
        refreshToken: exchange.body.refresh_token,
      }).expect(200);

      return refreshed.body.refresh_token;
    };

    const connectLegacyAndSharedClaudeMembers = async () => {
      const legacyClaudeClientId = await registerLegacyClaudeClient();

      return {
        legacyClaudeClientId,
        legacyRefreshToken: await connect({
          clientId: legacyClaudeClientId,
          token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
        }),
        sharedRefreshToken: await connect({
          clientId: claudeClientId,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        }),
      };
    };

    const expectBothMembersDisconnected = async ({
      legacyClaudeClientId,
      legacyRefreshToken,
      sharedRefreshToken,
    }: {
      legacyClaudeClientId: string;
      legacyRefreshToken: string;
      sharedRefreshToken: string;
    }) => {
      const [legacyRefresh, sharedRefresh] = await Promise.all([
        refresh({
          clientId: legacyClaudeClientId,
          refreshToken: legacyRefreshToken,
        }),
        refresh({ clientId: claudeClientId, refreshToken: sharedRefreshToken }),
      ]);

      expect(legacyRefresh.body.error).toBe('invalid_grant');
      expect(sharedRefresh.body.error).toBe('invalid_grant');
    };

    const findInstalls = (
      clientId: string,
    ): Promise<{ id: string; universalIdentifier: string }[]> =>
      ds.query(
        `SELECT application.id, application."universalIdentifier" FROM core."application" application
         JOIN core."applicationRegistration" registration ON registration.id = application."applicationRegistrationId"
         WHERE registration."oAuthClientId" = $1 AND application."workspaceId" = $2 AND application."deletedAt" IS NULL`,
        [clientId, SEED_APPLE_WORKSPACE_ID],
      );

    const isInstalled = async (clientId: string): Promise<boolean> =>
      (await findInstalls(clientId)).length > 0;

    it('should list the members of older per-connection installs as members of the shared Claude install', async () => {
      const { legacyClaudeClientId } =
        await connectLegacyAndSharedClaudeMembers();
      const [legacyInstall] = await findInstalls(legacyClaudeClientId);
      const [sharedInstall] = await findInstalls(claudeClientId);

      const response = await makeMetadataApiRequest({
        query: gql`
          query WorkspaceApplicationAuthorizations($applicationId: UUID!) {
            workspaceApplicationAuthorizations(applicationId: $applicationId) {
              applicationId
              oAuthIdentityUniversalIdentifier
            }
          }
        `,
        variables: { applicationId: sharedInstall.id },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.workspaceApplicationAuthorizations).toEqual(
        expect.arrayContaining([
          { applicationId: legacyInstall.id, oAuthIdentityUniversalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER },
          { applicationId: sharedInstall.id, oAuthIdentityUniversalIdentifier: CLAUDE_UNIVERSAL_IDENTIFIER },
        ]),
      );
    });

    it('should revoke every grant of a member across the shared and older Claude installs', async () => {
      const legacyClaudeClientId = await registerLegacyClaudeClient();
      const legacyRefreshToken = await connect({
        clientId: legacyClaudeClientId,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const sharedRefreshToken = await connect({
        clientId: claudeClientId,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const [sharedInstall] = await findInstalls(claudeClientId);

      const response = await makeMetadataApiRequest({
        query: gql`
          mutation RevokeWorkspaceApplicationMemberAccess(
            $applicationId: UUID!
            $userId: UUID!
          ) {
            revokeWorkspaceApplicationMemberAccess(
              applicationId: $applicationId
              userId: $userId
            )
          }
        `,
        variables: {
          applicationId: sharedInstall.id,
          userId: USER_DATA_SEED_IDS.JONY,
        },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.revokeWorkspaceApplicationMemberAccess).toBe(
        true,
      );

      await expectBothMembersDisconnected({
        legacyClaudeClientId,
        legacyRefreshToken,
        sharedRefreshToken,
      });
    });

    it('should disconnect the members of older per-connection Claude installs too', async () => {
      const connections = await connectLegacyAndSharedClaudeMembers();

      const { errors } = await uninstallApplication({
        universalIdentifier:
          CLAUDE_UNIVERSAL_IDENTIFIER,
      });

      expect(errors).toBeUndefined();

      await expectBothMembersDisconnected(connections);
    });

    it('should disconnect them in the uninstall job, not in the requests that queue it', async () => {
      const connections = await connectLegacyAndSharedClaudeMembers();

      await workspaceQueue.pause();

      try {
        const triggerClaudeUninstall = () =>
          triggerUninstallApplication({
            input: {
              universalIdentifier:
                CLAUDE_UNIVERSAL_IDENTIFIER,
            },
          });

        const [firstTrigger, doubleSubmittedTrigger] = await Promise.all([
          triggerClaudeUninstall(),
          triggerClaudeUninstall(),
        ]);

        expect(firstTrigger.errors).toBeUndefined();
        expect(doubleSubmittedTrigger.errors).toBeUndefined();
        expect(
          doubleSubmittedTrigger.data.triggerUninstallApplication.jobId,
        ).toBe(firstTrigger.data.triggerUninstallApplication.jobId);
        expect(await isInstalled(connections.legacyClaudeClientId)).toBe(true);
      } finally {
        await workspaceQueue.resume();
      }

      await waitForAllJobsToFinish();

      expect(await isInstalled(connections.legacyClaudeClientId)).toBe(false);
      await expectBothMembersDisconnected(connections);
    });

    it('should only uninstall an older per-connection Claude install while the shared one exists', async () => {
      const { legacyClaudeClientId, legacyRefreshToken, sharedRefreshToken } =
        await connectLegacyAndSharedClaudeMembers();
      const otherLegacyClaudeClientId = await registerLegacyClaudeClient();
      const otherLegacyRefreshToken = await connect({
        clientId: otherLegacyClaudeClientId,
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });
      const [legacyInstall] = await findInstalls(legacyClaudeClientId);

      const { errors } = await uninstallApplication({
        universalIdentifier: legacyInstall.universalIdentifier,
      });

      expect(errors).toBeUndefined();
      expect(await isInstalled(legacyClaudeClientId)).toBe(false);
      expect(await isInstalled(otherLegacyClaudeClientId)).toBe(true);
      expect(await isInstalled(claudeClientId)).toBe(true);

      const [legacyRefresh, otherLegacyRefresh, sharedRefresh] =
        await Promise.all([
          refresh({
            clientId: legacyClaudeClientId,
            refreshToken: legacyRefreshToken,
          }),
          refresh({
            clientId: otherLegacyClaudeClientId,
            refreshToken: otherLegacyRefreshToken,
          }),
          refresh({
            clientId: claudeClientId,
            refreshToken: sharedRefreshToken,
          }),
        ]);

      expect(legacyRefresh.body.error).toBe('invalid_grant');
      expect(otherLegacyRefresh.status).toBe(200);
      expect(sharedRefresh.status).toBe(200);
    });

    it('should only uninstall the shared Claude install while app preferences are off', async () => {
      await setAppPreferencesEnabled(false);

      try {
        const { legacyClaudeClientId, legacyRefreshToken, sharedRefreshToken } =
          await connectLegacyAndSharedClaudeMembers();

        const { errors } = await uninstallApplication({
          universalIdentifier:
            CLAUDE_UNIVERSAL_IDENTIFIER,
        });

        expect(errors).toBeUndefined();
        expect(await isInstalled(legacyClaudeClientId)).toBe(true);

        const [legacyRefresh, sharedRefresh] = await Promise.all([
          refresh({
            clientId: legacyClaudeClientId,
            refreshToken: legacyRefreshToken,
          }),
          refresh({
            clientId: claudeClientId,
            refreshToken: sharedRefreshToken,
          }),
        ]);

        expect(legacyRefresh.status).toBe(200);
        expect(sharedRefresh.body.error).toBe('invalid_grant');
      } finally {
        await setAppPreferencesEnabled(true);
      }
    });
  });
});
