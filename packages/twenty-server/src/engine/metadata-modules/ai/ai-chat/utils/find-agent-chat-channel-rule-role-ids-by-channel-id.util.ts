import { isNonEmptyArray } from 'twenty-shared/utils';
import { type EntityManager, In } from 'typeorm';

import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const findAgentChatChannelRuleRoleIdsByChannelId = async ({
  manager,
  workspaceId,
  channelIds,
}: {
  manager: Pick<EntityManager, 'getRepository'>;
  workspaceId: string;
  channelIds: string[];
}): Promise<Map<string, Set<string>>> => {
  const uniqueChannelIds = [...new Set(channelIds)];

  if (!isNonEmptyArray(uniqueChannelIds)) {
    return new Map();
  }

  const channelRepository = manager.getRepository(AgentChatChannelEntity);
  const roleRepository = manager.getRepository(RoleEntity);
  const channelRoleRepository = manager.getRepository(
    AgentChatChannelRoleEntity,
  );

  const channels = await channelRepository.find({
    select: { id: true },
    where: { workspaceId, id: In(uniqueChannelIds) },
  });
  const rolesWithAllChannelsAccess = await roleRepository.find({
    select: { id: true },
    where: { workspaceId, canAccessAllAgentChatChannels: true },
  });
  const channelRoles = await channelRoleRepository.find({
    select: { channelId: true, roleId: true },
    where: { workspaceId, channelId: In(uniqueChannelIds) },
  });

  const allChannelsRoleIds = rolesWithAllChannelsAccess.map(({ id }) => id);
  const ruleRoleIdsByChannelId = new Map(
    channels.map(({ id }) => [id, new Set(allChannelsRoleIds)]),
  );

  for (const { channelId, roleId } of channelRoles) {
    ruleRoleIdsByChannelId.get(channelId)?.add(roleId);
  }

  return ruleRoleIdsByChannelId;
};
