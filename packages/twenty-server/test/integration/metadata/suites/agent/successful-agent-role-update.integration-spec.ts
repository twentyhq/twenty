import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { ensureAgentRole } from 'test/integration/metadata/suites/agent/utils/ensure-agent-role.util';
import { findOneAgent } from 'test/integration/metadata/suites/agent/utils/find-one-agent.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { updateOneAgent } from 'test/integration/metadata/suites/agent/utils/update-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';

describe('Agent role update should succeed', () => {
  let testAgentId: string;
  let testRoleId: string;
  let secondTestRoleId: string;
  const initializedRoleIds = new Set<string>();
  const additionalAgentIds = new Set<string>();

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

    for (const agentId of additionalAgentIds) {
      await deleteOneAgent({ input: { id: agentId } });
    }

    for (const roleId of initializedRoleIds) {
      await deleteOneRole({ input: { idToDelete: roleId } });
    }

    additionalAgentIds.clear();
    initializedRoleIds.clear();
  });

  it('should add a role to an agent that does not have one initially', async () => {
    const { data: createData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Agent Without Role',
        prompt: 'Test prompt',
        modelId: TEST_AI_MODEL_ID,
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
        modelId: TEST_AI_MODEL_ID,
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
        modelId: TEST_AI_MODEL_ID,
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

  it('initializes a default-deny role once using the saved agent label', async () => {
    const { data: created } = await createOneAgent({
      input: {
        label: 'Agent Before Role Initialization',
        prompt: 'Test prompt',
        modelId: TEST_AI_MODEL_ID,
      },
    });
    testAgentId = created.createOneAgent.id;
    await updateOneAgent({
      input: { id: testAgentId, label: 'Agent After Role Initialization' },
    });

    const { data: initialized, errors } = await ensureAgentRole({
      agentId: testAgentId,
    });
    expect(errors).toBeUndefined();
    initializedRoleIds.add(initialized.ensureAgentRole.id);
    expect(initialized.ensureAgentRole).toMatchObject({
      label: 'Agent After Role Initialization Agent Role',
      canUpdateAllSettings: false,
      canAccessAllTools: false,
      canAccessAllAgentChatChannels: false,
      canReadAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
      canBeAssignedToUsers: false,
      canBeAssignedToAgents: true,
      canBeAssignedToApiKeys: false,
      agents: [{ id: testAgentId }],
    });

    const { data: repeated, errors: repeatErrors } = await ensureAgentRole({
      agentId: testAgentId,
    });
    const { data: reloaded } = await findOneAgent({
      input: { id: testAgentId },
    });
    const { data: roles } = await findRoles();
    expect(repeatErrors).toBeUndefined();
    expect(repeated.ensureAgentRole.id).toBe(initialized.ensureAgentRole.id);
    expect(reloaded.findOneAgent.roleId).toBe(initialized.ensureAgentRole.id);
    expect(
      roles.getRoles.filter(({ label }) =>
        label.startsWith('Agent After Role Initialization Agent Role'),
      ),
    ).toHaveLength(1);
  });

  it('returns one assigned role to concurrent initialization requests', async () => {
    const { data: created } = await createOneAgent({
      input: {
        label: 'Concurrent Role Initialization',
        prompt: 'Test prompt',
        modelId: TEST_AI_MODEL_ID,
      },
    });
    testAgentId = created.createOneAgent.id;

    const results = await Promise.all([
      ensureAgentRole({ agentId: testAgentId }),
      ensureAgentRole({ agentId: testAgentId }),
    ]);

    for (const { data, errors } of results) {
      expect(errors).toBeUndefined();
      initializedRoleIds.add(data.ensureAgentRole.id);
    }

    const [first, second] = results;
    const { data: roles } = await findRoles();
    expect(second.data.ensureAgentRole.id).toBe(first.data.ensureAgentRole.id);
    expect(
      roles.getRoles.filter(({ label }) =>
        label.startsWith('Concurrent Role Initialization Agent Role'),
      ),
    ).toHaveLength(1);
  });

  it('refuses to replace a role shared with another agent', async () => {
    const { data: created } = await createOneAgent({
      input: {
        label: 'Agent With Shared Role',
        prompt: 'Test prompt',
        modelId: TEST_AI_MODEL_ID,
        roleId: testRoleId,
      },
    });
    testAgentId = created.createOneAgent.id;
    const { data: other } = await createOneAgent({
      input: {
        label: 'Other Agent With Shared Role',
        prompt: 'Test prompt',
        modelId: TEST_AI_MODEL_ID,
        roleId: testRoleId,
      },
    });
    additionalAgentIds.add(other.createOneAgent.id);

    const { errors } = await ensureAgentRole({
      agentId: testAgentId,
      expectToFail: true,
    });
    const { data: reloaded } = await findOneAgent({
      input: { id: testAgentId },
    });
    expect(errors).toEqual([
      expect.objectContaining({
        extensions: expect.objectContaining({
          code: 'FORBIDDEN',
          subCode: 'ROLE_NOT_EDITABLE',
        }),
      }),
    ]);
    expect(reloaded.findOneAgent.roleId).toBe(testRoleId);
  });

  it.each(['users', 'API keys'])(
    'refuses to initialize a role assignable to %s',
    async (assignmentKind) => {
      const { data: createdRole } = await createOneRole({
        input: {
          label: `Agent Role Assignable To ${assignmentKind}`,
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canBeAssignedToUsers: assignmentKind === 'users',
          canBeAssignedToAgents: true,
          canBeAssignedToApiKeys: assignmentKind === 'API keys',
        },
      });
      const roleId = createdRole.createOneRole.id;
      initializedRoleIds.add(roleId);
      const { data: createdAgent } = await createOneAgent({
        input: {
          label: `Agent With ${assignmentKind} Role`,
          prompt: 'Test prompt',
          modelId: TEST_AI_MODEL_ID,
          roleId,
        },
      });
      testAgentId = createdAgent.createOneAgent.id;

      const { errors } = await ensureAgentRole({
        agentId: testAgentId,
        expectToFail: true,
      });
      const { data: reloaded } = await findOneAgent({
        input: { id: testAgentId },
      });

      expect(errors).toEqual([
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'FORBIDDEN',
            subCode: 'ROLE_NOT_EDITABLE',
          }),
        }),
      ]);
      expect(reloaded.findOneAgent.roleId).toBe(roleId);
    },
  );
});
