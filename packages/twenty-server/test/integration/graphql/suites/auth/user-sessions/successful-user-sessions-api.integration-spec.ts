import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import {
  currentUserSessionsQueryFactory,
  revokeAllOtherUserSessionsQueryFactory,
  revokeUserSessionQueryFactory,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

type UserSessionApiEntry = {
  id: string;
  isCurrent: boolean;
  isImpersonating: boolean;
  authProvider: string;
};

describe('successful user sessions API (integration)', () => {
  let currentSessionCookieHeader: string;
  let otherSessionToken: string;

  const fetchSessions = async (): Promise<UserSessionApiEntry[]> => {
    const response = await postMetadataOperationWithHeaders(
      currentUserSessionsQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: currentSessionCookieHeader,
      },
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.currentUserSessions;
  };

  beforeAll(async () => {
    // Two devices: the "other" one signs in first so the second sign-in does
    // not supersede it (no cookie presented on either exchange).
    const otherDeviceResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const currentDeviceResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });

    const otherCookie = extractSessionCookie(otherDeviceResponse);
    const currentCookie = extractSessionCookie(currentDeviceResponse);

    if (!otherCookie || !currentCookie) {
      throw new Error('Expected session cookies from both sign-ins');
    }

    otherSessionToken = otherCookie.sessionToken;
    currentSessionCookieHeader = currentCookie.cookieHeader;
  });

  it('should list active sessions and mark only the presented one as current', async () => {
    const sessions = await fetchSessions();

    expect(sessions.length).toBeGreaterThanOrEqual(2);

    const currentSessions = sessions.filter((session) => session.isCurrent);

    expect(currentSessions).toHaveLength(1);
    expect(currentSessions[0].authProvider).toBe('password');
    expect(currentSessions[0].isImpersonating).toBe(false);
  });

  it('should revoke a targeted session by id', async () => {
    const otherSessionRow = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).findOneBy({ tokenHash: hashUserSessionToken(otherSessionToken) });

    if (!otherSessionRow) {
      throw new Error('Expected the other session row');
    }

    const response = await postMetadataOperationWithHeaders(
      revokeUserSessionQueryFactory({ userSessionId: otherSessionRow.id }),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: currentSessionCookieHeader,
      },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.revokeUserSession).toBe(true);

    const revokedRow = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).findOneBy({ id: otherSessionRow.id });

    expect(revokedRow?.revokedAt).not.toBeNull();
    expect(revokedRow?.revokedReason).toBe(UserSessionRevokedReason.UserRevoked);

    const sessions = await fetchSessions();

    expect(
      sessions.find((session) => session.id === otherSessionRow.id),
    ).toBeUndefined();
  });

  it('should revoke every other session but keep the presented one alive', async () => {
    // A fresh sign-in guarantees at least one other active session to revoke.
    await signInWithCookieCapture({ originHeader: ALLOWED_ORIGIN });

    const response = await postMetadataOperationWithHeaders(
      revokeAllOtherUserSessionsQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: currentSessionCookieHeader,
      },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.revokeAllOtherUserSessions).toBeGreaterThanOrEqual(
      1,
    );

    const sessions = await fetchSessions();

    expect(sessions).toHaveLength(1);
    expect(sessions[0].isCurrent).toBe(true);
  });
});
