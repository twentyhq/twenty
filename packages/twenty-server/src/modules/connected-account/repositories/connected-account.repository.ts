import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

@Injectable()
export class ConnectedAccountRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getAll(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."connectedAccount" WHERE "provider" = 'google'`,
      [],
      workspaceId,
      transactionManager,
    );
  }

  public async getByIds(
    connectedAccountIds: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."connectedAccount" WHERE "id" = ANY($1)`,
      [connectedAccountIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getAllByWorkspaceMemberId(
    workspaceMemberId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>[] | undefined> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const connectedAccounts =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."connectedAccount" WHERE "accountOwnerId" = $1`,
        [workspaceMemberId],
        workspaceId,
        transactionManager,
      );

    return connectedAccounts;
  }

  public async getAllByHandleAndWorkspaceMemberId(
    handle: string,
    workspaceMemberId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>[] | undefined> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const connectedAccounts =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."connectedAccount" WHERE "handle" = $1 AND "accountOwnerId" = $2 LIMIT 1`,
        [handle, workspaceMemberId],
        workspaceId,
        transactionManager,
      );

    return connectedAccounts;
  }

  public async create(
    connectedAccount: Pick<
      ObjectRecord<ConnectedAccountObjectMetadata>,
      | 'id'
      | 'handle'
      | 'provider'
      | 'accessToken'
      | 'refreshToken'
      | 'accountOwnerId'
    >,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."connectedAccount" ("id", "handle", "provider", "accessToken", "refreshToken", "accountOwnerId") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        connectedAccount.id,
        connectedAccount.handle,
        connectedAccount.provider,
        connectedAccount.accessToken,
        connectedAccount.refreshToken,
        connectedAccount.accountOwnerId,
      ],
      workspaceId,
      transactionManager,
    );
  }

  public async updateAccessTokenAndRefreshToken(
    accessToken: string,
    refreshToken: string,
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "accessToken" = $1, "refreshToken" = $2, "authFailedAt" = NULL WHERE "id" = $3`,
      [accessToken, refreshToken, connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async getById(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata> | undefined> {
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
  ): Promise<ObjectRecord<ConnectedAccountObjectMetadata>> {
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

  public async updateLastSyncHistoryId(
    historyId: string,
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "lastSyncHistoryId" = $1 WHERE "id" = $2`,
      [historyId, connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async updateLastSyncHistoryIdIfHigher(
    historyId: string,
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "lastSyncHistoryId" = $1
      WHERE "id" = $2
      AND ("lastSyncHistoryId" < $1 OR "lastSyncHistoryId" = '')`,
      [historyId, connectedAccountId],
      workspaceId,
      transactionManager,
    );
  }

  public async deleteHistoryId(
    connectedAccountId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."connectedAccount" SET "lastSyncHistoryId" = '' WHERE "id" = $1`,
      [connectedAccountId],
      workspaceId,
      transactionManager,
    );
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
}
