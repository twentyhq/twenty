import crypto from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import request from 'supertest';
import * as tar from 'tar';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { type DataSource } from 'typeorm';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

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
      isVetted
    }
  }
`;

const INSTALL_MUTATION = `
  mutation InstallApplication($universalIdentifier: String!) {
    installApplication(universalIdentifier: $universalIdentifier) {
      id
    }
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
    category?: string;
  }): Promise<string> => {
    const id = crypto.randomUUID();
    const oAuthClientId = crypto.randomUUID();

    await ds.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId",
         "oAuthRedirectUris", "oAuthScopes", "workspaceId",
         "sourceType", "sourcePackage", "latestAvailableVersion",
         "manifest", "isListed", "category")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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
        params.category ?? null,
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
        category: 'Data',
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

  describe('installApplication', () => {
    it('should fail if registration does not exist', async () => {
      const res = await gqlRequest(INSTALL_MUTATION, {
        universalIdentifier: crypto.randomUUID(),
      }).expect(200);

      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toContain(
        'No application registration found',
      );
    });

    it('should install a tarball app and return the application id', async () => {
      const universalIdentifier = crypto.randomUUID();
      const roleId = crypto.randomUUID();

      const manifest = JSON.stringify({
        application: {
          universalIdentifier,
          displayName: 'Install Test App',
          description: 'App for testing installApplication',
          icon: 'IconTestPipe',
          defaultRoleUniversalIdentifier: roleId,
          applicationVariables: {},
          packageJsonChecksum: null,
          yarnLockChecksum: null,
        },
        roles: [
          {
            universalIdentifier: roleId,
            label: 'Default Role',
            description: 'Default role',
          },
        ],
        skills: [],
        agents: [],
        objects: [],
        fields: [],
        logicFunctions: [],
        frontComponents: [],
        publicAssets: [],
        views: [],
        navigationMenuItems: [],
        pageLayouts: [],
        pageLayoutTabs: [],
        commandMenuItems: [],
      });

      const packageJson = JSON.stringify({
        name: 'test-install-app',
        version: '1.0.0',
      });

      const tempId = crypto.randomUUID();
      const sourceDir = join(tmpdir(), `test-tarball-src-${tempId}`);
      const tarballPath = join(tmpdir(), `test-tarball-${tempId}.tar.gz`);

      await fs.mkdir(sourceDir, { recursive: true });
      await fs.writeFile(join(sourceDir, 'manifest.json'), manifest);
      await fs.writeFile(join(sourceDir, 'package.json'), packageJson);

      await tar.create({ file: tarballPath, gzip: true, cwd: sourceDir }, [
        'manifest.json',
        'package.json',
      ]);

      const tarballBuffer = await fs.readFile(tarballPath);

      await fs.rm(sourceDir, { recursive: true, force: true });
      await fs.rm(tarballPath, { force: true });

      const UPLOAD_MUTATION = `
        mutation UploadAppTarball($file: Upload!, $universalIdentifier: String) {
          uploadAppTarball(file: $file, universalIdentifier: $universalIdentifier) {
            id
            universalIdentifier
            name
          }
        }
      `;

      const uploadRes = await request(baseUrl)
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .field(
          'operations',
          JSON.stringify({
            query: UPLOAD_MUTATION,
            variables: { file: null, universalIdentifier },
          }),
        )
        .field('map', JSON.stringify({ '0': ['variables.file'] }))
        .attach('0', tarballBuffer, 'app.tar.gz')
        .expect(200);

      expect(uploadRes.body.errors).toBeUndefined();
      expect(uploadRes.body.data.uploadAppTarball.id).toBeDefined();

      try {
        const installRes = await gqlRequest(INSTALL_MUTATION, {
          universalIdentifier,
        }).expect(200);

        expect(installRes.body.errors).toBeUndefined();
        expect(installRes.body.data.installApplication).toBeDefined();
        expect(installRes.body.data.installApplication.id).toBeDefined();
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: universalIdentifier,
        });
      }
    }, 120000);
  });
});
