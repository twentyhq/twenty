import { isDefined } from 'twenty-shared/utils';

import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

export const isAgentChatChannelOpenToRole = ({
  channel,
  role,
}: {
  channel: Pick<FlatAgentChatChannelWithRoleIds, 'roleIds'>;
  role: Pick<FlatRole, 'id' | 'canAccessAllAgentChatChannels'> | undefined;
}): boolean =>
  isDefined(role) &&
  (role.canAccessAllAgentChatChannels || channel.roleIds.includes(role.id));
