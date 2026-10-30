import { Injectable } from '@nestjs/common';

import { MetadataFlatEntityMapsCacheProvider } from 'src/engine/workspace-cache/interfaces/metadata-flat-entity-maps-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatAgentChatChannelRoleMaps } from 'src/engine/metadata-modules/flat-agent-chat-channel-role/types/flat-agent-chat-channel-role-maps.type';
import { fromAgentChatChannelRoleEntityToFlatAgentChatChannelRole } from 'src/engine/metadata-modules/flat-agent-chat-channel-role/utils/from-agent-chat-channel-role-entity-to-flat-agent-chat-channel-role.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { type WorkspaceCacheProviderContext } from 'src/engine/workspace-cache/types/workspace-cache-provider-context.type';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const FLAT_AGENT_CHAT_CHANNEL_ROLE_ROWS_REQUIREMENT = {
  agentChatChannelRole: true,
  application: ['id', 'universalIdentifier'],
  agentChatChannel: ['id', 'universalIdentifier'],
  role: ['id', 'universalIdentifier'],
} as const;

@Injectable()
@WorkspaceCache('flatAgentChatChannelRoleMaps', { packingPonderation: 1 })
export class WorkspaceFlatAgentChatChannelRoleMapCacheService extends MetadataFlatEntityMapsCacheProvider<'agentChatChannelRole'> {
  override readonly rowsRequirement =
    FLAT_AGENT_CHAT_CHANNEL_ROLE_ROWS_REQUIREMENT;

  computeForCache({
    rows,
  }: WorkspaceCacheProviderContext<
    typeof FLAT_AGENT_CHAT_CHANNEL_ROLE_ROWS_REQUIREMENT
  >): FlatAgentChatChannelRoleMaps {
    const {
      agentChatChannelRole: agentChatChannelRoles,
      application: applications,
      agentChatChannel: agentChatChannels,
      role: roles,
    } = rows;

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const agentChatChannelIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(agentChatChannels);
    const roleIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(roles);

    const flatAgentChatChannelRoleMaps = createEmptyFlatEntityMaps();

    for (const agentChatChannelRoleEntity of agentChatChannelRoles) {
      const flatAgentChatChannelRole =
        fromAgentChatChannelRoleEntityToFlatAgentChatChannelRole({
          entity: agentChatChannelRoleEntity,
          applicationIdToUniversalIdentifierMap,
          agentChatChannelIdToUniversalIdentifierMap,
          roleIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatAgentChatChannelRole,
        flatEntityMapsToMutate: flatAgentChatChannelRoleMaps,
      });
    }

    return flatAgentChatChannelRoleMaps;
  }
}
