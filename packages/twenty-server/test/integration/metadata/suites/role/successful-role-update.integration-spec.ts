import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';

describe('Role update should succeed', () => {
  let testRoleId: string;

  beforeEach(async () => {
    const { data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Original Role Label',
        description: 'Original description',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    testRoleId = data.createOneRole.id;
  });

  afterEach(async () => {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: testRoleId },
    });
  });

  it('should update role label', async () => {
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          label: 'Updated Role Label',
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      label: 'Updated Role Label',
      description: 'Original description',
      icon: 'IconSettings',
    });
  });

  it('should update role description', async () => {
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          description: 'Updated description for the role',
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      label: 'Original Role Label',
      description: 'Updated description for the role',
    });
  });

  it('should update role icon', async () => {
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          icon: 'IconUser',
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      icon: 'IconUser',
    });
  });

  it('should update role permissions', async () => {
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          canUpdateAllSettings: true,
          canAccessAllTools: true,
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      canUpdateAllSettings: true,
      canAccessAllTools: true,
      canReadAllObjectRecords: true,
    });
  });

  it('should update role object record permissions', async () => {
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: true,
      canDestroyAllObjectRecords: false,
    });
  });

  it('should update role assignment permissions', async () => {
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: true,
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: true,
      canBeAssignedToApiKeys: true,
    });
  });

  it('should update multiple role properties at once', async () => {
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          label: 'Comprehensive Update',
          description: 'Updated multiple fields',
          icon: 'IconBriefcase',
          canUpdateAllSettings: true,
          canAccessAllTools: true,
          canUpdateAllObjectRecords: true,
          canBeAssignedToAgents: true,
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      label: 'Comprehensive Update',
      description: 'Updated multiple fields',
      icon: 'IconBriefcase',
      canUpdateAllSettings: true,
      canAccessAllTools: true,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canBeAssignedToUsers: true,
      canBeAssignedToAgents: true,
    });
  });

  it('should update role to read=false when explicitly setting all write permissions to false', async () => {
    // First update the role to have write permissions
    await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        },
      },
    });

    // Now update to read=false with all write permissions explicitly set to false
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    });
  });

  it('should update role from read=true to read=false with all write=false', async () => {
    // Start with read=true, write=false (default from beforeEach)
    const { data, errors } = await updateOneRole({
      expectToFail: false,
      input: {
        idToUpdate: testRoleId,
        updatePayload: {
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
        },
      },
    });

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.updateOneRole).toMatchObject({
      id: testRoleId,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    });
  });
});
