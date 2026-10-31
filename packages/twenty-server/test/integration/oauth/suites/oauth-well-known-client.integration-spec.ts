import crypto from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';
import { base64UrlEncode } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
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
    const authorizeAsMember = async (token: string) => {
      const response = await makeMetadataApiRequest(
        {
          query: authorizeAppMutation,
          variables: {
            clientId: claudeClientId,
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

    const exchangeCode = (code: string | null) =>
      request(baseUrl).post('/oauth/token').send({
        grant_type: 'authorization_code',
        code,
        client_id: claudeClientId,
        code_verifier: CODE_VERIFIER,
        redirect_uri: CLAUDE_CALLBACK,
      });

    it('should give two members connecting at once one Claude application', async () => {
      const [janeCode, jonyCode] = await Promise.all([
        authorizeAsMember(APPLE_JANE_ADMIN_ACCESS_TOKEN),
        authorizeAsMember(APPLE_JONY_MEMBER_ACCESS_TOKEN),
      ]);

      const [janeExchange, jonyExchange] = await Promise.all([
        exchangeCode(janeCode),
        exchangeCode(jonyCode),
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
});
