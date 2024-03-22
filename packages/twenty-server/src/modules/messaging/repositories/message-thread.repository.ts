import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class MessageThreadRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getOrphanThreadIdsPaginated(
    limit: number,
    offset: number,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<string[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const orphanThreads = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT mt.id
      FROM ${dataSourceSchema}."messageThread" mt
      LEFT JOIN ${dataSourceSchema}."message" m ON mt.id = m."messageThreadId"
      WHERE m."messageThreadId" IS NULL
      LIMIT $1 OFFSET $2`,
      [limit, offset],
      workspaceId,
      transactionManager,
    );

    return orphanThreads.map(({ id }) => id);
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

  public async insert(
    messageThreadId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."messageThread" (id) VALUES ($1)`,
      [messageThreadId],
      workspaceId,
      transactionManager,
    );
  }
}
