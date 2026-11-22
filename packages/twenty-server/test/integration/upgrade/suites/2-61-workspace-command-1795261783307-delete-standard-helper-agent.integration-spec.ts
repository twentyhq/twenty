import { TEST_AI_MODEL_ID } from 'test/integration/constants/test-ai-model-ids.constants';
import { createOneAgent } from 'test/integration/metadata/suites/agent/utils/create-one-agent.util';
import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { type DeleteStandardHelperAgentCommand } from 'src/database/commands/upgrade-version-command/2-61/2-61-workspace-command-1795261783307-delete-standard-helper-agent.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const HELPER_AGENT_UNIVERSAL_IDENTIFIER =
  '20202020-c7ab-4065-b822-0ca1d5de60a9';

type HelperAgentRows = {
  agentIds: string[];
  roleTargetIds: string[];
  navigationMenuItemIds: string[];
};

const readHelperAgentRows = async (
  agentId: string,
): Promise<HelperAgentRows> => {
  const selectIds = async (query: string): Promise<string[]> =>
    (await global.testDataSource.query<{ id: string }[]>(query, [agentId])).map(
      ({ id }) => id,
    );

  return {
    agentIds: await selectIds(`SELECT id FROM core."agent" WHERE id = $1`),
    roleTargetIds: await selectIds(
      `SELECT id FROM core."roleTarget" WHERE "agentId" = $1`,
    ),
    navigationMenuItemIds: await selectIds(
      `SELECT id FROM core."navigationMenuItem" WHERE "agentId" = $1`,
    ),
  };
};

const recomputeAgentCaches = () =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatAgentMaps',
    'flatRoleTargetMaps',
    'flatNavigationMenuItemMaps',
  ]);

describe('2-61 workspace command - delete standard helper agent (integration)', () => {
  let command: DeleteStandardHelperAgentCommand;
  let helperAgentId: string;
  let roleId: string;

  const runCommand = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
    });

  beforeAll(async () => {
    command = getAppProviderByClassName<DeleteStandardHelperAgentCommand>(
      'DeleteStandardHelperAgentCommand',
    );

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Helper agent role',
        description: 'Role assigned to the helper agent',
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

    roleId = roleData.createOneRole.id;

    const { data: agentData } = await createOneAgent({
      expectToFail: false,
      input: {
        label: 'Helper',
        prompt: 'You are a Helper Agent for Twenty.',
        modelId: TEST_AI_MODEL_ID,
        roleId,
      },
      gqlFields: 'id',
    });

    helperAgentId = agentData.createOneAgent.id;

    await createNavigationMenuItem({
      expectToFail: false,
      input: { type: NavigationMenuItemType.AGENT, agentId: helperAgentId },
      gqlFields: 'id',
    });

    // The standard application no longer builds the helper agent, so stand one in
    const { twentyStandardFlatApplication } =
      await getAppProviderByClassName<ApplicationService>(
        'ApplicationService',
      ).findWorkspaceTwentyStandardAndCustomApplicationOrThrow({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      });

    await global.testDataSource.query(
      `UPDATE core."agent"
       SET "applicationId" = $1, "universalIdentifier" = $2, name = 'helper'
       WHERE id = $3`,
      [
        twentyStandardFlatApplication.id,
        HELPER_AGENT_UNIVERSAL_IDENTIFIER,
        helperAgentId,
      ],
    );

    await recomputeAgentCaches();
  });

  afterAll(async () => {
    await global.testDataSource.query(
      `DELETE FROM core."agent" WHERE id = $1`,
      [helperAgentId],
    );
    await recomputeAgentCaches();
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: roleId },
    });
  });

  it('leaves the helper agent untouched on a dry run', async () => {
    const rowsBefore = await readHelperAgentRows(helperAgentId);

    expect(rowsBefore.agentIds).toHaveLength(1);
    expect(rowsBefore.roleTargetIds).toHaveLength(1);
    expect(rowsBefore.navigationMenuItemIds).toHaveLength(1);

    await runCommand({ dryRun: true });

    expect(await readHelperAgentRows(helperAgentId)).toEqual(rowsBefore);
  });

  it('deletes the helper agent with its role target and navigation menu items, once', async () => {
    await runCommand();
    await runCommand();

    expect(await readHelperAgentRows(helperAgentId)).toEqual({
      agentIds: [],
      roleTargetIds: [],
      navigationMenuItemIds: [],
    });
  });
});
