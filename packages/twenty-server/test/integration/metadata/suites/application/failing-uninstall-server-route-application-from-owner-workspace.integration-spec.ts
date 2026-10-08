import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { findOneApplicationQueryFactory } from 'test/integration/metadata/suites/application/utils/find-one-application-query-factory.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { triggerUninstallApplicationJob } from 'test/integration/metadata/suites/application/utils/trigger-uninstall-application-job.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  removeApplicationInstallFromForeignWorkspace,
  seedApplicationInstallInForeignWorkspace,
} from 'test/integration/server-route-trigger/utils/seed-application-install-in-foreign-workspace.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';

const APP_UNIVERSAL_IDENTIFIER = '3b6f0d1e-8a2c-4f7d-9e1b-2c4d6e8f0a1b';
const ROLE_UNIVERSAL_IDENTIFIER = '4c7a1e2f-9b3d-4a8e-8f2c-3d5e7f9a1b2c';
const RESOLVER_UNIVERSAL_IDENTIFIER = '5d8b2f3a-0c4e-4b9f-9a3d-4e6f8a0b2c3d';

const buildResolverManifest = (): LogicFunctionManifest => ({
  universalIdentifier: RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'server-route-resolver',
  handlerName: 'main',
  sourceHandlerPath: 'src/server-route-resolver.ts',
  builtHandlerPath: 'dist/server-route-resolver.mjs',
  builtHandlerChecksum: 'checksum-server-route-resolver',
  serverRouteTriggerSettings: { forwardedRequestHeaders: [] },
});

const findIsUninstallBlocked = async (): Promise<boolean> => {
  const response = await makeMetadataApiRequest(
    findOneApplicationQueryFactory({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
      gqlFields: 'isUninstallBlockedByOtherWorkspaceInstallations',
    }),
  );

  expect(response.body.errors).toBeUndefined();

  return response.body.data.findOneApplication
    .isUninstallBlockedByOtherWorkspaceInstallations;
};

describe('Uninstalling a server route application from its owner workspace (integration)', () => {
  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Server Route Owner Uninstall App',
      description: 'App exposing a server route from its owner workspace',
      sourcePath: 'server-route-owner-uninstall-app',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { logicFunctions: [buildResolverManifest()] },
      }),
      expectToFail: false,
    });
  }, 60000);

  afterAll(async () => {
    await removeApplicationInstallFromForeignWorkspace({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('does not block the uninstall while only the owner workspace has the application installed', async () => {
    expect(await findIsUninstallBlocked()).toBe(false);
  });

  describe('while another workspace has the application installed', () => {
    beforeAll(async () => {
      await seedApplicationInstallInForeignWorkspace({
        applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        resolverUniversalIdentifier: RESOLVER_UNIVERSAL_IDENTIFIER,
      });
    });

    afterAll(async () => {
      await removeApplicationInstallFromForeignWorkspace({
        applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      });
    });

    it('flags the uninstall as blocked', async () => {
      expect(await findIsUninstallBlocked()).toBe(true);
    });

    it('refuses to uninstall the application', async () => {
      const { errors } = await uninstallApplication({
        universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
        expectToFail: true,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].extensions.code).toBe('FORBIDDEN');
    });

    it('refuses to queue the uninstall job', async () => {
      const { errors } = await triggerUninstallApplicationJob({
        input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
        expectToFail: true,
      });

      expect(errors).toHaveLength(1);
      expect(errors[0].extensions.code).toBe('FORBIDDEN');
    });

    it('keeps the application installed in the owner workspace', async () => {
      const { data } = await findOneApplication({
        input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
        expectToFail: false,
      });

      expect(data?.findOneApplication.universalIdentifier).toBe(
        APP_UNIVERSAL_IDENTIFIER,
      );
    });
  });

  it('unblocks the uninstall once no other workspace has the application installed', async () => {
    expect(await findIsUninstallBlocked()).toBe(false);

    const { data } = await uninstallApplication({
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      expectToFail: false,
    });

    expect(data?.uninstallApplication).toBe(true);
  });
});
