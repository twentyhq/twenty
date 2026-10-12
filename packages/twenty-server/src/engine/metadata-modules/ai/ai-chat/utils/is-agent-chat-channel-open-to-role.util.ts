import { isDefined } from 'twenty-shared/utils';

import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';

export const isAgentChatChannelOpenToRole = ({
  channel,
  roleId,
}: {
  channel: Pick<
    FlatAgentChatChannelWithRoleIds,
    'isOpenToEveryone' | 'roleIds'
  >;
  roleId: string | undefined;
}): boolean =>
  channel.isOpenToEveryone ||
  (isDefined(roleId) && channel.roleIds.includes(roleId));
