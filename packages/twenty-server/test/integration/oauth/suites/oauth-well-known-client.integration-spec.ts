import crypto from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { base64UrlEncode } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { WELL_KNOWN_OAUTH_CLIENTS } from 'src/engine/core-modules/application/well-known-oauth-client/constants/well-known-oauth-clients.constant';
import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';

const CLAUDE_CALLBACK = 'https://claude.ai/api/mcp/auth_callback';
const CHATGPT_CONNECTION_CALLBACK =
  'https://chatgpt.com/connector/oauth/integration-test';

const findWellKnownOAuthClientUniversalIdentifier = (
  client: WellKnownOAuthClient,
): string => {
  const wellKnownOAuthClient = WELL_KNOWN_OAUTH_CLIENTS.find(
    (definition) => definition.client === client,
  );

  if (!wellKnownOAuthClient) {
    throw new Error(`Missing well-known OAuth client ${client}`);
  }

  return wellKnownOAuthClient.universalIdentifier;
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
      wellKnownOAuthClient
    }
  }
`;

describe('OAuth well-known clients (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let ds: DataSource;
  // Registrations are rate limited per IP, so the suite registers each client once
  let claudeClientId: string;
  let chatGptClientId: string;
  const createdRegistrationClientIds: string[] = [];
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update('integration-verifier').digest(),
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
    if (createdRegistrationClientIds.length > 0) {
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE "oAuthClientId" = ANY($1)`,
        [createdRegistrationClientIds],
      );
    }

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
        [
          findWellKnownOAuthClientUniversalIdentifier(
            WellKnownOAuthClient.CLAUDE,
          ),
        ],
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
