import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';

@Injectable()
export class MessageThreadService {
  constructor(
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

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
