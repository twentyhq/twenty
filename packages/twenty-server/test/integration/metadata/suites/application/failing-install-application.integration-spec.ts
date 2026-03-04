import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uninstallApplication } from 'test/integration/metadata/suites/application/utils/uninstall-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { v4 as uuidv4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

const INVALID_UUID_APP_ID = uuidv4();
const INVALID_UUID_ROLE_ID = uuidv4();

describe('Install application should fail when entity does not exist', () => {
  let appCreated = false;

  beforeAll(async () => {
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
  }, 60000);

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED,
      value: false,
      expectToFail: false,
    });
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

  it('should fail with execution error when deleting non-existent field metadata', async () => {
    const { errors } = await installApplication({
      expectToFail: true,
      input: {
        workspaceMigration: {
          actions: [
            {
              type: 'delete',
              metadataName: 'fieldMetadata',
              universalIdentifier: '20202020-6110-4547-9fd0-2525257a2c3f',
            },
          ],
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
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
