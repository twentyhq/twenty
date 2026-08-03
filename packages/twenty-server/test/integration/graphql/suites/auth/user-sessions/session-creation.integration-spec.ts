import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

const ALLOWED_ORIGIN = 'http://localhost:3001';
const DISALLOWED_ORIGIN = 'https://attacker.example.com';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_ABSOLUTE_LIFETIME_MS = 180 * ONE_DAY_MS;

describe('user session creation on auth exchanges (integration)', () => {
  describe('with cookie sessions disabled (default)', () => {
    it('should return auth tokens without setting a session cookie', async () => {
      const userSessionRepository =
        getCoreRepository<UserSessionEntity>(UserSessionEntity);
      const sessionCountBefore = await userSessionRepository.count();

      const response = await signInWithCookieCapture({
        originHeader: ALLOWED_ORIGIN,
      });

      expect(
        response.body.data.getAuthTokensFromLoginToken.tokens.refreshToken
          .token,
      ).toBeDefined();
      expect(extractSessionCookie(response)).toBeUndefined();

      const sessionCountAfter = await userSessionRepository.count();

      expect(sessionCountAfter).toBe(sessionCountBefore);
    });
  });

  describe('with cookie sessions enabled', () => {
    let firstSessionToken: string;

    beforeAll(async () => {
      await createConfigVariable({
        input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED', value: true },
      });
    });

    afterAll(async () => {
      await deleteConfigVariable({
        input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED' },
      }).catch(() => {});
    });

    it('should mint a session and set an httpOnly cookie on sign-in from an allowed origin', async () => {
      const response = await signInWithCookieCapture({
        originHeader: ALLOWED_ORIGIN,
      });

      expect(
        response.body.data.getAuthTokensFromLoginToken.tokens
          .accessOrWorkspaceAgnosticToken.token,
      ).toBeDefined();

      const sessionCookie = extractSessionCookie(response);

      expect(sessionCookie).toBeDefined();

      if (!sessionCookie) {
        throw new Error('Expected a session cookie');
      }

      firstSessionToken = sessionCookie.sessionToken;

      expect(sessionCookie.sessionToken).toMatch(/^sess_/);
      expect(sessionCookie.rawCookie).toContain('HttpOnly');
      expect(sessionCookie.rawCookie).toContain('Path=/');
      expect(sessionCookie.rawCookie).toContain('SameSite=Lax');
      // .env.test serves plain http, so the host-locked secure variant and the
      // Secure attribute must both be absent.
      expect(sessionCookie.rawCookie).not.toContain('__Host-');
      expect(sessionCookie.rawCookie.split(';')).not.toContainEqual(
        expect.stringMatching(/^\s*Secure\s*$/),
      );

      const expiresAttribute = sessionCookie.rawCookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('Expires='));

      expect(expiresAttribute).toBeDefined();

      const cookieLifetimeMs =
        new Date(expiresAttribute!.slice('Expires='.length)).getTime() -
        Date.now();

      expect(cookieLifetimeMs).toBeGreaterThan(
        SESSION_ABSOLUTE_LIFETIME_MS - ONE_DAY_MS,
      );
      expect(cookieLifetimeMs).toBeLessThan(
        SESSION_ABSOLUTE_LIFETIME_MS + ONE_DAY_MS,
      );
    });

    it('should store only the token hash at rest, with the expected session shape', async () => {
      const userSessionRepository =
        getCoreRepository<UserSessionEntity>(UserSessionEntity);

      const storedByRawToken = await userSessionRepository.findOneBy({
        tokenHash: firstSessionToken,
      });

      expect(storedByRawToken).toBeNull();

      const session = await userSessionRepository.findOneBy({
        tokenHash: hashUserSessionToken(firstSessionToken),
      });

      expect(session).not.toBeNull();

      if (!session) {
        throw new Error('Expected a persisted session');
      }

      expect(session).toMatchObject({
        userId: expect.any(String),
        workspaceId: expect.any(String),
        userWorkspaceId: expect.any(String),
        isImpersonating: false,
        revokedAt: null,
        revokedReason: null,
        // expect.any(Date) would fail: the entity's Date comes from the app's
        // vm context, so it is not an instanceof the test context's Date.
        lastActiveAt: expect.anything(),
      });

      const sessionLifetimeMs =
        session.expiresAt.getTime() - session.createdAt.getTime();

      expect(sessionLifetimeMs).toBeGreaterThan(
        SESSION_ABSOLUTE_LIFETIME_MS - ONE_DAY_MS,
      );
      expect(sessionLifetimeMs).toBeLessThan(
        SESSION_ABSOLUTE_LIFETIME_MS + ONE_DAY_MS,
      );
    });

    it('should set the cookie on a sign-in without an Origin header, keeping scripted sign-ins working', async () => {
      const response = await signInWithCookieCapture();

      expect(
        response.body.data.getAuthTokensFromLoginToken.tokens
          .accessOrWorkspaceAgnosticToken.token,
      ).toBeDefined();
      expect(extractSessionCookie(response)).toBeDefined();
    });

    it('should refuse the cookie but still return tokens on a sign-in from a disallowed origin (login-CSRF)', async () => {
      const userSessionRepository =
        getCoreRepository<UserSessionEntity>(UserSessionEntity);
      const sessionCountBefore = await userSessionRepository.count();

      const response = await signInWithCookieCapture({
        originHeader: DISALLOWED_ORIGIN,
      });

      expect(
        response.body.data.getAuthTokensFromLoginToken.tokens.refreshToken
          .token,
      ).toBeDefined();
      expect(extractSessionCookie(response)).toBeUndefined();

      const sessionCountAfter = await userSessionRepository.count();

      expect(sessionCountAfter).toBe(sessionCountBefore);
    });

    it('should revoke the presented session as superseded when signing in over it', async () => {
      const response = await signInWithCookieCapture({
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: `twenty-session=${firstSessionToken}`,
      });

      const newSessionCookie = extractSessionCookie(response);

      expect(newSessionCookie).toBeDefined();
      expect(newSessionCookie?.sessionToken).not.toBe(firstSessionToken);

      const userSessionRepository =
        getCoreRepository<UserSessionEntity>(UserSessionEntity);

      const supersededSession = await userSessionRepository.findOneBy({
        tokenHash: hashUserSessionToken(firstSessionToken),
      });

      expect(supersededSession).not.toBeNull();
      expect(supersededSession?.revokedAt).not.toBeNull();
      expect(supersededSession?.revokedReason).toBe(
        UserSessionRevokedReason.Superseded,
      );

      const newSession = await userSessionRepository.findOneBy({
        tokenHash: hashUserSessionToken(
          newSessionCookie?.sessionToken as string,
        ),
      });

      expect(newSession).not.toBeNull();
      expect(newSession?.revokedAt).toBeNull();
    });
  });
});
