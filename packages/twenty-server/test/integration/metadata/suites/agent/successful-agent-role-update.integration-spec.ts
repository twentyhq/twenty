import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';

describe('Agent role update should succeed', () => {
  let testAgentId: string;
  let testRoleId: string;
  let secondTestRoleId: string;

  beforeAll(async () => {
    const { data: role1Data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Agent Role 1',
        description: 'First test role for agent assignment',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });

    const { data: role2Data } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Agent Role 2',
        description: 'Second test role for agent assignment',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });

    testRoleId = role1Data.createOneRole.id;
    secondTestRoleId = role2Data.createOneRole.id;
  });

  afterAll(async () => {
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: testRoleId },
    });
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: secondTestRoleId },
    });
  });

  afterEach(async () => {
    if (testAgentId) {
      await deleteOneAgent({
        expectToFail: false,
        input: { id: testAgentId },
      });
    }
  });

  it('should add a role to an agent that does not have one initially', async () => {
    const { data: createData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Agent Without Role',
        prompt: 'Test prompt',
        modelId: 'gpt-4o',
      },
    });

    testAgentId = createData.createOneAgent.id;

    expect(createData.createOneAgent.roleId).toBeNull();

    const { data: updateData } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        roleId: testRoleId,
      },
    });

    expect(updateData.updateOneAgent).toMatchObject({
      id: testAgentId,
      roleId: testRoleId,
      label: 'Agent Without Role',
    });
  });

  it('should change the role of an agent that already has one', async () => {
    const { data: createData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Agent With Initial Role',
        prompt: 'Test prompt',
        modelId: 'gpt-4o',
        roleId: testRoleId,
      },
    });

    testAgentId = createData.createOneAgent.id;

    expect(createData.createOneAgent.roleId).toBe(testRoleId);

    const { data: updateData } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        roleId: secondTestRoleId,
      },
    });

    expect(updateData.updateOneAgent).toMatchObject({
      id: testAgentId,
      roleId: secondTestRoleId,
      label: 'Agent With Initial Role',
    });
  });

  it('should remove a role from an agent that already has one', async () => {
    const { data: createData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Agent With Role To Remove',
        prompt: 'Test prompt',
        modelId: 'gpt-4o',
        roleId: testRoleId,
      },
    });

    testAgentId = createData.createOneAgent.id;

    expect(createData.createOneAgent.roleId).toBe(testRoleId);

    const { data: updateData } = await updateOneAgent({
      expectToFail: false,
      input: {
        id: testAgentId,
        roleId: null,
      },
    });

    expect(updateData.updateOneAgent).toMatchObject({
      id: testAgentId,
      roleId: null,
      label: 'Agent With Role To Remove',
    });
  });
});
