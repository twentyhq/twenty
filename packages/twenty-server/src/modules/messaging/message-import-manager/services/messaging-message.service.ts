import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
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

    const existingMessageChannelMessageAssociationsMap = new Map<
      string,
      MessageChannelMessageAssociationWorkspaceEntity
    >();
    const existingMessagesMap = new Map<string, MessageWorkspaceEntity>();
    const messagesToCreate: Pick<
      MessageWorkspaceEntity,
      | 'id'
      | 'headerMessageId'
      | 'subject'
      | 'receivedAt'
      | 'text'
      | 'messageThreadId'
    >[] = [];
    const messageChannelMessageAssociationsToCreate: Pick<
      MessageChannelMessageAssociationWorkspaceEntity,
      | 'messageChannelId'
      | 'messageId'
      | 'messageExternalId'
      | 'messageThreadExternalId'
      | 'direction'
    >[] = [];

    const existingMessages = await messageRepository.find({
      where: {
        headerMessageId: In(messages.map((message) => message.headerMessageId)),
      },
    });

    const existingMessageChannelMessageAssociations =
      await messageChannelMessageAssociationRepository.find({
        where: {
          messageId: In(existingMessages.map((message) => message.id)),
          messageChannelId,
        },
      });

    for (const message of messages) {
      const existingMessage = existingMessages.find(
        (message) => message.headerMessageId === message.headerMessageId,
      );

      if (existingMessage) {
        existingMessagesMap.set(message.headerMessageId, existingMessage);

        const existingMessageChannelMessageAssociation =
          existingMessageChannelMessageAssociations.find(
            (association) => association.messageId === existingMessage.id,
          );

        if (existingMessageChannelMessageAssociation) {
          existingMessageChannelMessageAssociationsMap.set(
            message.headerMessageId,
            existingMessageChannelMessageAssociation,
          );
        }
      }
    }

    for (const message of messages) {
      if (
        existingMessageChannelMessageAssociationsMap.has(
          message.headerMessageId,
        )
      ) {
        continue;
      }

      const existingMessage = existingMessagesMap.get(message.headerMessageId);

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

      let newOrExistingMessageThreadId: string;

      if (!isDefined(existingThread)) {
        newOrExistingMessageThreadId = v4();

        await messageThreadRepository.insert(
          { id: newOrExistingMessageThreadId },
          transactionManager,
        );
      } else {
        newOrExistingMessageThreadId = existingThread.id;
      }

      let newOrExistingMessageId: string;

      if (!isDefined(existingMessage)) {
        newOrExistingMessageId = v4();

        const messageToCreate = {
          id: newOrExistingMessageId,
          headerMessageId: message.headerMessageId,
          subject: message.subject,
          receivedAt: message.receivedAt,
          text: message.text,
          messageThreadId: newOrExistingMessageThreadId,
        };

        messagesToCreate.push(messageToCreate);
      } else {
        newOrExistingMessageId = existingMessage.id;
      }
      messageExternalIdsAndIdsMap.set(
        message.externalId,
        newOrExistingMessageId,
      );

      messageChannelMessageAssociationsToCreate.push({
        messageChannelId,
        messageId: newOrExistingMessageId,
        messageExternalId: message.externalId,
        messageThreadExternalId: message.messageThreadExternalId,
        direction: message.direction,
      });
    }

    await messageRepository.insert(messagesToCreate, transactionManager);

    await messageChannelMessageAssociationRepository.insert(
      messageChannelMessageAssociationsToCreate,
      transactionManager,
    );

    return {
      createdMessages: messagesToCreate,
      messageExternalIdsAndIdsMap,
    };
  }
}
