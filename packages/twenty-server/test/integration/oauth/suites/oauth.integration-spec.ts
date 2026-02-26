import crypto from 'crypto';

import bcrypt from 'bcrypt';
import request from 'supertest';
import { type Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const TEST_USER_ID = '20202020-e6b5-4680-8a32-b820973715b6';

describe('OAuth (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let appRegistrationRepository: Repository<ApplicationRegistrationEntity>;
  let appTokenRepository: Repository<AppTokenEntity>;
  let applicationRepository: Repository<ApplicationEntity>;

  let testRegistration: ApplicationRegistrationEntity;
  let testClientSecret: string;
  let testApplication: ApplicationEntity;

  let autoInstallRegistration: ApplicationRegistrationEntity;
  let autoInstallClientSecret: string;

  const createdEntityIds: {
    registrations: string[];
    tokens: string[];
    applications: string[];
  } = { registrations: [], tokens: [], applications: [] };

  beforeAll(async () => {
    appRegistrationRepository = global.testDataSource.getRepository(
      ApplicationRegistrationEntity,
    );
    appTokenRepository = global.testDataSource.getRepository(AppTokenEntity);
    applicationRepository =
      global.testDataSource.getRepository(ApplicationEntity);

    testClientSecret = crypto.randomBytes(32).toString('hex');
    const clientSecretHash = await bcrypt.hash(testClientSecret, 10);

    testRegistration = await appRegistrationRepository.save(
      appRegistrationRepository.create({
        universalIdentifier: crypto.randomUUID(),
        name: 'OAuth Integration Test App',
        oAuthClientId: crypto.randomUUID(),
        oAuthClientSecretHash: clientSecretHash,
        oAuthRedirectUris: ['https://example.com/callback'],
        oAuthScopes: ['read', 'write'],
      }),
    );
    createdEntityIds.registrations.push(testRegistration.id);

    testApplication = await applicationRepository.save(
      applicationRepository.create({
        universalIdentifier: testRegistration.universalIdentifier,
        name: testRegistration.name,
        workspaceId: TEST_WORKSPACE_ID,
        applicationRegistrationId: testRegistration.id,
        sourceType: 'local',
        sourcePath: '',
        canBeUninstalled: true,
      }),
    );

    autoInstallClientSecret = crypto.randomBytes(32).toString('hex');
    const autoInstallSecretHash = await bcrypt.hash(
      autoInstallClientSecret,
      10,
    );

    autoInstallRegistration = await appRegistrationRepository.save(
      appRegistrationRepository.create({
        universalIdentifier: crypto.randomUUID(),
        name: 'OAuth Auto-Install Test App',
        description: 'App for testing OAuth auto-install',
        oAuthClientId: crypto.randomUUID(),
        oAuthClientSecretHash: autoInstallSecretHash,
        oAuthRedirectUris: ['https://example.com/callback'],
        oAuthScopes: ['api'],
      }),
    );
    createdEntityIds.registrations.push(autoInstallRegistration.id);
  });

  afterAll(async () => {
    if (createdEntityIds.tokens.length > 0) {
      await appTokenRepository.delete(createdEntityIds.tokens);
    }

    if (createdEntityIds.applications.length > 0) {
      await applicationRepository.delete(createdEntityIds.applications);
    }

    if (testApplication) {
      await applicationRepository.delete(testApplication.id);
    }

    if (createdEntityIds.registrations.length > 0) {
      await appRegistrationRepository.delete(createdEntityIds.registrations);
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
    const createAuthorizationCode = async (): Promise<string> => {
      const code = crypto.randomBytes(42).toString('hex');

      const token = appTokenRepository.create({
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      const saved = await appTokenRepository.save(token);

      createdEntityIds.tokens.push(saved.id);

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

      const token = appTokenRepository.create({
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() - 1000),
      });

      const saved = await appTokenRepository.save(token);

      createdEntityIds.tokens.push(saved.id);

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
      const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest()
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const code = crypto.randomBytes(42).toString('hex');

      const tokens = appTokenRepository.create([
        {
          value: code,
          type: AppTokenType.AuthorizationCode,
          userId: TEST_USER_ID,
          workspaceId: TEST_WORKSPACE_ID,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        {
          value: codeChallenge,
          type: AppTokenType.CodeChallenge,
          userId: TEST_USER_ID,
          workspaceId: TEST_WORKSPACE_ID,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      ]);

      const saved = await appTokenRepository.save(tokens);

      createdEntityIds.tokens.push(...saved.map((token) => token.id));

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

      const token = appTokenRepository.create({
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      const saved = await appTokenRepository.save(token);

      createdEntityIds.tokens.push(saved.id);

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

      const autoCreatedApp = await applicationRepository.findOne({
        where: {
          applicationRegistrationId: autoInstallRegistration.id,
          workspaceId: TEST_WORKSPACE_ID,
        },
      });

      expect(autoCreatedApp).toBeDefined();
      expect(autoCreatedApp!.name).toBe('OAuth Auto-Install Test App');
      expect(autoCreatedApp!.description).toBe(
        'App for testing OAuth auto-install',
      );
      expect(autoCreatedApp!.sourcePath).toBe('oauth-install');
      expect(autoCreatedApp!.universalIdentifier).toBe(
        autoInstallRegistration.universalIdentifier,
      );

      createdEntityIds.applications.push(autoCreatedApp!.id);
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

      const apps = await applicationRepository.find({
        where: {
          applicationRegistrationId: autoInstallRegistration.id,
          workspaceId: TEST_WORKSPACE_ID,
        },
      });

      expect(apps).toHaveLength(1);
    });

    it('should fail client credentials when app is not installed in any workspace', async () => {
      const noInstallSecret = crypto.randomBytes(32).toString('hex');
      const noInstallHash = await bcrypt.hash(noInstallSecret, 10);

      const noInstallRegistration = await appRegistrationRepository.save(
        appRegistrationRepository.create({
          universalIdentifier: crypto.randomUUID(),
          name: 'No Install Test App',
          oAuthClientId: crypto.randomUUID(),
          oAuthClientSecretHash: noInstallHash,
          oAuthRedirectUris: [],
          oAuthScopes: ['api'],
        }),
      );

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

      const token = appTokenRepository.create({
        value: code,
        type: AppTokenType.AuthorizationCode,
        userId: TEST_USER_ID,
        workspaceId: TEST_WORKSPACE_ID,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      const saved = await appTokenRepository.save(token);

      createdEntityIds.tokens.push(saved.id);

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
