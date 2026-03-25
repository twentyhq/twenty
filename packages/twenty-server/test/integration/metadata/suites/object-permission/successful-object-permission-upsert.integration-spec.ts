import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

describe('Object permission upsert should succeed', () => {
  let createdRoleId: string;
  let customObjectMetadataId: string;

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role For Object Permission Success',
        description: 'Role for object permission successful tests',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    createdRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(createdRoleId);

    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testObjectPermissionSuccess',
        namePlural: 'testObjectPermissionSuccesses',
        labelSingular: 'Test Object Permission Success',
        labelPlural: 'Test Object Permission Successes',
        icon: 'IconSettings',
      },
    });

    customObjectMetadataId = createOneObject.id;
    jestExpectToBeDefined(customObjectMetadataId);
  });

  afterAll(async () => {
    if (isDefined(createdRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRoleId },
      });
    }
    if (isDefined(customObjectMetadataId)) {
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: customObjectMetadataId },
      });
    }
  });

  it('should upsert one object permission (create)', async () => {
    const { data } = await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectPermissions: [
          {
            objectMetadataId: customObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });

    expect(data?.upsertObjectPermissions).toHaveLength(1);
    expect(data?.upsertObjectPermissions?.[0]).toMatchObject({
      objectMetadataId: customObjectMetadataId,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    });
  });

  it('should upsert to update existing object permission flags', async () => {
    const { data } = await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectPermissions: [
          {
            objectMetadataId: customObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });

    expect(data?.upsertObjectPermissions).toHaveLength(1);
    expect(data?.upsertObjectPermissions?.[0]).toMatchObject({
      objectMetadataId: customObjectMetadataId,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: false,
    });
  });

  it('should upsert with read and all write permissions true', async () => {
    const { data } = await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        objectPermissions: [
          {
            objectMetadataId: customObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: true,
          },
        ],
      },
    });

    expect(data?.upsertObjectPermissions).toHaveLength(1);
    expect(data?.upsertObjectPermissions?.[0]).toMatchObject({
      objectMetadataId: customObjectMetadataId,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
    });
  });
});
