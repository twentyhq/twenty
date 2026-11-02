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
import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
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

const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CODE_VERIFIER = 'integration-verifier';
const CHATGPT_CONNECTION_CALLBACK =
  'https://chatgpt.com/connector/oauth/integration-test';
const CHATGPT_PLATFORM_CALLBACK =
  'https://chatgpt.com/connector_platform_oauth_redirect';
const DOCUMENT_CLIENT_CALLBACK =
  'https://example.com/oauth/integration-test-callback';
const DOCUMENT_CLIENT_DOCUMENT = {
  clientId: 'https://example.com/oauth/integration-test-client.json',
  clientName: 'Document Client',
  logoUri: 'https://example.com/logo.png',
  redirectUris: [DOCUMENT_CLIENT_CALLBACK],
};
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
      logoUrl
    }
  }
`;

describe('OAuth well-known clients (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let dataSource: DataSource;
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
    dataSource = global.testDataSource;

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
    await getAppProviderByClassName<CoreEntityCacheService>(
      'CoreEntityCacheService',
    ).invalidate('marketplaceCatalog', MARKETPLACE_CATALOG_CACHE_ENTITY_ID);

    if (createdRegistrationClientIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."application" application
         USING core."applicationRegistration" registration
         WHERE registration.id = application."applicationRegistrationId"
           AND registration."oAuthClientId" = ANY($1)`,
        [createdRegistrationClientIds],
      );
      await dataSource.query(
        `DELETE FROM core."applicationRegistration" WHERE "oAuthClientId" = ANY($1)`,
        [createdRegistrationClientIds],
      );
    }

    await dataSource.query(
      `DELETE FROM core."application" application
       USING core."applicationRegistration" registration
       WHERE registration.id = application."applicationRegistrationId"
         AND registration."universalIdentifier" = ANY($1)`,
      [Object.values(WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS)],
    );

    await dataSource.query(
      `DELETE FROM core."appToken" WHERE context->>'redirectUri' = ANY($1)`,
      [
        [
          CLAUDE_CALLBACK,
          CHATGPT_CONNECTION_CALLBACK,
          CHATGPT_PLATFORM_CALLBACK,
          DOCUMENT_CLIENT_CALLBACK,
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

      const [seededRegistration] = await dataSource.query(
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

  describe('Marketplace', () => {
    it('should list ChatGPT and Claude as soon as their registrations exist', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          query FindManyMarketplaceApps {
            findManyMarketplaceApps {
              id
              name
              isListed
            }
          }
        `,
      });

      expect(response.body.data.findManyMarketplaceApps).toEqual(
        expect.arrayContaining([
          {
            id: WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CHATGPT,
            name: 'ChatGPT',
            isListed: true,
          },
          {
            id: WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
            name: 'Claude',
            isListed: true,
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
              wellKnownOAuthClient
            }
          }
        `,
        variables: {
          universalIdentifier:
            WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
        },
      });

      expect(response.body.data.findMarketplaceAppDetail).toEqual({
        name: 'Claude',
        sourceType: 'OAUTH_ONLY',
        wellKnownOAuthClient: 'CLAUDE',
      });
    });

    it('should keep ChatGPT and Claude out of the public marketplace that the authenticated catalog lists them in', async () => {
      const wellKnownOAuthClientUniversalIdentifiers = [
        WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CHATGPT,
        WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
      ];

      const authenticatedResponse = await makeMetadataApiRequest({
        query: gql`
          query FindManyMarketplaceApps {
            findManyMarketplaceApps {
              id
            }
          }
        `,
      });
      const publicResponse = await makeMetadataApiRequest(
        {
          query: gql`
            query PublicMarketplaceApps {
              publicMarketplaceApps {
                id
              }
            }
          `,
        },
        null,
      );

      const authenticatedAppIds =
        authenticatedResponse.body.data.findManyMarketplaceApps.map(
          (app: { id: string }) => app.id,
        );
      const publicAppIds = publicResponse.body.data.publicMarketplaceApps.map(
        (app: { id: string }) => app.id,
      );

      expect(authenticatedAppIds).toEqual(
        expect.arrayContaining(wellKnownOAuthClientUniversalIdentifiers),
      );
      for (const universalIdentifier of wellKnownOAuthClientUniversalIdentifiers) {
        expect(publicAppIds).not.toContain(universalIdentifier);
      }
    });

    it('should not show Claude on the public marketplace detail page', async () => {
      const response = await makeMetadataApiRequest(
        {
          query: gql`
            query PublicMarketplaceAppDetail($universalIdentifier: String!) {
              publicMarketplaceAppDetail(
                universalIdentifier: $universalIdentifier
              ) {
                name
              }
            }
          `,
          variables: {
            universalIdentifier:
              WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
          },
        },
        null,
      );

      expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
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

      const claudeApplications = await dataSource.query(
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
      const [{ logo: previousLogo }] = await dataSource.query(
        `SELECT logo FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
        [WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE],
      );
      const logoUrl = 'https://claude.ai/logo.png';

      await dataSource.query(
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
        await dataSource.query(
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
      ).toMatchObject({ name: 'Claude' });
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

    it('should spend the same fetch allowance when a signed-in user authorizes', async () => {
      await exhaustFetchRateLimitWithLookups();

      const throttledResponse = await requestAuthorization({
        clientId: buildUnreachableDocumentUrl(),
        token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      });

      expect(throttledResponse.body.errors?.[0]?.extensions?.subCode).toBe(
        'LIMIT_REACHED',
      );
    });

    describe('of a registered document client', () => {
      let findDocumentSpy: jest.SpyInstance;
      let isFetchDueSpy: jest.SpyInstance;

      beforeEach(() => {
        const clientIdMetadataDocumentService =
          getAppProviderByClassName<ClientIdMetadataDocumentService>(
            'ClientIdMetadataDocumentService',
          );

        findDocumentSpy = jest
          .spyOn(clientIdMetadataDocumentService, 'findDocument')
          .mockResolvedValue(DOCUMENT_CLIENT_DOCUMENT);
        isFetchDueSpy = jest
          .spyOn(clientIdMetadataDocumentService, 'isFetchDue')
          .mockResolvedValue(false);
      });

      afterEach(() => {
        findDocumentSpy.mockRestore();
        isFetchDueSpy.mockRestore();
      });

      it('should show the name and logo of the latest document before the user authorizes again', async () => {
        createdRegistrationClientIds.push(DOCUMENT_CLIENT_DOCUMENT.clientId);

        const code = await authorizeAsMember({
          clientId: DOCUMENT_CLIENT_DOCUMENT.clientId,
          token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
          redirectUrl: DOCUMENT_CLIENT_CALLBACK,
        });

        expect(code).toBeTruthy();

        findDocumentSpy.mockResolvedValue({
          ...DOCUMENT_CLIENT_DOCUMENT,
          clientName: 'Document Client (renamed)',
          logoUri: 'https://example.com/new-logo.png',
        });

        const response = await lookUp(DOCUMENT_CLIENT_DOCUMENT.clientId);

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.findApplicationRegistrationByClientId,
        ).toEqual({
          name: 'Document Client (renamed)',
          logoUrl: 'https://example.com/new-logo.png',
        });

        const [storedRegistration] = await dataSource.query(
          `SELECT name, logo FROM core."applicationRegistration" WHERE "oAuthClientId" = $1 AND "deletedAt" IS NULL`,
          [DOCUMENT_CLIENT_DOCUMENT.clientId],
        );

        expect(storedRegistration).toEqual({
          name: 'Document Client',
          logo: 'https://example.com/logo.png',
        });
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

      await dataSource.query(
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
      dataSource.query(
        `SELECT application.id, application."universalIdentifier" FROM core."application" application
         JOIN core."applicationRegistration" registration ON registration.id = application."applicationRegistrationId"
         WHERE registration."oAuthClientId" = $1 AND application."workspaceId" = $2 AND application."deletedAt" IS NULL`,
        [clientId, SEED_APPLE_WORKSPACE_ID],
      );

    const isInstalled = async (clientId: string): Promise<boolean> =>
      (await findInstalls(clientId)).length > 0;

    const revokeMemberAccess = (variables: {
      applicationId: string;
      userId: string;
    }) =>
      makeMetadataApiRequest({
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
        variables,
      });

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
              wellKnownOAuthClient
            }
          }
        `,
        variables: { applicationId: sharedInstall.id },
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.workspaceApplicationAuthorizations).toEqual(
        expect.arrayContaining([
          { applicationId: legacyInstall.id, wellKnownOAuthClient: 'CLAUDE' },
          { applicationId: sharedInstall.id, wellKnownOAuthClient: 'CLAUDE' },
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

      const response = await revokeMemberAccess({
        applicationId: sharedInstall.id,
        userId: USER_DATA_SEED_IDS.JONY,
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

    // Deleting the row leaves a live refresh token with no authorization row behind it
    it('should revoke a member refresh token that predates the authorization record', async () => {
      const refreshToken = await connect({
        clientId: claudeClientId,
        token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      });
      const [sharedInstall] = await findInstalls(claudeClientId);

      await dataSource.query(
        `DELETE FROM core."applicationAuthorization" WHERE "userId" = $1 AND "applicationId" = $2`,
        [USER_DATA_SEED_IDS.JONY, sharedInstall.id],
      );

      const response = await revokeMemberAccess({
        applicationId: sharedInstall.id,
        userId: USER_DATA_SEED_IDS.JONY,
      });

      expect(response.body.errors).toBeUndefined();

      const refreshResponse = await refresh({
        clientId: claudeClientId,
        refreshToken,
      }).expect(400);

      expect(refreshResponse.body.error).toBe('invalid_grant');

      const [authorization] = await dataSource.query(
        `SELECT "revokedAt" FROM core."applicationAuthorization" WHERE "userId" = $1 AND "applicationId" = $2`,
        [USER_DATA_SEED_IDS.JONY, sharedInstall.id],
      );

      expect(authorization.revokedAt).not.toBeNull();
    });

    it('should revoke a member refresh token on an older Claude install that has no authorization record', async () => {
      const { legacyClaudeClientId, legacyRefreshToken } =
        await connectLegacyAndSharedClaudeMembers();
      const [legacyInstall] = await findInstalls(legacyClaudeClientId);
      const [sharedInstall] = await findInstalls(claudeClientId);

      await dataSource.query(
        `DELETE FROM core."applicationAuthorization" WHERE "userId" = $1 AND "applicationId" = $2`,
        [USER_DATA_SEED_IDS.JONY, legacyInstall.id],
      );

      const response = await revokeMemberAccess({
        applicationId: sharedInstall.id,
        userId: USER_DATA_SEED_IDS.JONY,
      });

      expect(response.body.errors).toBeUndefined();

      const refreshResponse = await refresh({
        clientId: legacyClaudeClientId,
        refreshToken: legacyRefreshToken,
      }).expect(400);

      expect(refreshResponse.body.error).toBe('invalid_grant');

      const [authorization] = await dataSource.query(
        `SELECT "revokedAt" FROM core."applicationAuthorization" WHERE "userId" = $1 AND "applicationId" = $2`,
        [USER_DATA_SEED_IDS.JONY, legacyInstall.id],
      );

      expect(authorization.revokedAt).not.toBeNull();
    });

    it('should disconnect the members of older per-connection Claude installs too', async () => {
      const connections = await connectLegacyAndSharedClaudeMembers();

      const { errors } = await uninstallApplication({
        universalIdentifier:
          WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
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
                WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
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
            WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
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
