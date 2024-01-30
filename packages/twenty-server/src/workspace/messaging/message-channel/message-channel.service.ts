import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class MessageChannelService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByConnectedAccountId(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>[]> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    return await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."messageChannel" WHERE "connectedAccountId" = $1 AND "type" = 'email' LIMIT 1`,
      [connectedAccountId],
    );
  }

  public async getFirstByConnectedAccountIdOrFail(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<ObjectRecord<MessageChannelObjectMetadata>> {
    const messageChannels = await this.getByConnectedAccountId(
      workspaceId,
      connectedAccountId,
    );

    if (!messageChannels || messageChannels.length === 0) {
      throw new Error('No message channel found');
    }

    return messageChannels[0];
  }
}
