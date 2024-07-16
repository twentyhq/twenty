import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class WorkspaceMemberRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async find(workspaceMemberId: string, workspaceId: string) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMembers =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "id" = $1`,
        [workspaceMemberId],
        workspaceId,
      );

    return workspaceMembers?.[0];
  }

  public async getByIdOrFail(
    userId: string,
    workspaceId: string,
  ): Promise<WorkspaceMemberWorkspaceEntity> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMembers =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "userId" = $1`,
        [userId],
        workspaceId,
      );

    if (!workspaceMembers || workspaceMembers.length === 0) {
      throw new NotFoundException(
        `No workspace member found for user ${userId} in workspace ${workspaceId}`,
      );
    }

    return workspaceMembers[0];
  }

  public async getAllByWorkspaceId(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<WorkspaceMemberWorkspaceEntity[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMembers =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember"`,
        [],
        workspaceId,
        transactionManager,
      );

    return workspaceMembers;
  }
}
