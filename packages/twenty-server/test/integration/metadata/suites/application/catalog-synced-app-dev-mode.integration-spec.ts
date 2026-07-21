import crypto from 'crypto';

import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { type DataSource } from 'typeorm';

// A published npm app lands on an instance through the marketplace catalog
// sync as an instance-global, unowned registration (sourceType 'npm'). A dev
// iterating locally on that app with `twenty app dev` must be able to sync it
// into their own workspace without claiming ownership, without rotating the
// shared OAuth client secret, and without mutating the shared registration
// (which would delist the app from the marketplace for every workspace and
// fight with the catalog sync cron).
describe('CLI dev mode on a catalog-synced (npm) app', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  const universalIdentifier = crypto.randomUUID();
  const roleId = crypto.randomUUID();
  const registrationId = crypto.randomUUID();
  const oAuthClientId = crypto.randomUUID();

  let ds: DataSource;

  const gqlRequest = (query: string, variables?: Record<string, unknown>) =>
    request(baseUrl)
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send({ query, variables });

  const fetchRegistrationRow = async () => {
    const [row] = await ds.query(
      `SELECT name, "sourceType", "workspaceId", "manifest", "isListed"
       FROM core."applicationRegistration" WHERE id = $1`,
      [registrationId],
    );

    return row;
  };

  beforeAll(async () => {
    jest.useRealTimers();
    ds = global.testDataSource;

    // Simulate MarketplaceCatalogSyncService.upsertFromCatalog: unowned
    // registration (workspaceId NULL), npm-sourced, no client secret.
    await ds.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId",
         "oAuthRedirectUris", "oAuthScopes", "workspaceId", "sourceType",
         "sourcePackage", "latestAvailableVersion", "isListed", "manifest")
       VALUES ($1, $2, $3, $4, $5, $6, NULL, 'npm', $7, '1.0.0', true, $8)`,
      [
        registrationId,
        universalIdentifier,
        'Published Catalog App',
        oAuthClientId,
        [],
        [],
        '@test/published-catalog-app',
        JSON.stringify({ application: { universalIdentifier } }),
      ],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: universalIdentifier,
    });
    jest.useFakeTimers();
  });

  it('reports the universal identifier as already claimed on createApplicationRegistration', async () => {
    const res = await gqlRequest(
      `mutation CreateApplicationRegistration($input: CreateApplicationRegistrationInput!) {
        createApplicationRegistration(input: $input) {
          applicationRegistration { id }
          clientSecret
        }
      }`,
      {
        input: {
          name: 'Published Catalog App (dev)',
          universalIdentifier,
        },
      },
    ).expect(200);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toContain('already claimed');
  });

  it('refuses to rotate the shared client secret for a non-owner workspace', async () => {
    const res = await gqlRequest(
      `mutation RotateSecret($id: String!) {
        rotateApplicationRegistrationClientSecret(id: $id) {
          clientSecret
        }
      }`,
      { id: registrationId },
    ).expect(200);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toContain('not found');
  });

  it('lets a workspace dev-sync the app and mint a dev token without claiming ownership or touching the shared registration', async () => {
    const createDevAppRes = await gqlRequest(
      `mutation CreateDevApp($universalIdentifier: String!, $name: String!) {
        createDevelopmentApplication(universalIdentifier: $universalIdentifier, name: $name) {
          id
        }
      }`,
      { universalIdentifier, name: 'Published Catalog App (dev)' },
    ).expect(200);

    expect(createDevAppRes.body.errors).toBeUndefined();

    const applicationId = createDevAppRes.body.data.createDevelopmentApplication
      .id as string;

    // The CLI uploads the app's package.json before syncing the manifest.
    await uploadApplicationFile({
      applicationUniversalIdentifier: universalIdentifier,
      fileFolder: 'Dependencies',
      filePath: 'package.json',
      fileBuffer: Buffer.from(
        JSON.stringify({ name: 'published-catalog-app', version: '1.0.1' }),
      ),
      filename: 'package.json',
      expectToFail: false,
    });

    const syncRes = await syncApplication({
      manifest: buildBaseManifest({
        appId: universalIdentifier,
        roleId,
        overrides: {
          application: {
            universalIdentifier,
            defaultRoleUniversalIdentifier: roleId,
            displayName: 'Published Catalog App (dev)',
            description: 'Local dev iteration of a published app',
            applicationVariables: {},
            packageJsonChecksum: null,
            yarnLockChecksum: null,
          },
        },
      }),
      expectToFail: false,
    });

    expect(syncRes.errors).toBeUndefined();

    // The shared registration is untouched: still npm-sourced, unowned,
    // listed in the marketplace catalog, and carrying the published name and
    // manifest.
    const registrationRow = await fetchRegistrationRow();

    expect(registrationRow.sourceType).toBe('npm');
    expect(registrationRow.workspaceId).toBeNull();
    expect(registrationRow.name).toBe('Published Catalog App');
    expect(registrationRow.isListed).toBe(true);
    expect(registrationRow.manifest).toEqual({
      application: { universalIdentifier },
    });

    // Dev tooling gets a workspace-scoped app token via
    // generateApplicationToken instead of rotating the shared client secret.
    const tokenRes = await gqlRequest(
      `mutation GenerateApplicationToken($applicationId: UUID!) {
        generateApplicationToken(applicationId: $applicationId) {
          applicationAccessToken { token expiresAt }
          applicationRefreshToken { token expiresAt }
        }
      }`,
      { applicationId },
    ).expect(200);

    expect(tokenRes.body.errors).toBeUndefined();
    expect(
      tokenRes.body.data.generateApplicationToken.applicationAccessToken.token,
    ).toBeDefined();
  });

  it('still lets a workspace that owns a non-npm registration sync its metadata', async () => {
    // Control: a local registration owned by the workspace keeps receiving
    // manifest updates from dev sync (the guard only protects npm/unowned
    // registrations).
    const ownedUid = crypto.randomUUID();
    const ownedRoleId = crypto.randomUUID();

    const createRes = await gqlRequest(
      `mutation CreateApplicationRegistration($input: CreateApplicationRegistrationInput!) {
        createApplicationRegistration(input: $input) {
          applicationRegistration { id }
        }
      }`,
      { input: { name: 'Owned Local App', universalIdentifier: ownedUid } },
    ).expect(200);

    expect(createRes.body.errors).toBeUndefined();

    const ownedRegistrationId =
      createRes.body.data.createApplicationRegistration.applicationRegistration
        .id;

    try {
      const createDevAppRes = await gqlRequest(
        `mutation CreateDevApp($universalIdentifier: String!, $name: String!) {
          createDevelopmentApplication(universalIdentifier: $universalIdentifier, name: $name) {
            id
          }
        }`,
        { universalIdentifier: ownedUid, name: 'Owned Local App' },
      ).expect(200);

      expect(createDevAppRes.body.errors).toBeUndefined();

      await uploadApplicationFile({
        applicationUniversalIdentifier: ownedUid,
        fileFolder: 'Dependencies',
        filePath: 'package.json',
        fileBuffer: Buffer.from(
          JSON.stringify({ name: 'owned-local-app', version: '0.0.1' }),
        ),
        filename: 'package.json',
        expectToFail: false,
      });

      const syncRes = await syncApplication({
        manifest: buildBaseManifest({
          appId: ownedUid,
          roleId: ownedRoleId,
          overrides: {
            application: {
              universalIdentifier: ownedUid,
              defaultRoleUniversalIdentifier: ownedRoleId,
              displayName: 'Owned Local App (renamed)',
              description: 'Owned local app',
              applicationVariables: {},
              packageJsonChecksum: null,
              yarnLockChecksum: null,
            },
            roles: [
              {
                universalIdentifier: ownedRoleId,
                label: 'Owned Local App Role',
                description: 'A test role',
              },
            ],
          },
        }),
        expectToFail: false,
      });

      expect(syncRes.errors).toBeUndefined();

      const [row] = await ds.query(
        `SELECT name, "sourceType" FROM core."applicationRegistration" WHERE id = $1`,
        [ownedRegistrationId],
      );

      expect(row.name).toBe('Owned Local App (renamed)');
      expect(row.sourceType).toBe('local');
    } finally {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: ownedUid,
      });
    }
  });
});
