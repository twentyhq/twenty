import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
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
    const { messageExternalId } = await this.resolveDraftAssociation(
      draftMessageId,
      workspaceId,
    );

    return this.messageOutboundService.sendDraft(
      messageExternalId,
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
    workspaceId,
  }: {
    draftMessageId: string;
    workspaceId: string;
  }): Promise<void> {
    const { messageExternalId, messageChannelId } =
      await this.resolveDraftAssociation(draftMessageId, workspaceId);

    await this.messageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
      {
        workspaceId,
        messageExternalIds: [messageExternalId],
        messageChannelId,
      },
    );
  }

  private async resolveDraftAssociation(
    draftMessageId: string,
    workspaceId: string,
  ): Promise<{ messageExternalId: string; messageChannelId: string }> {
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
            where: { messageId: draftMessageId },
          });
        },
        authContext,
        { lite: true },
      );

    const association = associations.find((currentAssociation) =>
      isNonEmptyString(currentAssociation.messageExternalId),
    );

    if (!association || !isNonEmptyString(association.messageExternalId)) {
      throw new Error(
        `Could not find a synced draft to send for message ${draftMessageId}`,
      );
    }

    return {
      messageExternalId: association.messageExternalId,
      messageChannelId: association.messageChannelId,
    };
  }
}
