import { Injectable } from '@nestjs/common';

import { EntityManager, DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import {
  GmailMessage,
  Recipient,
} from 'src/workspace/messaging/types/gmailMessage';
import { GmailThread } from 'src/workspace/messaging/types/gmailThread';
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

  public getThreadsFromMessages(messages: GmailMessage[]): GmailThread[] {
    return messages.reduce((acc, message) => {
      if (message.externalId === message.messageThreadExternalId) {
        acc.push({
          id: message.messageThreadExternalId,
          subject: message.subject,
        });
      }

      return acc;
    }, [] as GmailThread[]);
  }

  public async saveMessageThreads(
    threads: GmailThread[],
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
    connectedAccountId: string,
  ) {
    const messageChannel = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."messageChannel" WHERE "connectedAccountId" = $1`,
      [connectedAccountId],
    );

    if (!messageChannel.length) {
      throw new Error('No message channel found for this connected account');
    }

    for (const thread of threads) {
      await workspaceDataSource?.query(
        `INSERT INTO ${dataSourceMetadata.schema}."messageThread" ("externalId", "subject", "messageChannelId", "visibility") VALUES ($1, $2, $3, $4)`,
        [thread.id, thread.subject, messageChannel[0].id, 'default'],
      );
    }
  }

  public async saveMessages(
    messages: GmailMessage[],
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
    connectedAccount,
  ) {
    for (const message of messages) {
      const {
        externalId,
        headerMessageId,
        subject,
        messageThreadExternalId,
        internalDate,
        fromHandle,
        fromDisplayName,
        recipients,
        text,
      } = message;

      const date = new Date(parseInt(internalDate));

      const messageThread = await workspaceDataSource?.query(
        `SELECT * FROM ${dataSourceMetadata.schema}."messageThread" WHERE "externalId" = $1`,
        [messageThreadExternalId],
      );

      const messageId = v4();

      const person = await workspaceDataSource?.query(
        `SELECT * FROM ${dataSourceMetadata.schema}."person" WHERE "email" = $1`,
        [fromHandle],
      );

      const personId = person[0]?.id;

      const workspaceMember = await workspaceDataSource?.query(
        `SELECT "workspaceMember"."id" FROM ${dataSourceMetadata.schema}."workspaceMember"
        JOIN ${dataSourceMetadata.schema}."connectedAccount" ON ${dataSourceMetadata.schema}."workspaceMember"."id" = ${dataSourceMetadata.schema}."connectedAccount"."accountOwnerId"
        WHERE ${dataSourceMetadata.schema}."connectedAccount"."handle" = $1`,
        [fromHandle],
      );

      const workspaceMemberId = workspaceMember[0]?.id;

      const messageDirection =
        connectedAccount.handle === fromHandle ? 'outgoing' : 'incoming';

      await workspaceDataSource?.transaction(async (manager) => {
        await manager.query(
          `INSERT INTO ${dataSourceMetadata.schema}."message" ("id", "externalId", "headerMessageId", "subject", "date", "messageThreadId", "direction", "body") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            messageId,
            externalId,
            headerMessageId,
            subject,
            date,
            messageThread[0]?.id,
            messageDirection,
            text,
          ],
        );

        await manager.query(
          `INSERT INTO ${dataSourceMetadata.schema}."messageRecipient" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            messageId,
            'from',
            fromHandle,
            fromDisplayName,
            personId,
            workspaceMemberId,
          ],
        );

        await this.saveMessageRecipients(
          recipients,
          dataSourceMetadata,
          messageId,
          manager,
        );
      });
    }
  }

  public async saveMessageRecipients(
    recipients: Recipient[],
    dataSourceMetadata: DataSourceEntity,
    messageId: string,
    manager: EntityManager,
  ): Promise<void> {
    if (!recipients) return;

    for (const recipient of recipients) {
      const recipientPerson = await manager.query(
        `SELECT * FROM ${dataSourceMetadata.schema}."person" WHERE "email" = $1`,
        [recipient.handle],
      );

      const recipientPersonId = recipientPerson[0]?.id;

      const workspaceMember = await manager.query(
        `SELECT "workspaceMember"."id" FROM ${dataSourceMetadata.schema}."workspaceMember"
          JOIN ${dataSourceMetadata.schema}."connectedAccount" ON ${dataSourceMetadata.schema}."workspaceMember"."id" = ${dataSourceMetadata.schema}."connectedAccount"."accountOwnerId"
          WHERE ${dataSourceMetadata.schema}."connectedAccount"."handle" = $1`,
        [recipient.handle],
      );

      const recipientWorkspaceMemberId = workspaceMember[0]?.id;

      await manager.query(
        `INSERT INTO ${dataSourceMetadata.schema}."messageRecipient" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          messageId,
          recipient.role,
          recipient.handle,
          recipient.displayName,
          recipientPersonId,
          recipientWorkspaceMemberId,
        ],
      );
    }
  }

  public async getSavedMessageIdsAndThreadIds(
    messageEternalIds: string[],
    connectedAccountId: string,
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
  ): Promise<{
    savedMessageIds: string[];
    savedThreadIds: string[];
  }> {
    const messageIdsInDatabase: {
      messageExternalId: string;
      messageThreadExternalId: string;
    }[] = await workspaceDataSource?.query(
      `SELECT message."externalId" AS "messageExternalId",
      "messageThread"."externalId" AS "messageThreadExternalId"
      FROM ${dataSourceMetadata.schema}."message" message
      LEFT JOIN ${dataSourceMetadata.schema}."messageThread" "messageThread" ON message."messageThreadId" = "messageThread"."id" 
      LEFT JOIN ${dataSourceMetadata.schema}."messageChannel" ON "messageThread"."messageChannelId" = ${dataSourceMetadata.schema}."messageChannel"."id"
      WHERE ${dataSourceMetadata.schema}."messageChannel"."connectedAccountId" = $1
        AND message."externalId" = ANY($2)`,
      [connectedAccountId, messageEternalIds],
    );

    return {
      savedMessageIds: messageIdsInDatabase.map(
        (message) => message.messageExternalId,
      ),
      savedThreadIds: [
        ...new Set(
          messageIdsInDatabase.map(
            (message) => message.messageThreadExternalId,
          ),
        ),
      ],
    };
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
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'gmail'`,
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
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'gmail' AND "id" = $1`,
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

  public async deleteMessages(
    messageIds: string[],
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
  ) {
    if (!messageIds || messageIds.length === 0) {
      return;
    }

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."message" WHERE "externalId" = ANY($1)`,
      [messageIds],
    );
  }

  public async deleteEmptyThreads(
    messageIds: string[],
    connectedAccountId: string,
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
  ) {
    const messageThreadsToDelete = await workspaceDataSource?.query(
      `SELECT "messageThread"."id" FROM ${dataSourceMetadata.schema}."messageThread" "messageThread"
      LEFT JOIN ${dataSourceMetadata.schema}."message" message ON "messageThread"."id" = message."messageThreadId"
      LEFT JOIN ${dataSourceMetadata.schema}."messageChannel" ON "messageThread"."messageChannelId" = ${dataSourceMetadata.schema}."messageChannel"."id"
      WHERE "messageThread"."externalId" = ANY($1)
      AND ${dataSourceMetadata.schema}."messageChannel"."connectedAccountId" = $2
      GROUP BY "messageThread"."id"
      HAVING COUNT(message."id") = 0`,
      [messageIds, connectedAccountId],
    );

    if (!messageThreadsToDelete || messageThreadsToDelete.length === 0) {
      return;
    }

    const messageThreadIdsToDelete = messageThreadsToDelete.map(
      (messageThread) => messageThread.id,
    );

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."messageThread" WHERE "id" = ANY($1)`,
      [messageThreadIdsToDelete],
    );
  }
}
