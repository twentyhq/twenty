import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class MessageChannelService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByConnectedAccountId(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannel" WHERE "connectedAccountId" = $1 AND "type" = 'email' LIMIT 1`,
      [connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async getFirstByConnectedAccountIdOrFail(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>> {
    const messageChannels = await this.getByConnectedAccountId(
      connectedAccountId,
      workspaceId,
    );

    if (!messageChannels || messageChannels.length === 0) {
      throw new Error('No message channel found');
    }

    return messageChannels[0];
  }

  public async getIsContactAutoCreationEnabledByConnectedAccountIdOrFail(
    connectedAccountId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const messageChannel = await this.getFirstByConnectedAccountIdOrFail(
      connectedAccountId,
      workspaceId,
    );

    return messageChannel.isContactAutoCreationEnabled;
  }

  public async getIsContactAutoCreationEnabledByMessageChannelId(
    messageChannelId: string,
    workspaceId: string,
  ): Promise<boolean> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const messageChannels =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."messageChannel" WHERE "id" = $1 LIMIT 1`,
        [messageChannelId],
        workspaceId,
      );

    return messageChannels[0]?.isContactAutoCreationEnabled;
  }

  public async getByIds(
    ids: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannel" WHERE "id" = ANY($1)`,
      [ids],
      workspaceId,
      transactionManager,
    );
  }
}
