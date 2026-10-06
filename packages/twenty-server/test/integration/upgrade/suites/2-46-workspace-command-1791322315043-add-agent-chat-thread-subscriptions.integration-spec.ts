import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddAgentChatThreadSubscriptionsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791322315043-add-agent-chat-thread-subscriptions.command';
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

const SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.isSubscribed
    .universalIdentifier,
  STANDARD_OBJECTS.agentChatThreadParticipant.fields.lastMentionedAt
    .universalIdentifier,
];

const SUBSCRIPTION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  STANDARD_COMMAND_MENU_ITEMS.subscribeToAiChat.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.unsubscribeFromAiChat.universalIdentifier,
];

describe('2-46 workspace command - add agent chat thread subscriptions (integration)', () => {
  let command: AddAgentChatThreadSubscriptionsCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const findSubscriptionMetadata = async () => {
    const { flatFieldMetadataMaps, flatCommandMenuItemMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
        'flatCommandMenuItemMaps',
      ]);

    return {
      fields: SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier,
          }) !== undefined,
      ),
      commandMenuItems:
        SUBSCRIPTION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.filter(
          (universalIdentifier) =>
            flatCommandMenuItemMaps.byUniversalIdentifier[
              universalIdentifier
            ] !== undefined,
        ),
    };
  };

  const listParticipantColumns = async (): Promise<string[]> => {
    const columns: { column_name: string }[] =
      await global.testDataSource.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = 'agentChatThreadParticipant'
           AND column_name IN ('isSubscribed', 'lastMentionedAt')
         ORDER BY column_name`,
        [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
      );

    return columns.map(({ column_name }) => column_name);
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddAgentChatThreadSubscriptionsCommand>(
      'AddAgentChatThreadSubscriptionsCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  it('removes the fields and commands on down', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await findSubscriptionMetadata()).toEqual({
      fields: [],
      commandMenuItems: [],
    });
    expect(await listParticipantColumns()).toEqual([]);
  });

  it('adds them back on up, with every existing row subscribed', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await findSubscriptionMetadata()).toEqual({
      fields: SUBSCRIPTION_FIELD_UNIVERSAL_IDENTIFIERS,
      commandMenuItems: SUBSCRIPTION_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
    });
    expect(await listParticipantColumns()).toEqual([
      'isSubscribed',
      'lastMentionedAt',
    ]);

    const [{ unsubscribedCount }] = await global.testDataSource.query(
      `SELECT count(*)::int AS "unsubscribedCount"
       FROM ${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}."agentChatThreadParticipant"
       WHERE "isSubscribed" IS NOT TRUE`,
    );

    expect(unsubscribedCount).toBe(0);
  });

  it('changes nothing when it runs again', async () => {
    await expect(command.up(RUN_ON_WORKSPACE_ARGS)).resolves.toBeUndefined();
    expect(await listParticipantColumns()).toEqual([
      'isSubscribed',
      'lastMentionedAt',
    ]);
  });
});
