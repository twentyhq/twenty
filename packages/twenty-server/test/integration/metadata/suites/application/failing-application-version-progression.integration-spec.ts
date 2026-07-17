import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { createAppTarball } from 'test/integration/metadata/suites/application/utils/create-app-tarball.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { uploadAppTarball } from 'test/integration/metadata/suites/application/utils/upload-app-tarball.util';
import { scrubSemverVersions } from 'test/utils/scrub-semver-versions.util';

// Fixed identifiers keep the exception messages, and therefore the error
// snapshots, stable across runs.
const APP_UNIVERSAL_IDENTIFIER = '20202020-6b0e-4b1e-9d3a-000000002931';
const ROLE_UNIVERSAL_IDENTIFIER = '20202020-6b0e-4b1e-9d3a-000000002932';

// The upload flow runs cache-lock retries with real delays, so fake timers
// would hang it — mirror the other application suites.
jest.setTimeout(120000);

const buildTarball = (version: string): Promise<Buffer> =>
  createAppTarball({
    'manifest.json': JSON.stringify(
      buildBaseManifest({
        appId: APP_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
      }),
    ),
    'package.json': JSON.stringify({
      name: 'test-version-progression',
      version,
    }),
  });

describe('Application version progression gate', () => {
  beforeAll(async () => {
    jest.useRealTimers();

    const tarball = await buildTarball('1.0.0');

    await uploadAppTarball({
      tarballBuffer: tarball,
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    });

    jest.useFakeTimers();
  });

  it('rejects re-deploying the currently deployed version', async () => {
    const tarball = await buildTarball('1.0.0');

    const { errors } = await uploadAppTarball({
      tarballBuffer: tarball,
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: scrubSemverVersions,
    });
  });

  it('rejects deploying a version lower than the deployed one', async () => {
    const tarball = await buildTarball('0.9.0');

    const { errors } = await uploadAppTarball({
      tarballBuffer: tarball,
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: scrubSemverVersions,
    });
  });

  it('rejects re-installing the already installed version', async () => {
    await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
    });

    const { errors } = await installApplication({
      input: { universalIdentifier: APP_UNIVERSAL_IDENTIFIER },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({
      errors,
      normalizeMessage: scrubSemverVersions,
    });
  });
});
