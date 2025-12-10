import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';
import { v4 } from 'uuid';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { type MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { type MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';

type MessageAccumulator = {
  existingMessageInDB?: MessageWorkspaceEntity;
  existingThreadInDB?: Pick<MessageThreadWorkspaceEntity, 'id'>;
  existingMessageChannelMessageAssociationInDB?: MessageChannelMessageAssociationWorkspaceEntity;
  messageToCreate?: Pick<
    MessageWorkspaceEntity,
    | 'id'
    | 'headerMessageId'
    | 'subject'
    | 'receivedAt'
    | 'text'
    | 'messageThreadId'
  >;
  threadToCreate?: Pick<MessageThreadWorkspaceEntity, 'id'>;
  messageChannelMessageAssociationToCreate?: Pick<
    MessageChannelMessageAssociationWorkspaceEntity,
    | 'messageChannelId'
    | 'messageId'
    | 'messageExternalId'
    | 'messageThreadExternalId'
    | 'direction'
  >;
};
@Injectable()
export class MessagingMessageService {
  private readonly logger = new Logger(MessagingMessageService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async saveMessagesWithinTransaction(
    messages: MessageWithParticipants[],
    messageChannelId: string,
    transactionManager: WorkspaceEntityManager,
    workspaceId: string,
  ): Promise<{
    createdMessages: Partial<MessageWorkspaceEntity>[];
    messageExternalIdsAndIdsMap: Map<string, string>;
  }> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const messageChannelMessageAssociationRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelMessageAssociationWorkspaceEntity>(
            workspaceId,
            'messageChannelMessageAssociation',
          );

        const messageRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageWorkspaceEntity>(
            workspaceId,
            'message',
          );

        const messageThreadRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageThreadWorkspaceEntity>(
            workspaceId,
            'messageThread',
          );

        const messageAccumulatorMap = new Map<string, MessageAccumulator>();

        const existingMessagesInDB = await messageRepository.find({
          where: {
            headerMessageId: In(
              messages.map((message) => message.headerMessageId),
            ),
          },
        });

        const messageChannelMessageAssociationsReferencingMessageThread =
          await messageChannelMessageAssociationRepository.find(
            {
              where: {
                messageThreadExternalId: In(
                  messages.map((message) => message.messageThreadExternalId),
                ),
                messageChannelId,
              },
              relations: ['message'],
            },
            transactionManager,
          );

        const existingMessageChannelMessageAssociations =
          await messageChannelMessageAssociationRepository.find({
            where: {
              messageId: In(existingMessagesInDB.map((message) => message.id)),
              messageChannelId,
            },
          });

        await this.enrichMessageAccumulatorWithExistingMessages(
          messages,
          messageAccumulatorMap,
          existingMessagesInDB,
        );

        await this.enrichMessageAccumulatorWithExistingMessageThreadIds(
          messages,
          messageAccumulatorMap,
          messageChannelMessageAssociationsReferencingMessageThread,
          workspaceId,
        );

        await this.enrichMessageAccumulatorWithExistingMessageChannelMessageAssociations(
          messages,
          messageAccumulatorMap,
          existingMessageChannelMessageAssociations,
        );

        await this.enrichMessageAccumulatorWithMessageThreadToCreate(
          messages,
          messageAccumulatorMap,
        );

        for (const message of messages) {
          const messageAccumulator = messageAccumulatorMap.get(
            message.externalId,
          );

          if (!isDefined(messageAccumulator)) {
            throw new Error(
              `Message accumulator should reference the message, this should never happen`,
            );
          }

          const messageThreadId =
            messageAccumulator.threadToCreate?.id ??
            messageAccumulator.existingThreadInDB?.id;

          if (!isDefined(messageThreadId)) {
            throw new Error(
              `Message thread id should be defined, either in the threadToCreate or existingThreadInDB`,
            );
          }

          let newOrExistingMessageId: string;

          if (!isDefined(messageAccumulator.existingMessageInDB)) {
            newOrExistingMessageId = v4();

            const messageToCreate = {
              id: newOrExistingMessageId,
              headerMessageId: message.headerMessageId,
              subject: message.subject,
              receivedAt: message.receivedAt,
              text: message.text,
              messageThreadId,
            };

            messageAccumulator.messageToCreate = messageToCreate;
          } else {
            newOrExistingMessageId = messageAccumulator.existingMessageInDB.id;
          }

          if (
            !isDefined(
              messageAccumulator.existingMessageChannelMessageAssociationInDB,
            )
          ) {
            messageAccumulator.messageChannelMessageAssociationToCreate = {
              messageChannelId,
              messageId: newOrExistingMessageId,
              messageExternalId: message.externalId,
              messageThreadExternalId: message.messageThreadExternalId,
              direction: message.direction,
            };

            messageAccumulatorMap.set(message.externalId, messageAccumulator);
          }
        }

        const messageThreadsToCreate = Array.from(
          messageAccumulatorMap.values(),
        )
          .map((accumulator) => accumulator.threadToCreate)
          .filter(isDefined);

        await messageThreadRepository.insert(
          messageThreadsToCreate,
          transactionManager,
        );

        const messagesToCreate = Array.from(messageAccumulatorMap.values())
          .map((accumulator) => accumulator.messageToCreate)
          .filter(isDefined);

        await messageRepository.insert(messagesToCreate, transactionManager);

        const messageChannelMessageAssociationsToCreate = Array.from(
          messageAccumulatorMap.values(),
        )
          .map(
            (accumulator) =>
              accumulator.messageChannelMessageAssociationToCreate,
          )
          .filter(isDefined);

        await messageChannelMessageAssociationRepository.insert(
          messageChannelMessageAssociationsToCreate,
          transactionManager,
        );

        const messageExternalIdsAndIdsMap = new Map<string, string>();

        for (const [
          externalId,
          accumulator,
        ] of messageAccumulatorMap.entries()) {
          if (isDefined(accumulator.messageToCreate)) {
            messageExternalIdsAndIdsMap.set(
              externalId,
              accumulator.messageToCreate.id,
            );
          }

          if (isDefined(accumulator.existingMessageInDB)) {
            messageExternalIdsAndIdsMap.set(
              externalId,
              accumulator.existingMessageInDB.id,
            );
          }
        }

        return {
          createdMessages: messagesToCreate,
          messageExternalIdsAndIdsMap,
        };
      },
    );
  }

  private async enrichMessageAccumulatorWithExistingMessages(
    messages: MessageWithParticipants[],
    messageAccumulatorMap: Map<string, MessageAccumulator>,
    existingMessagesInDB: MessageWorkspaceEntity[],
  ) {
    for (const message of messages) {
      const existingMessage = existingMessagesInDB.find(
        (existingMessage) =>
          existingMessage.headerMessageId === message.headerMessageId,
      );

      if (!isDefined(existingMessage)) {
        messageAccumulatorMap.set(message.externalId, {});
        continue;
      }

      messageAccumulatorMap.set(message.externalId, {
        existingMessageInDB: existingMessage,
      });
    }
  }

  private async enrichMessageAccumulatorWithExistingMessageThreadIds(
    messages: MessageWithParticipants[],
    messageAccumulatorMap: Map<string, MessageAccumulator>,
    messageChannelMessageAssociationsReferencingMessageThread: Pick<
      MessageChannelMessageAssociationWorkspaceEntity,
      'messageThreadExternalId' | 'message'
    >[],
    workspaceId: string,
  ) {
    for (const message of messages) {
      const messageAccumulator = messageAccumulatorMap.get(message.externalId);

      if (!isDefined(messageAccumulator)) {
        throw new Error(
          `Message accumulator should reference the message, this should never happen`,
        );
      }

      const messageChannelMessageAssociationReferencingMessageThread =
        messageChannelMessageAssociationsReferencingMessageThread.find(
          (association) =>
            association.messageThreadExternalId ===
            message.messageThreadExternalId,
        );

      const existingThreadIdInDBIfMessageIsExistingInDB =
        messageAccumulator.existingMessageInDB?.messageThreadId;
      const existingThreadIdInDBIfMessageIsReferencedInMessageChannelMessageAssociation =
        messageChannelMessageAssociationReferencingMessageThread?.message
          ?.messageThreadId;

      if (isDefined(existingThreadIdInDBIfMessageIsExistingInDB)) {
        messageAccumulator.existingThreadInDB = {
          id: existingThreadIdInDBIfMessageIsExistingInDB,
        };
      }

      if (
        isDefined(
          existingThreadIdInDBIfMessageIsReferencedInMessageChannelMessageAssociation,
        )
      ) {
        messageAccumulator.existingThreadInDB = {
          id: existingThreadIdInDBIfMessageIsReferencedInMessageChannelMessageAssociation,
        };
      }

      if (
        isDefined(existingThreadIdInDBIfMessageIsExistingInDB) &&
        isDefined(
          existingThreadIdInDBIfMessageIsReferencedInMessageChannelMessageAssociation,
        ) &&
        existingThreadIdInDBIfMessageIsExistingInDB !==
          existingThreadIdInDBIfMessageIsReferencedInMessageChannelMessageAssociation
      ) {
        this.logger.warn(
          `
          WorkspaceId: ${workspaceId} /
          Message ExternalId: ${message.externalId} /
          Message HeaderId: ${message.headerMessageId} /
          Message Thread ExternalId: ${message.messageThreadExternalId} /
          Message Thread Id in DB: ${existingThreadIdInDBIfMessageIsExistingInDB} /
          Message Thread Id in Message Channel Message Association: ${existingThreadIdInDBIfMessageIsReferencedInMessageChannelMessageAssociation} /
          Message Subject: ${message.subject} /
          Message Received At: ${message.receivedAt} /
          Thread inter channel detected`,
        );
      }

      messageAccumulatorMap.set(message.externalId, messageAccumulator);
    }
  }

  private async enrichMessageAccumulatorWithExistingMessageChannelMessageAssociations(
    messages: MessageWithParticipants[],
    messageAccumulatorMap: Map<string, MessageAccumulator>,
    existingMessageChannelMessageAssociations: MessageChannelMessageAssociationWorkspaceEntity[],
  ) {
    for (const message of messages) {
      const messageAccumulator = messageAccumulatorMap.get(message.externalId);

      if (!isDefined(messageAccumulator)) {
        throw new Error(
          `Message accumulator should reference the message, this should never happen`,
        );
      }

      const existingMessage = messageAccumulator.existingMessageInDB;

      if (!isDefined(existingMessage)) {
        continue;
      }

      const existingMessageChannelMessageAssociation =
        existingMessageChannelMessageAssociations.find(
          (association) => association.messageId === existingMessage.id,
        );

      if (existingMessageChannelMessageAssociation) {
        messageAccumulatorMap.set(message.externalId, {
          existingMessageInDB: existingMessage,
          existingMessageChannelMessageAssociationInDB:
            existingMessageChannelMessageAssociation,
        });
      }
    }
  }

  private async enrichMessageAccumulatorWithMessageThreadToCreate(
    messages: MessageWithParticipants[],
    messageAccumulatorMap: Map<string, MessageAccumulator>,
  ) {
    for (const [index, message] of messages.entries()) {
      const messageAccumulator = messageAccumulatorMap.get(message.externalId);

      if (!isDefined(messageAccumulator)) {
        throw new Error(
          `Message accumulator should reference the message, this should never happen`,
        );
      }

      const previousMessageWithSameThreadExternalId = messages.find(
        (otherMessage, otherMessageIndex) =>
          otherMessage.messageThreadExternalId ===
            message.messageThreadExternalId && otherMessageIndex < index,
      );

      let newOrExistingMessageThreadId: string | undefined;

      if (isDefined(messageAccumulator.existingThreadInDB)) {
        newOrExistingMessageThreadId = messageAccumulator.existingThreadInDB.id;
      }

      if (isDefined(previousMessageWithSameThreadExternalId)) {
        const previousMessageAccumulator = messageAccumulatorMap.get(
          previousMessageWithSameThreadExternalId.externalId,
        );

        const previousMessageThreadId =
          previousMessageAccumulator?.threadToCreate?.id ??
          previousMessageAccumulator?.existingThreadInDB?.id;

        if (!isDefined(previousMessageThreadId)) {
          throw new Error(
            `Previous message should have a thread id, either in the messageToCreate or existingMessageInDB`,
          );
        }

        newOrExistingMessageThreadId = previousMessageThreadId;
        messageAccumulator.existingThreadInDB = {
          id: previousMessageThreadId,
        };
      }

      if (!isDefined(newOrExistingMessageThreadId)) {
        newOrExistingMessageThreadId = v4();

        messageAccumulator.threadToCreate = {
          id: newOrExistingMessageThreadId,
        };
      }

      messageAccumulatorMap.set(message.externalId, messageAccumulator);
    }
  }
}
