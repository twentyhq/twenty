import { upsertPermissionFlagGrants } from 'test/integration/metadata/suites/permission-flag-grant/utils/upsert-permission-flag-grants.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { PermissionFlagType } from 'twenty-shared/constants';

describe('Permission flag upsert should succeed', () => {
  let createdRoleId: string;

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role For Permission Flag Success',
        description: 'Role for permission flag successful tests',
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

    const roleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(roleId);
    createdRoleId = roleId;
  });

  afterAll(async () => {
    if (createdRoleId) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRoleId },
      });
    }
  });

  it('should upsert with empty permissionFlagGrantKeys', async () => {
    const { data } = await upsertPermissionFlagGrants({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        permissionFlagGrantKeys: [],
      },
    });

    expect(data?.upsertPermissionFlagGrants).toEqual([]);
  });

  it('should upsert with one permission flag', async () => {
    const { data } = await upsertPermissionFlagGrants({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        permissionFlagGrantKeys: [PermissionFlagType.DATA_MODEL],
      },
    });

    expect(data?.upsertPermissionFlagGrants).toHaveLength(1);
    expect(data?.upsertPermissionFlagGrants?.[0]).toMatchObject({
      roleId: createdRoleId,
      flag: PermissionFlagType.DATA_MODEL,
    });
    expect(data?.upsertPermissionFlagGrants?.[0].id).toBeDefined();
  });

  it('should upsert with multiple permission flags', async () => {
    const { data } = await upsertPermissionFlagGrants({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        permissionFlagGrantKeys: [
          PermissionFlagType.DATA_MODEL,
          PermissionFlagType.ROLES,
          PermissionFlagType.VIEWS,
        ],
      },
    });

    expect(data?.upsertPermissionFlagGrants).toHaveLength(3);
    const flags = data?.upsertPermissionFlagGrants?.map((pf) => pf.flag) ?? [];
    expect(flags).toContain(PermissionFlagType.DATA_MODEL);
    expect(flags).toContain(PermissionFlagType.ROLES);
    expect(flags).toContain(PermissionFlagType.VIEWS);
  });

  it('should upsert to remove some flags (replace with subset)', async () => {
    const { data } = await upsertPermissionFlagGrants({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        permissionFlagGrantKeys: [PermissionFlagType.DATA_MODEL],
      },
    });

    expect(data?.upsertPermissionFlagGrants).toHaveLength(1);
    expect(data?.upsertPermissionFlagGrants?.[0].flag).toBe(
      PermissionFlagType.DATA_MODEL,
    );
  });

  it('should upsert back to empty', async () => {
    const { data } = await upsertPermissionFlagGrants({
      expectToFail: false,
      input: {
        roleId: createdRoleId,
        permissionFlagGrantKeys: [],
      },
    });

    expect(data?.upsertPermissionFlagGrants).toEqual([]);
  });
});
