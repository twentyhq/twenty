import crypto from 'crypto';

import { Queue } from 'bullmq';
import gql from 'graphql-tag';
import IORedis from 'ioredis';
import request from 'supertest';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { triggerUninstallApplication } from 'test/integration/metadata/suites/application/utils/trigger-uninstall-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { base64UrlEncode } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { ALL_OAUTH_SCOPES } from 'src/engine/core-modules/application/application-oauth/constants/oauth-scopes';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';

const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CODE_VERIFIER = 'integration-verifier';
const CHATGPT_CONNECTION_CALLBACK =
  'https://chatgpt.com/connector/oauth/integration-test';

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
      wellKnownOAuthClient
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

  const authorizeAsMember = async ({
    clientId,
    token,
  }: {
    clientId: string;
    token: string;
  }) => {
    const response = await makeMetadataApiRequest(
      {
        query: authorizeAppMutation,
        variables: {
          clientId,
          redirectUrl: CLAUDE_CALLBACK,
          codeChallenge,
        },
      },
      token,
    );

    return new URL(
      response.body.data.authorizeApp.redirectUrl,
    ).searchParams.get('code');
  };

  const exchangeCode = ({
    clientId,
    code,
  }: {
    clientId: string;
    code: string | null;
  }) =>
    request(baseUrl).post('/oauth/token').send({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      code_verifier: CODE_VERIFIER,
      redirect_uri: CLAUDE_CALLBACK,
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

  afterAll(async () => {
    // Other suites insert catalog rows directly and expect the cached catalog to be rebuilt from them
    await getAppProviderByClassName<CoreEntityCacheService>(
      'CoreEntityCacheService',
    ).invalidate('marketplaceCatalog', MARKETPLACE_CATALOG_CACHE_ENTITY_ID);

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

  describe('Consent screen', () => {
    it('should identify the seeded client by the server, not by its name', async () => {
      const response = await makeMetadataApiRequest({
        query: findApplicationRegistrationByClientIdQuery,
        variables: { clientId: claudeClientId },
      });

      expect(response.body.data.findApplicationRegistrationByClientId).toEqual({
        name: 'Claude',
        wellKnownOAuthClient: 'CLAUDE',
      });
    });

    it('should not identify a client that only borrows the name', async () => {
      const registration = await register({
        client_name: 'Claude',
        redirect_uris: ['https://example.com/claude-callback'],
      }).expect(201);

      createdRegistrationClientIds.push(registration.body.client_id);

      const response = await makeMetadataApiRequest({
        query: findApplicationRegistrationByClientIdQuery,
        variables: { clientId: registration.body.client_id },
      });

      expect(
        response.body.data.findApplicationRegistrationByClientId
          .wellKnownOAuthClient,
      ).toBeNull();
    });
  });

  describe('Uninstall', () => {
    let redisConnection: IORedis;
    let workspaceQueue: Queue;

    beforeAll(() => {
      redisConnection = new IORedis(
        process.env.REDIS_QUEUE_URL ??
          process.env.REDIS_URL ??
          'redis://localhost:6379',
        { maxRetriesPerRequest: null },
      );
      workspaceQueue = new Queue(MessageQueue.workspaceQueue, {
        connection: redisConnection,
      });
    });

    afterAll(async () => {
      await workspaceQueue.close();
      await redisConnection.quit();
    });

    const registerLegacyClaudeClient = async (): Promise<string> => {
      const legacyClaudeClientId = crypto.randomUUID();

      // Each Claude connection registered its own client before the shared one existed
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

    const isInstalled = async (clientId: string): Promise<boolean> => {
      const installs = await ds.query(
        `SELECT application.id FROM core."application" application
         JOIN core."applicationRegistration" registration ON registration.id = application."applicationRegistrationId"
         WHERE registration."oAuthClientId" = $1 AND application."workspaceId" = $2 AND application."deletedAt" IS NULL`,
        [clientId, SEED_APPLE_WORKSPACE_ID],
      );

      return installs.length > 0;
    };

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
  });
});
