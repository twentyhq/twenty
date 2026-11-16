import crypto from 'crypto';

import gql from 'graphql-tag';
import IORedis from 'ioredis';
import request from 'supertest';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { base64UrlEncode } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { CLIENT_ID_METADATA_DOCUMENT_FETCH_RATE_LIMIT_MAX } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/constants/client-id-metadata-document-fetch-rate-limit.constant';
import { type ClientIdMetadataDocumentService } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/services/client-id-metadata-document.service';
import { type ClientIdMetadataDocument } from 'src/engine/core-modules/application/application-oauth/client-id-metadata-document/types/client-id-metadata-document.type';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { TOKEN_BUCKET_THROTTLE_KEY_PREFIX } from 'src/engine/core-modules/throttler/constants/token-bucket-throttle-key-prefix.constant';

const CODE_VERIFIER = 'integration-verifier';

// Shaped like the documents ChatGPT and Claude Code publish
const WEB_CLIENT_DOCUMENT: ClientIdMetadataDocument = {
  clientId: 'https://chatgpt.com/oauth/integration-test-client.json',
  clientName: 'ChatGPT',
  logoUri: 'https://persistent.oaistatic.com/sonic/misc/openai-logo.png',
  redirectUris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
};
const NATIVE_CLIENT_DOCUMENT: ClientIdMetadataDocument = {
  clientId: 'https://claude.ai/oauth/integration-test-native-client',
  clientName: 'Claude Code',
  logoUri: null,
  redirectUris: ['http://localhost/callback', 'http://127.0.0.1/callback'],
};
const VERIFIED_CLIENT_DOCUMENT: ClientIdMetadataDocument = {
  clientId: 'https://chatgpt.com/oauth/client.json',
  clientName: 'ChatGPT',
  logoUri: null,
  redirectUris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
};
const DOCUMENTS = [
  WEB_CLIENT_DOCUMENT,
  NATIVE_CLIENT_DOCUMENT,
  VERIFIED_CLIENT_DOCUMENT,
];
const DOCUMENT_CLIENT_IDS = DOCUMENTS.map(({ clientId }) => clientId);
const WEB_CLIENT_CALLBACK = WEB_CLIENT_DOCUMENT.redirectUris[0];

const authorizeAppMutation = gql`
  mutation AuthorizeApp(
    $clientId: String!
    $redirectUrl: String!
    $codeChallenge: String
    $resource: String
  ) {
    authorizeApp(
      clientId: $clientId
      redirectUrl: $redirectUrl
      codeChallenge: $codeChallenge
      resource: $resource
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
      oAuthScopes
    }
  }
`;

const findClientVerificationQuery = gql`
  query FindClientVerification($clientId: String!) {
    findApplicationRegistrationByClientId(clientId: $clientId) {
      name
      isVerified
      isClaimingVerifiedClientName
    }
  }
`;

const clearFetchRateLimit = async () => {
  const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379');

  try {
    const keys = await redis.keys(
      `${CacheStorageNamespace.IntegrationTests}:${CacheStorageNamespace.EngineWorkspace}:${TOKEN_BUCKET_THROTTLE_KEY_PREFIX}:oauth*`,
    );

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } finally {
    redis.disconnect();
  }
};

describe('OAuth client ID metadata documents (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update(CODE_VERIFIER).digest(),
  );

  let dataSource: DataSource;
  let clientIdMetadataDocumentService: ClientIdMetadataDocumentService;
  let findDocumentSpy: jest.SpyInstance;
  let isFetchDueSpy: jest.SpyInstance;

  const lookUp = (clientId: string) =>
    makeMetadataApiRequest(
      {
        query: findApplicationRegistrationByClientIdQuery,
        variables: { clientId },
      },
      null,
    );

  const requestAuthorization = ({
    clientId,
    redirectUrl,
    resource,
  }: {
    clientId: string;
    redirectUrl: string;
    resource?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: authorizeAppMutation,
        variables: { clientId, redirectUrl, codeChallenge, resource },
      },
      APPLE_JANE_ADMIN_ACCESS_TOKEN,
    );

  const findAuthorizationCode = (response: {
    body: { data: { authorizeApp: { redirectUrl: string } } };
  }) =>
    new URL(response.body.data.authorizeApp.redirectUrl).searchParams.get(
      'code',
    );

  const postToken = (body: Record<string, unknown>) =>
    request(baseUrl).post('/oauth/token').send(body);

  const countRegistrations = async (clientId: string): Promise<number> => {
    const [{ count }] = await dataSource.query(
      `SELECT COUNT(*)::int AS count FROM core."applicationRegistration" WHERE "oAuthClientId" = $1`,
      [clientId],
    );

    return count;
  };

  const stubDocuments = () => {
    findDocumentSpy = jest
      .spyOn(clientIdMetadataDocumentService, 'findDocument')
      .mockImplementation(
        async (clientId) =>
          DOCUMENTS.find((document) => document.clientId === clientId) ?? null,
      );
    isFetchDueSpy = jest
      .spyOn(clientIdMetadataDocumentService, 'isFetchDue')
      .mockResolvedValue(false);
  };

  const restoreDocuments = () => {
    findDocumentSpy.mockRestore();
    isFetchDueSpy.mockRestore();
  };

  beforeAll(() => {
    dataSource = global.testDataSource;
    clientIdMetadataDocumentService =
      getAppProviderByClassName<ClientIdMetadataDocumentService>(
        'ClientIdMetadataDocumentService',
      );
  });

  beforeEach(clearFetchRateLimit);

  afterAll(async () => {
    jest.restoreAllMocks();
    await clearFetchRateLimit();

    await dataSource.query(
      `DELETE FROM core."application" application
       USING core."applicationRegistration" registration
       WHERE registration.id = application."applicationRegistrationId"
         AND registration."oAuthClientId" = ANY($1)`,
      [DOCUMENT_CLIENT_IDS],
    );
    await dataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE "oAuthClientId" = ANY($1)`,
      [DOCUMENT_CLIENT_IDS],
    );
    await dataSource.query(
      `DELETE FROM core."appToken" WHERE context->>'clientId' = ANY($1)`,
      [DOCUMENT_CLIENT_IDS],
    );
  });

  describe('Document clients', () => {
    beforeEach(stubDocuments);

    afterEach(restoreDocuments);

    it('should advertise support', async () => {
      const response = await request(baseUrl)
        .get('/.well-known/oauth-authorization-server')
        .expect(200);

      expect(response.body.client_id_metadata_document_supported).toBe(true);
    });

    it('should describe the client on the consent screen without registering it', async () => {
      const response = await lookUp(NATIVE_CLIENT_DOCUMENT.clientId);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.findApplicationRegistrationByClientId).toEqual({
        name: 'Claude Code',
        logoUrl: null,
        oAuthScopes: expect.arrayContaining(['api', 'profile']),
      });
      expect(await countRegistrations(NATIVE_CLIENT_DOCUMENT.clientId)).toBe(0);
    });

    it('should verify a client only when its document URL is on the verified list', async () => {
      const lookUpVerification = async (clientId: string) => {
        const response = await makeMetadataApiRequest(
          { query: findClientVerificationQuery, variables: { clientId } },
          null,
        );

        return response.body.data.findApplicationRegistrationByClientId;
      };

      expect(
        await lookUpVerification(VERIFIED_CLIENT_DOCUMENT.clientId),
      ).toEqual({
        name: 'ChatGPT',
        isVerified: true,
        isClaimingVerifiedClientName: false,
      });
      expect(await lookUpVerification(WEB_CLIENT_DOCUMENT.clientId)).toEqual({
        name: 'ChatGPT',
        isVerified: false,
        isClaimingVerifiedClientName: true,
      });
    });

    it('should authorize, exchange and refresh with the document URL as client id', async () => {
      const firstAuthorization = await requestAuthorization({
        clientId: WEB_CLIENT_DOCUMENT.clientId,
        redirectUrl: WEB_CLIENT_CALLBACK,
      });
      const secondAuthorization = await requestAuthorization({
        clientId: WEB_CLIENT_DOCUMENT.clientId,
        redirectUrl: WEB_CLIENT_CALLBACK,
      });

      expect(secondAuthorization.body.errors).toBeUndefined();
      expect(await countRegistrations(WEB_CLIENT_DOCUMENT.clientId)).toBe(1);

      const exchangeResponse = await postToken({
        grant_type: 'authorization_code',
        code: findAuthorizationCode(firstAuthorization),
        client_id: WEB_CLIENT_DOCUMENT.clientId,
        code_verifier: CODE_VERIFIER,
        redirect_uri: WEB_CLIENT_CALLBACK,
      });

      expect(exchangeResponse.status).toBe(200);

      const refreshResponse = await postToken({
        grant_type: 'refresh_token',
        refresh_token: exchangeResponse.body.refresh_token,
        client_id: WEB_CLIENT_DOCUMENT.clientId,
      });

      expect(refreshResponse.status).toBe(200);
    });

    it('should reject a callback the document does not list, without registering the client', async () => {
      const response = await requestAuthorization({
        clientId: NATIVE_CLIENT_DOCUMENT.clientId,
        redirectUrl: 'https://claude.ai/another_callback',
      });

      expect(response.body.errors?.[0]?.message).toContain(
        'redirectUrl mismatch',
      );
      expect(await countRegistrations(NATIVE_CLIENT_DOCUMENT.clientId)).toBe(0);
    });

    it('should refuse a resource this server does not serve, without registering the client', async () => {
      const response = await requestAuthorization({
        clientId: NATIVE_CLIENT_DOCUMENT.clientId,
        redirectUrl: 'http://localhost:53124/callback',
        resource: 'https://mcp.attacker.example.com/mcp',
      });

      expect(response.body.errors?.[0]?.message).toContain('Unknown resource');
      expect(await countRegistrations(NATIVE_CLIENT_DOCUMENT.clientId)).toBe(0);
    });

    it('should accept any port on a loopback callback the document lists', async () => {
      const response = await requestAuthorization({
        clientId: NATIVE_CLIENT_DOCUMENT.clientId,
        redirectUrl: 'http://localhost:53124/callback',
      });

      expect(response.body.errors).toBeUndefined();
      expect(findAuthorizationCode(response)).toEqual(expect.any(String));
    });

    it('should still revoke a refresh token while the document is withdrawn', async () => {
      const authorization = await requestAuthorization({
        clientId: WEB_CLIENT_DOCUMENT.clientId,
        redirectUrl: WEB_CLIENT_CALLBACK,
      });
      const exchangeResponse = await postToken({
        grant_type: 'authorization_code',
        code: findAuthorizationCode(authorization),
        client_id: WEB_CLIENT_DOCUMENT.clientId,
        code_verifier: CODE_VERIFIER,
        redirect_uri: WEB_CLIENT_CALLBACK,
      }).expect(200);
      const refreshToken = exchangeResponse.body.refresh_token;

      findDocumentSpy.mockResolvedValue(null);

      await request(baseUrl)
        .post('/oauth/revoke')
        .send({ token: refreshToken, client_id: WEB_CLIENT_DOCUMENT.clientId })
        .expect(200);

      findDocumentSpy.mockImplementation(
        async (clientId) =>
          DOCUMENTS.find((document) => document.clientId === clientId) ?? null,
      );

      const refreshResponse = await postToken({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: WEB_CLIENT_DOCUMENT.clientId,
      }).expect(400);

      expect(refreshResponse.body.error).toBe('invalid_grant');
    });

    it('should stop accepting the client once its document is withdrawn', async () => {
      await requestAuthorization({
        clientId: WEB_CLIENT_DOCUMENT.clientId,
        redirectUrl: WEB_CLIENT_CALLBACK,
      });

      findDocumentSpy.mockResolvedValue(null);

      const response = await requestAuthorization({
        clientId: WEB_CLIENT_DOCUMENT.clientId,
        redirectUrl: WEB_CLIENT_CALLBACK,
      });

      expect(response.body.errors?.[0]?.message).toContain('Client not found');
    });
  });

  describe('Fetch allowance', () => {
    const buildUnreachableDocumentUrl = () =>
      `https://10.255.255.1/${crypto.randomUUID()}`;

    const exhaustFetchAllowance = async (): Promise<string> => {
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

    it('should rate limit the lookups that fetch a document, not the cached ones', async () => {
      const cachedDocumentUrl = await exhaustFetchAllowance();

      const throttledResponse = await lookUp(buildUnreachableDocumentUrl());

      expect(throttledResponse.body.errors?.[0]?.extensions?.subCode).toBe(
        'LIMIT_REACHED',
      );

      const cachedResponse = await lookUp(cachedDocumentUrl);

      expect(cachedResponse.body.errors).toBeUndefined();
    });

    it('should spend the same allowance on the authorize, token, revoke and introspect endpoints', async () => {
      await exhaustFetchAllowance();

      const throttledAuthorization = await requestAuthorization({
        clientId: buildUnreachableDocumentUrl(),
        redirectUrl: WEB_CLIENT_CALLBACK,
      });

      expect(throttledAuthorization.body.errors?.[0]?.extensions?.subCode).toBe(
        'LIMIT_REACHED',
      );

      const throttledResponses = await Promise.all([
        postToken({
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
    });
  });
});
