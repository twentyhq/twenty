import {
  extractSessionCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import {
  currentUserIdentityQueryFactory,
  currentUserSessionsQueryFactory,
  revokeAllOtherUserSessionsQueryFactory,
  revokeUserSessionQueryFactory,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import { setupDatabaseConfigOverrideForSuite } from 'test/integration/graphql/suites/auth/user-sessions/utils/setup-database-config-override.util';

type UserSessionApiEntry = { id: string; isCurrent: boolean };

// Tim is seeded in both apple and yc, which is what makes this provable: one
// person, two workspaces. Almost nothing in Twenty is account-wide, so a
// workspace must not surface, or be able to revoke, the sessions this person
// holds in another workspace.
describe('workspace-scoped user sessions API (integration)', () => {
  setupDatabaseConfigOverrideForSuite('AUTH_COOKIE_SESSIONS_ENABLED', true);

  let appleCookieHeader: string;
  let ycCookieHeader: string;

  const signInTo = async (workspaceSubdomain: string): Promise<string> => {
    const response = await signInWithCookieCapture({
      workspaceSubdomain,
      originHeader: ALLOWED_ORIGIN,
    });
    const sessionCookie = extractSessionCookie(response);

    if (!sessionCookie) {
      throw new Error(`Expected a session cookie from ${workspaceSubdomain}`);
    }

    return sessionCookie.cookieHeader;
  };

  const fetchSessions = async (
    cookieHeader: string,
  ): Promise<UserSessionApiEntry[]> => {
    const response = await postMetadataOperationWithHeaders(
      currentUserSessionsQueryFactory(),
      { originHeader: ALLOWED_ORIGIN, cookieHeader },
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.currentUserSessions;
  };

  beforeAll(async () => {
    appleCookieHeader = await signInTo('apple');
    ycCookieHeader = await signInTo('yc');
  });

  it('should list only the sessions bound to the workspace the cookie belongs to', async () => {
    const appleSessionIds = (await fetchSessions(appleCookieHeader)).map(
      (session) => session.id,
    );
    const ycSessionIds = (await fetchSessions(ycCookieHeader)).map(
      (session) => session.id,
    );

    expect(appleSessionIds.length).toBeGreaterThan(0);
    expect(ycSessionIds.length).toBeGreaterThan(0);

    expect(
      appleSessionIds.filter((sessionId) => ycSessionIds.includes(sessionId)),
    ).toHaveLength(0);
  });

  it('should refuse to revoke a session belonging to another workspace', async () => {
    const ycSessions = await fetchSessions(ycCookieHeader);
    const ycSessionId = ycSessions[0].id;

    const response = await postMetadataOperationWithHeaders(
      revokeUserSessionQueryFactory({ userSessionId: ycSessionId }),
      { originHeader: ALLOWED_ORIGIN, cookieHeader: appleCookieHeader },
    );

    expect(response.body.errors).toBeDefined();

    // Still usable: the refusal has to be a no-op, not a silent revocation.
    const ycSessionsAfter = await fetchSessions(ycCookieHeader);

    expect(ycSessionsAfter.map((session) => session.id)).toContain(ycSessionId);
  });

  it('should leave other workspaces signed in when revoking all other devices', async () => {
    // A second apple sign-in guarantees there is something to revoke.
    await signInTo('apple');

    const response = await postMetadataOperationWithHeaders(
      revokeAllOtherUserSessionsQueryFactory(),
      { originHeader: ALLOWED_ORIGIN, cookieHeader: appleCookieHeader },
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.revokeAllOtherUserSessions).toBeGreaterThanOrEqual(
      1,
    );

    const ycResponse = await postMetadataOperationWithHeaders(
      currentUserIdentityQueryFactory(),
      { originHeader: ALLOWED_ORIGIN, cookieHeader: ycCookieHeader },
    );

    expect(ycResponse.body.errors).toBeUndefined();
    expect(ycResponse.body.data.currentUser.email).toBe('tim@apple.dev');
  });
});
