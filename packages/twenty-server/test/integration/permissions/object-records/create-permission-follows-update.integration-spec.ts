import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { RowLevelPermissionPredicateGroupLogicalOperator } from 'twenty-shared/types';

const findRoleCreatePermission = async (roleId: string) => {
  const [role] = await global.testDataSource.query(
    'SELECT "canCreateAllObjectRecords" FROM core."role" WHERE id = $1',
    [roleId],
  );

  return role.canCreateAllObjectRecords;
};

const findObjectCreatePermission = async ({
  roleId,
  objectMetadataId,
}: {
  roleId: string;
  objectMetadataId: string;
}) => {
  const [objectPermission] = await global.testDataSource.query(
    'SELECT "canCreateObjectRecords" FROM core."objectPermission" WHERE "roleId" = $1 AND "objectMetadataId" = $2',
    [roleId, objectMetadataId],
  );

  return objectPermission.canCreateObjectRecords;
};

const findGroupCreatePermission = async (groupId: string) => {
  const [group] = await global.testDataSource.query(
    'SELECT "canCreateRecords" FROM core."rowLevelPermissionPredicateGroup" WHERE id = $1',
    [groupId],
  );

  return group.canCreateRecords;
};

const createRole = async (canUpdateAllObjectRecords: boolean) => {
  const { data } = await createOneRole({
    input: {
      label: `Create follows update ${canUpdateAllObjectRecords}`,
      canUpdateAllSettings: false,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    },
  });

  return data.createOneRole.id;
};

describe('create permission when update is granted', () => {
  let roleIds: string[] = [];

  const createTrackedRole = async (canUpdateAllObjectRecords: boolean) => {
    const roleId = await createRole(canUpdateAllObjectRecords);

    roleIds = [...roleIds, roleId];

    return roleId;
  };

  afterEach(async () => {
    for (const roleId of roleIds) {
      await deleteOneRole({ input: { idToDelete: roleId } });
    }

    roleIds = [];
  });

  it('should follow update on a created role', async () => {
    expect(await findRoleCreatePermission(await createTrackedRole(true))).toBe(
      true,
    );
    expect(await findRoleCreatePermission(await createTrackedRole(false))).toBe(
      false,
    );
  });

  it('should follow update when a role is updated', async () => {
    const roleId = await createTrackedRole(false);

    await updateOneRole({
      input: {
        idToUpdate: roleId,
        updatePayload: { canUpdateAllObjectRecords: true },
      },
    });

    expect(await findRoleCreatePermission(roleId)).toBe(true);

    await updateOneRole({
      input: {
        idToUpdate: roleId,
        updatePayload: { canUpdateAllObjectRecords: false },
      },
    });

    expect(await findRoleCreatePermission(roleId)).toBe(false);
  });

  it('should follow update on object permissions', async () => {
    const roleId = await createTrackedRole(false);
    const objectMetadataId = await findObjectMetadataIdByName('person');
    const upsertUpdatePermission = (canUpdateObjectRecords: boolean) =>
      upsertObjectPermissions({
        expectToFail: false,
        input: {
          roleId,
          objectPermissions: [
            {
              objectMetadataId,
              canReadObjectRecords: true,
              canUpdateObjectRecords,
            },
          ],
        },
      });

    await upsertUpdatePermission(false);

    expect(await findObjectCreatePermission({ roleId, objectMetadataId })).toBe(
      false,
    );

    await upsertUpdatePermission(true);

    expect(await findObjectCreatePermission({ roleId, objectMetadataId })).toBe(
      true,
    );

    await upsertUpdatePermission(false);

    expect(await findObjectCreatePermission({ roleId, objectMetadataId })).toBe(
      false,
    );
  });

  it('should follow update on row level permission groups', async () => {
    const roleId = await createTrackedRole(false);
    const objectMetadataId = await findObjectMetadataIdByName('company');
    const upsertGroup = async ({
      canUpdateRecords,
      id,
    }: {
      canUpdateRecords: boolean;
      id?: string;
    }) => {
      const { data } = await upsertRowLevelPermissionPredicates({
        expectToFail: false,
        input: {
          roleId,
          objectMetadataId,
          predicates: [],
          predicateGroups: [
            {
              id,
              objectMetadataId,
              logicalOperator:
                RowLevelPermissionPredicateGroupLogicalOperator.AND,
              canUpdateRecords,
            },
          ],
        },
      });

      return data.upsertRowLevelPermissionPredicates.predicateGroups[0].id;
    };

    const groupId = await upsertGroup({ canUpdateRecords: false });

    expect(await findGroupCreatePermission(groupId)).toBe(false);

    await upsertGroup({ canUpdateRecords: true, id: groupId });

    expect(await findGroupCreatePermission(groupId)).toBe(true);

    await upsertGroup({ canUpdateRecords: false, id: groupId });

    expect(await findGroupCreatePermission(groupId)).toBe(false);
  });
});
