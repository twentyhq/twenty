import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

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
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannelMessageAssociation"
    WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
      [messageExternalIds, messageChannelId],
      workspaceId,
      transactionManager,
    );
  }

  public async countByMessageExternalIdsAndMessageChannelId(
    messageExternalIds: string[],
    messageChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT COUNT(*) FROM ${dataSourceSchema}."messageChannelMessageAssociation"
    WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
      [messageExternalIds, messageChannelId],
      workspaceId,
      transactionManager,
    );

    return result[0]?.count;
  }

  public async deleteByMessageExternalIdsAndMessageChannelId(
    messageExternalIds: string[],
    messageChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."messageChannelMessageAssociation" WHERE "messageExternalId" = ANY($1) AND "messageChannelId" = $2`,
      [messageExternalIds, messageChannelId],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByMessageChannelId(
    messageChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."messageChannelMessageAssociation" WHERE "messageChannelId" = $1`,
      [messageChannelId],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    ids: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."messageChannelMessageAssociation" WHERE "id" = ANY($1)`,
      [ids],
      workspaceId,
      transactionManager,
    );
  }

  public async getByMessageThreadExternalIds(
    messageThreadExternalIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannelMessageAssociation"
    WHERE "messageThreadExternalId" = ANY($1)`,
      [messageThreadExternalIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getFirstByMessageThreadExternalId(
    messageThreadExternalId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata> | null> {
    const existingMessageChannelMessageAssociations =
      await this.getByMessageThreadExternalIds(
        [messageThreadExternalId],
        workspaceId,
        transactionManager,
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
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannelMessageAssociation"
    WHERE "messageId" = ANY($1)`,
      [messageIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getByMessageThreadId(
    messageThreadId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageChannelMessageAssociationObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageChannelMessageAssociation"
    WHERE "messageThreadId" = $1`,
      [messageThreadId],
      workspaceId,
      transactionManager,
    );
  }
}
