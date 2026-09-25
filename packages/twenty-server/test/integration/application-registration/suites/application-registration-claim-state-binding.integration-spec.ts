import crypto from 'crypto';

import gql from 'graphql-tag';
import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { type DataSource } from 'typeorm';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';

const CALLBACK_PATH = '/application-registration-claim/github/callback';
const PUBLISHER_ORG = 'publisher-org';
const PACKAGE_VERSION = '1.0.0';

const provenanceAttestations = (repository: string) => ({
  attestations: [
    {
      predicateType: 'https://slsa.dev/provenance/v1',
      bundle: {
        dsseEnvelope: {
          payload: Buffer.from(
            JSON.stringify({
              predicate: {
                buildDefinition: {
                  externalParameters: { workflow: { repository } },
                },
              },
            }),
          ).toString('base64'),
        },
      },
    },
  ],
});

const insertClaimableRegistration = async (
  dataSource: DataSource,
  sourcePackage: string,
): Promise<string> => {
  const id = crypto.randomUUID();

  await dataSource.query(
    `INSERT INTO core."applicationRegistration"
      (id, "universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris", "oAuthScopes",
       "sourceType", "sourcePackage", "latestAvailableVersion", "workspaceId")
     VALUES ($1, $2, $3, $4, '{}', '{}', 'npm', $5, $6, NULL)`,
    [
      id,
      crypto.randomUUID(),
      `claim-target-${id.slice(0, 8)}`,
      crypto.randomUUID(),
      sourcePackage,
      PACKAGE_VERSION,
    ],
  );

  return id;
};

const readOwnerWorkspaceId = async (
  dataSource: DataSource,
  registrationId: string,
): Promise<string | null> => {
  const [row] = await dataSource.query(
    'SELECT "workspaceId" FROM core."applicationRegistration" WHERE id = $1',
    [registrationId],
  );

  return row?.workspaceId ?? null;
};

describe('Application registration claim state binding (integration)', () => {
  const httpMock = setupHttpMock();

  const baseUrl = `http://localhost:${APP_PORT}`;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = global.testDataSource;

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

  const stubPublisherIsOrgAdmin = (sourcePackage: string) => {
    const encodedName = sourcePackage.replace(/\//g, '%2F');

    httpMock.use(
      http.get(
        `https://registry.npmjs.org/-/npm/v1/attestations/${encodedName}@${PACKAGE_VERSION}`,
        () =>
          HttpResponse.json(
            provenanceAttestations(`https://github.com/${PUBLISHER_ORG}/app`),
          ),
      ),
      http.post('https://github.com/login/oauth/access_token', () =>
        HttpResponse.json({ access_token: 'github-token' }),
      ),
      http.get('https://api.github.com/user', () =>
        HttpResponse.json({ login: 'publisher-maintainer' }),
      ),
      http.get(
        `https://api.github.com/user/memberships/orgs/${PUBLISHER_ORG}`,
        () => HttpResponse.json({ state: 'active', role: 'admin' }),
      ),
    );
  };

  // Mints an authorization url the way the settings page does, and returns the
  // state GitHub will echo back plus the nonce cookie the browser receives.
  const startClaim = async (registrationId: string) => {
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

    const authorizationUrl = new URL(
      response.body.data.githubClaimAuthorizationUrl,
    );
    const setCookie = response.headers['set-cookie'];

    expect(setCookie).toBeDefined();

    return {
      state: authorizationUrl.searchParams.get('state') as string,
      cookie: (setCookie as unknown as string[])[0].split(';')[0],
    };
  };

  const callback = (params: { state: string; cookie?: string }) => {
    const pending = request(baseUrl)
      .get(CALLBACK_PATH)
      .query({ code: 'github-code', state: params.state });

    if (params.cookie !== undefined) {
      pending.set('Cookie', params.cookie);
    }

    return pending;
  };

  // A strict cookie is withheld on GitHub's cross-site redirect back to the
  // callback, which would fail every claim on instances configured that way.
  it.each(['strict', 'lax', 'none'] as const)(
    'never issues the nonce cookie as SameSite=strict when AUTH_COOKIE_SAME_SITE is %s',
    async (sameSite) => {
      const registrationId = await insertClaimableRegistration(
        dataSource,
        `@${PUBLISHER_ORG}/same-site-${sameSite}`,
      );

      await updateConfigVariable({
        input: { key: 'AUTH_COOKIE_SAME_SITE', value: sameSite },
      });

      try {
        const response = await makeMetadataApiRequest({
          query: gql`
            query GithubClaimAuthorizationUrl(
              $applicationRegistrationId: String!
            ) {
              githubClaimAuthorizationUrl(
                applicationRegistrationId: $applicationRegistrationId
              )
            }
          `,
          variables: { applicationRegistrationId: registrationId },
        });

        const [claimCookie] = response.headers[
          'set-cookie'
        ] as unknown as string[];

        expect(claimCookie.toLowerCase()).not.toContain('samesite=strict');
        expect(claimCookie.toLowerCase()).toContain(
          sameSite === 'none' ? 'samesite=none' : 'samesite=lax',
        );
      } finally {
        await updateConfigVariable({
          input: { key: 'AUTH_COOKIE_SAME_SITE', value: 'lax' },
        });
      }
    },
  );

  it('claims the registration for the browser that started the claim', async () => {
    const sourcePackage = `@${PUBLISHER_ORG}/happy-path`;
    const registrationId = await insertClaimableRegistration(
      dataSource,
      sourcePackage,
    );

    stubPublisherIsOrgAdmin(sourcePackage);

    const { state, cookie } = await startClaim(registrationId);
    const response = await callback({ state, cookie });

    expect(response.status).toBe(302);
    expect(response.headers.location).not.toContain('claimErrorCode');
    await expect(
      readOwnerWorkspaceId(dataSource, registrationId),
    ).resolves.toBe(SEED_APPLE_WORKSPACE_ID);
  });

  it('rejects a forwarded authorization url opened in another browser', async () => {
    const sourcePackage = `@${PUBLISHER_ORG}/forwarded`;
    const registrationId = await insertClaimableRegistration(
      dataSource,
      sourcePackage,
    );

    stubPublisherIsOrgAdmin(sourcePackage);

    // The url is forwarded to the publisher, whose browser never received the
    // nonce cookie, so the claim must not land in the sender's workspace.
    const { state } = await startClaim(registrationId);
    const response = await callback({ state });

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain(
      'claimErrorCode=CLAIM_STATE_MISMATCH',
    );
    await expect(
      readOwnerWorkspaceId(dataSource, registrationId),
    ).resolves.toBeNull();
  });

  it('rejects a nonce minted for another claim', async () => {
    const sourcePackage = `@${PUBLISHER_ORG}/other-claim`;
    const registrationId = await insertClaimableRegistration(
      dataSource,
      sourcePackage,
    );
    const otherRegistrationId = await insertClaimableRegistration(
      dataSource,
      `@${PUBLISHER_ORG}/other-claim-source`,
    );

    stubPublisherIsOrgAdmin(sourcePackage);

    const { state } = await startClaim(registrationId);
    const { cookie: otherCookie } = await startClaim(otherRegistrationId);

    const response = await callback({ state, cookie: otherCookie });

    expect(response.headers.location).toContain(
      'claimErrorCode=CLAIM_STATE_MISMATCH',
    );
    await expect(
      readOwnerWorkspaceId(dataSource, registrationId),
    ).resolves.toBeNull();
  });

  it('leaves a pending claim alone when the callback is hit with unrelated state', async () => {
    const sourcePackage = `@${PUBLISHER_ORG}/not-cleared`;
    const registrationId = await insertClaimableRegistration(
      dataSource,
      sourcePackage,
    );

    stubPublisherIsOrgAdmin(sourcePackage);

    const { state, cookie } = await startClaim(registrationId);

    // An unrelated page navigates the browser to the public callback first.
    await callback({ state: 'not-a-signed-state', cookie });

    const response = await callback({ state, cookie });

    expect(response.headers.location).not.toContain('claimErrorCode');
    await expect(
      readOwnerWorkspaceId(dataSource, registrationId),
    ).resolves.toBe(SEED_APPLE_WORKSPACE_ID);
  });
});
