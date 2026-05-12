import { faker } from '@faker-js/faker';
import { createPermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/create-permission-flag.util';
import { deletePermissionFlag } from 'test/integration/metadata/suites/permission-flag/utils/delete-permission-flag.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

describe('PermissionFlag creation should succeed', () => {
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

  afterEach(async () => {
    if (createdPermissionFlagId) {
      await deletePermissionFlag({
        expectToFail: false,
        input: { id: createdPermissionFlagId },
      });
      createdPermissionFlagId = undefined as unknown as string;
    }
  });

  it('should create a permission flag with minimal input', async () => {
    const key = `custom_${faker.string.alphanumeric(8)}`;

    const { data } = await createPermissionFlag({
      expectToFail: false,
      input: {
        key,
        label: 'Custom Flag',
        permissionType: 'tool',
      },
    });

    createdPermissionFlagId = data?.createPermissionFlag?.id;

    expect(data.createPermissionFlag).toMatchObject({
      id: expect.any(String),
      key,
      label: 'Custom Flag',
      description: null,
      iconKey: null,
      permissionType: 'tool',
      isRelevantForAgents: false,
      isRelevantForUsers: false,
      isRelevantForApiKeys: false,
      isCustom: true,
    });
  });

  it('should create a permission flag with all optional fields', async () => {
    const key = `custom_${faker.string.alphanumeric(8)}`;

    const { data } = await createPermissionFlag({
      expectToFail: false,
      input: {
        key,
        label: 'Fully Specified Flag',
        description: 'A custom flag with everything filled in',
        iconKey: 'IconStar',
        permissionType: 'tool',
        isRelevantForAgents: true,
        isRelevantForUsers: true,
        isRelevantForApiKeys: true,
      },
    });

    createdPermissionFlagId = data?.createPermissionFlag?.id;

    expect(data.createPermissionFlag).toMatchObject({
      id: expect.any(String),
      key,
      label: 'Fully Specified Flag',
      description: 'A custom flag with everything filled in',
      iconKey: 'IconStar',
      permissionType: 'tool',
      isRelevantForAgents: true,
      isRelevantForUsers: true,
      isRelevantForApiKeys: true,
      isCustom: true,
    });
  });

  it('should create a settings-type permission flag', async () => {
    const key = `custom_settings_${faker.string.alphanumeric(8)}`;

    const { data } = await createPermissionFlag({
      expectToFail: false,
      input: {
        key,
        label: 'Custom Settings Flag',
        permissionType: 'settings',
      },
    });

    createdPermissionFlagId = data?.createPermissionFlag?.id;

    expect(data.createPermissionFlag).toMatchObject({
      key,
      permissionType: 'settings',
      isCustom: true,
    });
  });

  it('should accept a caller-provided universalIdentifier', async () => {
    const key = `custom_${faker.string.alphanumeric(8)}`;
    const universalIdentifier = faker.string.uuid();

    const { data } = await createPermissionFlag({
      expectToFail: false,
      input: {
        key,
        label: 'Identified Flag',
        permissionType: 'tool',
        universalIdentifier,
      },
    });

    createdPermissionFlagId = data?.createPermissionFlag?.id;

    expect(data.createPermissionFlag).toMatchObject({
      key,
      universalIdentifier,
    });
  });
});
