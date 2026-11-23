import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const isAgentChatChannelOpenToRoles = ({
  channel,
  roles,
}: {
  channel: Pick<FlatAgentChatChannelWithRoleIds, 'roleIds'>;
  roles: Pick<FlatRole, 'id' | 'canAccessAllAgentChatChannels'>[];
}): boolean =>
  roles.some(
    (role) =>
      role.canAccessAllAgentChatChannels || channel.roleIds.includes(role.id),
  );
