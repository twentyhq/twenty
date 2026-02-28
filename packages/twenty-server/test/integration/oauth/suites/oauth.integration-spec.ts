import crypto from 'crypto';

import bcrypt from 'bcrypt';
import request from 'supertest';
import { type DataSource } from 'typeorm';
import { base64UrlEncode } from 'twenty-shared/utils';

import { AppTokenType } from 'src/engine/core-modules/app-token/app-token.entity';

const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const TEST_USER_ID = '20202020-e6b5-4680-8a32-b8209737156b';

type TestRegistration = {
  id: string;
  universalIdentifier: string;
  name: string;
  description: string | null;
  oAuthClientId: string;
  oAuthRedirectUris: string[];
  oAuthScopes: string[];
};

type TestApplication = {
  id: string;
};

const insertRegistration = async (
  ds: DataSource,
  params: {
    name: string;
    description?: string;
    clientSecretHash: string;
    redirectUris: string[];
    scopes: string[];
  },
): Promise<TestRegistration> => {
  const id = crypto.randomUUID();
  const universalIdentifier = crypto.randomUUID();
  const oAuthClientId = crypto.randomUUID();

  await ds.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, description, "oAuthClientId", "oAuthClientSecretHash", "oAuthRedirectUris", "oAuthScopes")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      universalIdentifier,
      params.name,
      params.description ?? null,
      oAuthClientId,
      params.clientSecretHash,
      params.redirectUris,
      params.scopes,
    ],
  );

  return {
    id,
    universalIdentifier,
    name: params.name,
    description: params.description ?? null,
    oAuthClientId,
    oAuthRedirectUris: params.redirectUris,
    oAuthScopes: params.scopes,
  };
};

const insertApplication = async (
  ds: DataSource,
  params: {
    universalIdentifier: string;
    name: string;
    workspaceId: string;
    applicationRegistrationId: string;
  },
): Promise<TestApplication> => {
  const id = crypto.randomUUID();

  await ds.query(
    `INSERT INTO core."application"
      (id, "universalIdentifier", name, "workspaceId", "applicationRegistrationId", "sourceType", "sourcePath", "canBeUninstalled")
     VALUES ($1, $2, $3, $4, $5, 'local', '', true)`,
    [
      id,
      params.universalIdentifier,
      params.name,
      params.workspaceId,
      params.applicationRegistrationId,
    ],
  );

  return { id };
};

const insertAppToken = async (
  ds: DataSource,
  params: {
    value: string;
    type: AppTokenType;
    userId: string;
    workspaceId: string;
    expiresAt: Date;
    context?: Record<string, string>;
  },
): Promise<string> => {
  const rows = await ds.query(
    `INSERT INTO core."appToken"
      (value, type, "userId", "workspaceId", "expiresAt", context)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [
      params.value,
      params.type,
      params.userId,
      params.workspaceId,
      params.expiresAt,
      params.context ? JSON.stringify(params.context) : null,
    ],
  );

  return rows[0].id;
};

describe('OAuth (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let ds: DataSource;

  let testRegistration: TestRegistration;
  let testClientSecret: string;
  let testApplication: TestApplication;

  let autoInstallRegistration: TestRegistration;
  let autoInstallClientSecret: string;

  const createdEntityIds: {
    registrations: string[];
    tokens: string[];
    applications: string[];
  } = { registrations: [], tokens: [], applications: [] };

  beforeAll(async () => {
    ds = global.testDataSource;

    testClientSecret = crypto.randomBytes(32).toString('hex');
    const clientSecretHash = await bcrypt.hash(testClientSecret, 10);

    testRegistration = await insertRegistration(ds, {
      name: 'OAuth Integration Test App',
      clientSecretHash,
      redirectUris: ['https://example.com/callback'],
      scopes: ['read', 'write'],
    });
    createdEntityIds.registrations.push(testRegistration.id);

    testApplication = await insertApplication(ds, {
      universalIdentifier: testRegistration.universalIdentifier,
      name: testRegistration.name,
      workspaceId: TEST_WORKSPACE_ID,
      applicationRegistrationId: testRegistration.id,
    });

    autoInstallClientSecret = crypto.randomBytes(32).toString('hex');
    const autoInstallSecretHash = await bcrypt.hash(
      autoInstallClientSecret,
      10,
    );

    autoInstallRegistration = await insertRegistration(ds, {
      name: 'OAuth Auto-Install Test App',
      description: 'App for testing OAuth auto-install',
      clientSecretHash: autoInstallSecretHash,
      redirectUris: ['https://example.com/callback'],
      scopes: ['api'],
    });
    createdEntityIds.registrations.push(autoInstallRegistration.id);
  });

  afterAll(async () => {
    if (createdEntityIds.tokens.length > 0) {
      const placeholders = createdEntityIds.tokens
        .map((_, i) => `$${i + 1}`)
        .join(', ');

      await ds.query(
        `DELETE FROM core."appToken" WHERE id IN (${placeholders})`,
        createdEntityIds.tokens,
      );
    }

    if (createdEntityIds.applications.length > 0) {
      const placeholders = createdEntityIds.applications
        .map((_, i) => `$${i + 1}`)
        .join(', ');

      await ds.query(
        `DELETE FROM core."application" WHERE id IN (${placeholders})`,
        createdEntityIds.applications,
      );
    }

    if (testApplication) {
      await ds.query(`DELETE FROM core."application" WHERE id = $1`, [
        testApplication.id,
      ]);
    }

    if (createdEntityIds.registrations.length > 0) {
      const placeholders = createdEntityIds.registrations
        .map((_, i) => `$${i + 1}`)
        .join(', ');

      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE id IN (${placeholders})`,
        createdEntityIds.registrations,
      );
    }
  });

  const postToken = (body: Record<string, string>) =>
    request(baseUrl).post('/oauth/token').send(body);

  describe('Discovery endpoint', () => {
    it('should return OAuth authorization server metadata', async () => {
      const res = await request(baseUrl)
        .get('/.well-known/oauth-authorization-server')
        .expect(200);

      expect(res.body.token_endpoint).toContain('/oauth/token');
      expect(res.body.grant_types_supported).toEqual(
        expect.arrayContaining([
          'authorization_code',
          'client_credentials',
          'refresh_token',
        ]),
      );
      expect(res.body.code_challenge_methods_supported).toContain('S256');
      expect(res.body.scopes_supported).toBeDefined();
      expect(res.body.response_types_supported).toContain('code');
    });
  });

  describe('Token endpoint validation', () => {
    it('should return 400 for unsupported grant_type', async () => {
      const res = await postToken({
        grant_type: 'password',
        client_id: testRegistration.oAuthClientId,
      }).expect(400);

      expect(res.body.error).toBe('unsupported_grant_type');
    });

    it('should return 400 for invalid client_id', async () => {
      const res = await postToken({
        grant_type: 'client_credentials',
        client_id: 'non-existent-client',
        client_secret: testClientSecret,
      }).expect(400);

      expect(res.body.error).toBe('invalid_client');
    });

    it('should return 400 for invalid client_secret', async () => {
      const res = await postToken({
        grant_type: 'client_credentials',
        client_id: testRegistration.oAuthClientId,
        client_secret: 'wrong-secret',
      }).expect(400);

      expect(res.body.error).toBe('invalid_client');
    });

    it('should return 400 when grant_type is missing', async () => {
      await postToken({
        client_id: testRegistration.oAuthClientId,
      }).expect(400);
    });
  });

  describe('Client credentials grant', () => {
    it('should issue an access token for valid credentials', async () => {
      const res = await postToken({
        grant_type: 'client_credentials',
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
      }).expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.token_type).toBe('Bearer');
      expect(res.body.expires_in).toBeGreaterThan(0);
      expect(res.body.scope).toBe('read write');
      expect(res.body.refresh_token).toBeUndefined();
    });
  });

  describe('Authorization code grant', () => {
    const createAuthorizationCode = async (
      redirectUri = 'https://example.com/callback',
    ): Promise<string> => {
      const code = crypto.randomBytes(42).toString('hex');

      const tokenId = await insertAppToken(ds, {
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        context: { redirectUri },
      });

      createdEntityIds.tokens.push(tokenId);

      return code;
    };

    it('should exchange a valid authorization code for tokens', async () => {
      const code = await createAuthorizationCode();

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
        redirect_uri: 'https://example.com/callback',
      }).expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.refresh_token).toBeDefined();
      expect(res.body.token_type).toBe('Bearer');
      expect(res.body.expires_in).toBeGreaterThan(0);
    });

    it('should reject a reused authorization code', async () => {
      const code = await createAuthorizationCode();

      await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
        redirect_uri: 'https://example.com/callback',
      }).expect(200);

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
        redirect_uri: 'https://example.com/callback',
      }).expect(400);

      expect(res.body.error).toBe('invalid_grant');
    });

    it('should reject an expired authorization code', async () => {
      const code = crypto.randomBytes(42).toString('hex');

      const tokenId = await insertAppToken(ds, {
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() - 1000),
      });

      createdEntityIds.tokens.push(tokenId);

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
        redirect_uri: 'https://example.com/callback',
      }).expect(400);

      expect(res.body.error).toBe('invalid_grant');
    });

    it('should reject when redirect_uri does not match', async () => {
      const code = await createAuthorizationCode();

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
        redirect_uri: 'https://evil.com/callback',
      }).expect(400);

      expect(res.body.error).toBe('invalid_grant');
    });

    it('should require either client_secret or code_verifier', async () => {
      const code = await createAuthorizationCode();

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        redirect_uri: 'https://example.com/callback',
      }).expect(400);

      expect(res.body.error).toBe('invalid_request');
    });
  });

  describe('Authorization code grant with PKCE', () => {
    const createAuthCodeWithPkce = async (): Promise<{
      code: string;
      codeVerifier: string;
    }> => {
      const codeVerifier = crypto.randomBytes(32).toString('hex');
      const codeChallenge = base64UrlEncode(
        crypto.createHash('sha256').update(codeVerifier).digest(),
      );

      const code = crypto.randomBytes(42).toString('hex');

      const codeTokenId = await insertAppToken(ds, {
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        context: { redirectUri: 'https://example.com/callback' },
      });

      const challengeTokenId = await insertAppToken(ds, {
        value: codeChallenge,
        type: AppTokenType.CodeChallenge,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      createdEntityIds.tokens.push(codeTokenId, challengeTokenId);

      return { code, codeVerifier };
    };

    it('should exchange code with valid PKCE verifier', async () => {
      const { code, codeVerifier } = await createAuthCodeWithPkce();

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        code_verifier: codeVerifier,
        redirect_uri: 'https://example.com/callback',
      }).expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.refresh_token).toBeDefined();
      expect(res.body.token_type).toBe('Bearer');
    });

    it('should reject code with wrong PKCE verifier', async () => {
      const { code } = await createAuthCodeWithPkce();

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        code_verifier: 'wrong-verifier',
        redirect_uri: 'https://example.com/callback',
      }).expect(400);

      expect(res.body.error).toBe('invalid_grant');
    });
  });

  describe('OAuth auto-install', () => {
    const createAutoInstallAuthCode = async (): Promise<string> => {
      const code = crypto.randomBytes(42).toString('hex');

      const tokenId = await insertAppToken(ds, {
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        context: { redirectUri: 'https://example.com/callback' },
      });

      createdEntityIds.tokens.push(tokenId);

      return code;
    };

    it('should auto-install application during authorization code exchange', async () => {
      const code = await createAutoInstallAuthCode();

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: autoInstallRegistration.oAuthClientId,
        client_secret: autoInstallClientSecret,
        redirect_uri: 'https://example.com/callback',
      }).expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.refresh_token).toBeDefined();
      expect(res.body.token_type).toBe('Bearer');
      expect(res.body.scope).toBe('api');

      const rows = await ds.query(
        `SELECT id, name, description, "sourcePath", "universalIdentifier"
         FROM core."application"
         WHERE "applicationRegistrationId" = $1
           AND "workspaceId" = $2`,
        [autoInstallRegistration.id, TEST_WORKSPACE_ID],
      );

      expect(rows).toHaveLength(1);

      const autoCreatedApp = rows[0];

      expect(autoCreatedApp.name).toBe('OAuth Auto-Install Test App');
      expect(autoCreatedApp.description).toBe(
        'App for testing OAuth auto-install',
      );
      expect(autoCreatedApp.sourcePath).toBe('oauth-install');
      expect(autoCreatedApp.universalIdentifier).toBe(
        autoInstallRegistration.universalIdentifier,
      );

      createdEntityIds.applications.push(autoCreatedApp.id);
    });

    it('should reuse existing application on subsequent authorization code exchanges', async () => {
      const code = await createAutoInstallAuthCode();

      const res = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: autoInstallRegistration.oAuthClientId,
        client_secret: autoInstallClientSecret,
        redirect_uri: 'https://example.com/callback',
      }).expect(200);

      expect(res.body.access_token).toBeDefined();

      const rows = await ds.query(
        `SELECT id FROM core."application"
         WHERE "applicationRegistrationId" = $1
           AND "workspaceId" = $2`,
        [autoInstallRegistration.id, TEST_WORKSPACE_ID],
      );

      expect(rows).toHaveLength(1);
    });

    it('should fail client credentials when app is not installed in any workspace', async () => {
      const noInstallSecret = crypto.randomBytes(32).toString('hex');
      const noInstallHash = await bcrypt.hash(noInstallSecret, 10);

      const noInstallRegistration = await insertRegistration(ds, {
        name: 'No Install Test App',
        clientSecretHash: noInstallHash,
        redirectUris: [],
        scopes: ['api'],
      });

      createdEntityIds.registrations.push(noInstallRegistration.id);

      const res = await postToken({
        grant_type: 'client_credentials',
        client_id: noInstallRegistration.oAuthClientId,
        client_secret: noInstallSecret,
      }).expect(400);

      expect(res.body.error).toBe('server_error');
      expect(res.body.error_description).toContain(
        'No workspace installation found',
      );
    });
  });

  describe('Refresh token grant', () => {
    it('should issue new tokens from a valid refresh token', async () => {
      const code = crypto.randomBytes(42).toString('hex');

      const tokenId = await insertAppToken(ds, {
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        context: { redirectUri: 'https://example.com/callback' },
      });

      createdEntityIds.tokens.push(tokenId);

      const authCodeRes = await postToken({
        grant_type: 'authorization_code',
        code,
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
        redirect_uri: 'https://example.com/callback',
      }).expect(200);

      const refreshToken = authCodeRes.body.refresh_token;

      expect(refreshToken).toBeDefined();

      const res = await postToken({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
      }).expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.refresh_token).toBeDefined();
      expect(res.body.token_type).toBe('Bearer');
      expect(res.body.expires_in).toBeGreaterThan(0);
    });

    it('should reject an invalid refresh token', async () => {
      const res = await postToken({
        grant_type: 'refresh_token',
        refresh_token: 'invalid-refresh-token',
        client_id: testRegistration.oAuthClientId,
        client_secret: testClientSecret,
      }).expect(400);

      expect(res.body.error).toBe('invalid_grant');
    });
  });
});
