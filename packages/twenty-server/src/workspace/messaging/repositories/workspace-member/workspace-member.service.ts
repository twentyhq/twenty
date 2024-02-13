import { Injectable, NotFoundException } from '@nestjs/common';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';

// TODO: Move outside of the messaging module
@Injectable()
export class WorkspaceMemberService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByIds(
    userIds: string[],
    workspaceId: string,
  ): Promise<ObjectRecord<WorkspaceMemberObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "userId" = ANY($1)`,
      [userIds],
      workspaceId,
    );

    return result.rows;
  }

  public async getByIdOrFail(
    userId: string,
    workspaceId: string,
  ): Promise<ObjectRecord<WorkspaceMemberObjectMetadata>> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMembers =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "userId" = $1`,
        [userId],
        workspaceId,
      );

    if (!workspaceMembers || workspaceMembers.length === 0) {
      throw new NotFoundException('No workspace member found');
    }

    return workspaceMembers[0];
  }
}
