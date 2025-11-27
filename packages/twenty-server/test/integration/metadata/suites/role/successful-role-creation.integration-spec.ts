import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { isDefined } from 'twenty-shared/utils';

describe('Role creation should succeed', () => {
  let createdRoleId: string | undefined;

  afterEach(async () => {
    if (isDefined(createdRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: createdRoleId },
      });
      createdRoleId = undefined;
    }
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

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data.createOneRole.id).toBeDefined();
    expect(data.createOneRole.label).toBe('Test Custom Role');
    expect(data.createOneRole.description).toBe(
      'A custom role for integration testing',
    );
    expect(data.createOneRole.icon).toBe('IconSettings');
    expect(data.createOneRole.isEditable).toBe(true);
    expect(data.createOneRole.canUpdateAllSettings).toBe(false);
    expect(data.createOneRole.canAccessAllTools).toBe(true);
    expect(data.createOneRole.canReadAllObjectRecords).toBe(true);
    expect(data.createOneRole.canUpdateAllObjectRecords).toBe(false);
    expect(data.createOneRole.canSoftDeleteAllObjectRecords).toBe(false);
    expect(data.createOneRole.canDestroyAllObjectRecords).toBe(false);
    expect(data.createOneRole.canBeAssignedToUsers).toBe(true);
    expect(data.createOneRole.canBeAssignedToAgents).toBe(false);
    expect(data.createOneRole.canBeAssignedToApiKeys).toBe(false);

    createdRoleId = data.createOneRole.id;
  });
});
