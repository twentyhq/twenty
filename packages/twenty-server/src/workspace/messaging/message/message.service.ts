import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class MessageService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getFirstByHeaderMessageId(
    workspaceId: string,
    headerMessageId: string,
  ): Promise<ObjectRecord<MessageObjectMetadata> | null> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    const messages = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."message" WHERE "headerMessageId" = $1 LIMIT 1`,
      [headerMessageId],
    );

    if (!messages || messages.length === 0) {
      return null;
    }

    return messages[0];
  }

  public async getByIds(
    workspaceId: string,
    messageIds: string[],
  ): Promise<ObjectRecord<MessageObjectMetadata>[]> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    return await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."message" WHERE "id" = ANY($1)`,
      [messageIds],
    );
  }

  public async deleteByIds(
    workspaceId: string,
    messageIds: string[],
  ): Promise<void> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."message" WHERE "id" = ANY($1)`,
      [messageIds],
    );
  }
}
