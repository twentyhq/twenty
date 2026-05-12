import { faker } from '@faker-js/faker';
import { createPermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/create-permission-flag.util';
import { deletePermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/delete-permission-flag.util';
import { findPermissionFlags } from 'test/integration/metadata/suites/permission-flag/utils/find-permission-flags.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

describe('PermissionFlag deletion should succeed', () => {
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

  it('should delete an existing custom permission flag', async () => {
    const key = `custom_${faker.string.alphanumeric(8)}`;

    const { data: createData } = await createPermissionFlag({
      expectToFail: false,
      input: {
        key,
        label: 'Flag To Delete',
        permissionType: 'tool',
      },
    });

    const createdId = createData.createPermissionFlag.id;

    const { data: deleteData } = await deletePermissionFlag({
      expectToFail: false,
      input: { id: createdId },
    });

    expect(deleteData.deletePermissionFlag).toMatchObject({
      id: createdId,
      key,
      label: 'Flag To Delete',
    });

    const { data: findData } = await findPermissionFlags({
      expectToFail: false,
      input: undefined,
    });

    const deletedFlag = findData.permissionFlags.find(
      (flag) => flag.id === createdId,
    );

    expect(deletedFlag).toBeUndefined();
  });
});
