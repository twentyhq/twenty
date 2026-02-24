import http from 'http';

import { type Manifest } from 'twenty-shared/application';
import { v4 as uuidv4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

import { buildTestTarball } from 'test/integration/metadata/suites/application/utils/build-test-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const TEST_VERSION = '0.1.0';

const TARBALL_SERVER_PORT = 4444;

const manifest: Manifest = {
  application: {
    universalIdentifier: TEST_APP_ID,
    defaultRoleUniversalIdentifier: TEST_ROLE_ID,
    displayName: 'Test Install App',
    description: 'An application installed from tarball',
    icon: 'IconTestPipe',
    applicationVariables: {},
    packageJsonChecksum: null,
    yarnLockChecksum: null,
    apiClientChecksum: null,
  },
  roles: [
    {
      universalIdentifier: TEST_ROLE_ID,
      label: 'Default Role',
      description: 'Default role for the test app',
    },
  ],
  skills: [],
  objects: [],
  fields: [],
  logicFunctions: [],
  frontComponents: [],
  publicAssets: [],
  views: [],
  navigationMenuItems: [],
  pageLayouts: [],
};

const packageJson = {
  name: 'test-install-app',
  version: TEST_VERSION,
};

const startTarballServer = (
  tarballBuffer: Buffer,
): Promise<http.Server> => {
  return new Promise((resolve) => {
    const expectedPath =
      `/${TEST_APP_ID}@${TEST_VERSION}/app.tar.gz`;

    const server = http.createServer((req, res) => {
      if (req.url === expectedPath) {
        res.writeHead(200, {
          'Content-Type': 'application/gzip',
          'Content-Length': tarballBuffer.length,
        });
        res.end(tarballBuffer);

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

describe('Install application from tarball', () => {
  let tarballServer: http.Server;

  beforeAll(async () => {
    jest.useRealTimers();

    const tarballBuffer = await buildTestTarball({
      manifest,
      packageJson,
    });

    tarballServer = await startTarballServer(tarballBuffer);

    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED,
      value: true,
      expectToFail: false,
    });

    jest.useFakeTimers();
  }, 30000);

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
    await uninstallApplication({
      universalIdentifier: TEST_APP_ID,
      expectToFail: false,
    });
  });

  it('should successfully install an application from a tarball', async () => {
    jest.useRealTimers();

    const { data, errors } = await installApplication({
      input: {
        applicationUniversalIdentifier: TEST_APP_ID,
        version: TEST_VERSION,
      },
      expectToFail: false,
    });

    expect(errors).toBeUndefined();
    expect(data?.installApplication).toBe(true);

    jest.useFakeTimers();
  }, 60000);
});
