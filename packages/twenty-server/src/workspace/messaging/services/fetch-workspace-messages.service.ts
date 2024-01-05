import { Injectable } from '@nestjs/common';

import { gmail_v1, google } from 'googleapis';
import { v4 } from 'uuid';
import { DataSource } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';
import { GmailMessage } from 'src/workspace/messaging/types/gmailMessage';
import { MessageOrThreadQuery } from 'src/workspace/messaging/types/messageOrThreadQuery';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { RefreshAccessTokenService } from 'src/workspace/messaging/services/refresh-access-token.service';

@Injectable()
export class FetchWorkspaceMessagesService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly fetchBatchMessagesService: FetchBatchMessagesService,
    private readonly refreshAccessTokenService: RefreshAccessTokenService,
  ) {}

  async fetchWorkspaceMessages(workspaceId: string): Promise<void> {
    await this.refreshAccessTokenService.refreshAndSaveAccessToken(
      workspaceId,
      '20202020-0687-4c41-b707-ed1bfca972a7',
    );
    await this.fetchWorkspaceMemberThreads(
      workspaceId,
      '20202020-0687-4c41-b707-ed1bfca972a7',
    );
  }

  async fetchWorkspaceMemberThreads(
    workspaceId: string,
    workspaceMemberId: string,
    maxResults = 500,
  ): Promise<void> {
    const { workspaceDataSource, dataSourceMetadata, connectedAccount } =
      await this.getDataSourceMetadataWorkspaceMetadataAndConnectedAccount(
        workspaceId,
        workspaceMemberId,
      );

    const accessToken = connectedAccount.accessToken;
    const refreshToken = connectedAccount.refreshToken;

    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const gmailClient = await this.getGmailClient(refreshToken);

    const threads = await gmailClient.users.threads.list({
      userId: 'me',
      maxResults,
    });

    const threadsData = threads.data.threads;

    if (!threadsData || threadsData?.length === 0) {
      return;
    }

    const { savedMessageIds, savedThreadIds } =
      await this.getAllSavedMessagesIdsAndMessageThreadsIdsForConnectedAccount(
        dataSourceMetadata,
        workspaceDataSource,
        connectedAccount.id,
      );

    const threadsToSave = threadsData.filter(
      (thread) => thread.id && !savedThreadIds.includes(thread.id),
    );

    await this.saveMessageThreads(
      threadsToSave,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount.id,
    );

    const threadQueries: MessageOrThreadQuery[] = threadsData.map((thread) => ({
      uri: '/gmail/v1/users/me/threads/' + thread.id + '?format=minimal',
    }));

    const threadsWithMessageIds =
      await this.fetchBatchMessagesService.fetchAllThreads(
        threadQueries,
        accessToken,
      );

    const messageIds = threadsWithMessageIds
      .map((thread) => thread.messageIds)
      .flat();

    const messageIdsToSave = messageIds.filter(
      (messageId) => !savedMessageIds.includes(messageId),
    );

    const messageQueries: MessageOrThreadQuery[] = messageIdsToSave.map(
      (messageId) => ({
        uri: '/gmail/v1/users/me/messages/' + messageId + '?format=RAW',
      }),
    );

    const messagesResponse =
      await this.fetchBatchMessagesService.fetchAllMessages(
        messageQueries,
        accessToken,
      );

    await this.saveMessages(
      messagesResponse,
      dataSourceMetadata,
      workspaceDataSource,
      workspaceMemberId,
    );
  }

  async getGmailClient(refreshToken: string): Promise<gmail_v1.Gmail> {
    const gmailClientId = this.environmentService.getAuthGoogleClientId();

    const gmailClientSecret =
      this.environmentService.getAuthGoogleClientSecret();

    const oAuth2Client = new google.auth.OAuth2(
      gmailClientId,
      gmailClientSecret,
    );

    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const gmailClient = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    return gmailClient;
  }

  async saveMessageThreads(
    threads: gmail_v1.Schema$Thread[],
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
        [thread.id, thread.snippet, messageChannel[0].id, 'default'],
      );
    }
  }

  async saveMessages(
    messages: GmailMessage[],
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
    workspaceMemberId: string,
  ) {
    for (const message of messages) {
      const {
        externalId,
        headerMessageId,
        subject,
        messageThreadId,
        internalDate,
        from,
        text,
      } = message;

      const date = new Date(parseInt(internalDate));

      const messageThread = await workspaceDataSource?.query(
        `SELECT * FROM ${dataSourceMetadata.schema}."messageThread" WHERE "externalId" = $1`,
        [messageThreadId],
      );

      const messageId = v4();
      const handle = from?.value[0]?.address;
      const displayName = from?.value[0]?.name;

      const person = await workspaceDataSource?.query(
        `SELECT * FROM ${dataSourceMetadata.schema}."person" WHERE "email" = $1`,
        [handle],
      );

      const personId = person[0]?.id;

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
            'incoming',
            text,
          ],
        );

        await manager.query(
          `INSERT INTO ${dataSourceMetadata.schema}."messageRecipient" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ($1, $2, $3, $4, $5, $6)`,
          [messageId, 'from', handle, displayName, personId, workspaceMemberId],
        );
      });
    }
  }

  async getAllSavedMessagesIdsAndMessageThreadsIdsForConnectedAccount(
    dataSourceMetadata: DataSourceEntity,
    workspaceDataSource: DataSource,
    connectedAccountId: string,
  ): Promise<{
    savedMessageIds: string[];
    savedThreadIds: string[];
  }> {
    const messageIds: { messageId: string; messageThreadId: string }[] =
      await workspaceDataSource?.query(
        `SELECT message."externalId" AS "messageId",
      "messageThread"."externalId" AS "messageThreadId"
      FROM ${dataSourceMetadata.schema}."message" message
      LEFT JOIN ${dataSourceMetadata.schema}."messageThread" "messageThread" ON message."messageThreadId" = "messageThread"."id" 
      LEFT JOIN ${dataSourceMetadata.schema}."messageChannel" ON "messageThread"."messageChannelId" = ${dataSourceMetadata.schema}."messageChannel"."id"
      WHERE ${dataSourceMetadata.schema}."messageChannel"."connectedAccountId" = $1`,
        [connectedAccountId],
      );

    return {
      savedMessageIds: messageIds.map((message) => message.messageId),
      savedThreadIds: [
        ...new Set(messageIds.map((message) => message.messageThreadId)),
      ],
    };
  }

  async getDataSourceMetadataWorkspaceMetadataAndConnectedAccount(
    workspaceId: string,
    workspaceMemberId: string,
  ): Promise<{
    dataSourceMetadata: DataSourceEntity;
    workspaceDataSource: DataSource;
    connectedAccount: any;
  }> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

    if (!workspaceDataSource) {
      throw new Error('No workspace data source found');
    }

    const connectedAccounts = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'gmail' AND "accountOwnerId" = $1`,
      [workspaceMemberId],
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
}
