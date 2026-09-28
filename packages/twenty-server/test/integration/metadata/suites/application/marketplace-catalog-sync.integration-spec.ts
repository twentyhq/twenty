import crypto from 'crypto';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { gql } from 'graphql-tag';
import request from 'supertest';
import * as tar from 'tar';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findApplicationRegistrationByUniversalIdentifier } from 'test/integration/metadata/suites/application/utils/find-application-registration-by-universal-identifier.util';
import { insertCatalogApplicationRegistration } from 'test/integration/metadata/suites/application/utils/insert-catalog-application-registration.util';
import { syncMarketplaceCatalogFromRegistryPackage } from 'test/integration/metadata/suites/application/utils/sync-marketplace-catalog-from-registry-package.util';
import { upsertApplicationRegistrationFromCatalog } from 'test/integration/metadata/suites/application/utils/upsert-application-registration-from-catalog.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type DataSource } from 'typeorm';

import { MARKETPLACE_VETTED_APPLICATIONS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-vetted-applications.constant';
import { type ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
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
      logoUrl
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

  const insertCatalogRegistration = async (
    params: Parameters<typeof insertCatalogApplicationRegistration>[0],
  ): Promise<string> => {
    const id = await insertCatalogApplicationRegistration(params);

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

  describe('catalog sync', () => {
    it.each([true, false])(
      'preserves the admin choice isVetted=%s',
      async (isVetted) => {
        const applicationRegistrationService =
          getAppProviderByClassName<ApplicationRegistrationService>(
            'ApplicationRegistrationService',
          );
        const universalIdentifier = isVetted
          ? crypto.randomUUID()
          : MARKETPLACE_VETTED_APPLICATIONS[0].universalIdentifier;
        const catalogParams = {
          universalIdentifier,
          name: 'Vetted catalog sync test',
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: isVetted
            ? '@test/vetted-catalog-sync'
            : MARKETPLACE_VETTED_APPLICATIONS[0].sourcePackage,
          latestAvailableVersion: '1.0.0',
          manifest: buildBaseManifest({
            appId: universalIdentifier,
            roleId: crypto.randomUUID(),
          }),
        };

        expect(
          await applicationRegistrationService.findOneByUniversalIdentifierGlobal(
            universalIdentifier,
          ),
        ).toBeNull();

        try {
          await applicationRegistrationService.upsertFromCatalog(catalogParams);

          const registration =
            await applicationRegistrationService.findOneByUniversalIdentifierGlobal(
              universalIdentifier,
            );

          expect(registration).toMatchObject({ isVetted: !isVetted });

          const updateResponse = await makeAdminPanelApiRequest({
            query: gql`
              mutation UpdateAdminApplicationRegistration(
                $input: AdminUpdateApplicationRegistrationInput!
              ) {
                updateAdminApplicationRegistration(input: $input) {
                  id
                  isVetted
                }
              }
            `,
            variables: {
              input: { id: registration?.id, update: { isVetted } },
            },
          });

          expect(updateResponse.body.errors).toBeUndefined();
          expect(
            updateResponse.body.data.updateAdminApplicationRegistration,
          ).toMatchObject({ isVetted });

          await applicationRegistrationService.upsertFromCatalog(catalogParams);

          const refreshedResponse = await makeAdminPanelApiRequest({
            query: gql`
              query FindOneAdminApplicationRegistration($id: String!) {
                findOneAdminApplicationRegistration(id: $id) {
                  id
                  isVetted
                }
              }
            `,
            variables: { id: registration?.id },
          });

          expect(refreshedResponse.body.errors).toBeUndefined();
          expect(
            refreshedResponse.body.data.findOneAdminApplicationRegistration,
          ).toMatchObject({ isVetted });
        } finally {
          await ds.query(
            `DELETE FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
            [universalIdentifier],
          );
        }
      },
    );
  });

  describe('catalog sync source package pinning', () => {
    const OFFICIAL_APPLICATION = MARKETPLACE_VETTED_APPLICATIONS[0];

    it('does not let another package overwrite an existing registration', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Pinned App',
        sourcePackage: '@test/pinned-app',
      });

      await upsertApplicationRegistrationFromCatalog({
        universalIdentifier,
        name: 'Squatted App',
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: '@test/squatter-app',
        latestAvailableVersion: '9.9.9',
        manifest: buildBaseManifest({
          appId: universalIdentifier,
          roleId: crypto.randomUUID(),
        }),
      });

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({
        name: 'Pinned App',
        sourcePackage: '@test/pinned-app',
        latestAvailableVersion: '1.0.0',
      });
    });

    it('does not attach a package to a registration created from a local install', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Dev Mode App',
        sourceType: ApplicationRegistrationSourceType.LOCAL,
      });

      await upsertApplicationRegistrationFromCatalog({
        universalIdentifier,
        name: 'Squatted App',
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: '@test/squatter-app',
        latestAvailableVersion: '9.9.9',
        manifest: buildBaseManifest({
          appId: universalIdentifier,
          roleId: crypto.randomUUID(),
        }),
      });

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({
        name: 'Dev Mode App',
        sourcePackage: null,
        latestAvailableVersion: '1.0.0',
      });
    });

    it('keeps updating an existing registration from its own package', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Pinned App',
        sourcePackage: '@test/pinned-app',
      });

      await upsertApplicationRegistrationFromCatalog({
        universalIdentifier,
        name: 'Pinned App',
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: '@test/pinned-app',
        latestAvailableVersion: '2.0.0',
        manifest: buildBaseManifest({
          appId: universalIdentifier,
          roleId: crypto.randomUUID(),
        }),
      });

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({
        sourcePackage: '@test/pinned-app',
        latestAvailableVersion: '2.0.0',
      });
    });

    it('does not register an official identifier from a non-official package', async () => {
      const { universalIdentifier } = OFFICIAL_APPLICATION;

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toBeNull();

      try {
        await upsertApplicationRegistrationFromCatalog({
          universalIdentifier,
          name: 'Squatted Official App',
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage: '@test/squatter-app',
          latestAvailableVersion: '1.0.0',
          manifest: buildBaseManifest({
            appId: universalIdentifier,
            roleId: crypto.randomUUID(),
          }),
        });

        expect(
          await findApplicationRegistrationByUniversalIdentifier({
            universalIdentifier,
          }),
        ).toBeNull();
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: universalIdentifier,
        });
      }
    });

    it.each([
      {
        variant: 'uppercase',
        transform: (universalIdentifier: string) =>
          universalIdentifier.toUpperCase(),
      },
      {
        variant: 'hyphenless',
        transform: (universalIdentifier: string) =>
          universalIdentifier.replace(/-/g, ''),
      },
    ])(
      'does not register an official identifier spelled $variant from a non-official package',
      async ({ transform }) => {
        const { universalIdentifier } = OFFICIAL_APPLICATION;

        expect(
          await findApplicationRegistrationByUniversalIdentifier({
            universalIdentifier,
          }),
        ).toBeNull();

        try {
          await upsertApplicationRegistrationFromCatalog({
            universalIdentifier: transform(universalIdentifier),
            name: 'Squatted Official App',
            sourceType: ApplicationRegistrationSourceType.NPM,
            sourcePackage: '@test/squatter-app',
            latestAvailableVersion: '1.0.0',
            manifest: buildBaseManifest({
              appId: transform(universalIdentifier),
              roleId: crypto.randomUUID(),
            }),
          });

          expect(
            await findApplicationRegistrationByUniversalIdentifier({
              universalIdentifier,
            }),
          ).toBeNull();
        } finally {
          await cleanupApplicationAndAppRegistration({
            applicationUniversalIdentifier: universalIdentifier,
          });
        }
      },
    );

    it('does not let another package overwrite an existing registration through an uppercase identifier', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Pinned App',
        sourcePackage: '@test/pinned-app',
      });

      await upsertApplicationRegistrationFromCatalog({
        universalIdentifier: universalIdentifier.toUpperCase(),
        name: 'Squatted App',
        sourceType: ApplicationRegistrationSourceType.NPM,
        sourcePackage: '@test/squatter-app',
        latestAvailableVersion: '9.9.9',
        manifest: buildBaseManifest({
          appId: universalIdentifier.toUpperCase(),
          roleId: crypto.randomUUID(),
        }),
      });

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({
        name: 'Pinned App',
        sourcePackage: '@test/pinned-app',
        latestAvailableVersion: '1.0.0',
      });
    });

    it('lets the official package take back an official identifier registered from another package', async () => {
      const { universalIdentifier, sourcePackage } = OFFICIAL_APPLICATION;

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toBeNull();

      try {
        await insertCatalogApplicationRegistration({
          universalIdentifier,
          name: 'Squatted Official App',
          sourcePackage: '@test/squatter-app',
        });

        await upsertApplicationRegistrationFromCatalog({
          universalIdentifier,
          name: 'Official App',
          sourceType: ApplicationRegistrationSourceType.NPM,
          sourcePackage,
          latestAvailableVersion: '2.0.0',
          manifest: buildBaseManifest({
            appId: universalIdentifier,
            roleId: crypto.randomUUID(),
          }),
        });

        expect(
          await findApplicationRegistrationByUniversalIdentifier({
            universalIdentifier,
          }),
        ).toMatchObject({
          name: 'Official App',
          sourcePackage,
          latestAvailableVersion: '2.0.0',
        });
      } finally {
        await cleanupApplicationAndAppRegistration({
          applicationUniversalIdentifier: universalIdentifier,
        });
      }
    });
  });

  describe('catalog sync versions', () => {
    const SOURCE_PACKAGE = '@test/versioned-app';

    const buildCatalogParams = ({
      universalIdentifier,
      name,
      latestAvailableVersion,
    }: {
      universalIdentifier: string;
      name: string;
      latestAvailableVersion: string | null;
    }) => ({
      universalIdentifier,
      name,
      sourceType: ApplicationRegistrationSourceType.NPM,
      sourcePackage: SOURCE_PACKAGE,
      latestAvailableVersion,
      manifest: buildBaseManifest({
        appId: universalIdentifier,
        roleId: crypto.randomUUID(),
      }),
    });

    it('does not downgrade a registration to an older catalog version', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Versioned App',
        sourcePackage: SOURCE_PACKAGE,
        latestAvailableVersion: '2.0.0',
      });

      const registration = await upsertApplicationRegistrationFromCatalog(
        buildCatalogParams({
          universalIdentifier,
          name: 'Older Versioned App',
          latestAvailableVersion: '1.0.0',
        }),
      );

      expect(registration).toBeNull();
      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({
        name: 'Versioned App',
        latestAvailableVersion: '2.0.0',
      });
    });

    it('does not erase a known version when the catalog entry has none', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Versioned App',
        sourcePackage: SOURCE_PACKAGE,
        latestAvailableVersion: '1.0.0',
      });

      const registration = await upsertApplicationRegistrationFromCatalog(
        buildCatalogParams({
          universalIdentifier,
          name: 'Unversioned App',
          latestAvailableVersion: null,
        }),
      );

      expect(registration).toBeNull();
      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({
        name: 'Versioned App',
        latestAvailableVersion: '1.0.0',
      });
    });

    it('refreshes a registration served again on the same version', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Versioned App',
        sourcePackage: SOURCE_PACKAGE,
        latestAvailableVersion: '1.0.0',
      });

      const registration = await upsertApplicationRegistrationFromCatalog(
        buildCatalogParams({
          universalIdentifier,
          name: 'Renamed Versioned App',
          latestAvailableVersion: '1.0.0',
        }),
      );

      expect(registration).toMatchObject({
        name: 'Renamed Versioned App',
        latestAvailableVersion: '1.0.0',
      });
      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({
        name: 'Renamed Versioned App',
        latestAvailableVersion: '1.0.0',
      });
    });

    it('sets the version on a registration that has none', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Versioned App',
        sourcePackage: SOURCE_PACKAGE,
        latestAvailableVersion: null,
      });

      await upsertApplicationRegistrationFromCatalog(
        buildCatalogParams({
          universalIdentifier,
          name: 'Versioned App',
          latestAvailableVersion: '1.0.0',
        }),
      );

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({ latestAvailableVersion: '1.0.0' });
    });
  });

  describe('catalog sync assets', () => {
    // 1x1 transparent PNG, so file type detection accepts the asset
    const LOGO_PNG = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64',
    );

    const buildManifestWithLogo = (universalIdentifier: string) => {
      const manifest = buildBaseManifest({
        appId: universalIdentifier,
        roleId: crypto.randomUUID(),
      });

      manifest.application.logo = 'public/logo.png';

      return manifest;
    };

    it('does not store assets from another package on an existing registration', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Pinned App',
        sourcePackage: '@test/pinned-app',
      });

      await syncMarketplaceCatalogFromRegistryPackage({
        packageName: '@test/squatter-app',
        version: '2.0.0',
        manifest: buildManifestWithLogo(universalIdentifier),
        asset: LOGO_PNG,
      });

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({ logoFileId: null });
    });

    it('stores assets from the package the registration is bound to', async () => {
      const universalIdentifier = crypto.randomUUID();

      await insertCatalogRegistration({
        universalIdentifier,
        name: 'Pinned App',
        sourcePackage: '@test/pinned-app',
      });

      await syncMarketplaceCatalogFromRegistryPackage({
        packageName: '@test/pinned-app',
        version: '2.0.0',
        manifest: buildManifestWithLogo(universalIdentifier),
        asset: LOGO_PNG,
      });

      expect(
        await findApplicationRegistrationByUniversalIdentifier({
          universalIdentifier,
        }),
      ).toMatchObject({ logoFileId: expect.any(String) });
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
        pageLayoutWidgets: [],
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
