import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791405449480-add-agent-chat-channels.command';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const THREAD_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.channel.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.channelArchivedAt.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.channelSnoozedUntil
    .universalIdentifier,
  STANDARD_OBJECTS.workspaceMember.fields.agentChatChannelMemberships
    .universalIdentifier,
];

describe('2-46 workspace command - add agent chat channels (integration)', () => {
  let command: AddAgentChatChannelsCommand;
  let workspaceCacheService: WorkspaceCacheService;

  const findChannelMetadata = async () => {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    const threadObject =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    return {
      objectNames: [
        STANDARD_OBJECTS.agentChatChannel.universalIdentifier,
        STANDARD_OBJECTS.agentChatChannelMember.universalIdentifier,
      ]
        .map(
          (universalIdentifier) =>
            flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier]
              ?.nameSingular,
        )
        .filter((nameSingular) => nameSingular !== undefined),
      fieldCount: THREAD_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatFieldMetadataMaps,
            universalIdentifier,
          }) !== undefined,
      ).length,
      hasThreadIndex:
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier:
            STANDARD_OBJECTS.agentChatThread.indexes.channelLastActivityIndex
              .universalIdentifier,
        }) !== undefined,
      threadReadability: threadObject?.readability,
    };
  };

  const hasChannelTable = async (): Promise<boolean> => {
    const tables: unknown[] = await global.testDataSource.query(
      `SELECT 1 FROM information_schema.tables
       WHERE table_schema = $1 AND table_name = 'agentChatChannel'`,
      [getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)],
    );

    return tables.length === 1;
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddAgentChatChannelsCommand>(
      'AddAgentChatChannelsCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
  });

  it('removes channels and reads chats through their own grants again on down', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await findChannelMetadata()).toEqual({
      objectNames: [],
      fieldCount: 0,
      hasThreadIndex: false,
      threadReadability: MetadataReadability.PRIVATE,
    });
    expect(await hasChannelTable()).toBe(false);
  });

  it('adds them back on up', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await findChannelMetadata()).toEqual({
      objectNames: ['agentChatChannel', 'agentChatChannelMember'],
      fieldCount: 4,
      hasThreadIndex: true,
      threadReadability: MetadataReadability.INHERITED,
    });
    expect(await hasChannelTable()).toBe(true);
  });

  it('changes nothing when it runs again', async () => {
    await expect(command.up(RUN_ON_WORKSPACE_ARGS)).resolves.toBeUndefined();
    expect(await findChannelMetadata()).toEqual({
      objectNames: ['agentChatChannel', 'agentChatChannelMember'],
      fieldCount: 4,
      hasThreadIndex: true,
      threadReadability: MetadataReadability.INHERITED,
    });
  });
});
