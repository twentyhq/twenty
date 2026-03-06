import { Injectable } from '@nestjs/common';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { TaskPostQueryHookService } from 'src/modules/task/query-hooks/task-post-query-hook.service';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';

@Injectable()
@WorkspaceQueryHook({
  key: `task.restoreMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class TaskRestoreManyPostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly taskPostQueryHookService: TaskPostQueryHookService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: TaskWorkspaceEntity[],
  ): Promise<void> {
    await this.taskPostQueryHookService.handleTaskTargetsRestore(
      authContext,
      payload,
    );
  }
}
