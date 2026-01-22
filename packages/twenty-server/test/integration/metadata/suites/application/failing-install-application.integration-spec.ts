import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

describe('Install application should fail', () => {
  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag:
        FeatureFlagKey.IS_APPLICATION_INSTALLATION_FROM_TARBALL_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  it('should return true when feature flag is enabled', async () => {
    const { data, errors } = await installApplication({
      expectToFail: true,
      input: {
        workspaceMigration: {
          actions: [
            {
              type: 'delete',
              metadataName: 'skill',
              universalIdentifier: 'test-skill-id',
            },
          ],
        },
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
