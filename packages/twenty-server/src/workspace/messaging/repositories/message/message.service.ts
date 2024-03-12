import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { GmailMessage } from 'src/workspace/messaging/types/gmail-message';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';
import { MessageThreadService } from 'src/workspace/messaging/repositories/message-thread/message-thread.service';
import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
    @Inject(forwardRef(() => MessageThreadService))
    private readonly messageThreadService: MessageThreadService,
    private readonly messageChannelService: MessageChannelService,
  ) {}

  public async getNonAssociatedMessageIdsPaginated(
    limit: number,
    offset: number,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<string[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const nonAssociatedMessages =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT m.id FROM ${dataSourceSchema}."message" m
        LEFT JOIN ${dataSourceSchema}."messageChannelMessageAssociation" mcma
        ON m.id = mcma."messageId"
        WHERE mcma.id IS NULL
        LIMIT $1 OFFSET $2`,
        [limit, offset],
        workspaceId,
        transactionManager,
      );

    return nonAssociatedMessages.map(({ id }) => id);
  }

  public async getFirstOrNullByHeaderMessageId(
    headerMessageId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageObjectMetadata> | null> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const messages = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."message" WHERE "headerMessageId" = $1 LIMIT 1`,
      [headerMessageId],
      workspaceId,
      transactionManager,
    );

    if (!messages || messages.length === 0) {
      return null;
    }

    return messages[0];
  }

  public async getByIds(
    messageIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."message" WHERE "id" = ANY($1)`,
      [messageIds],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    messageIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."message" WHERE "id" = ANY($1)`,
      [messageIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getByMessageThreadIds(
    messageThreadIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."message" WHERE "messageThreadId" = ANY($1)`,
      [messageThreadIds],
      workspaceId,
      transactionManager,
    );
  }

  public async saveMessages(
    messages: GmailMessage[],
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    gmailMessageChannelId: string,
    workspaceId: string,
  ): Promise<Map<string, string>> {
    const messageExternalIdsAndIdsMap = new Map<string, string>();

    try {
      let keepImporting = true;

      for (const message of messages) {
        if (!keepImporting) {
          break;
        }

        await workspaceDataSource?.transaction(
          async (manager: EntityManager) => {
            const gmailMessageChannel =
              await this.messageChannelService.getByIds(
                [gmailMessageChannelId],
                workspaceId,
                manager,
              );

            if (gmailMessageChannel.length === 0) {
              this.logger.error(
                `No message channel found for connected account ${connectedAccount.id} in workspace ${workspaceId} in saveMessages`,
              );

              keepImporting = false;

              return;
            }

            const existingMessageChannelMessageAssociationsCount =
              await this.messageChannelMessageAssociationService.countByMessageExternalIdsAndMessageChannelId(
                [message.externalId],
                gmailMessageChannelId,
                workspaceId,
                manager,
              );

            if (existingMessageChannelMessageAssociationsCount > 0) {
              return;
            }

            // TODO: This does not handle all thread merging use cases and might create orphan threads.
            const savedOrExistingMessageThreadId =
              await this.messageThreadService.saveMessageThreadOrReturnExistingMessageThread(
                message.headerMessageId,
                message.messageThreadExternalId,
                dataSourceMetadata,
                workspaceId,
                manager,
              );

            const savedOrExistingMessageId =
              await this.saveMessageOrReturnExistingMessage(
                message,
                savedOrExistingMessageThreadId,
                connectedAccount,
                dataSourceMetadata,
                workspaceId,
                manager,
              );

            messageExternalIdsAndIdsMap.set(
              message.externalId,
              savedOrExistingMessageId,
            );

            await manager.query(
              `INSERT INTO ${dataSourceMetadata.schema}."messageChannelMessageAssociation" ("messageChannelId", "messageId", "messageExternalId", "messageThreadId", "messageThreadExternalId") VALUES ($1, $2, $3, $4, $5)`,
              [
                gmailMessageChannelId,
                savedOrExistingMessageId,
                message.externalId,
                savedOrExistingMessageThreadId,
                message.messageThreadExternalId,
              ],
            );
          },
        );
      }
    } catch (error) {
      throw new Error(
        `Error saving connected account ${connectedAccount.id} messages to workspace ${workspaceId}: ${error.message}`,
      );
    }

    return messageExternalIdsAndIdsMap;
  }

  private async saveMessageOrReturnExistingMessage(
    message: GmailMessage,
    messageThreadId: string,
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    manager: EntityManager,
  ): Promise<string> {
    const existingMessage = await this.getFirstOrNullByHeaderMessageId(
      message.headerMessageId,
      workspaceId,
    );
    const existingMessageId = existingMessage?.id;

    if (existingMessageId) {
      return Promise.resolve(existingMessageId);
    }

    const newMessageId = v4();

    const messageDirection =
      connectedAccount.handle === message.fromHandle ? 'outgoing' : 'incoming';

    const receivedAt = new Date(parseInt(message.internalDate));

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}."message" ("id", "headerMessageId", "subject", "receivedAt", "direction", "messageThreadId", "text") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        newMessageId,
        message.headerMessageId,
        message.subject,
        receivedAt,
        messageDirection,
        messageThreadId,
        message.text,
      ],
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
        await this.messageChannelMessageAssociationService.getByMessageExternalIdsAndMessageChannelId(
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

      await this.messageChannelMessageAssociationService.deleteByIds(
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
        await this.messageChannelMessageAssociationService.getByMessageIds(
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

      await this.deleteByIds(messageIdsToDelete, workspaceId, manager);

      const messageThreadIdsFromMessageChannelMessageAssociationsToDelete =
        messageChannelMessageAssociationsToDelete.map(
          (messageChannelMessageAssociationToDelete) =>
            messageChannelMessageAssociationToDelete.messageThreadId,
        );

      const messagesByThreadIds = await this.getByMessageThreadIds(
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

      await this.messageThreadService.deleteByIds(
        threadIdsToDelete,
        workspaceId,
        manager,
      );
    });
  }
}
