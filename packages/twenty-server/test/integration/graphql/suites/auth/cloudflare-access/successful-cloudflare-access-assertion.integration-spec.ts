import {
  type CloudflareAccessIssuer,
  startCloudflareAccessIssuer,
} from 'test/integration/graphql/suites/auth/cloudflare-access/utils/start-cloudflare-access-issuer.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { getYcombinatorAdminAccessToken } from 'test/integration/sso/utils/get-ycombinator-admin-access-token.util';
import { mockConfigVariables } from 'test/integration/utils/mock-config-variables.util';

import { CLOUDFLARE_ACCESS_ASSERTION_HEADER } from 'src/engine/core-modules/auth/cloudflare-access/constants/cloudflare-access-assertion-header.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

/* global APPLE_JANE_ADMIN_ACCESS_TOKEN */

const AUDIENCE = 'server-admin-audience';

describe('Requests allowed with Cloudflare Access in front of the server admin workspace', () => {
  let issuer: CloudflareAccessIssuer;
  let ycombinatorAccessToken: string;

  beforeAll(async () => {
    // Logged in before the restriction applies: the login helpers send the default Apple token.
    ycombinatorAccessToken = await getYcombinatorAdminAccessToken();
    issuer = await startCloudflareAccessIssuer();

    mockConfigVariables({
      SERVER_ADMIN_WORKSPACE_ID: SEED_APPLE_WORKSPACE_ID,
      CLOUDFLARE_ACCESS_ISSUER_URL: issuer.issuerUrl,
      CLOUDFLARE_ACCESS_SERVER_ADMIN_AUDIENCE: AUDIENCE,
      OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS: ['127.0.0.1'],
    });
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await issuer.stop();
  });

  it('should accept a request into the server admin workspace with an assertion issued to its user', async () => {
    const { data, errors } = await getCurrentUser({
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
      expectToFail: false,
      headers: {
        [CLOUDFLARE_ACCESS_ASSERTION_HEADER]: issuer.signAssertion({
          email: 'Jane.Austen@Apple.dev',
          audience: AUDIENCE,
        }),
      },
    });

    expect(errors).toBeUndefined();
    expect(data.currentUser.id).toBe(USER_DATA_SEED_IDS.JANE);
  });

  it('should not require an assertion in another workspace', async () => {
    const { data, errors } = await getCurrentUser({
      accessToken: ycombinatorAccessToken,
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data.currentUser.id).toBe(USER_DATA_SEED_IDS.TIM);
  });
});
