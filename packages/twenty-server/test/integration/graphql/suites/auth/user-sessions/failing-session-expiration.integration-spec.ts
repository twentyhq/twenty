import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  hasClearingCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { currentUserIdentityQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Sessions created here are never resolved before the row is tampered with,
// so the read-through cache holds no entry and the checks hit the database.
describe('failing session expiration (integration)', () => {
  const signInAndTamper = async (
    tamper: Partial<Pick<UserSessionEntity, 'expiresAt' | 'lastActiveAt'>>,
  ): Promise<string> => {
    const signInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const sessionCookie = extractSessionCookie(signInResponse);

    if (!sessionCookie) {
      throw new Error('Expected a session cookie from sign-in');
    }

    await getCoreRepository<UserSessionEntity>(UserSessionEntity).update(
      { tokenHash: hashUserSessionToken(sessionCookie.sessionToken) },
      tamper,
    );

    return sessionCookie.cookieHeader;
  };

  const expectCookieRejected = async (
    sessionCookieHeader: string,
  ): Promise<void> => {
    const response = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: sessionCookieHeader,
      },
    );

    expect(response.body.errors).toBeDefined();
    expect(hasClearingCookie(response)).toBe(true);
  };

  it('should reject a session past its absolute lifetime and clear the cookie', async () => {
    const sessionCookieHeader = await signInAndTamper({
      expiresAt: new Date(Date.now() - ONE_DAY_MS),
    });

    await expectCookieRejected(sessionCookieHeader);
  });

  it('should reject a session past the idle timeout and clear the cookie', async () => {
    // 31 days idle exceeds the 30d SESSION_IDLE_TIMEOUT while the absolute
    // 180d lifetime is still far in the future.
    const sessionCookieHeader = await signInAndTamper({
      lastActiveAt: new Date(Date.now() - 31 * ONE_DAY_MS),
    });

    await expectCookieRejected(sessionCookieHeader);
  });
});
