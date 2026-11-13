import crypto from 'crypto';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { currentUserApplicationAuthorizationsMarketplaceAppQuery } from 'test/integration/metadata/suites/application/utils/current-user-application-authorizations-marketplace-app-query.util';
import { findManyMarketplaceAppsConnectUrlQuery } from 'test/integration/metadata/suites/application/utils/find-many-marketplace-apps-connect-url-query.util';
import { findMarketplaceAppDetailConnectUrlQuery } from 'test/integration/metadata/suites/application/utils/find-marketplace-app-detail-connect-url-query.util';
import { insertCatalogApplicationRegistration } from 'test/integration/metadata/suites/application/utils/insert-catalog-application-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type DataSource } from 'typeorm';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { MARKETPLACE_CATALOG_CACHE_ENTITY_ID } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-apps-cache.constant';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CONNECT_URL = 'https://client.example.com/connect?server={mcpServerUrl}';

describe('Marketplace application that declares an OAuth client', () => {
  const marketplaceAppUniversalIdentifier = crypto.randomUUID();
  const marketplaceAppRegistrationId = crypto.randomUUID();
  const clientRegistrationId = crypto.randomUUID();
  const developedApplicationUniversalIdentifier = crypto.randomUUID();
  const clientApplicationId = crypto.randomUUID();
  const clientIdMetadataDocumentUrl = `https://client.example.com/oauth/${crypto.randomUUID()}.json`;

  let dataSource: DataSource;

  const invalidateMarketplaceCatalog = () =>
    getAppProviderByClassName<CoreEntityCacheService>(
      'CoreEntityCacheService',
    ).invalidate('marketplaceCatalog', MARKETPLACE_CATALOG_CACHE_ENTITY_ID);

  const setMarketplaceAppListed = async (isListed: boolean) => {
    await dataSource.query(
      `UPDATE core."applicationRegistration" SET "isListed" = $1 WHERE id = $2`,
      [isListed, marketplaceAppRegistrationId],
    );
    await invalidateMarketplaceCatalog();
  };

  const findConnectionMarketplaceAppUniversalIdentifier = async () => {
    const response = await makeMetadataApiRequest({
      query: currentUserApplicationAuthorizationsMarketplaceAppQuery,
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.currentUserApplicationAuthorizations.find(
      (authorization: { applicationId: string }) =>
        authorization.applicationId === clientApplicationId,
    )?.marketplaceAppUniversalIdentifier;
  };

  beforeAll(async () => {
    dataSource = global.testDataSource;

    await dataSource.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris",
         "oAuthScopes", "workspaceId", "sourceType", "sourcePackage",
         "latestAvailableVersion", "isListed", "manifest")
       VALUES ($1, $2, $3, $4, $5, $6, NULL, 'npm', $7, '1.0.0', true, $8)`,
      [
        marketplaceAppRegistrationId,
        marketplaceAppUniversalIdentifier,
        'OAuth Client Marketplace App',
        crypto.randomUUID(),
        [],
        [],
        '@test/oauth-client-marketplace-app',
        JSON.stringify({
          application: {
            universalIdentifier: marketplaceAppUniversalIdentifier,
            oAuthClient: {
              clientIdMetadataDocumentUrls: [clientIdMetadataDocumentUrl],
              connectUrl: CONNECT_URL,
            },
          },
        }),
      ],
    );

    await dataSource.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId", "oAuthRedirectUris",
         "oAuthScopes", "workspaceId", "sourceType")
       VALUES ($1, $2, $3, $4, $5, $6, NULL, 'oauth-only')`,
      [
        clientRegistrationId,
        crypto.randomUUID(),
        'OAuth Client',
        clientIdMetadataDocumentUrl,
        ['https://client.example.com/callback'],
        ['api'],
      ],
    );

    await dataSource.query(
      `INSERT INTO core."application"
        (id, "universalIdentifier", name, "workspaceId",
         "applicationRegistrationId", "sourceType", "sourcePath",
         "canBeUninstalled")
       VALUES ($1, $2, $3, $4, $5, 'local', '', true)`,
      [
        clientApplicationId,
        crypto.randomUUID(),
        'OAuth Client',
        SEED_APPLE_WORKSPACE_ID,
        clientRegistrationId,
      ],
    );

    await dataSource.query(
      `INSERT INTO core."applicationAuthorization"
        ("userId", "workspaceId", "userWorkspaceId", "applicationId", scopes,
         "lastAuthorizedAt", "lastUsedAt")
       SELECT "userId", "workspaceId", id, $3, $4, now(), now()
       FROM core."userWorkspace"
       WHERE "userId" = $1 AND "workspaceId" = $2`,
      [
        USER_DATA_SEED_IDS.JANE,
        SEED_APPLE_WORKSPACE_ID,
        clientApplicationId,
        ['api'],
      ],
    );

    await invalidateMarketplaceCatalog();
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM core."applicationAuthorization" WHERE "applicationId" = $1`,
      [clientApplicationId],
    );
    await dataSource.query(`DELETE FROM core."application" WHERE id = $1`, [
      clientApplicationId,
    ]);
    await dataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE id IN ($1, $2)`,
      [marketplaceAppRegistrationId, clientRegistrationId],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: developedApplicationUniversalIdentifier,
    });
    await invalidateMarketplaceCatalog();
  });

  it('should list the application with its connect link', async () => {
    const response = await makeMetadataApiRequest({
      query: findManyMarketplaceAppsConnectUrlQuery,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findManyMarketplaceApps).toContainEqual({
      id: marketplaceAppUniversalIdentifier,
      connectUrl: CONNECT_URL,
    });
  });

  it('should return the connect link on the application detail', async () => {
    const response = await makeMetadataApiRequest({
      query: findMarketplaceAppDetailConnectUrlQuery,
      variables: { universalIdentifier: marketplaceAppUniversalIdentifier },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.findMarketplaceAppDetail).toEqual({
      universalIdentifier: marketplaceAppUniversalIdentifier,
      connectUrl: CONNECT_URL,
    });
  });

  it('should refuse to install the application in a workspace', async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: developedApplicationUniversalIdentifier,
      name: 'Developed OAuth Client App',
      description: 'App that declares an OAuth client',
      sourcePath: 'developed-oauth-client-app',
    });

    const { application, ...baseManifest } = buildBaseManifest({
      appId: developedApplicationUniversalIdentifier,
      roleId: crypto.randomUUID(),
      overrides: { roles: [] },
    });

    const { errors } = await syncApplication({
      manifest: {
        ...baseManifest,
        application: {
          universalIdentifier: application.universalIdentifier,
          displayName: application.displayName,
          description: application.description,
          packageJsonChecksum: application.packageJsonChecksum,
          yarnLockChecksum: application.yarnLockChecksum,
          oAuthClient: {
            clientIdMetadataDocumentUrls: [clientIdMetadataDocumentUrl],
            connectUrl: CONNECT_URL,
          },
        },
      },
      expectToFail: true,
    });

    expect(errors[0].message).toBe(
      'An application that declares an OAuth client installs nothing: members connect it themselves',
    );
  });

  it('should attach a connection of the declared client to the application', async () => {
    expect(await findConnectionMarketplaceAppUniversalIdentifier()).toBe(
      marketplaceAppUniversalIdentifier,
    );
  });

  it('should not attach the connection when a second listed application the store hides declares the same client', async () => {
    const hiddenRegistrationId = await insertCatalogApplicationRegistration({
      universalIdentifier: crypto.randomUUID(),
      name: 'Hidden OAuth Client Marketplace App',
      sourcePackage: '@test/hidden-oauth-client-marketplace-app',
      workspaceId: null,
      manifest: {
        application: {
          requiredServerVersionRange: '>=999.0.0',
          oAuthClient: {
            clientIdMetadataDocumentUrls: [clientIdMetadataDocumentUrl],
            connectUrl: CONNECT_URL,
          },
        },
      },
    });

    expect(await findConnectionMarketplaceAppUniversalIdentifier()).toBeNull();

    await dataSource.query(
      `DELETE FROM core."applicationRegistration" WHERE id = $1`,
      [hiddenRegistrationId],
    );
    await invalidateMarketplaceCatalog();

    expect(await findConnectionMarketplaceAppUniversalIdentifier()).toBe(
      marketplaceAppUniversalIdentifier,
    );
  });

  it('should not attach the connection once the application is unlisted', async () => {
    await setMarketplaceAppListed(false);

    expect(await findConnectionMarketplaceAppUniversalIdentifier()).toBeNull();

    await setMarketplaceAppListed(true);
  });
});
