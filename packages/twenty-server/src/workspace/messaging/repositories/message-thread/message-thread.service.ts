import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';
import { MessageThreadObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-thread.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

@Injectable()
export class MessageThreadService {
  constructor(
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getOrphanThreads(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageThreadObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT mt.* FROM ${dataSourceSchema}."messageThread" mt
      WHERE NOT EXISTS (
          SELECT 1 FROM ${dataSourceSchema}."message" m
          WHERE m."messageThreadId" = mt.id
      )`,
      [],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    messageThreadIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."messageThread" WHERE id = ANY($1)`,
      [messageThreadIds],
      workspaceId,
      transactionManager,
    );
  }

  public async saveMessageThreadOrReturnExistingMessageThread(
    messageThreadExternalId: string,
    dataSourceMetadata: DataSourceEntity,
    workspaceId: string,
    manager: EntityManager,
  ) {
    const existingMessageChannelMessageAssociationByMessageThreadExternalId =
      await this.messageChannelMessageAssociationService.getFirstByMessageThreadExternalId(
        messageThreadExternalId,
        workspaceId,
        manager,
      );

    const existingMessageThread =
      existingMessageChannelMessageAssociationByMessageThreadExternalId?.messageThreadId;

    if (existingMessageThread) {
      return Promise.resolve(existingMessageThread);
    }

    const newMessageThreadId = v4();

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}."messageThread" ("id") VALUES ($1)`,
      [newMessageThreadId],
    );

    return Promise.resolve(newMessageThreadId);
  }
}
