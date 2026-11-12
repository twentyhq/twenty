import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { getLastDeletedRecordIdsByParentId } from 'src/utils/get-last-deleted-record-ids-by-parent-id.util';

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
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<TaskTargetWorkspaceEntity>(
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
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<TaskTargetWorkspaceEntity>(
          'taskTarget',
        );

      const deletedTaskTargets = await taskTargetRepository.find({
        where: {
          taskId: In(payload.map((task) => task.id)),
          deletedAt: Not(IsNull()),
        },
        select: { id: true, taskId: true, deletedAt: true },
        withDeleted: true,
      });

      const taskTargetIdsToRestore = getLastDeletedRecordIdsByParentId(
        deletedTaskTargets.map(({ id, taskId, deletedAt }) => ({
          id,
          parentId: taskId,
          deletedAt,
        })),
      );

      if (taskTargetIdsToRestore.length === 0) {
        return;
      }

      await taskTargetRepository.restore({
        id: In(taskTargetIdsToRestore),
      });
    }, authContext);
  }
}
