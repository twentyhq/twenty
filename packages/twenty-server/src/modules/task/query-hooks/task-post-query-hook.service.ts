import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceDataSourceV2Service } from 'src/engine/twenty-orm-v2/datasource/workspace-data-source-v2.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

@Injectable()
export class TaskPostQueryHookService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workspaceDataSourceV2Service: WorkspaceDataSourceV2Service,
  ) {}

  async handleTaskTargetsDelete(
    authContext: WorkspaceAuthContext,
    payload: TaskWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const taskTargetRepository = this.workspaceDataSourceV2Service
        .getDataSource({ useReplica: false })
        .getRepository('taskTarget');

      await taskTargetRepository.softDelete({
        taskId: In(payload.map((task) => task.id)),
      });
    }, authContext);
  }

  async handleTaskTargetsRestore(
    authContext: WorkspaceAuthContext,
    payload: TaskWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const taskTargetRepository = this.workspaceDataSourceV2Service
        .getDataSource({ useReplica: false })
        .getRepository('taskTarget');

      await taskTargetRepository.restore({
        taskId: In(payload.map((task) => task.id)),
      });
    }, authContext);
  }
}
