import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

@Injectable()
export class TaskPostQueryHookService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async handleTaskTargetsDelete(
    authContext: AuthContext,
    payload: TaskWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const taskTargetRepository =
        await this.globalWorkspaceOrmManager.getRepository<TaskTargetWorkspaceEntity>(
          workspace.id,
          'taskTarget',
        );

      await taskTargetRepository.softDelete({
        taskId: In(payload.map((task) => task.id)),
      });
    }, authContext as WorkspaceAuthContext);
  }

  async handleTaskTargetsRestore(
    authContext: AuthContext,
    payload: TaskWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const taskTargetRepository =
        await this.globalWorkspaceOrmManager.getRepository<TaskTargetWorkspaceEntity>(
          workspace.id,
          'taskTarget',
        );

      await taskTargetRepository.restore({
        taskId: In(payload.map((task) => task.id)),
      });
    }, authContext as WorkspaceAuthContext);
  }
}
