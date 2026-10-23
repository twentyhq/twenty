import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type AddAgentChatChannelsCommand } from 'src/database/commands/upgrade-version-command/2-51/2-51-workspace-command-1792686629823-add-agent-chat-channels.command';
import { type AgentChatChannelService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { STANDARD_AGENT_CHAT_CHANNEL } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-agent-chat-channel.constant';

const RUN_ON_WORKSPACE_ARGS = {
  workspaceId: SEED_APPLE_WORKSPACE_ID,
  options: {},
  index: 0,
  total: 1,
};

const THREAD_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.agentChatThread.fields.channelId.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.channelArchivedAt.universalIdentifier,
  STANDARD_OBJECTS.agentChatThread.fields.channelSnoozedUntil
    .universalIdentifier,
];

const ADDED_STATE = {
  fieldCount: 3,
  hasThreadIndex: true,
  generalChannel: {
    name: 'General',
    isCustom: false,
  },
};

describe('2-51 workspace command - add agent chat channels (integration)', () => {
  let command: AddAgentChatChannelsCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let channelService: AgentChatChannelService;

  const findChannelMetadata = async () => {
    const { flatFieldMetadataMaps, flatIndexMaps, flatAgentChatChannelMaps } =
      await workspaceCacheService.getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
        'flatAgentChatChannelMaps',
      ]);
    const generalChannel = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatAgentChatChannelMaps,
      universalIdentifier:
        STANDARD_AGENT_CHAT_CHANNEL.general.universalIdentifier,
    });

    return {
      fieldCount: THREAD_FIELD_UNIVERSAL_IDENTIFIERS.filter(
        (universalIdentifier) =>
          isDefined(
            findFlatEntityByUniversalIdentifier({
              flatEntityMaps: flatFieldMetadataMaps,
              universalIdentifier,
            }),
          ),
      ).length,
      hasThreadIndex: isDefined(
        findFlatEntityByUniversalIdentifier({
          flatEntityMaps: flatIndexMaps,
          universalIdentifier:
            STANDARD_OBJECTS.agentChatThread.indexes.channelLastActivityIndex
              .universalIdentifier,
        }),
      ),
      generalChannel: isDefined(generalChannel)
        ? {
            name: generalChannel.name,
            isCustom: generalChannel.isCustom,
          }
        : null,
    };
  };

  beforeAll(() => {
    command = getAppProviderByClassName<AddAgentChatChannelsCommand>(
      'AddAgentChatChannelsCommand',
    );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );
    channelService = getAppProviderByClassName<AgentChatChannelService>(
      'AgentChatChannelService',
    );
  });

  afterAll(async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);
  });

  it('removes the thread channel fields and General on down', async () => {
    await command.down(RUN_ON_WORKSPACE_ARGS);

    expect(await findChannelMetadata()).toEqual({
      fieldCount: 0,
      hasThreadIndex: false,
      generalChannel: null,
    });
  });

  it('changes nothing on a dry run', async () => {
    await command.up({ ...RUN_ON_WORKSPACE_ARGS, options: { dryRun: true } });

    expect((await findChannelMetadata()).generalChannel).toBeNull();
  });

  it('refuses new channels until the thread channel fields exist', async () => {
    await expect(
      channelService.createChannel({
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        name: 'Support',
        icon: null,
        color: null,
        roleIds: [],
      }),
    ).rejects.toMatchObject({
      code: AiExceptionCode.CHAT_CHANNELS_UNAVAILABLE,
    });
  });

  it('adds them back on up', async () => {
    await command.up(RUN_ON_WORKSPACE_ARGS);

    expect(await findChannelMetadata()).toEqual(ADDED_STATE);
  });

  it('changes nothing when it runs again', async () => {
    await expect(command.up(RUN_ON_WORKSPACE_ARGS)).resolves.toBeUndefined();
    expect(await findChannelMetadata()).toEqual(ADDED_STATE);
  });
});
