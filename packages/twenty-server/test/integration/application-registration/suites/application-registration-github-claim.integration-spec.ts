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

describe('Application registration GitHub claim (integration)', () => {
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

    expect(authorizationUrl.origin).toBe('https://github.com');

    return authorizationUrl.searchParams.get('state') as string;
  };

  const callback = (query: Record<string, string>) =>
    request(baseUrl).get(CALLBACK_PATH).query(query);

  it('claims the registration for the workspace that started the claim', async () => {
    const sourcePackage = `@${PUBLISHER_ORG}/happy-path`;
    const registrationId = await insertClaimableRegistration(
      dataSource,
      sourcePackage,
    );

    stubPublisherIsOrgAdmin(sourcePackage);

    const state = await startClaim(registrationId);
    const response = await callback({ code: 'github-code', state });

    expect(response.status).toBe(302);
    expect(response.headers.location).not.toContain('claimErrorCode');
    await expect(
      readOwnerWorkspaceId(dataSource, registrationId),
    ).resolves.toBe(SEED_APPLE_WORKSPACE_ID);
  });

  it('leaves the registration unowned when GitHub denies the authorization', async () => {
    const sourcePackage = `@${PUBLISHER_ORG}/denied`;
    const registrationId = await insertClaimableRegistration(
      dataSource,
      sourcePackage,
    );

    stubPublisherIsOrgAdmin(sourcePackage);

    const state = await startClaim(registrationId);
    const response = await callback({ error: 'access_denied', state });

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain(
      'claimErrorCode=GITHUB_AUTH_FAILED',
    );
    await expect(
      readOwnerWorkspaceId(dataSource, registrationId),
    ).resolves.toBeNull();
  });

  it('refuses to claim a registration that is already owned', async () => {
    const sourcePackage = `@${PUBLISHER_ORG}/already-owned`;
    const registrationId = await insertClaimableRegistration(
      dataSource,
      sourcePackage,
    );

    stubPublisherIsOrgAdmin(sourcePackage);

    const state = await startClaim(registrationId);

    await callback({ code: 'github-code', state });

    const response = await callback({ code: 'github-code', state });

    expect(response.headers.location).toContain(
      'claimErrorCode=APPLICATION_REGISTRATION_ALREADY_OWNED',
    );
    await expect(
      readOwnerWorkspaceId(dataSource, registrationId),
    ).resolves.toBe(SEED_APPLE_WORKSPACE_ID);
  });
});
