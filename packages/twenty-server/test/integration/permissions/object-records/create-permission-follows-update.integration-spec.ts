import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import { upsertRowLevelPermissionRules } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-rules.util';
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

const findRuleCreatePermission = async (ruleId: string) => {
  const [rule] = await global.testDataSource.query(
    'SELECT "canCreateRecords" FROM core."rowLevelPermissionRule" WHERE id = $1',
    [ruleId],
  );

  return rule.canCreateRecords;
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

  it('should follow update on row level permission rules', async () => {
    const roleId = await createTrackedRole(false);
    const objectMetadataId = await findObjectMetadataIdByName('company');
    const upsertRule = async ({
      canUpdateRecords,
      id,
    }: {
      canUpdateRecords: boolean;
      id?: string;
    }) => {
      const { data } = await upsertRowLevelPermissionRules({
        expectToFail: false,
        input: {
          roleId,
          objectMetadataId,
          rules: [
            {
              id,
              canUpdateRecords,
              predicateGroups: [
                {
                  logicalOperator:
                    RowLevelPermissionPredicateGroupLogicalOperator.AND,
                },
              ],
            },
          ],
        },
      });

      return data.upsertRowLevelPermissionRules.rules[0].id;
    };

    const ruleId = await upsertRule({ canUpdateRecords: false });

    expect(await findRuleCreatePermission(ruleId)).toBe(false);

    await upsertRule({ canUpdateRecords: true, id: ruleId });

    expect(await findRuleCreatePermission(ruleId)).toBe(true);

    await upsertRule({ canUpdateRecords: false, id: ruleId });

    expect(await findRuleCreatePermission(ruleId)).toBe(false);
  });
});
