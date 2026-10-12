import crypto from 'crypto';

import gql from 'graphql-tag';
import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { type DataSource } from 'typeorm';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';

const START_PATH = '/application-registration-claim/github/start';
const CALLBACK_PATH = '/application-registration-claim/github/callback';
const WORKSPACE_ORIGIN = 'http://apple.localhost:3001';
const FRONT_ORIGIN = 'http://localhost:3001';
const PUBLISHER_ORG = 'publisher-org';
const PACKAGE_VERSION = '1.0.0';

const GITHUB_CLAIM_AUTHORIZATION_URL_QUERY = gql`
  query GithubClaimAuthorizationUrl($applicationRegistrationId: String!) {
    githubClaimAuthorizationUrl(
      applicationRegistrationId: $applicationRegistrationId
    )
  }
`;

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

  const mintClaimStartUrl = async (registrationId: string) => {
    const response = await makeMetadataApiRequest({
      query: GITHUB_CLAIM_AUTHORIZATION_URL_QUERY,
      variables: { applicationRegistrationId: registrationId },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.headers['set-cookie']).toBeUndefined();

    const claimStartUrl = new URL(
      response.body.data.githubClaimAuthorizationUrl,
    );

    expect(claimStartUrl.pathname).toBe(START_PATH);

    return claimStartUrl;
  };

  const postClaimStart = async (
    registrationId: string,
    origin: string | undefined,
  ) => {
    const claimStartUrl = await mintClaimStartUrl(registrationId);
    const pending = request(baseUrl)
      .post(START_PATH)
      .query({ token: claimStartUrl.searchParams.get('token') });

    if (origin !== undefined) {
      pending.set('Origin', origin);
    }

    return pending;
  };

  const startClaim = async (registrationId: string) => {
    const response = await postClaimStart(registrationId, WORKSPACE_ORIGIN);

    expect(response.status).toBe(302);

    const authorizationUrl = new URL(response.headers.location);
    const setCookie = response.headers['set-cookie'];

    expect(authorizationUrl.origin).toBe('https://github.com');
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
        const response = await postClaimStart(registrationId, WORKSPACE_ORIGIN);

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

  it('starts a claim from the instance front origin', async () => {
    const registrationId = await insertClaimableRegistration(
      dataSource,
      `@${PUBLISHER_ORG}/front-origin`,
    );

    const response = await postClaimStart(registrationId, FRONT_ORIGIN);

    expect(response.status).toBe(302);
    expect(new URL(response.headers.location).origin).toBe(
      'https://github.com',
    );
    expect(response.headers['set-cookie']).toBeDefined();
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

  it.each([
    ['a custom domain or any foreign site', 'https://crm.apple.example'],
    ['a client that sends no browser origin', undefined],
  ])('refuses to start a claim from %s', async (_description, origin) => {
    const registrationId = await insertClaimableRegistration(
      dataSource,
      `@${PUBLISHER_ORG}/origin-${crypto.randomUUID().slice(0, 8)}`,
    );

    const response = await postClaimStart(registrationId, origin);

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain(
      'claimErrorCode=CLAIM_ORIGIN_NOT_ALLOWED',
    );
    expect(response.headers['set-cookie']).toBeUndefined();
  });

  it('does not start a claim from a start url opened as a link', async () => {
    const registrationId = await insertClaimableRegistration(
      dataSource,
      `@${PUBLISHER_ORG}/start-as-link`,
    );
    const claimStartUrl = await mintClaimStartUrl(registrationId);

    const response = await request(baseUrl)
      .get(START_PATH)
      .query({ token: claimStartUrl.searchParams.get('token') })
      .set('Origin', WORKSPACE_ORIGIN);

    expect(response.status).not.toBe(302);
    expect(response.headers['set-cookie']).toBeUndefined();
  });
});
