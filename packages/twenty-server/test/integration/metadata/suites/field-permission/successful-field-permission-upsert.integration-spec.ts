import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

describe('Field permission upsert should succeed', () => {
  let createdRoleId: string;
  let customObjectMetadataId: string;
  let oneFieldMetadataId: string;
  let objectWithNoObjectPermissionMetadataId: string;
  let objectWithNoObjectPermissionFieldMetadataId: string;

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role For Field Permission Success',
        description: 'Role for field permission successful tests',
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
        nameSingular: 'testFieldPermissionSuccess',
        namePlural: 'testFieldPermissionSuccesses',
        labelSingular: 'Test Field Permission Success',
        labelPlural: 'Test Field Permission Successes',
        icon: 'IconSettings',
      },
    });

    customObjectMetadataId = createOneObject.id;
    jestExpectToBeDefined(customObjectMetadataId);

    const {
      data: { createOneObject: createOneObjectWithNoObjectPermission },
    } = await createOneObjectMetadata({
      input: {
        nameSingular: 'testFieldPermissionNoObjPerm',
        namePlural: 'testFieldPermissionNoObjPerms',
        labelSingular: 'Test Field Permission No Obj Perm',
        labelPlural: 'Test Field Permission No Obj Perms',
        icon: 'IconSettings',
      },
    });
    objectWithNoObjectPermissionMetadataId =
      createOneObjectWithNoObjectPermission.id;
    jestExpectToBeDefined(objectWithNoObjectPermissionMetadataId);

    await upsertObjectPermissions({
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

    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: customObjectMetadataId } },
        paging: { first: 1 },
      },
      gqlFields: 'id',
    });
    jestExpectToBeDefined(fields);
    expect(fields?.length).toBeGreaterThan(0);
    oneFieldMetadataId = fields[0].node.id;

    const { fields: fieldsNoObjectPermission } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: {
          objectMetadataId: { eq: objectWithNoObjectPermissionMetadataId },
        },
        paging: { first: 1 },
      },
      gqlFields: 'id',
    });
    jestExpectToBeDefined(fieldsNoObjectPermission);
    expect(fieldsNoObjectPermission?.length).toBeGreaterThan(0);
    objectWithNoObjectPermissionFieldMetadataId =
      fieldsNoObjectPermission[0].node.id;
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
    if (isDefined(objectWithNoObjectPermissionMetadataId)) {
      await deleteOneObjectMetadata({
        expectToFail: false,
        input: { idToDelete: objectWithNoObjectPermissionMetadataId },
      });
    }
  });

  it('should upsert one field permission (create)', async () => {
    const { data } = await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        fieldPermissions: [
          {
            objectMetadataId: customObjectMetadataId,
            fieldMetadataId: oneFieldMetadataId,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    expect(data?.upsertFieldPermissions).toHaveLength(1);
    expect(data?.upsertFieldPermissions?.[0]).toMatchObject({
      objectMetadataId: customObjectMetadataId,
      fieldMetadataId: oneFieldMetadataId,
      roleId: createdRoleId,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    });
  });

  it('should upsert to update existing field permission', async () => {
    const { data } = await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        fieldPermissions: [
          {
            objectMetadataId: customObjectMetadataId,
            fieldMetadataId: oneFieldMetadataId,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    expect(data?.upsertFieldPermissions).toHaveLength(1);
    expect(data?.upsertFieldPermissions?.[0]).toMatchObject({
      objectMetadataId: customObjectMetadataId,
      fieldMetadataId: oneFieldMetadataId,
      roleId: createdRoleId,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    });
  });

  it('should upsert with both canReadFieldValue and canUpdateFieldValue false', async () => {
    const { data } = await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        fieldPermissions: [
          {
            objectMetadataId: customObjectMetadataId,
            fieldMetadataId: oneFieldMetadataId,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    expect(data?.upsertFieldPermissions).toHaveLength(1);
    expect(data?.upsertFieldPermissions?.[0]).toMatchObject({
      objectMetadataId: customObjectMetadataId,
      fieldMetadataId: oneFieldMetadataId,
      roleId: createdRoleId,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    });
  });

  it('should upsert even when object permission is not found for role on object', async () => {
    const { data } = await upsertFieldPermissions({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        fieldPermissions: [
          {
            objectMetadataId: objectWithNoObjectPermissionMetadataId,
            fieldMetadataId: objectWithNoObjectPermissionFieldMetadataId,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ],
      },
    });

    expect(data?.upsertFieldPermissions).toHaveLength(1);
    expect(data?.upsertFieldPermissions?.[0]).toMatchObject({
      objectMetadataId: objectWithNoObjectPermissionMetadataId,
      fieldMetadataId: objectWithNoObjectPermissionFieldMetadataId,
      roleId: createdRoleId,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    });
  });
});
