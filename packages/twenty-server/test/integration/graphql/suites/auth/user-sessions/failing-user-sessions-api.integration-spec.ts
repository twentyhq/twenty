import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  extractSessionCookie,
  postMetadataOperationWithHeaders,
  signInWithCookieCapture,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/sign-in-with-cookie-capture.util';
import {
  currentUserSessionsQueryFactory,
  revokeUserSessionQueryFactory,
} from 'test/integration/graphql/suites/auth/user-sessions/utils/user-session-operations.util';

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';

import { ALLOWED_ORIGIN } from 'test/integration/graphql/suites/auth/user-sessions/constants/session-origins.constants';

describe('failing user sessions API (integration)', () => {
  let timSessionId: string;

  beforeAll(async () => {
    await createConfigVariable({
      input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED', value: true },
    });

    const signInResponse = await signInWithCookieCapture({
      originHeader: ALLOWED_ORIGIN,
    });
    const sessionCookie = extractSessionCookie(signInResponse);

    if (!sessionCookie) {
      throw new Error('Expected a session cookie from sign-in');
    }

    const sessionRow = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).findOneBy({ tokenHash: hashUserSessionToken(sessionCookie.sessionToken) });

    if (!sessionRow) {
      throw new Error('Expected a persisted session row');
    }

    timSessionId = sessionRow.id;
  });

  afterAll(async () => {
    await deleteConfigVariable({
      input: { key: 'AUTH_COOKIE_SESSIONS_ENABLED' },
    }).catch(() => {});
  });

  it('should reject an unauthenticated sessions listing', async () => {
    const response = await postMetadataOperationWithHeaders(
      currentUserSessionsQueryFactory(),
      { originHeader: ALLOWED_ORIGIN },
    );

    expect(response.body.errors).toBeDefined();
  });

  it("should refuse to revoke another user's session", async () => {
    // Default token authenticates Jane, a different seeded user than Tim.
    const response = await makeMetadataAPIRequest(
      revokeUserSessionQueryFactory({ userSessionId: timSessionId }),
    ).expect(200);

    expect(response.body.errors).toBeDefined();

    const sessionRow = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).findOneBy({ id: timSessionId });

    expect(sessionRow?.revokedAt).toBeNull();
  });
});
