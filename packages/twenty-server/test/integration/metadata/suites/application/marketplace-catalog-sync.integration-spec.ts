import crypto from 'crypto';

import request from 'supertest';
import { type DataSource } from 'typeorm';

const TEST_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const MARKETPLACE_QUERY = `
  query {
    findManyMarketplaceApps {
      id
      name
      description
      author
      sourcePackage
      category
      logo
      isFeatured
    }
  }
`;

const INSTALL_MUTATION = `
  mutation InstallMarketplaceApp($universalIdentifier: String!) {
    installMarketplaceApp(universalIdentifier: $universalIdentifier)
  }
`;

describe('Marketplace Catalog Sync (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let ds: DataSource;
  const createdRegistrationIds: string[] = [];

  beforeAll(() => {
    jest.useRealTimers();
    ds = global.testDataSource;
  });

  afterAll(async () => {
    for (const id of createdRegistrationIds) {
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE id = $1`,
        [id],
      );
    }
    jest.useFakeTimers();
  });

  const gqlRequest = (query: string, variables?: Record<string, unknown>) =>
    request(baseUrl)
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query, variables });

  const insertCatalogRegistration = async (params: {
    universalIdentifier: string;
    name: string;
    sourcePackage: string;
    latestAvailableVersion?: string;
    manifest?: Record<string, unknown>;
  }): Promise<string> => {
    const id = crypto.randomUUID();
    const oAuthClientId = crypto.randomUUID();

    await ds.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId",
         "oAuthRedirectUris", "oAuthScopes", "workspaceId",
         "sourceType", "sourcePackage", "latestAvailableVersion",
         "manifest", "isListed")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        params.universalIdentifier,
        params.name,
        oAuthClientId,
        [],
        [],
        TEST_WORKSPACE_ID,
        'npm',
        params.sourcePackage,
        params.latestAvailableVersion ?? '1.0.0',
        params.manifest ? JSON.stringify(params.manifest) : null,
        true,
      ],
    );

    createdRegistrationIds.push(id);

    return id;
  };

  describe('findManyMarketplaceApps', () => {
    const npmUid = crypto.randomUUID();
    const tarballUid = crypto.randomUUID();
    const curatedUid = 'a1b2c3d4-0000-0000-0000-000000000001';

    // Insert all data before queries so the in-memory cache is populated once
    // with complete data rather than being stale for later tests.
    beforeAll(async () => {
      await insertCatalogRegistration({
        universalIdentifier: npmUid,
        name: 'Test Catalog App',
        sourcePackage: '@test/catalog-app',
      });

      const tarballId = crypto.randomUUID();
      const oAuthClientId = crypto.randomUUID();

      await ds.query(
        `INSERT INTO core."applicationRegistration"
          (id, "universalIdentifier", name, "oAuthClientId",
           "oAuthRedirectUris", "oAuthScopes", "workspaceId",
           "sourceType")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          tarballId,
          tarballUid,
          'Tarball Only App',
          oAuthClientId,
          [],
          [],
          TEST_WORKSPACE_ID,
          'tarball',
        ],
      );

      createdRegistrationIds.push(tarballId);

      await insertCatalogRegistration({
        universalIdentifier: curatedUid,
        name: 'Data Enrichment',
        sourcePackage: '@twentyhq/app-data-enrichment',
        manifest: {
          application: {
            category: 'Data',
          },
        },
      });
    });

    it('should return npm-sourced registrations from the database', async () => {
      const res = await gqlRequest(MARKETPLACE_QUERY).expect(200);
      const apps = res.body.data.findManyMarketplaceApps;

      const testApp = apps.find((app: { id: string }) => app.id === npmUid);

      expect(testApp).toBeDefined();
      expect(testApp.name).toBe('Test Catalog App');
      expect(testApp.sourcePackage).toBe('@test/catalog-app');
    });

    it('should not return tarball-sourced registrations', async () => {
      const res = await gqlRequest(MARKETPLACE_QUERY).expect(200);
      const apps = res.body.data.findManyMarketplaceApps;

      const tarballApp = apps.find(
        (app: { id: string }) => app.id === tarballUid,
      );

      expect(tarballApp).toBeUndefined();
    });

    it('should enrich curated apps with rich display data', async () => {
      const res = await gqlRequest(MARKETPLACE_QUERY).expect(200);
      const apps = res.body.data.findManyMarketplaceApps;

      const curatedApp = apps.find(
        (app: { id: string }) => app.id === curatedUid,
      );

      expect(curatedApp).toBeDefined();
      expect(curatedApp.name).toBe('Data Enrichment');
      expect(curatedApp.category).toBe('Data');
    });
  });

  describe('installMarketplaceApp', () => {
    it('should fail if registration does not exist', async () => {
      const res = await gqlRequest(INSTALL_MUTATION, {
        universalIdentifier: crypto.randomUUID(),
      }).expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain(
        'No application registration found',
      );
    });
  });
});
