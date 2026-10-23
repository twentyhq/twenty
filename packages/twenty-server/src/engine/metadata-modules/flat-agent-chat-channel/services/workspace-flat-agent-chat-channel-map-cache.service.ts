import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatAgentChatChannelMaps } from 'src/engine/metadata-modules/flat-agent-chat-channel/types/flat-agent-chat-channel-maps.type';
import { fromAgentChatChannelEntityToFlatAgentChatChannel } from 'src/engine/metadata-modules/flat-agent-chat-channel/utils/from-agent-chat-channel-entity-to-flat-agent-chat-channel.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_AGENT_CHAT_CHANNEL_ROWS_REQUIREMENT = {
  agentChatChannel: true,
  application: ['id', 'universalIdentifier'],
  agentChatChannelRole: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['channelId'],
  },
  navigationMenuItem: {
    columns: ['id', 'universalIdentifier'],
    groupBy: ['agentChatChannelId'],
  },
} as const;

@Injectable()
@WorkspaceCache('flatAgentChatChannelMaps', { packingPonderation: 1 })
export class WorkspaceFlatAgentChatChannelMapCacheService extends MetadataFlatEntityMapsCacheProvider<'agentChatChannel'> {
  override readonly rowsRequirement = FLAT_AGENT_CHAT_CHANNEL_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_AGENT_CHAT_CHANNEL_ROWS_REQUIREMENT
  >): FlatAgentChatChannelMaps {
    const {
      agentChatChannel: agentChatChannels,
      application: applications,
      agentChatChannelRole: channelRoles,
      navigationMenuItem: navigationMenuItems,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);

    const flatAgentChatChannelMaps = createEmptyFlatEntityMaps();

    for (const agentChatChannelEntity of agentChatChannels) {
      const flatAgentChatChannel =
        fromAgentChatChannelEntityToFlatAgentChatChannel({
          entity: {
            ...agentChatChannelEntity,
            channelRoles:
              channelRoles.byChannelId.get(agentChatChannelEntity.id) || [],
            navigationMenuItems:
              navigationMenuItems.byAgentChatChannelId.get(
                agentChatChannelEntity.id,
              ) || [],
          },
          applicationIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatAgentChatChannel,
        flatEntityMapsToMutate: flatAgentChatChannelMaps,
      });
    }

    return flatAgentChatChannelMaps;
  }
}
