import { faker } from '@faker-js/faker';
import { createPermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/create-permission-flag.util';
import { deletePermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/delete-permission-flag.util';
import { updatePermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/update-permission-flag.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

describe('PermissionFlag update should succeed', () => {
  let createdPermissionFlagId: string;

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

  beforeEach(async () => {
    const key = `custom_${faker.string.alphanumeric(8)}`;

    const { data } = await createPermissionFlag({
      expectToFail: false,
      input: {
        key,
        label: 'Original Label',
        description: 'Original description',
        iconKey: 'IconOriginal',
        permissionType: 'tool',
        isRelevantForAgents: false,
        isRelevantForUsers: false,
        isRelevantForApiKeys: false,
      },
    });

    createdPermissionFlagId = data.createPermissionFlag.id;
  });

  afterEach(async () => {
    if (createdPermissionFlagId) {
      await deletePermissionFlag({
        expectToFail: false,
        input: { id: createdPermissionFlagId },
      });
      createdPermissionFlagId = undefined as unknown as string;
    }
  });

  it('should update label and description', async () => {
    const { data } = await updatePermissionFlag({
      expectToFail: false,
      input: {
        id: createdPermissionFlagId,
        update: {
          label: 'New Label',
          description: 'New description',
        },
      },
    });

    expect(data.updatePermissionFlag).toMatchObject({
      id: createdPermissionFlagId,
      label: 'New Label',
      description: 'New description',
    });
  });

  it('should update permissionType from tool to settings', async () => {
    const { data } = await updatePermissionFlag({
      expectToFail: false,
      input: {
        id: createdPermissionFlagId,
        update: {
          permissionType: 'settings',
        },
      },
    });

    expect(data.updatePermissionFlag).toMatchObject({
      id: createdPermissionFlagId,
      permissionType: 'settings',
    });
  });

  it('should update isRelevantFor* flags', async () => {
    const { data } = await updatePermissionFlag({
      expectToFail: false,
      input: {
        id: createdPermissionFlagId,
        update: {
          isRelevantForAgents: true,
          isRelevantForUsers: true,
          isRelevantForApiKeys: true,
        },
      },
    });

    expect(data.updatePermissionFlag).toMatchObject({
      id: createdPermissionFlagId,
      isRelevantForAgents: true,
      isRelevantForUsers: true,
      isRelevantForApiKeys: true,
    });
  });

  it('should update iconKey', async () => {
    const { data } = await updatePermissionFlag({
      expectToFail: false,
      input: {
        id: createdPermissionFlagId,
        update: {
          iconKey: 'IconNew',
        },
      },
    });

    expect(data.updatePermissionFlag).toMatchObject({
      id: createdPermissionFlagId,
      iconKey: 'IconNew',
    });
  });
});
