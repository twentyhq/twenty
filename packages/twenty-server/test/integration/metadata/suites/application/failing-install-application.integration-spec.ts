import http from 'http';

import { v4 as uuidv4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { buildTestTarball } from 'test/integration/metadata/suites/application/utils/build-test-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';

const INVALID_UUID_APP_ID = uuidv4();
const INVALID_UUID_ROLE_ID = uuidv4();

const TARBALL_SERVER_PORT = 4444;

const buildTarballServerUrl = (path: string) =>
  `/${path}/app.tar.gz`;

const startTarballServer = (
  routes: Record<string, Buffer>,
): Promise<http.Server> => {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const tarball = routes[req.url ?? ''];

      if (tarball) {
        res.writeHead(200, {
          'Content-Type': 'application/gzip',
          'Content-Length': tarball.length,
        });
        res.end(tarball);

        return;
      }

      res.writeHead(404);
      res.end('Not found');
    });

    server.listen(TARBALL_SERVER_PORT, '127.0.0.1', () => {
      resolve(server);
    });
  });
};

const stopServer = (server: http.Server): Promise<void> => {
  return new Promise((resolve) => server.close(() => resolve()));
};

describe('Install application should fail', () => {
  let appCreated = false;
  let tarballServer: http.Server;

  const NO_MANIFEST_APP_ID = uuidv4();
  const NO_MANIFEST_VERSION = '0.1.0';

  const INVALID_MANIFEST_APP_ID = uuidv4();
  const INVALID_MANIFEST_VERSION = '0.1.0';

  beforeAll(async () => {
    jest.useRealTimers();

    const tarballWithoutManifest = await buildTestTarball({
      packageJson: { name: 'no-manifest', version: '0.1.0' },
    });

    const tarballWithInvalidManifest = await buildTestTarball({
      rawManifestContent: '{ this is not valid json !!!',
      packageJson: { name: 'invalid-manifest', version: '0.1.0' },
    });

    const routes: Record<string, Buffer> = {
      [buildTarballServerUrl(
        `${NO_MANIFEST_APP_ID}@${NO_MANIFEST_VERSION}`,
      )]: tarballWithoutManifest,
      [buildTarballServerUrl(
        `${INVALID_MANIFEST_APP_ID}@${INVALID_MANIFEST_VERSION}`,
      )]: tarballWithInvalidManifest,
    };

    tarballServer = await startTarballServer(routes);

    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED,
      value: true,
      expectToFail: false,
    });

    await setupApplicationForSync({
      applicationUniversalIdentifier: INVALID_UUID_APP_ID,
      name: 'Test Invalid UUID App',
      description: 'App for testing UUID v4 validation',
      sourcePath: 'test-invalid-uuid',
    });

    appCreated = true;

    jest.useFakeTimers();
  }, 60000);

  afterAll(async () => {
    jest.useRealTimers();

    await stopServer(tarballServer);

    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED,
      value: false,
      expectToFail: false,
    });

    jest.useFakeTimers();
  });

  afterEach(async () => {
    if (!appCreated) {
      return;
    }

    await uninstallApplication({
      universalIdentifier: INVALID_UUID_APP_ID,
      expectToFail: false,
    });
  });

  it('should fail when tarball is not found on registry (404)', async () => {
    jest.useRealTimers();

    const { errors } = await installApplication({
      expectToFail: true,
      input: {
        applicationUniversalIdentifier: uuidv4(),
        version: '9.9.9',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    jest.useFakeTimers();
  });

  it('should fail when tarball does not contain manifest.json', async () => {
    jest.useRealTimers();

    const { errors } = await installApplication({
      expectToFail: true,
      input: {
        applicationUniversalIdentifier: NO_MANIFEST_APP_ID,
        version: NO_MANIFEST_VERSION,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    jest.useFakeTimers();
  });

  it('should fail when manifest.json is not valid JSON', async () => {
    jest.useRealTimers();

    const { errors } = await installApplication({
      expectToFail: true,
      input: {
        applicationUniversalIdentifier: INVALID_MANIFEST_APP_ID,
        version: INVALID_MANIFEST_VERSION,
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });

    jest.useFakeTimers();
  });

  it('should fail when a role has an invalid universalIdentifier', async () => {
    const manifest = buildBaseManifest({
      appId: INVALID_UUID_APP_ID,
      roleId: INVALID_UUID_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: 'not-a-valid-uuid',
            label: 'Invalid UUID Role',
            description: 'Role with invalid universalIdentifier',
          },
        ],
      },
    });

    const { errors } = await syncApplication({
      manifest,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  }, 60000);
});
