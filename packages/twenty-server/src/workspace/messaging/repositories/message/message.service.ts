import { Injectable } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { GmailMessage } from 'src/workspace/messaging/types/gmail-message';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';
import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';
import { MessageParticipantService } from 'src/workspace/messaging/repositories/message-participant/message-participant.service';
import { MessageThreadService } from 'src/workspace/messaging/repositories/message-thread/message-thread.service';
import { isPersonEmail } from 'src/workspace/messaging/utils/is-person-email.util';
import { CreateCompaniesAndContactsService } from 'src/workspace/messaging/services/create-companies-and-contacts/create-companies-and-contacts.service';
@Injectable()
export class MessageService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
    private readonly messageThreadService: MessageThreadService,
    private readonly messageParticipantService: MessageParticipantService,
    private readonly messageChannelService: MessageChannelService,
    private readonly createCompaniesAndContactsService: CreateCompaniesAndContactsService,
  ) {}

  public async getFirstByHeaderMessageId(
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
  ) {
    for (const message of messages) {
      if (this.shouldSkipImport(message)) {
        continue;
      }

      await workspaceDataSource?.transaction(async (manager: EntityManager) => {
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

        const savedOrExistingMessageThreadId =
          await this.messageThreadService.saveMessageThreadOrReturnExistingMessageThread(
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
      });
    }
  }

  private shouldSkipImport(message: GmailMessage): boolean {
    return !isPersonEmail(message.fromHandle);
  }

  private async saveMessageOrReturnExistingMessage(
    message: GmailMessage,
    messageThreadId: string,
    connectedAccount: ObjectRecord<ConnectedAccountObjectMetadata>,
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    manager: EntityManager,
  ): Promise<string> {
    const existingMessage = await this.getFirstByHeaderMessageId(
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
      `INSERT INTO ${dataSourceMetadata.schema}."message" ("id", "headerMessageId", "subject", "receivedAt", "direction", "messageThreadId", "text", "html") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newMessageId,
        message.headerMessageId,
        message.subject,
        receivedAt,
        messageDirection,
        messageThreadId,
        message.text,
        message.html,
      ],
    );

    const isContactAutoCreationEnabled =
      await this.messageChannelService.getIsContactAutoCreationEnabledByConnectedAccountIdOrFail(
        connectedAccount.id,
        workspaceId,
      );

    if (isContactAutoCreationEnabled) {
      await this.createCompaniesAndContactsService.createCompaniesAndContacts(
        message.participants,
        workspaceId,
        manager,
      );
    }

    await this.messageParticipantService.saveMessageParticipants(
      message.participants,
      newMessageId,
      workspaceId,
      manager,
    );

    return Promise.resolve(newMessageId);
  }

  public async deleteMessages(
    workspaceDataSource: DataSource,
    messagesDeletedMessageExternalIds: string[],
    gmailMessageChannelId: string,
    workspaceId: string,
  ) {
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
