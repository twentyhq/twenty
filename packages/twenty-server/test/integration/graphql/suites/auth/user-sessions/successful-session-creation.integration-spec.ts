import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  normalizeSessionCookieForSnapshot,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import { IS_SECURE_DEPLOYMENT } from 'test/integration/graphql/suites/auth/user-sessions/constants/is-secure-deployment.constant';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_ABSOLUTE_LIFETIME_MS = 180 * ONE_DAY_MS;

describe('successful user session creation on auth exchanges (integration)', () => {
  let firstSessionToken: string;
  let firstSessionCookieHeader: string;

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
    firstSessionCookieHeader = sessionCookie.cookieHeader;

    // Insecure boot only (plain http: no Secure, no __Host-); secure-deployment/suites/secure-session-cookie.integration-spec.ts
    // pins the secure shape. The absences matter: no Domain keeps the cookie host-only, off sibling workspace subdomains.
    if (!IS_SECURE_DEPLOYMENT) {
      expect(
        normalizeSessionCookieForSnapshot(sessionCookie.rawCookie),
      ).toMatchSnapshot('session-cookie');
    }

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
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userWorkspaceId: expect.any(String),
      isImpersonating: false,
      revokedAt: null,
      revokedReason: null,
      // Not expect.any(Date): the entity's Date comes from the app's vm context.
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

  it('should revoke the presented session as superseded when signing in over it', async () => {
    const response = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
      cookieHeader: firstSessionCookieHeader,
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
      tokenHash: hashUserSessionToken(newSessionCookie?.sessionToken as string),
    });

    expect(newSession).not.toBeNull();
    expect(newSession?.revokedAt).toBeNull();
  });
});
