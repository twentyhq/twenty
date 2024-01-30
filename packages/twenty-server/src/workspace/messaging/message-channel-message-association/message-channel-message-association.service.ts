import { Injectable } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel-message-association.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class MessageChannelMessageAssociationService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getMessageChannelMessageAssociationsByMessageExternalIdsAndMessageChannelId(
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

  public async countMessageChannelMessageAssociationsByMessageExternalIdsAndMessageChannelId(
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

  public async deleteMessageChannelMessageAssociations(
    messageExternalIds: string[],
    connectedAccountId: string,
    workspaceId: string,
  ) {
    const { dataSource: workspaceDataSource, dataSourceMetadata } =
      await this.workspaceDataSourceService.connectedToWorkspaceDataSourceAndReturnMetadata(
        workspaceId,
      );

    await workspaceDataSource?.query(
      `DELETE FROM ${dataSourceMetadata.schema}."messageChannelMessageAssociation" WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
      [messageExternalIds, connectedAccountId],
    );
  }

  public async getMessageChannelMessageAssociationByMessageThreadExternalIds(
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

  public async getFirstMessageChannelMessageAssociationByMessageThreadExternalId(
    messageThreadExternalId: string,
    workspaceId: string,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata> | null> {
    const existingMessageChannelMessageAssociations =
      await this.getMessageChannelMessageAssociationByMessageThreadExternalIds(
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

  public async getMessageChannelMessageAssociationByMessageIds(
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
