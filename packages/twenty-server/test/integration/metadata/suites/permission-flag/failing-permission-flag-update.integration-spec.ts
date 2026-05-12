import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createPermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/create-permission-flag.util';
import { deletePermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/delete-permission-flag.util';
import { updatePermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/update-permission-flag.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

describe('PermissionFlag update should fail', () => {
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

    it('should fail when updating a non-existent permission flag', async () => {
      const { errors } = await updatePermissionFlag({
        expectToFail: true,
        input: {
          id: faker.string.uuid(),
          update: { label: 'New Label' },
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    });

    it('should fail when updating with invalid permissionType', async () => {
      const key = `custom_${faker.string.alphanumeric(8)}`;

      const { data } = await createPermissionFlag({
        expectToFail: false,
        input: { key, label: 'Flag', permissionType: 'tool' },
      });

      const createdId = data.createPermissionFlag.id;

      try {
        const { errors } = await updatePermissionFlag({
          expectToFail: true,
          input: {
            id: createdId,
            update: { permissionType: 'invalid_type' as 'tool' },
          },
        });

        expectOneNotInternalServerErrorSnapshot({
          errors,
        });
      } finally {
        await deletePermissionFlag({
          expectToFail: false,
          input: { id: createdId },
        });
      }
    });

    it('should fail when updating with an invalid id (not a UUID)', async () => {
      const { errors } = await updatePermissionFlag({
        expectToFail: true,
        input: {
          id: 'not-a-uuid',
          update: { label: 'New Label' },
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    });
  });

  describe('with feature flag disabled', () => {
    it('should reject update when IS_CUSTOM_PERMISSION_FLAGS_ENABLED is off', async () => {
      const { errors } = await updatePermissionFlag({
        expectToFail: true,
        input: {
          id: faker.string.uuid(),
          update: { label: 'Should Be Rejected' },
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    });
  });
});
