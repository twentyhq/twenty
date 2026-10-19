import { MEMBER_ROLE_UNIVERSAL_IDENTIFIER } from 'twenty-shared/constants';
import { v4 } from 'uuid';

import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { deleteOneAgent } from 'test/integration/metadata/suites/agent/utils/delete-one-agent.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const setWorkspaceDefaultRoleId = (roleId: string) =>
  global.testDataSource.query(
    `UPDATE core."workspace" SET "defaultRoleId" = $1 WHERE id = $2`,
    [roleId, SEED_APPLE_WORKSPACE_ID],
  );

const setRoleUniversalIdentifier = (
  roleId: string,
  universalIdentifier: string,
) =>
  global.testDataSource.query(
    `UPDATE core."role" SET "universalIdentifier" = $1 WHERE id = $2`,
    [universalIdentifier, roleId],
  );

const findRoleIds = async (roleId: string): Promise<string[]> =>
  (
    await global.testDataSource.query(
      `SELECT id FROM core."role" WHERE id = $1`,
      [roleId],
    )
  ).map(({ id }: { id: string }) => id);

describe('Member role deletion should fail', () => {
  let adminRoleId: string;
  let memberRoleId: string;

  beforeAll(async () => {
    adminRoleId = (await findOneRoleByLabel({ label: 'Admin' })).id;
    memberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    await setWorkspaceDefaultRoleId(adminRoleId);
  });

  afterAll(async () => {
    await setWorkspaceDefaultRoleId(memberRoleId);
  });

  it('should refuse deleting Member without moving its members', async () => {
    const { errors } = await deleteOneRole({
      expectToFail: true,
      input: { idToDelete: memberRoleId },
    });

    expect(errors?.[0]?.extensions?.errors?.role?.[0]?.errors?.[0]?.code).toBe(
      PermissionsExceptionCode.MEMBER_ROLE_CANNOT_BE_DELETED,
    );

    const roleTargets: { roleId: string }[] = await global.testDataSource.query(
      `SELECT "roleId" FROM core."roleTarget" WHERE "workspaceId" = $1 AND "userWorkspaceId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, USER_WORKSPACE_DATA_SEED_IDS.JONY],
    );

    expect(roleTargets).toEqual([{ roleId: memberRoleId }]);
  });

  describe('when Member is agent-only and loses its last agent', () => {
    let agentOnlyMemberRoleId: string;
    let agentOnlyMemberRoleUniversalIdentifier: string;
    let agentId: string;
    let agentRoleTargetId: string;

    beforeAll(async () => {
      const { data: roleData } = await createOneRole({
        expectToFail: false,
        input: {
          label: 'Agent-only Member',
          description: 'Stands in for an agent-only Member',
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

      agentOnlyMemberRoleId = roleData.createOneRole.id;

      const { data: agentData } = await createOneAgent({
        expectToFail: false,
        input: {
          label: 'Agent-only Member agent',
          prompt: 'Do nothing',
          modelId: TEST_AI_MODEL_ID,
          roleId: agentOnlyMemberRoleId,
        },
      });

      agentId = agentData.createOneAgent.id;

      const [agentRoleTarget] = await global.testDataSource.query(
        `SELECT id FROM core."roleTarget" WHERE "agentId" = $1`,
        [agentId],
      );
      const [agentOnlyMemberRole] = await global.testDataSource.query(
        `SELECT "universalIdentifier" FROM core."role" WHERE id = $1`,
        [agentOnlyMemberRoleId],
      );

      agentRoleTargetId = agentRoleTarget.id;
      agentOnlyMemberRoleUniversalIdentifier =
        agentOnlyMemberRole.universalIdentifier;

      await setRoleUniversalIdentifier(memberRoleId, v4());
      await setRoleUniversalIdentifier(
        agentOnlyMemberRoleId,
        MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
      );
    });

    afterAll(async () => {
      await setRoleUniversalIdentifier(
        agentOnlyMemberRoleId,
        agentOnlyMemberRoleUniversalIdentifier,
      );
      await setRoleUniversalIdentifier(
        memberRoleId,
        MEMBER_ROLE_UNIVERSAL_IDENTIFIER,
      );
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatRoleMaps',
        'flatRolePermissionFlagMaps',
      ]);
      await deleteOneAgent({ expectToFail: false, input: { id: agentId } });
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: agentOnlyMemberRoleId },
      });
    });

    it('should keep Member when workflow step cleanup removes its last agent', async () => {
      await getAppProviderByClassName<AiAgentRoleService>(
        'AiAgentRoleService',
      ).deleteAgentOnlyRoleIfUnused({
        roleId: agentOnlyMemberRoleId,
        roleTargetId: agentRoleTargetId,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });

      expect(await findRoleIds(agentOnlyMemberRoleId)).toEqual([
        agentOnlyMemberRoleId,
      ]);
    });
  });
});
