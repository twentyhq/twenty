import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';

@WorkspaceQueryHook({
  key: `workflow.createMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkflowCreateManyPostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspace.id,
        'workflowVersion',
      );

    const position = await this.recordPositionService.buildRecordPosition({
      value: 'first',
      objectMetadata: {
        isCustom: false,
        nameSingular: 'workflowVersion',
      },
      workspaceId: workspace.id,
    });

    const workflowVersionsToCreate = payload.map((workflow) => ({
      workflowId: workflow.id,
      status: WorkflowVersionStatus.DRAFT,
      name: 'v1',
      position,
    }));

    await Promise.all(
      workflowVersionsToCreate.map((workflowVersion) => {
        return workflowVersionRepository.insert(workflowVersion);
      }),
    );
  }
}
