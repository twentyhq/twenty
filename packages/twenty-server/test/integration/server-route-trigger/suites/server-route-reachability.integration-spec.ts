import { transferApplicationRegistrationOwnership } from 'test/integration/metadata/suites/application-registration/utils/transfer-application-registration-ownership.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import {
  removeApplicationInstallFromForeignWorkspace,
  seedApplicationInstallInForeignWorkspace,
} from 'test/integration/server-route-trigger/utils/seed-application-install-in-foreign-workspace.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';

import { type ServerRouteReachabilityService } from 'src/engine/core-modules/server-route-trigger/server-route-reachability.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APP_UNIVERSAL_IDENTIFIER = '6e9c3a4b-1d5f-4c0a-8b4e-5f7a9b1c3d4e';
const ROLE_UNIVERSAL_IDENTIFIER = '7f0d4b5c-2e6a-4d1b-9c5f-6a8b0c2d4e5f';
const RESOLVER_UNIVERSAL_IDENTIFIER = '8a1e5c6d-3f7b-4e2c-8d6a-7b9c1d3e5f6a';
const NEWER_RESOLVER_UNIVERSAL_IDENTIFIER =
  '9b2f6d7e-4a8c-4f3d-9e7b-8c0d2e4f6a7b';

const buildResolverManifest = (): LogicFunctionManifest => ({
  universalIdentifier: RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'reachability-resolver',
  handlerName: 'main',
  sourceHandlerPath: 'src/reachability-resolver.ts',
  builtHandlerPath: 'dist/reachability-resolver.mjs',
  builtHandlerChecksum: 'checksum-reachability-resolver',
  serverRouteTriggerSettings: { forwardedRequestHeaders: [] },
});

const findUnreachableRegistration = async () => {
  const unreachableRegistrations =
    await getAppProviderByClassName<ServerRouteReachabilityService>(
      'ServerRouteReachabilityService',
    ).findUnreachableServerRouteRegistrations();

  return unreachableRegistrations.find(
    (unreachableRegistration) =>
      unreachableRegistration.universalIdentifier === APP_UNIVERSAL_IDENTIFIER,
  );
};

const setOwnerWorkspaceId = (ownerWorkspaceId: string | null) =>
  globalThis.testDataSource.query(
    `UPDATE core."applicationRegistration" SET "workspaceId" = $1
     WHERE "universalIdentifier" = $2`,
    [ownerWorkspaceId, APP_UNIVERSAL_IDENTIFIER],
  );

describe('ServerRouteReachabilityService (integration)', () => {
  let applicationRegistrationId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      name: 'Server Route Reachability App',
      description: 'App exposing a server route from its owner workspace',
      sourcePath: 'server-route-reachability-app',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { logicFunctions: [buildResolverManifest()] },
      }),
      expectToFail: false,
    });

    [{ id: applicationRegistrationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."applicationRegistration" WHERE "universalIdentifier" = $1`,
      [APP_UNIVERSAL_IDENTIFIER],
    );
  }, 60000);

  afterEach(async () => {
    await removeApplicationInstallFromForeignWorkspace({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
    await setOwnerWorkspaceId(SEED_APPLE_WORKSPACE_ID);
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  it('does not report a registration whose owner workspace serves its server route', async () => {
    await seedApplicationInstallInForeignWorkspace({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      resolverUniversalIdentifier: RESOLVER_UNIVERSAL_IDENTIFIER,
    });

    expect(await findUnreachableRegistration()).toBeUndefined();
  });

  it('reports the workspaces relying on a route the owner workspace does not serve', async () => {
    await seedApplicationInstallInForeignWorkspace({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      resolverUniversalIdentifier: NEWER_RESOLVER_UNIVERSAL_IDENTIFIER,
    });

    expect(await findUnreachableRegistration()).toEqual(
      expect.objectContaining({
        applicationRegistrationId,
        unreachableWorkspaceCount: 1,
      }),
    );
  });

  it('reports the installed workspaces once ownership moves to a workspace without the application', async () => {
    await transferApplicationRegistrationOwnership({
      input: { applicationRegistrationId, targetWorkspaceSubdomain: 'yc' },
      expectToFail: false,
    });

    expect(await findUnreachableRegistration()).toEqual(
      expect.objectContaining({
        applicationRegistrationId,
        unreachableWorkspaceCount: 1,
      }),
    );
  });

  it('reports every installed workspace once the registration has no owner workspace', async () => {
    await seedApplicationInstallInForeignWorkspace({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      resolverUniversalIdentifier: RESOLVER_UNIVERSAL_IDENTIFIER,
    });
    await setOwnerWorkspaceId(null);

    expect(await findUnreachableRegistration()).toEqual(
      expect.objectContaining({ unreachableWorkspaceCount: 2 }),
    );
  });
});
