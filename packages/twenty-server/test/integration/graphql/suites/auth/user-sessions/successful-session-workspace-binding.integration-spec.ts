import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import { currentUserWorkspaceContextQueryFactory } from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';
import { setupDatabaseConfigOverrideForSuite } from 'test/integration/graphql/suites/auth/user-sessions/utils/setup-database-config-override.util';

import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

// Tim is seeded in both the apple and yc workspaces, which is what makes this
// provable: same user, same credentials, two sessions, and each cookie can
// only ever reach the workspace its exchange selected. No request-side input
// (header, variable, origin) lets a session pivot to another workspace; the
// context is rebuilt from the session row alone.
describe('successful session workspace binding (integration)', () => {
  setupDatabaseConfigOverrideForSuite('AUTH_COOKIE_SESSIONS_ENABLED', true);

  let appleSessionToken: string;
  let ycSessionToken: string;

  const fetchWorkspaceContext = async (sessionToken: string) => {
    const response = await postMetadataOperationWithHeaders(
      currentUserWorkspaceContextQueryFactory(),
      {
        originHeader: ALLOWED_ORIGIN,
        cookieHeader: `twenty-session=${sessionToken}`,
      },
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.currentUser;
  };

  beforeAll(async () => {
    const appleResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const ycResponse = await signInWithCookieCapture({
      workspaceSubdomain: 'yc',
      originHeader: ALLOWED_ORIGIN,
    });

    const appleCookie = extractSessionCookie(appleResponse);
    const ycCookie = extractSessionCookie(ycResponse);

    if (!appleCookie || !ycCookie) {
      throw new Error('Expected session cookies from both workspace sign-ins');
    }

    appleSessionToken = appleCookie.sessionToken;
    ycSessionToken = ycCookie.sessionToken;
  });

  it('should persist each session bound to the workspace its exchange selected', async () => {
    const userSessionRepository =
      getCoreRepository<UserSessionEntity>(UserSessionEntity);

    const appleSession = await userSessionRepository.findOneBy({
      tokenHash: hashUserSessionToken(appleSessionToken),
    });
    const ycSession = await userSessionRepository.findOneBy({
      tokenHash: hashUserSessionToken(ycSessionToken),
    });

    expect(appleSession?.workspaceId).toBe(SEED_APPLE_WORKSPACE_ID);
    expect(appleSession?.userWorkspaceId).toBe(
      USER_WORKSPACE_DATA_SEED_IDS.TIM,
    );
    expect(ycSession?.workspaceId).toBe(SEED_YCOMBINATOR_WORKSPACE_ID);
    expect(ycSession?.userWorkspaceId).toBe(
      USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME,
    );
  });

  it('should resolve the auth context of each cookie to its own workspace, with no cross-workspace pivot', async () => {
    const appleContext = await fetchWorkspaceContext(appleSessionToken);
    const ycContext = await fetchWorkspaceContext(ycSessionToken);

    expect(appleContext.email).toBe('tim@apple.dev');
    expect(appleContext.currentWorkspace.id).toBe(SEED_APPLE_WORKSPACE_ID);
    expect(appleContext.currentUserWorkspace.id).toBe(
      USER_WORKSPACE_DATA_SEED_IDS.TIM,
    );

    expect(ycContext.email).toBe('tim@apple.dev');
    expect(ycContext.currentWorkspace.id).toBe(SEED_YCOMBINATOR_WORKSPACE_ID);
    expect(ycContext.currentUserWorkspace.id).toBe(
      USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME,
    );
  });
});
