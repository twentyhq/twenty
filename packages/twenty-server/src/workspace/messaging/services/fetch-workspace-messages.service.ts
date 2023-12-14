import { Injectable } from '@nestjs/common';

import { google } from 'googleapis';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { FetchBatchMessagesService } from 'src/workspace/messaging/services/fetch-batch-messages.service';

@Injectable()
export class FetchWorkspaceMessagesService {
  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly fetchBatchMessagesService: FetchBatchMessagesService,
  ) {}

  async fetchWorkspaceThreads(workspaceId: string): Promise<any> {
    return await this.fetchWorkspaceMemberThreads(
      workspaceId,
      '20202020-0687-4c41-b707-ed1bfca972a7',
    );
  }

  async fetchWorkspaceMessages(workspaceId: string): Promise<any> {
    return await this.fetchWorkspaceMemberMessages(
      workspaceId,
      '20202020-0687-4c41-b707-ed1bfca972a7',
    );
  }

  async fetchWorkspaceMemberThreads(
    workspaceId: string,
    workspaceMemberId: string,
  ): Promise<any> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

    const connectedAccount = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'gmail' AND "accountOwnerId" = $1`,
      [workspaceMemberId],
    );

    const refreshToken = connectedAccount[0].refreshToken;

    const gmail = await this.getGmailClient(refreshToken);

    const threads = await gmail.users.threads.list({
      userId: 'me',
    });

    const threadsData = threads.data.threads;

    if (!threadsData) {
      return;
    }

    await this.saveMessageThreads(
      threadsData,
      dataSourceMetadata,
      workspaceDataSource,
      connectedAccount[0].id,
    );

    return threads;
  }

  async fetchWorkspaceMemberMessages(
    workspaceId: string,
    workspaceMemberId: string,
  ): Promise<any> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource = await this.typeORMService.connectToDataSource(
      dataSourceMetadata,
    );

    const connectedAccount = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'gmail' AND "accountOwnerId" = $1`,
      [workspaceMemberId],
    );

    const refreshToken = connectedAccount[0].refreshToken;

    const gmail = await this.getGmailClient(refreshToken);

    const messages = await gmail.users.messages.list({
      userId: 'me',
    });

    const messagesData = messages.data.messages;

    console.log('messagesData', messages);

    if (!messagesData) {
      return;
    }
    // TODO: fetch batch request !!!
    // for (const message of messagesData) {
    //   if (!message.id) {
    //     continue;
    //   }
    //   const messageData = await gmail.users.messages.get({
    //     userId: 'me',
    //     id: message.id,
    //   });

    //   console.log('messageData', messageData.data.snippet);
    // }

    const messageQueries = messagesData.map((message) => ({
      uri: '/gmail/v1/users/me/messages/' + message.id,
    }));

    await this.fetchBatchMessagesService.fetchBatch(
      messageQueries,
      refreshToken,
      10,
    );

    // if (!messagesData) {
    //   return;
    // }

    // await this.saveMessages(
    //   messagesData,
    //   dataSourceMetadata,
    //   workspaceDataSource,
    //   connectedAccount[0].id,
    // );

    return messages;
  }

  async getGmailClient(refreshToken) {
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

    return google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });
  }

  async saveMessageThreads(
    threads,
    dataSourceMetadata,
    workspaceDataSource,
    connectedAccountId,
  ) {
    const messageChannel = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."messageChannel" WHERE "connectedAccountId" = $1`,
      [connectedAccountId],
    );

    for (const thread of threads) {
      await workspaceDataSource?.query(
        `INSERT INTO ${dataSourceMetadata.schema}."messageThread" ("externalId", "subject", "messageChannelId", "visibility") VALUES ($1, $2, $3, $4)`,
        [thread.id, thread.snippet, messageChannel[0].id, 'default'],
      );
    }
  }

  //   async saveMessages(
  //     threads,
  //     dataSourceMetadata,
  //     workspaceDataSource,
  //     connectedAccountId,
  //   ) {
  //     const messageChannel = await workspaceDataSource?.query(
  //       `SELECT * FROM ${dataSourceMetadata.schema}."messageChannel" WHERE "connectedAccountId" = $1`,
  //       [connectedAccountId],
  //     );

  //     for (const thread of threads) {
  //       await workspaceDataSource?.query(
  //         `INSERT INTO ${dataSourceMetadata.schema}."message" ("externalId", "subject", "messageChannelId", "visibility") VALUES ($1, $2, $3, $4)`,
  //         [thread.id, thread.snippet, messageChannel[0].id, 'default'],
  //       );
  //     }
  //   }
}
