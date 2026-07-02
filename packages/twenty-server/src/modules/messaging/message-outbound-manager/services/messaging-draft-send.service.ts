import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In, Repository } from 'typeorm';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';
import { MessagingMessageOutboundService } from 'src/modules/messaging/message-outbound-manager/services/messaging-message-outbound.service';
import { type SendMessageInput } from 'src/modules/messaging/message-outbound-manager/types/send-message-input.type';
import { type SendMessageResult } from 'src/modules/messaging/message-outbound-manager/types/send-message-result.type';

@Injectable()
export class MessagingDraftSendService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly messageOutboundService: MessagingMessageOutboundService,
    private readonly messageCleanerService: MessagingMessageCleanerService,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
  ) {}

  async sendDraftMessage({
    draftMessageId,
    sendMessageInput,
    connectedAccount,
    workspaceId,
  }: {
    draftMessageId: string;
    sendMessageInput: SendMessageInput;
    connectedAccount: ConnectedAccountEntity;
    workspaceId: string;
  }): Promise<SendMessageResult> {
    const draftAssociation = await this.resolveDraftAssociation(
      draftMessageId,
      connectedAccount.id,
      workspaceId,
    );

    if (!isDefined(draftAssociation)) {
      throw new Error(
        `Could not find a synced draft to send for message ${draftMessageId}`,
      );
    }

    return this.messageOutboundService.sendDraft(
      draftAssociation.messageExternalId,
      sendMessageInput,
      connectedAccount,
    );
  }

  async getSentMessageThreadId({
    messageExternalId,
    workspaceId,
  }: {
    messageExternalId: string;
    workspaceId: string;
  }): Promise<string | undefined> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        const association =
          await messageChannelMessageAssociationRepository.findOne({
            where: { messageExternalId },
            relations: ['message'],
          });

        return association?.message?.messageThreadId ?? undefined;
      },
      authContext,
      { lite: true },
    );
  }

  async deleteSentDraft({
    draftMessageId,
    connectedAccountId,
    workspaceId,
  }: {
    draftMessageId: string;
    connectedAccountId: string;
    workspaceId: string;
  }): Promise<void> {
    const draftAssociation = await this.resolveDraftAssociation(
      draftMessageId,
      connectedAccountId,
      workspaceId,
    );

    if (!isDefined(draftAssociation)) {
      return;
    }

    await this.messageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
      {
        workspaceId,
        messageExternalIds: [draftAssociation.messageExternalId],
        messageChannelId: draftAssociation.messageChannelId,
      },
    );
  }

  // Scoped to the caller's own channels so a member cannot act on another
  // member's draft by passing its message id.
  private async resolveDraftAssociation(
    draftMessageId: string,
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<{ messageExternalId: string; messageChannelId: string } | null> {
    const channels = await this.messageChannelRepository.find({
      where: { connectedAccountId, workspaceId },
    });

    const channelIds = channels.map((channel) => channel.id);

    if (channelIds.length === 0) {
      return null;
    }

    const authContext = buildSystemAuthContext(workspaceId);

    const associations =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const messageChannelMessageAssociationRepository =
            await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
              workspaceId,
              'messageChannelMessageAssociation',
            );

          return messageChannelMessageAssociationRepository.find({
            where: {
              messageId: draftMessageId,
              messageChannelId: In(channelIds),
            },
          });
        },
        authContext,
        { lite: true },
      );

    const association = associations.find((currentAssociation) =>
      isNonEmptyString(currentAssociation.messageExternalId),
    );

    if (!association || !isNonEmptyString(association.messageExternalId)) {
      return null;
    }

    return {
      messageExternalId: association.messageExternalId,
      messageChannelId: association.messageChannelId,
    };
  }
}
