import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

@Injectable()
export class TaskPostQueryHookService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async handleTaskTargetsDelete(
    authContext: WorkspaceAuthContext,
    payload: TaskWorkspaceEntity[],
  ): Promise<void> {
    if (!payload || payload?.length === 0) {
      return;
    }

    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const taskTargetRepository =
        this.workspaceOrmManager.getRepository<TaskTargetWorkspaceEntity>(
          'taskTarget',
        );

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

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const taskTargetRepository =
        this.workspaceOrmManager.getRepository<TaskTargetWorkspaceEntity>(
          'taskTarget',
        );

      await taskTargetRepository.restore({
        taskId: In(payload.map((task) => task.id)),
      });
    }, authContext);
  }
}
