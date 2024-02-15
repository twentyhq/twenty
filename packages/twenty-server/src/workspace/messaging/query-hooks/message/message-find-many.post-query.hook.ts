import { Injectable } from '@nestjs/common';

import { groupBy } from 'lodash';

import { IConnection } from 'src/utils/pagination/interfaces/connection.interface';
import { IEdge } from 'src/utils/pagination/interfaces/edge.interface';
import { WorkspacePostQueryHook } from 'src/workspace/workspace-query-runner/workspace-query-hook/interfaces/workspace-post-query-hook.interface';
import { Record as IRecord } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';
import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';
import { WorkspaceMemberService } from 'src/workspace/messaging/repositories/workspace-member/workspace-member.service';
import { ConnectedAccountService } from 'src/workspace/messaging/repositories/connected-account/connected-account.service';

@Injectable()
export class MessageFindManyPostQueryHook implements WorkspacePostQueryHook {
  constructor(
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
    private readonly messageChannelService: MessageChannelService,
    private readonly workspaceMemberService: WorkspaceMemberService,
    private readonly connectedAccountService: ConnectedAccountService,
  ) {}

  async execute<Record extends IRecord = IRecord>(
    userId: string,
    workspaceId: string,
    result: IConnection<Record, IEdge<Record>>,
  ): Promise<IConnection<Record, IEdge<Record>>> {
    const messagesWithHiddenUnsharedMessages = await this.hideUnsharedMessages(
      userId,
      workspaceId,
      result.edges,
    );

    return {
      ...result,
      edges: messagesWithHiddenUnsharedMessages,
    };
  }

  private async hideUnsharedMessages<Record extends IRecord = IRecord>(
    userId: string,
    workspaceId: string,
    messages: IEdge<Record>[],
  ) {
    const messageChannelMessageAssociations =
      await this.messageChannelMessageAssociationService.getByMessageIds(
        messages.map((message) => message.node.id),
        workspaceId,
      );

    const messageChannelMessageAssociationsByMessageIds = groupBy(
      messageChannelMessageAssociations,
      (messageChannelMessageAssociation) =>
        messageChannelMessageAssociation.messageId,
    );

    const messageChannelIds = messageChannelMessageAssociations.map(
      (association) => association.messageChannelId,
    );

    const messageChannels = await this.messageChannelService.getByIds(
      messageChannelIds,
      workspaceId,
    );

    const messageChannelsByIds = groupBy(
      messageChannels,
      (channel) => channel.id,
    );

    const currentWorkspaceMember =
      await this.workspaceMemberService.getByIdOrFail(userId, workspaceId);

    const connectedAccounts = await this.connectedAccountService.getByIds(
      messageChannels.map((channel) => channel.connectedAccountId),
      workspaceId,
    );

    const connectedAccountsByIds = groupBy(
      connectedAccounts,
      (account) => account.id,
    );

    const messagesWithHiddenUnsharedMessages = messages.map((message) => {
      const messageChannelMessageAssociations =
        messageChannelMessageAssociationsByMessageIds[message.node.id];

      const shouldShowMessage = messageChannelMessageAssociations.find(
        (association) => {
          const messageChannel =
            messageChannelsByIds[association.messageChannelId][0];

          messageChannel.visibility === 'share_everything' ||
            connectedAccountsByIds[messageChannel.connectedAccountId][0]
              .accountOwnerId === currentWorkspaceMember.id;
        },
      );

      if (shouldShowMessage) {
        return message;
      }

      return {
        ...message,
        node: {
          ...message.node,
          hidden: true,
        },
      };
    });

    return messagesWithHiddenUnsharedMessages;
  }
}
