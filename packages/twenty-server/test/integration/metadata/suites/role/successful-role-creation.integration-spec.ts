import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';

describe('Role creation should succeed', () => {
  let createdRoleId: string;

  afterEach(async () => {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: createdRoleId },
    });
  });

  it('should create a basic custom role with minimal input', async () => {
    const { data, errors } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Custom Role',
        description: 'A custom role for integration testing',
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

    createdRoleId = data?.createOneRole?.id;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.createOneRole).toMatchObject({
      id: expect.any(String),
      label: 'Test Custom Role',
      description: 'A custom role for integration testing',
      icon: 'IconSettings',
      isEditable: true,
      canUpdateAllSettings: false,
      canAccessAllTools: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
    });
  });

  it('should create role with read and write permissions', async () => {
    const { data, errors } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Role With All Permissions',
        description: 'Role with read and write permissions',
        canUpdateAllSettings: true,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
      },
    });

    createdRoleId = data?.createOneRole?.id;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.createOneRole).toMatchObject({
      id: expect.any(String),
      label: 'Role With All Permissions',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: true,
    });
  });

  it('should create role with read=false and all write permissions=false', async () => {
    const { data, errors } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Read-Only False Role',
        description: 'Role with no read or write permissions',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      },
    });

    createdRoleId = data?.createOneRole?.id;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.createOneRole).toMatchObject({
      id: expect.any(String),
      label: 'Read-Only False Role',
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    });
  });
});
