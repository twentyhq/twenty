import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class ConnectedAccountRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async updateAccessToken(
    accessToken: string,
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "accessToken" = $1, "authFailedAt" = NULL WHERE "id" = $2`,
      [accessToken, connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async updateHandleAliases(
    handleAliases: string[],
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "handleAliases" = $1 WHERE "id" = $2`,
      // TODO: modify handleAliases to be of fieldmetadatatype array
      [handleAliases.join(','), connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }
}
