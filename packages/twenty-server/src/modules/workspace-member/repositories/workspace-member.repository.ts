import { Injectable, NotFoundException } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { WorkspaceMember } from 'src/engine/core-modules/user/dtos/workspace-member.dto';
import { assert } from 'src/utils/assert';

@Injectable()
export class WorkspaceMemberRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByIds(
    userIds: string[],
    workspaceId: string,
  ): Promise<ObjectRecord<WorkspaceMemberWorkspaceEntity>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "userId" = ANY($1)`,
      [userIds],
      workspaceId,
    );

    return result;
  }

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

  public async getById(userId: string, workspaceId: string) {
    const schemaExists =
      await this.workspaceDataSourceService.checkSchemaExists(workspaceId);

    if (!schemaExists) {
      return;
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMembers =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."workspaceMember" WHERE "userId" = $1`,
        [userId],
        workspaceId,
      );

    if (!workspaceMembers.length) {
      return;
    }

    assert(
      workspaceMembers.length === 1,
      'WorkspaceMember not found or too many found',
    );

    const workspaceMember = new WorkspaceMember();

    workspaceMember.id = workspaceMembers[0].id;
    workspaceMember.colorScheme = workspaceMembers[0].colorScheme;
    workspaceMember.locale = workspaceMembers[0].locale;
    workspaceMember.avatarUrl = workspaceMembers[0].avatarUrl;
    workspaceMember.name = {
      firstName: workspaceMembers[0].nameFirstName,
      lastName: workspaceMembers[0].nameLastName,
    };

    return workspaceMember;
  }

  public async getByIdOrFail(userId: string, workspaceId: string) {
    const workspaceMember = await this.getById(userId, workspaceId);

    if (!workspaceMember) {
      throw new NotFoundException(
        `No workspace member found for user ${userId} in workspace ${workspaceId}`,
      );
    }

    return workspaceMember;
  }

  public async getAllByWorkspaceId(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<WorkspaceMemberWorkspaceEntity>[]> {
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
