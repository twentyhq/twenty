import { faker } from '@faker-js/faker';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createPermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/create-permission-flag.util';
import { deletePermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/delete-permission-flag.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { FeatureFlagKey } from 'twenty-shared/types';

import { type CreatePermissionFlagInput } from 'src/engine/metadata-modules/permission-flag/dtos/create-permission-flag.input';

type TestContext = {
  input: CreatePermissionFlagInput;
};

const failingPermissionFlagCreationTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when creating with empty key',
      context: {
        input: {
          key: '',
          label: 'Test Label',
          permissionType: 'tool',
        },
      },
    },
    {
      title: 'when creating with empty label',
      context: {
        input: {
          key: `custom_${faker.string.alphanumeric(8)}`,
          label: '',
          permissionType: 'tool',
        },
      },
    },
    {
      title: 'when creating with missing permissionType',
      context: {
        input: {
          key: `custom_${faker.string.alphanumeric(8)}`,
          label: 'Test Label',
        } as CreatePermissionFlagInput,
      },
    },
    {
      title: 'when creating with invalid permissionType',
      context: {
        input: {
          key: `custom_${faker.string.alphanumeric(8)}`,
          label: 'Test Label',
          permissionType: 'invalid_type' as 'tool',
        },
      },
    },
    {
      title: 'when creating with invalid universalIdentifier (not a UUID)',
      context: {
        input: {
          key: `custom_${faker.string.alphanumeric(8)}`,
          label: 'Test Label',
          permissionType: 'tool',
          universalIdentifier: 'not-a-valid-uuid',
        },
      },
    },
  ];

describe('PermissionFlag creation should fail', () => {
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

    it.each(eachTestingContextFilter(failingPermissionFlagCreationTestCases))(
      '$title',
      async ({ context }) => {
        const { errors } = await createPermissionFlag({
          expectToFail: true,
          input: context.input,
        });

        expectOneNotInternalServerErrorSnapshot({
          errors,
        });
      },
    );

    it('should fail when creating a duplicate key for the same workspace', async () => {
      const key = `custom_${faker.string.alphanumeric(8)}`;

      const { data } = await createPermissionFlag({
        expectToFail: false,
        input: { key, label: 'First Flag', permissionType: 'tool' },
      });

      const createdId = data.createPermissionFlag.id;

      try {
        const { errors } = await createPermissionFlag({
          expectToFail: true,
          input: { key, label: 'Duplicate Flag', permissionType: 'tool' },
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
  });

  describe('with feature flag disabled', () => {
    it('should reject creation when IS_CUSTOM_PERMISSION_FLAGS_ENABLED is off', async () => {
      const { errors } = await createPermissionFlag({
        expectToFail: true,
        input: {
          key: `custom_${faker.string.alphanumeric(8)}`,
          label: 'Should Be Rejected',
          permissionType: 'tool',
        },
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    });
  });
});
