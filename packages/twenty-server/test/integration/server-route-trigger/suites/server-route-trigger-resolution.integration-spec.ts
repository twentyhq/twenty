import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { callServerRoute } from 'test/integration/server-route-trigger/utils/call-server-route.util';
import { findLogicFunctionId } from 'test/integration/server-route-trigger/utils/find-logic-function-id.util';
import {
  removeApplicationInstallFromForeignWorkspace,
  seedApplicationInstallInForeignWorkspace,
} from 'test/integration/server-route-trigger/utils/seed-application-install-in-foreign-workspace.util';
import {
  removeForeignServerRouteClaimant,
  seedForeignServerRouteClaimant,
} from 'test/integration/server-route-trigger/utils/seed-foreign-server-route-claimant.util';
import { expectOneNotInternalServerErrorHttpResponseSnapshot } from 'test/integration/utils/expect-one-not-internal-server-error-http-response-snapshot.util';
import { type LogicFunctionManifest } from 'twenty-shared/application';
import { LOGIC_FUNCTION_HTTP_RESPONSE_MARKER } from 'twenty-shared/types';

import { SERVER_ROUTE_LEGACY_IDENTIFIER_DEPRECATION_HEADER_VALUE } from 'src/engine/core-modules/server-route-trigger/constants/server-route-legacy-identifier-deprecation-header-value.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OWNER_APP_UNIVERSAL_IDENTIFIER = '7c8d9e0f-1a2b-4c3d-8e4f-5a6b7c8d9e0f';
const OWNER_ROLE_UNIVERSAL_IDENTIFIER = '8d9e0f1a-2b3c-4d4e-9f5a-6b7c8d9e0f1a';

const OWNER_RESOLVER_UNIVERSAL_IDENTIFIER =
  '9e0f1a2b-3c4d-4e5f-8a6b-7c8d9e0f1a2b';

const SQUATTER_APP_UNIVERSAL_IDENTIFIER =
  '0f1a2b3c-4d5e-4f6a-8b7c-8d9e0f1a2b3c';

const UNKNOWN_IDENTIFIER = '11111111-1111-4111-8111-111111111111';

const OWNER_RESPONSE = { answeredBy: 'owner' };

const OWNER_RESOLVER_BUILT_HANDLER_CODE = `export const main = async () => ({
  ${LOGIC_FUNCTION_HTTP_RESPONSE_MARKER}: true,
  status: 200,
  body: ${JSON.stringify(OWNER_RESPONSE)},
});
`;

const buildResolverManifest = (): LogicFunctionManifest => ({
  universalIdentifier: OWNER_RESOLVER_UNIVERSAL_IDENTIFIER,
  name: 'owner-resolver',
  handlerName: 'main',
  sourceHandlerPath: 'src/owner-resolver.ts',
  builtHandlerPath: 'dist/owner-resolver.mjs',
  builtHandlerChecksum: 'checksum-owner-resolver',
  serverRouteTriggerSettings: { forwardedRequestHeaders: [] },
});

const seedSquatter = ({
  resolverUniversalIdentifier,
}: {
  resolverUniversalIdentifier: string;
}) =>
  seedForeignServerRouteClaimant({
    applicationUniversalIdentifier: SQUATTER_APP_UNIVERSAL_IDENTIFIER,
    resolverUniversalIdentifier,
  });

const removeSquatter = () =>
  removeForeignServerRouteClaimant({
    applicationUniversalIdentifier: SQUATTER_APP_UNIVERSAL_IDENTIFIER,
  });

const seedOwnerAppInstall = () =>
  seedApplicationInstallInForeignWorkspace({
    applicationUniversalIdentifier: OWNER_APP_UNIVERSAL_IDENTIFIER,
    resolverUniversalIdentifier: OWNER_RESOLVER_UNIVERSAL_IDENTIFIER,
  });

const removeOwnerAppInstall = () =>
  removeApplicationInstallFromForeignWorkspace({
    applicationUniversalIdentifier: OWNER_APP_UNIVERSAL_IDENTIFIER,
  });

describe('ServerRouteTrigger resolver resolution (integration)', () => {
  let ownerResolverId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: OWNER_APP_UNIVERSAL_IDENTIFIER,
      name: 'Server Route Resolution Owner App',
      description: 'App owning the public server route under test',
      sourcePath: 'server-route-resolution-owner-app',
    });

    jest.useRealTimers();
    await uploadApplicationFile({
      applicationUniversalIdentifier: OWNER_APP_UNIVERSAL_IDENTIFIER,
      fileFolder: 'BuiltLogicFunction',
      filePath: 'dist/owner-resolver.mjs',
      fileBuffer: Buffer.from(OWNER_RESOLVER_BUILT_HANDLER_CODE),
      filename: 'owner-resolver.mjs',
      contentType: 'application/javascript',
      expectToFail: false,
    });
    jest.useFakeTimers();

    await syncApplication({
      manifest: buildBaseManifest({
        appId: OWNER_APP_UNIVERSAL_IDENTIFIER,
        roleId: OWNER_ROLE_UNIVERSAL_IDENTIFIER,
        overrides: { logicFunctions: [buildResolverManifest()] },
      }),
      expectToFail: false,
    });

    ownerResolverId = await findLogicFunctionId({
      universalIdentifier: OWNER_RESOLVER_UNIVERSAL_IDENTIFIER,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  }, 60000);

  afterAll(async () => {
    await removeSquatter();
    await removeOwnerAppInstall();
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: OWNER_APP_UNIVERSAL_IDENTIFIER,
    });
  }, 60000);

  describe('by primary key', () => {
    it('dispatches to the resolver and does not flag the response as deprecated', async () => {
      const response = await callServerRoute({ identifier: ownerResolverId });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(OWNER_RESPONSE);
      expect(response.headers['deprecation']).toBeUndefined();
    }, 60000);

    it('rejects the id of a copy installed in a workspace that does not own the app', async () => {
      const { logicFunctionId: installedCopyId } = await seedOwnerAppInstall();

      try {
        const response = await callServerRoute({
          identifier: installedCopyId,
          expectToFail: true,
        });

        expect(response.status).toBe(404);
        expectOneNotInternalServerErrorHttpResponseSnapshot({
          status: response.status,
          body: {
            ...response.body,
            messages: response.body.messages.map((message: string) =>
              message.replace(installedCopyId, '<installed copy id>'),
            ),
          },
        });
      } finally {
        await removeOwnerAppInstall();
      }
    }, 60000);

    it('answers 404 for an id that resolves to nothing', async () => {
      const response = await callServerRoute({
        identifier: UNKNOWN_IDENTIFIER,
        expectToFail: true,
      });

      expect(response.status).toBe(404);
      expectOneNotInternalServerErrorHttpResponseSnapshot({
        status: response.status,
        body: response.body,
      });
    });

    it('keeps dispatching while the legacy identifier is contested by a foreign workspace', async () => {
      await seedSquatter({
        resolverUniversalIdentifier: OWNER_RESOLVER_UNIVERSAL_IDENTIFIER,
      });

      try {
        const response = await callServerRoute({ identifier: ownerResolverId });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(OWNER_RESPONSE);
      } finally {
        await removeSquatter();
      }
    }, 60000);

    it('wins over a foreign resolver whose universalIdentifier equals this id', async () => {
      await seedSquatter({ resolverUniversalIdentifier: ownerResolverId });

      try {
        const response = await callServerRoute({ identifier: ownerResolverId });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(OWNER_RESPONSE);
      } finally {
        await removeSquatter();
      }
    }, 60000);
  });

  describe('by legacy universalIdentifier', () => {
    it('still dispatches and flags the response as deprecated', async () => {
      const response = await callServerRoute({
        identifier: OWNER_RESOLVER_UNIVERSAL_IDENTIFIER,
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(OWNER_RESPONSE);
      expect(response.headers['deprecation']).toBe(
        SERVER_ROUTE_LEGACY_IDENTIFIER_DEPRECATION_HEADER_VALUE,
      );
    }, 60000);

    it('refuses to dispatch once a foreign workspace claims the same identifier', async () => {
      await seedSquatter({
        resolverUniversalIdentifier: OWNER_RESOLVER_UNIVERSAL_IDENTIFIER,
      });

      try {
        const response = await callServerRoute({
          identifier: OWNER_RESOLVER_UNIVERSAL_IDENTIFIER,
          body: { victimSecret: 'synthetic-webhook-body' },
          expectToFail: true,
        });

        expect(response.status).toBe(404);
        expect(response.body).not.toEqual(OWNER_RESPONSE);
        expectOneNotInternalServerErrorHttpResponseSnapshot({
          status: response.status,
          body: response.body,
        });
      } finally {
        await removeSquatter();
      }
    }, 60000);

    it('does not count a copy installed in another workspace as a claimant', async () => {
      await seedOwnerAppInstall();

      try {
        const response = await callServerRoute({
          identifier: OWNER_RESOLVER_UNIVERSAL_IDENTIFIER,
        });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(OWNER_RESPONSE);
      } finally {
        await removeOwnerAppInstall();
      }
    }, 60000);
  });
});
