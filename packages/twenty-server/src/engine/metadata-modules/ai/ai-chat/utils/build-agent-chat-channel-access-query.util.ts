import { type EntityManager } from 'typeorm';

import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

export const buildAgentChatChannelAccessQuery = ({
  manager,
  workspaceIdParameter,
}: {
  manager: Pick<EntityManager, 'getRepository'>;
  workspaceIdParameter: string;
}): string => {
  const explicitRoleAccessQuery = manager
    .getRepository(AgentChatChannelRoleEntity)
    .createQueryBuilder('channel_role')
    .select('channel_role.channelId', 'channel_id')
    .addSelect('channel_role.roleId', 'role_id')
    .where(`channel_role.workspaceId = ${workspaceIdParameter}`)
    .getQuery();
  const allChannelsAccessQuery = manager
    .getRepository(AgentChatChannelEntity)
    .createQueryBuilder('channel')
    .select('channel.id', 'channel_id')
    .addSelect('workspace_role.id', 'role_id')
    .innerJoin(
      RoleEntity,
      'workspace_role',
      'workspace_role.workspaceId = channel.workspaceId AND workspace_role.canAccessAllAgentChatChannels',
    )
    .where(`channel.workspaceId = ${workspaceIdParameter}`)
    .getQuery();

  return `${explicitRoleAccessQuery} UNION ${allChannelsAccessQuery}`;
};
