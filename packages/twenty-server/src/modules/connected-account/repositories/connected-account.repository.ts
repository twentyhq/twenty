import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class ConnectedAccountRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getById(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ConnectedAccountWorkspaceEntity | undefined> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const connectedAccounts =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."connectedAccount" WHERE "id" = $1 LIMIT 1`,
        [connectedAccountId],
        workspaceId,
        transactionManager,
      );

    return connectedAccounts[0];
  }

  public async getByIdOrFail(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ConnectedAccountWorkspaceEntity> {
    const connectedAccount = await this.getById(
      connectedAccountId,
      workspaceId,
      transactionManager,
    );

    if (!connectedAccount) {
      throw new NotFoundException(
        `Connected account with id ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    return connectedAccount;
  }

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

  public async updateAuthFailedAt(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "authFailedAt" = NOW() WHERE "id" = $1`,
      [connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async getConnectedAccountOrThrow(
    workspaceId: string,
    connectedAccountId: string,
  ): Promise<ConnectedAccountWorkspaceEntity> {
    const connectedAccount = await this.getById(
      connectedAccountId,
      workspaceId,
    );

    if (!connectedAccount) {
      throw new Error(
        `Connected account ${connectedAccountId} not found in workspace ${workspaceId}`,
      );
    }

    return connectedAccount;
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
