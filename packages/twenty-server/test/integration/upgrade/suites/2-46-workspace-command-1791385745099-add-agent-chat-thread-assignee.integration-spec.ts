import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddAgentChatThreadSubscriptionsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791322315043-add-agent-chat-thread-subscriptions.command';
import { type AddAgentChatThreadAssigneeCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791385745099-add-agent-chat-thread-assignee.command';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.assignee.universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.assignedAgentChatThreads
    .universalIdentifier,
];

describe('2-46 workspace command - add agent chat thread assignee (integration)', () => {
  let command: AddAgentChatThreadAssigneeCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const findAssigneeMetadata = async () => {
    const { flatFieldMetadataMaps, flatIndexMaps, flatCommandMenuItemMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'flatCommandMenuItemMaps',
      ]);

    return {
      fieldCount: ASSIGNEE_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier,
          }) !== undefined,
      ).length,
      hasIndex:
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier:
            STANDARD_OBJECTS.agentChatThread.indexes.assigneeIndex
              .universalIdentifier,
        }) !== undefined,
      hasCommandMenuItem:
        flatCommandMenuItemMaps.byUniversalIdentifier[
          STANDARD_COMMAND_MENU_ITEMS.assignAiChat.universalIdentifier
        ] !== undefined,
    };
  };

  const hasAssigneeColumn = async (): Promise<boolean> => {
    const columns: unknown[] = await global.testDataSource.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = 'agentChatThread' AND column_name = 'assigneeId'`,
      [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
    );

    return columns.length === 1;
  };

  // An earlier suite may have rebuilt the chat objects without the
  // subscriptions, which the upgrade adds before this one
  beforeAll(async () => {
    command = getAppProviderByClassName<AddAgentChatThreadAssigneeCommand>(
      'AddAgentChatThreadAssigneeCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    await getAppProviderByClassName<AddAgentChatThreadSubscriptionsCommand>(
      'AddAgentChatThreadSubscriptionsCommand',
    ).up(RUN_ON_WORKSPACE_ARGS);
  });

  it('removes the assignee, its index and the command on down', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await findAssigneeMetadata()).toEqual({
      fieldCount: 0,
      hasIndex: false,
      hasCommandMenuItem: false,
    });
    expect(await hasAssigneeColumn()).toBe(false);
  });

  it('adds them back on up', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await findAssigneeMetadata()).toEqual({
      fieldCount: 2,
      hasIndex: true,
      hasCommandMenuItem: true,
    });
    expect(await hasAssigneeColumn()).toBe(true);
  });

  it('changes nothing when it runs again', async () => {
    await expect(command.up(RUN_ON_WORKSPACE_ARGS)).resolves.toBeUndefined();
    expect(await findAssigneeMetadata()).toEqual({
      fieldCount: 2,
      hasIndex: true,
      hasCommandMenuItem: true,
    });
  });
});
