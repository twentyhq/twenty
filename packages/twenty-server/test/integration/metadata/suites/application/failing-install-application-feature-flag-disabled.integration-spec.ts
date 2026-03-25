import { FeatureFlagKey } from 'twenty-shared/types';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { installApplication } from 'test/integration/metadata/suites/application/utils/install-application.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';

describe('Install application should fail when feature flag is disabled', () => {
  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_APPLICATION_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  it('should fail with forbidden error when feature flag is disabled', async () => {
    const { errors } = await installApplication({
      expectToFail: true,
      input: {
        appRegistrationId: '20202020-0000-0000-0000-000000000000',
      },
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
