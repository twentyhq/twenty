import {
  type EntityManager,
  type ObjectLiteral,
  type SelectQueryBuilder,
} from 'typeorm';

import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

const ROLE_CAN_ACCESS_THREAD_CHANNEL =
  '(role."canAccessAllAgentChatChannels" = true OR channel_role.id IS NOT NULL)';

export const buildAgentChatChannelRuleGrantsQuery = ({
  manager,
  workspaceId,
  threadTable,
}: {
  manager: Pick<EntityManager, 'createQueryBuilder'>;
  workspaceId: string;
  threadTable: string;
}): SelectQueryBuilder<ObjectLiteral> =>
  manager
    .createQueryBuilder()
    .select('thread.id', 'recordId')
    .addSelect('role.id', 'principalId')
    .addSelect('thread."channelId"', 'sourceId')
    .from(threadTable, 'thread')
    .innerJoin(
      AgentChatChannelEntity,
      'channel',
      'channel.id = thread."channelId" AND channel."workspaceId" = :workspaceId',
    )
    .innerJoin(RoleEntity, 'role', 'role."workspaceId" = :workspaceId')
    .leftJoin(
      AgentChatChannelRoleEntity,
      'channel_role',
      'channel_role."workspaceId" = :workspaceId AND channel_role."channelId" = thread."channelId" AND channel_role."roleId" = role.id',
    )
    .where(ROLE_CAN_ACCESS_THREAD_CHANNEL)
    .setParameter('workspaceId', workspaceId);
