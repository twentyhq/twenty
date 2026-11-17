import type request from 'supertest';
import { buildAppleHttpOrigin } from 'test/integration/graphql/suites/auth/cookie-session/utils/build-apple-http-origin.util';
import { SESSION_COOKIE_OPT_IN_HEADER_NAME } from 'twenty-shared/constants';

// Without a Host matching the apple subdomain the server sees a cross-origin request and refuses the cookie.
export const asWorkspaceRequest = (
  agent: request.Test,
  originOverride?: string,
): request.Test => {
  const origin = buildAppleHttpOrigin();

  return agent
    .set('Host', new URL(origin).host)
    .set('Origin', originOverride ?? origin)
    .set(SESSION_COOKIE_OPT_IN_HEADER_NAME, '1');
};
