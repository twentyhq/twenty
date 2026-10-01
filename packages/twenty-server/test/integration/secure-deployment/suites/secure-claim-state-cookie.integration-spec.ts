import crypto from 'crypto';

import gql from 'graphql-tag';
import request from 'supertest';
import { type DataSource } from 'typeorm';

import {
  getApplicationRegistrationClaimStateCookieName,
  getApplicationRegistrationClaimStateSecureCookieName,
} from 'src/engine/core-modules/application/application-registration/constants/application-registration-claim-state-cookie-name.constant';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { IS_SECURE_DEPLOYMENT } from 'test/integration/graphql/suites/auth/user-sessions/constants/is-secure-deployment.constant';

// The secure/insecure cookie branch is decided by configuration, never by the
// transport: isSecureCookieDeployment() reads SERVER_URL, which is env-only.
// Run through `nx run twenty-server:test:integration:secure`.
describe('claim state cookie on a production-like secure deployment (integration)', () => {
  let registrationId: string;

  beforeAll(async () => {
    if (!IS_SECURE_DEPLOYMENT) {
      throw new Error(
        'This suite requires an https SERVER_URL; run it via nx run twenty-server:test:integration:secure',
      );
    }

    const dataSource: DataSource = global.testDataSource;

    registrationId = crypto.randomUUID();

    await dataSource.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris", "oAuthScopes",
         "sourceType", "sourcePackage", "latestAvailableVersion", "workspaceId")
       VALUES ($1, $2, 'secure-claim-target', $3, '{}', '{}', 'npm', $4, '1.0.0', NULL)`,
      [
        registrationId,
        crypto.randomUUID(),
        crypto.randomUUID(),
        `@publisher-org/secure-${registrationId.slice(0, 8)}`,
      ],
    );

    await updateConfigVariable({
      input: { key: 'APP_CLAIM_GITHUB_CLIENT_ID', value: 'test-client-id' },
    });
    await updateConfigVariable({
      input: {
        key: 'APP_CLAIM_GITHUB_CLIENT_SECRET',
        value: 'test-client-secret',
      },
    });
  });

  const startClaim = async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        query GithubClaimAuthorizationUrl($applicationRegistrationId: String!) {
          githubClaimAuthorizationUrl(
            applicationRegistrationId: $applicationRegistrationId
          )
        }
      `,
      variables: { applicationRegistrationId: registrationId },
    });

    expect(response.body.errors).toBeUndefined();

    const [claimCookie] = response.headers['set-cookie'] as unknown as string[];

    return {
      claimCookie,
      nonce: claimCookie.split(';')[0].split('=')[1],
      state: new URL(
        response.body.data.githubClaimAuthorizationUrl,
      ).searchParams.get('state') as string,
    };
  };

  it('should deliver the production cookie: __Host- name, Secure, SameSite=Lax', async () => {
    const response = await makeMetadataApiRequest({
      query: gql`
        query GithubClaimAuthorizationUrl($applicationRegistrationId: String!) {
          githubClaimAuthorizationUrl(
            applicationRegistrationId: $applicationRegistrationId
          )
        }
      `,
      variables: { applicationRegistrationId: registrationId },
    });

    expect(response.body.errors).toBeUndefined();

    const [claimCookie] = response.headers['set-cookie'] as unknown as string[];

    expect(claimCookie).toContain(
      `${getApplicationRegistrationClaimStateSecureCookieName(registrationId)}=`,
    );
    expect(claimCookie).toContain('Secure');
    expect(claimCookie).toContain('HttpOnly');
    expect(claimCookie.toLowerCase()).toContain('samesite=lax');
  });

  // A sibling subdomain can set a cookie under the plain name but never under
  // __Host-, so the plain name must not be honoured on an https deployment.
  it('should ignore a nonce planted under the plain cookie name', async () => {
    const { state, nonce } = await startClaim();

    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/application-registration-claim/github/callback')
      .query({ code: 'github-code', state })
      .set(
        'Cookie',
        `${getApplicationRegistrationClaimStateCookieName(registrationId)}=${nonce}`,
      );

    expect(response.headers.location).toContain(
      'claimErrorCode=CLAIM_STATE_MISMATCH',
    );
  });
});
