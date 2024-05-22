import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class MessageThreadMemberRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async insert(
    id: string,
    messageThreadId: string,
    workspaceMemberId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."messageThreadMember" ("id", "messageThreadId", "workspaceMemberId") VALUES ($1, $2, $3)`,
      [id, messageThreadId, workspaceMemberId],
      workspaceId,
      transactionManager,
    );
  }

  public async removeByMessageThreadId(
    messageThreadId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."messageThreadMember" WHERE "messageThreadId" = $1`,
      [messageThreadId],
      workspaceId,
      transactionManager,
    );
  }

  public async removeByWorkspaceMemberId(
    workspaceMemberId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."messageThreadMember" WHERE "workspaceMemberId" = $1`,
      [workspaceMemberId],
      workspaceId,
      transactionManager,
    );
  }
}
