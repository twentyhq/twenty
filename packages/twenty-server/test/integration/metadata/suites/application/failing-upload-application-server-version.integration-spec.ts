import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { scrubSemverVersions } from 'test/utils/scrub-semver-versions.util';
import { v4 as uuidv4 } from 'uuid';

// The upload flow runs cache-lock retries with real delays, so fake timers
// would hang it — mirror the other application suites.
jest.setTimeout(120000);

describe('Publish application is gated by the instance server version', () => {
  const createdApplicationUniversalIdentifiers: string[] = [];

  beforeAll(() => {
    jest.useRealTimers();
  });

  afterAll(async () => {
    for (const universalIdentifier of createdApplicationUniversalIdentifiers) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: universalIdentifier,
      });
    }

    jest.useFakeTimers();
  });

  it('rejects publishing when the app requires a server version the instance does not satisfy', async () => {
    const universalIdentifier = uuidv4();
    const roleId = uuidv4();

    const tarball = await createAppTarball({
      'manifest.json': JSON.stringify(
        buildBaseManifest({ appId: universalIdentifier, roleId }),
      ),
      'package.json': JSON.stringify({
        name: `test-server-version-gate-${universalIdentifier}`,
        version: '1.0.0',
        // Require a server version far above any real instance version so the
        // instance-level compatibility check always rejects it.
        engines: { twenty: '>=999.0.0' },
      }),
    });

    createdApplicationUniversalIdentifiers.push(universalIdentifier);

    const { errors } = await uploadAppTarball({
      tarballBuffer: tarball,
      universalIdentifier,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: scrubSemverVersions,
    });
  });
});
