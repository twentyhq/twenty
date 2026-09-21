import crypto from 'crypto';

import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { type DataSource } from 'typeorm';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('CLI dev mode on a registration owned by another workspace', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  const foreignWorkspaceId = SEED_YCOMBINATOR_WORKSPACE_ID;

  let ds: DataSource;

  const gqlRequest = (query: string, variables?: Record<string, unknown>) =>
    request(baseUrl)
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query, variables });

  const createDevelopmentApplication = (universalIdentifier: string) =>
    gqlRequest(
      `mutation CreateDevApp($universalIdentifier: String!, $name: String!) {
        createDevelopmentApplication(universalIdentifier: $universalIdentifier, name: $name) {
          id
        }
      }`,
      { universalIdentifier, name: 'Stolen App' },
    ).expect(200);

  const seedForeignRegistration = async ({
    universalIdentifier,
    isListed,
    isPreInstalled,
  }: {
    universalIdentifier: string;
    isListed: boolean;
    isPreInstalled: boolean;
  }) => {
    await ds.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris",
         "oAuthScopes", "workspaceId", "sourceType", "isListed", "isPreInstalled")
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'tarball', $8, $9)`,
      [
        crypto.randomUUID(),
        universalIdentifier,
        'Victim Internal App',
        crypto.randomUUID(),
        [],
        [],
        foreignWorkspaceId,
        isListed,
        isPreInstalled,
      ],
    );
  };

  beforeAll(() => {
    jest.useRealTimers();
    ds = global.testDataSource;
  });

  afterAll(() => {
    jest.useFakeTimers();
  });

  it.each([
    { label: 'unlisted', isListed: false, isPreInstalled: false },
    {
      label: 'listed on the marketplace',
      isListed: true,
      isPreInstalled: false,
    },
    {
      label: 'pre-installed by the operator',
      isListed: false,
      isPreInstalled: true,
    },
  ])(
    'refuses to create a development application on a $label foreign registration',
    async ({ isListed, isPreInstalled }) => {
      const universalIdentifier = crypto.randomUUID();

      await seedForeignRegistration({
        universalIdentifier,
        isListed,
        isPreInstalled,
      });

      try {
        const res = await createDevelopmentApplication(universalIdentifier);

        expect(res.body.errors).toBeDefined();
        expect(res.body.errors[0].message).toContain('another workspace');
        expect(res.body.data?.createDevelopmentApplication).toBeFalsy();
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: universalIdentifier,
        });
      }
    },
  );
});
