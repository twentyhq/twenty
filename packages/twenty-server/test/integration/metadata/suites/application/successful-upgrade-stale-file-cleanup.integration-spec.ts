import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';

const APP_UNIVERSAL_IDENTIFIER = '20202020-7c1f-4c2f-8e4b-000000002932';
const ROLE_UNIVERSAL_IDENTIFIER = '20202020-7c1f-4c2f-8e4b-000000002933';

const SVG_CONTENT = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

// The upload flow runs cache-lock retries with real delays, so fake timers
// would hang it — mirror the other application suites.
jest.setTimeout(120000);

const buildTarball = ({
  version,
  assetPath,
}: {
  version: string;
  assetPath: string;
}): Promise<Buffer> =>
  createAppTarball({
    'manifest.json': JSON.stringify({
      ...buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
      }),
      publicAssets: [
        {
          filePath: assetPath,
          fileName: assetPath.split('/').pop(),
          fileType: 'image/svg+xml',
          checksum: null,
        },
      ],
    }),
    'package.json': JSON.stringify({
      name: 'test-upgrade-stale-file-cleanup',
      version,
    }),
    [assetPath]: SVG_CONTENT,
  });

const fetchStoredPublicAssetPaths = async (): Promise<string[]> => {
  const rows: { path: string }[] = await globalThis.testDataSource.query(
    `SELECT f."path" FROM core."file" f
     JOIN core."application" a ON a."id" = f."applicationId"
     WHERE a."universalIdentifier" = $1 AND f."path" LIKE 'public-asset/%'`,
    [APP_UNIVERSAL_IDENTIFIER],
  );

  return rows.map((row) => row.path);
};

describe('Upgrade sweeps files dropped by the new version', () => {
  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });

    jest.useFakeTimers();
  });

  it('deletes the previous version asset that the new version no longer ships', async () => {
    const tarballV1 = await buildTarball({
      version: '1.0.0',
      assetPath: 'assets/logo-v1.svg',
    });

    await uploadAppTarball({
      tarballBuffer: tarballV1,
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });

    await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
    });

    expect(await fetchStoredPublicAssetPaths()).toEqual([
      'public-asset/assets/logo-v1.svg',
    ]);

    const tarballV2 = await buildTarball({
      version: '2.0.0',
      assetPath: 'assets/logo-v2.svg',
    });

    await uploadAppTarball({
      tarballBuffer: tarballV2,
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });

    await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
    });

    expect(await fetchStoredPublicAssetPaths()).toEqual([
      'public-asset/assets/logo-v2.svg',
    ]);
  });
});
