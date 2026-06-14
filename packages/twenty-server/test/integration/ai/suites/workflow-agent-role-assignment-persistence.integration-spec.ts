import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';

describe('Workflow agent role assignment persistence (integration)', () => {
  let agentWithRoleId: string;
  let agentWithoutRoleId: string;
  let roleId: string;

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Workflow Agent Assignment Test Role',
        description:
          'Role used to verify workflow agent role assignment persistence',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
    });

    roleId = roleData.createOneRole.id;

    const { data: agentWithRoleData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Role-Assigned Workflow Agent',
        prompt: 'Test prompt',
        modelId: 'openai/gpt-4.1',
        roleId,
      },
    });

    agentWithRoleId = agentWithRoleData.createOneAgent.id;

    const { data: agentWithoutRoleData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Roleless Workflow Agent',
        prompt: 'Test prompt',
        modelId: 'openai/gpt-4.1',
      },
    });

    agentWithoutRoleId = agentWithoutRoleData.createOneAgent.id;
  });

  afterAll(async () => {
    await deleteOneAgent({
      expectToFail: false,
      input: { id: agentWithRoleId },
    });
    await deleteOneAgent({
      expectToFail: false,
      input: { id: agentWithoutRoleId },
    });
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: roleId },
    });
  });

  it('persists a role target row when an agent is created with a roleId', async () => {
    const rows = await global.testDataSource.query(
      `SELECT "roleId" FROM "core"."roleTarget"
       WHERE "agentId" = $1 AND "workspaceId" = $2`,
      [agentWithRoleId, SEED_APPLE_WORKSPACE_ID],
    );

    expect(rows).toHaveLength(1);
    expect(rows[0].roleId).toBe(roleId);
  });

  it('resolves the persisted agent role through the role target repository', async () => {
    const roleTargetRepository = global.app.get<Repository<RoleTargetEntity>>(
      getRepositoryToken(RoleTargetEntity),
    );

    const roleTarget = await roleTargetRepository.findOne({
      where: {
        agentId: agentWithRoleId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      },
      select: ['roleId'],
    });

    expect(roleTarget?.roleId).toBe(roleId);
  });

  it('does not create a role target row for an agent with no role assignment', async () => {
    const roleTargetRepository = global.app.get<Repository<RoleTargetEntity>>(
      getRepositoryToken(RoleTargetEntity),
    );

    const roleTarget = await roleTargetRepository.findOne({
      where: {
        agentId: agentWithoutRoleId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      },
      select: ['roleId'],
    });

    expect(roleTarget).toBeNull();
  });
});
