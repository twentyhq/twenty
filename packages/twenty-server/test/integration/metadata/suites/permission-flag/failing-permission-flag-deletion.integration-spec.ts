import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { deletePermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/delete-permission-flag.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

describe('PermissionFlag deletion should fail', () => {
  describe('with feature flag enabled', () => {
    beforeAll(async () => {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_CUSTOM_PERMISSION_FLAGS_ENABLED,
        value: true,
        expectToFail: false,
      });
    });

    afterAll(async () => {
      await updateFeatureFlag({
        featureFlag: FeatureFlagKey.IS_CUSTOM_PERMISSION_FLAGS_ENABLED,
        value: false,
        expectToFail: false,
      });
    });

    it('should fail when deleting a non-existent permission flag', async () => {
      const { errors } = await deletePermissionFlag({
        expectToFail: true,
        input: { id: faker.string.uuid() },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    });

    it('should fail when deleting with an invalid id (not a UUID)', async () => {
      const { errors } = await deletePermissionFlag({
        expectToFail: true,
        input: { id: 'not-a-uuid' },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    });
  });

  describe('with feature flag disabled', () => {
    it('should reject deletion when IS_CUSTOM_PERMISSION_FLAGS_ENABLED is off', async () => {
      const { errors } = await deletePermissionFlag({
        expectToFail: true,
        input: { id: faker.string.uuid() },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    });
  });
});
