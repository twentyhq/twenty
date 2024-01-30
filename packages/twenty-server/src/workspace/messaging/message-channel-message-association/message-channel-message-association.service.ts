import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel-message-association.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class MessageChannelMessageAssociationService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByMessageExternalIdsAndMessageChannelId(
    messageExternalIds: string[],
    messageChannelId: string,
    workspaceId: string,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata>[]> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    return await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation"
    WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
      [messageExternalIds, messageChannelId],
    );
  }

  public async countByMessageExternalIdsAndMessageChannelId(
    messageExternalIds: string[],
    messageChannelId: string,
    workspaceId: string,
  ): Promise<number> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    const result = await workspaceDataSource?.query(
      `SELECT COUNT(*) FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation"
    WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
      [messageExternalIds, messageChannelId],
    );

    return result[0]?.count;
  }

  public async deleteByMessageExternalIdsAndMessageChannelId(
    messageExternalIds: string[],
    messageChannelId: string,
    workspaceId: string,
  ) {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation" WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
      [messageExternalIds, messageChannelId],
    );
  }

  public async getByMessageThreadExternalIds(
    messageThreadExternalIds: string[],
    workspaceId: string,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata>[]> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    return await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation"
    WHERE "messageThreadExternalId" = ANY($1)`,
      [messageThreadExternalIds],
    );
  }

  public async getFirstByMessageThreadExternalId(
    messageThreadExternalId: string,
    workspaceId: string,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata> | null> {
    const existingMessageChannelMessageAssociations =
      await this.getByMessageThreadExternalIds(
        [messageThreadExternalId],
        workspaceId,
      );

    if (
      !existingMessageChannelMessageAssociations ||
      existingMessageChannelMessageAssociations.length === 0
    ) {
      return null;
    }

    return existingMessageChannelMessageAssociations[0];
  }

  public async getByMessageIds(
    messageIds: string[],
    workspaceId: string,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata>[]> {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    return await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation"
    WHERE "messageId" = ANY($1)`,
      [messageIds],
    );
  }
}
