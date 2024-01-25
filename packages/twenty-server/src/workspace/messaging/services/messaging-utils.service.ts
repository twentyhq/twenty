import { Injectable } from '@nestjs/common';

import { EntityManager, DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import {
  GmailMessage,
  Participant,
} from 'src/workspace/messaging/types/gmailMessage';
import { MessageQuery } from 'src/workspace/messaging/types/messageOrThreadQuery';

@Injectable()
export class MessagingUtilsService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
  ) {}

  public createQueriesFromMessageIds(
    messageExternalIds: string[],
  ): MessageQuery[] {
    return messageExternalIds.map((messageId) => ({
      uri: '/gmail/v1/users/me/messages/' + messageId + '?format=RAW',
    }));
  }

  public async saveMessages(
    messages: GmailMessage[],
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
    connectedAccount,
    gmailMessageChannelId: string,
  ) {
    for (const message of messages) {
      await workspaceDataSource?.transaction(async (manager) => {
        const existingMessageChannelMessageAssociations = await manager.query(
          `SELECT COUNT(*) FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation"
          WHERE "messageExternalId" = $1 AND "messageChannelId" = $2`,
          [message.externalId, gmailMessageChannelId],
        );

        if (existingMessageChannelMessageAssociations[0]?.count > 0) {
          return;
        }

        const savedOrExistingMessageThreadId =
          await this.saveMessageThreadOrReturnExistingMessageThread(
            message.messageThreadExternalId,
            dataSourceMetadata,
            workspaceDataSource,
          );

        const savedOrExistingMessageId =
          await this.saveMessageOrReturnExistingMessage(
            message,
            savedOrExistingMessageThreadId,
            connectedAccount,
            dataSourceMetadata,
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

  private async saveMessageOrReturnExistingMessage(
    message: GmailMessage,
    messageThreadId: string,
    connectedAccount,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<string> {
    const existingMessages = await manager.query(
      `SELECT "message"."id" FROM ${dataSourceMetadata.schema}."message" WHERE ${dataSourceMetadata.schema}."message"."headerMessageId" = $1 LIMIT 1`,
      [message.headerMessageId],
    );
    const existingMessageId: string = existingMessages[0]?.id;

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

    await this.saveMessageParticipants(
      message.participants,
      newMessageId,
      dataSourceMetadata,
      manager,
    );

    return Promise.resolve(newMessageId);
  }

  private async saveMessageThreadOrReturnExistingMessageThread(
    messageThreadExternalId: string,
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
  ) {
    const existingMessageThreads = await workspaceDataSource?.query(
      `SELECT "messageChannelMessageAssociation"."messageThreadId" FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation" WHERE "messageThreadExternalId" = $1 LIMIT 1`,
      [messageThreadExternalId],
    );

    const existingMessageThread = existingMessageThreads[0]?.messageThreadId;

    if (existingMessageThread) {
      return Promise.resolve(existingMessageThread);
    }

    const newMessageThreadId = v4();

    await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."messageThread" ("id") VALUES ($1)`,
      [newMessageThreadId],
    );

    return Promise.resolve(newMessageThreadId);
  }

  private async saveMessageParticipants(
    participants: Participant[],
    messageId: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!participants) return;

    for (const participant of participants) {
      const participantPerson = await manager.query(
        `SELECT "person"."id" FROM ${dataSourceMetadata.schema}."person" WHERE "email" = $1 LIMIT 1`,
        [participant.handle],
      );

      const participantPersonId = participantPerson[0]?.id;

      const workspaceMember = await manager.query(
        `SELECT "workspaceMember"."id" FROM ${dataSourceMetadata.schema}."workspaceMember"
          JOIN ${dataSourceMetadata.schema}."connectedAccount" ON ${dataSourceMetadata.schema}."workspaceMember"."id" = ${dataSourceMetadata.schema}."connectedAccount"."accountOwnerId"
          WHERE ${dataSourceMetadata.schema}."connectedAccount"."handle" = $1
          LIMIT 1`,
        [participant.handle],
      );

      const participantWorkspaceMemberId = workspaceMember[0]?.id;

      await manager.query(
        `INSERT INTO ${dataSourceMetadata.schema}."messageParticipant" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          messageId,
          participant.role,
          participant.handle,
          participant.displayName,
          participantPersonId,
          participantWorkspaceMemberId,
        ],
      );
    }
  }

  public async deleteMessageChannelMessageAssociations(
    messageExternalIds: string[],
    connectedAccountId: string,
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
  ) {
    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation" WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
      [messageExternalIds, connectedAccountId],
    );
  }

  public async getConnectedAccountsFromWorkspaceId(
    workspaceId: string,
  ): Promise<any[]> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    if (!workspaceDataSource) {
      throw new Error('No workspace data source found');
    }

    const connectedAccounts = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'google'`,
    );

    if (!connectedAccounts || connectedAccounts.length === 0) {
      throw new Error('No connected account found');
    }

    return connectedAccounts;
  }

  public async getDataSourceMetadataWorkspaceMetadataAndConnectedAccount(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<{
    dataSourceMetadata: DataSourceEntity;
    workspaceDataSource: DataSource;
    connectedAccount: any;
  }> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    if (!workspaceDataSource) {
      throw new Error('No workspace data source found');
    }

    const connectedAccounts = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'google' AND "id" = $1`,
      [connectedAccountId],
    );

    if (!connectedAccounts || connectedAccounts.length === 0) {
      throw new Error('No connected account found');
    }

    return {
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount: connectedAccounts[0],
    };
  }

  public async saveLastSyncHistoryId(
    historyId: string,
    connectedAccountId: string,
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
  ) {
    await workspaceDataSource?.query(
      `UPDATE ${dataSourceMetadata.schema}."connectedAccount" SET "lastSyncHistoryId" = $1 WHERE "id" = $2`,
      [historyId, connectedAccountId],
    );
  }

  public async getMessageChannelMessageAssociations(
    messageExternalIds: string[],
    gmailMessageChannelId: string,
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
  ) {
    const existingMessageChannelMessageAssociation =
      await workspaceDataSource?.query(
        `SELECT * FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation"
      WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
        [messageExternalIds, gmailMessageChannelId],
      );

    return existingMessageChannelMessageAssociation;
  }
}
