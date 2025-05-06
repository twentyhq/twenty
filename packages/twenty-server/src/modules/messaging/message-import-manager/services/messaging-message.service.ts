import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

@Injectable()
export class MessagingMessageService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  public async saveMessagesWithinTransaction(
    messages: MessageWithParticipants[],
    messageChannelId: string,
    transactionManager: WorkspaceEntityManager,
  ): Promise<{
    createdMessages: Partial<MessageWorkspaceEntity>[];
    messageExternalIdsAndIdsMap: Map<string, string>;
  }> {
    const messageChannelMessageAssociationRepository =
      await this.twentyORMManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
        'messageChannelMessageAssociation',
      );

    const messageRepository =
      await this.twentyORMManager.getRepository<MessageWorkspaceEntity>(
        'message',
      );

    const messageThreadRepository =
      await this.twentyORMManager.getRepository<MessageThreadWorkspaceEntity>(
        'messageThread',
      );

    const messageExternalIdsAndIdsMap = new Map<string, string>();
    const createdMessages: Partial<MessageWorkspaceEntity>[] = [];

    for (const message of messages) {
      const existingMessageChannelMessageAssociation =
        await messageChannelMessageAssociationRepository.findOne(
          {
            where: {
              messageExternalId: message.externalId,
              messageChannelId: messageChannelId,
            },
          },
          transactionManager,
        );

      if (existingMessageChannelMessageAssociation) {
        continue;
      }

      const existingMessage = await messageRepository.findOne({
        where: {
          headerMessageId: message.headerMessageId,
        },
      });

      if (existingMessage) {
        await messageChannelMessageAssociationRepository.upsert(
          {
            messageChannelId,
            messageId: existingMessage.id,
            messageExternalId: message.externalId,
            messageThreadExternalId: message.messageThreadExternalId,
          },
          {
            conflictPaths: ['messageChannelId', 'messageId'],
            indexPredicate: '"deletedAt" IS NULL',
          },
          transactionManager,
        );

        continue;
      }

      const existingThread = await messageThreadRepository.findOne(
        {
          where: {
            messages: {
              messageChannelMessageAssociations: {
                messageThreadExternalId: message.messageThreadExternalId,
                messageChannelId,
              },
            },
          },
        },
        transactionManager,
      );

      let newOrExistingMessageThreadId = existingThread?.id;

      if (!existingThread) {
        newOrExistingMessageThreadId = v4();

        await messageThreadRepository.insert(
          { id: newOrExistingMessageThreadId },
          transactionManager,
        );
      }

      const newMessageId = v4();
      const messageToCreate = {
        id: newMessageId,
        headerMessageId: message.headerMessageId,
        subject: message.subject,
        receivedAt: message.receivedAt,
        text: message.text,
        messageThreadId: newOrExistingMessageThreadId,
      };

      await messageRepository.insert(messageToCreate, transactionManager);

      createdMessages.push(messageToCreate);

      messageExternalIdsAndIdsMap.set(message.externalId, newMessageId);

      await messageChannelMessageAssociationRepository.insert(
        {
          messageChannelId,
          messageId: newMessageId,
          messageExternalId: message.externalId,
          messageThreadExternalId: message.messageThreadExternalId,
          direction: message.direction,
        },
        transactionManager,
      );
    }

    return {
      createdMessages,
      messageExternalIdsAndIdsMap,
    };
  }
}
