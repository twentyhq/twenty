import { Injectable } from '@nestjs/common';

import { RecordSharePrincipalType } from 'twenty-shared/types';

import { RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { AgentChatChannelMetadataService } from 'src/engine/metadata-modules/agent-chat-channel/services/agent-chat-channel-metadata.service';
import { type FlatAgentChatChannelWithRoleIds } from 'src/engine/metadata-modules/agent-chat-channel/types/flat-agent-chat-channel-with-role-ids.type';
import { type AgentChatChannelAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-access-args.type';
import { isAgentChatChannelOpenToRole } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-agent-chat-channel-open-to-role.util';
import { throwAgentChatChannelNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-errors.util';

type MemberArgs = {
  workspaceId: string;
  workspaceMemberId: string;
};

@Injectable()
export class AgentChatChannelAccessService {
  constructor(
    private readonly channelMetadataService: AgentChatChannelMetadataService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
  ) {}

  async findAccessibleChannels(
    args: MemberArgs,
  ): Promise<FlatAgentChatChannelWithRoleIds[]> {
    const [channels, roleId] = await Promise.all([
      this.channelMetadataService.findChannels(args.workspaceId),
      this.findMemberRoleId(args),
    ]);

    return channels.filter((channel) =>
      isAgentChatChannelOpenToRole({ channel, roleId }),
    );
  }

  async assertChannelAccess(
    args: AgentChatChannelAccessArgs,
  ): Promise<FlatAgentChatChannelWithRoleIds> {
    const accessibleChannels = await this.findAccessibleChannels(args);

    return (
      accessibleChannels.find(({ id }) => id === args.channelId) ??
      throwAgentChatChannelNotFound()
    );
  }

  async findMemberRoleId({
    workspaceId,
    workspaceMemberId,
  }: MemberArgs): Promise<string | undefined> {
    const [roleId] = await this.recordSharePrincipalService.resolveRoleIds({
      workspaceId,
      principals: [
        {
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          principalId: workspaceMemberId,
        },
      ],
    });

    return roleId;
  }
}
