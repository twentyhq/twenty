import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelMessageAssociationRepository } from 'src/modules/messaging/common/repositories/message-channel-message-association.repository';
import { MessageThreadRepository } from 'src/modules/messaging/common/repositories/message-thread.repository';
import { MessageRepository } from 'src/modules/messaging/common/repositories/message.repository';
import { MessagingMessageThreadService } from 'src/modules/messaging/common/services/messaging-message-thread.service';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { GmailMessage } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message';

@Injectable()
export class MessagingMessageService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(
      MessageChannelMessageAssociationWorkspaceEntity,
    )
    private readonly messageChannelMessageAssociationRepository: MessageChannelMessageAssociationRepository,
    @InjectObjectMetadataRepository(MessageWorkspaceEntity)
    private readonly messageRepository: MessageRepository,
    @InjectObjectMetadataRepository(MessageThreadWorkspaceEntity)
    private readonly messageThreadRepository: MessageThreadRepository,
    private readonly messageThreadService: MessagingMessageThreadService,
  ) {}

  public async saveMessagesWithinTransaction(
    messages: GmailMessage[],
    connectedAccount: ConnectedAccountWorkspaceEntity,
    gmailMessageChannelId: string,
    workspaceId: string,
    transactionManager: EntityManager,
  ): Promise<Map<string, string>> {
    const messageExternalIdsAndIdsMap = new Map<string, string>();

    for (const message of messages) {
      const existingMessageChannelMessageAssociationsCount =
        await this.messageChannelMessageAssociationRepository.countByMessageExternalIdsAndMessageChannelId(
          [message.externalId],
          gmailMessageChannelId,
          workspaceId,
          transactionManager,
        );

      if (existingMessageChannelMessageAssociationsCount > 0) {
        continue;
      }

      // TODO: This does not handle all thread merging use cases and might create orphan threads.
      const savedOrExistingMessageThreadId =
        await this.messageThreadService.saveMessageThreadOrReturnExistingMessageThread(
          message.headerMessageId,
          message.messageThreadExternalId,
          workspaceId,
          transactionManager,
        );

      if (!savedOrExistingMessageThreadId) {
        throw new Error(
          `No message thread found for message ${message.headerMessageId} in workspace ${workspaceId} in saveMessages`,
        );
      }

      const savedOrExistingMessageId =
        await this.saveMessageOrReturnExistingMessage(
          message,
          savedOrExistingMessageThreadId,
          connectedAccount,
          workspaceId,
          transactionManager,
        );

      messageExternalIdsAndIdsMap.set(
        message.externalId,
        savedOrExistingMessageId,
      );

      await this.messageChannelMessageAssociationRepository.insert(
        gmailMessageChannelId,
        savedOrExistingMessageId,
        message.externalId,
        savedOrExistingMessageThreadId,
        message.messageThreadExternalId,
        workspaceId,
        transactionManager,
      );
    }

    return messageExternalIdsAndIdsMap;
  }

  private async saveMessageOrReturnExistingMessage(
    message: GmailMessage,
    messageThreadId: string,
    connectedAccount: ConnectedAccountWorkspaceEntity,
    workspaceId: string,
    manager: EntityManager,
  ): Promise<string> {
    const existingMessage =
      await this.messageRepository.getFirstOrNullByHeaderMessageId(
        message.headerMessageId,
        workspaceId,
      );
    const existingMessageId = existingMessage?.id;

    if (existingMessageId) {
      return Promise.resolve(existingMessageId);
    }

    const newMessageId = v4();

    const messageDirection =
      connectedAccount.handle === message.fromHandle ||
      connectedAccount.emailAliases?.includes(message.fromHandle)
        ? 'outgoing'
        : 'incoming';

    const receivedAt = new Date(parseInt(message.internalDate));

    await this.messageRepository.insert(
      newMessageId,
      message.headerMessageId,
      message.subject,
      receivedAt,
      messageDirection,
      messageThreadId,
      message.text,
      workspaceId,
      manager,
    );

    return Promise.resolve(newMessageId);
  }

  public async deleteMessages(
    messagesDeletedMessageExternalIds: string[],
    gmailMessageChannelId: string,
    workspaceId: string,
  ) {
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        workspaceId,
      );

    await workspaceDataSource?.transaction(async (manager: EntityManager) => {
      const messageChannelMessageAssociationsToDelete =
        await this.messageChannelMessageAssociationRepository.getByMessageExternalIdsAndMessageChannelId(
          messagesDeletedMessageExternalIds,
          gmailMessageChannelId,
          workspaceId,
          manager,
        );

      const messageChannelMessageAssociationIdsToDeleteIds =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.id,
        );

      await this.messageChannelMessageAssociationRepository.deleteByIds(
        messageChannelMessageAssociationIdsToDeleteIds,
        workspaceId,
        manager,
      );

      const messageIdsFromMessageChannelMessageAssociationsToDelete =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.messageId,
        );

      const messageChannelMessageAssociationByMessageIds =
        await this.messageChannelMessageAssociationRepository.getByMessageIds(
          messageIdsFromMessageChannelMessageAssociationsToDelete,
          workspaceId,
          manager,
        );

      const messageIdsFromMessageChannelMessageAssociationByMessageIds =
        messageChannelMessageAssociationByMessageIds.map(
          (messageChannelMessageAssociation) =>
            messageChannelMessageAssociation.messageId,
        );

      const messageIdsToDelete =
        messageIdsFromMessageChannelMessageAssociationsToDelete.filter(
          (messageId) =>
            !messageIdsFromMessageChannelMessageAssociationByMessageIds.includes(
              messageId,
            ),
        );

      await this.messageRepository.deleteByIds(
        messageIdsToDelete,
        workspaceId,
        manager,
      );

      const messageThreadIdsFromMessageChannelMessageAssociationsToDelete =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.messageThreadId,
        );

      const messagesByThreadIds =
        await this.messageRepository.getByMessageThreadIds(
          messageThreadIdsFromMessageChannelMessageAssociationsToDelete,
          workspaceId,
          manager,
        );

      const threadIdsToDelete =
        messageThreadIdsFromMessageChannelMessageAssociationsToDelete.filter(
          (threadId) =>
            !messagesByThreadIds.find(
              (message) => message.messageThreadId === threadId,
            ),
        );

      await this.messageThreadRepository.deleteByIds(
        threadIdsToDelete,
        workspaceId,
        manager,
      );
    });
  }
}
