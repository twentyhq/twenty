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
      icon
      version
      category
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
  }): Promise<string> => {
    const id = crypto.randomUUID();
    const oAuthClientId = crypto.randomUUID();

    await ds.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId",
         "oAuthRedirectUris", "oAuthScopes", "workspaceId",
         "sourceType", "sourcePackage", "latestAvailableVersion")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
      ],
    );

    createdRegistrationIds.push(id);

    return id;
  };

  describe('findManyMarketplaceApps', () => {
    it('should return npm-sourced registrations from the database', async () => {
      const uid = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier: uid,
        name: 'Test Catalog App',
        sourcePackage: '@test/catalog-app',
      });

      const res = await gqlRequest(MARKETPLACE_QUERY).expect(200);
      const apps = res.body.data.findManyMarketplaceApps;

      const testApp = apps.find(
        (app: { id: string }) => app.id === uid,
      );

      expect(testApp).toBeDefined();
      expect(testApp.name).toBe('Test Catalog App');
      expect(testApp.sourcePackage).toBe('@test/catalog-app');
    });

    it('should not return tarball-sourced registrations', async () => {
      const uid = crypto.randomUUID();
      const id = crypto.randomUUID();
      const oAuthClientId = crypto.randomUUID();

      await ds.query(
        `INSERT INTO core."applicationRegistration"
          (id, "universalIdentifier", name, "oAuthClientId",
           "oAuthRedirectUris", "oAuthScopes", "workspaceId",
           "sourceType")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          uid,
          'Tarball Only App',
          oAuthClientId,
          [],
          [],
          TEST_WORKSPACE_ID,
          'tarball',
        ],
      );

      createdRegistrationIds.push(id);

      const res = await gqlRequest(MARKETPLACE_QUERY).expect(200);
      const apps = res.body.data.findManyMarketplaceApps;

      const tarballApp = apps.find(
        (app: { id: string }) => app.id === uid,
      );

      expect(tarballApp).toBeUndefined();
    });

    it('should enrich curated apps with rich display data', async () => {
      // The curated index has a Data Enrichment entry with identifier
      // a1b2c3d4-0000-0000-0000-000000000001 — create a matching registration
      const curatedUid = 'a1b2c3d4-0000-0000-0000-000000000001';

      await insertCatalogRegistration({
        universalIdentifier: curatedUid,
        name: 'Data Enrichment',
        sourcePackage: '@twentyhq/app-data-enrichment',
      });

      const res = await gqlRequest(MARKETPLACE_QUERY).expect(200);
      const apps = res.body.data.findManyMarketplaceApps;

      const curatedApp = apps.find(
        (app: { id: string }) => app.id === curatedUid,
      );

      expect(curatedApp).toBeDefined();
      expect(curatedApp.name).toBe('Data Enrichment');
      expect(curatedApp.category).toBe('Data');
      expect(curatedApp.icon).toBe('IconSparkles');
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
