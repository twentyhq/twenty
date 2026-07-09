import crypto from 'crypto';

import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { type DataSource } from 'typeorm';

// Reproduces the conflict between marketplace catalog sync (npm) and CLI dev
// mode (local) on the shared applicationRegistration table:
// 1. Catalog sync creates an unowned npm registration for a published app.
// 2. A dev running `twenty app dev` against this instance follows the
//    ensureAppRegistration flow: create -> ALREADY_CLAIMED -> rotate secret,
//    and the rotation fails because the workspace does not own the
//    registration.
// 3. Even after claiming ownership, dev sync flips the instance-global
//    registration to sourceType=local, which removes the app from the
//    marketplace catalog for every workspace and invalidates the published
//    app's OAuth client secret.
describe('Catalog-synced app vs CLI dev mode (reproduction)', () => {
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

  beforeAll(async () => {
    jest.useRealTimers();
    ds = global.testDataSource;

    // Simulate MarketplaceCatalogSyncService.upsertFromCatalog: an npm app
    // published on the registry lands on this instance as an unowned
    // registration (workspaceId is NULL).
    await ds.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId",
         "oAuthClientSecretHash", "oAuthRedirectUris", "oAuthScopes",
         "workspaceId", "sourceType", "sourcePackage",
         "latestAvailableVersion", "isListed")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, 'npm', $8, '1.0.0', true)`,
      [
        registrationId,
        universalIdentifier,
        'Published Catalog App',
        oAuthClientId,
        'published-app-secret-hash',
        [],
        [],
        '@test/published-catalog-app',
      ],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: universalIdentifier,
    });
    jest.useFakeTimers();
  });

  it('step 1: CLI createApplicationRegistration fails with UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED', async () => {
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

  it('step 2: CLI fallback rotateApplicationRegistrationClientSecret fails because the workspace is not the owner', async () => {
    const res = await gqlRequest(
      `mutation RotateSecret($id: String!) {
        rotateApplicationRegistrationClientSecret(id: $id) {
          clientSecret
        }
      }`,
      { id: registrationId },
    ).expect(200);

    // This is the "rotate secret error" the dev hits: the registration exists
    // (found by universalIdentifier) but rotateClientSecret scopes the lookup
    // to the calling workspace, which does not own the catalog-synced row.
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toContain('not found');
  });

  it('step 3: after claiming ownership, rotating succeeds but invalidates the published app secret instance-wide', async () => {
    const claimRes = await gqlRequest(
      `mutation Claim($applicationRegistrationId: String!) {
        claimApplicationRegistrationOwnership(applicationRegistrationId: $applicationRegistrationId) {
          id
          sourceType
        }
      }`,
      { applicationRegistrationId: registrationId },
    ).expect(200);

    expect(claimRes.body.errors).toBeUndefined();

    const rotateRes = await gqlRequest(
      `mutation RotateSecret($id: String!) {
        rotateApplicationRegistrationClientSecret(id: $id) {
          clientSecret
        }
      }`,
      { id: registrationId },
    ).expect(200);

    expect(rotateRes.body.errors).toBeUndefined();

    // The registration is shared by the whole instance: rotating replaced the
    // published app's real client secret, breaking OAuth for the publisher
    // and every other workspace using the app.
    const [row] = await ds.query(
      `SELECT "oAuthClientSecretHash" FROM core."applicationRegistration" WHERE id = $1`,
      [registrationId],
    );

    expect(row.oAuthClientSecretHash).not.toBe('published-app-secret-hash');
  });

  it('step 4: dev sync flips the shared registration to sourceType=local and removes the app from the instance catalog', async () => {
    const marketplaceBeforeRes = await gqlRequest(
      `query { findManyMarketplaceApps { id } }`,
    ).expect(200);

    const listedIdsBefore =
      marketplaceBeforeRes.body.data.findManyMarketplaceApps.map(
        (app: { id: string }) => app.id,
      );

    expect(listedIdsBefore).toContain(universalIdentifier);

    const createDevAppRes = await gqlRequest(
      `mutation CreateDevApp($universalIdentifier: String!, $name: String!) {
        createDevelopmentApplication(universalIdentifier: $universalIdentifier, name: $name) {
          id
        }
      }`,
      { universalIdentifier, name: 'Published Catalog App (dev)' },
    ).expect(200);

    expect(createDevAppRes.body.errors).toBeUndefined();

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

    const [row] = await ds.query(
      `SELECT "sourceType" FROM core."applicationRegistration" WHERE id = $1`,
      [registrationId],
    );

    // The npm registration has been converted to local for the whole
    // instance. From here on: the app disappears from the marketplace
    // (findManyListedCatalogCards filters sourceType=npm), installApplication
    // silently no-ops for every other workspace (LOCAL skip), upgrades are
    // rejected, and the next catalog sync cron will overwrite the row back to
    // npm, clobbering the dev manifest.
    expect(row.sourceType).toBe('local');

    const marketplaceRes = await gqlRequest(
      `query { findManyMarketplaceApps { id } }`,
    ).expect(200);

    expect(marketplaceRes.body.errors).toBeUndefined();

    const listedIds = marketplaceRes.body.data.findManyMarketplaceApps.map(
      (app: { id: string }) => app.id,
    );

    expect(listedIds).not.toContain(universalIdentifier);
  });
});
