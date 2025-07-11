import { WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { workspaceValidator } from 'src/engine/core-modules/workspace/workspace.validate';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@WorkspaceQueryHook({
  key: `workflow.createMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkflowCreateManyPostQueryHook
  implements WorkspacePostQueryHookInstance
{
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async execute(
    authContext: AuthContext,
    _objectName: string,
    payload: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    const workspace = authContext.workspace;

    workspaceValidator.assertIsDefinedOrThrow(workspace);

    const workflowVersionRepository =
      await this.twentyORMManager.getRepository<WorkflowVersionWorkspaceEntity>(
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

    const workflowVersionsToCreate = payload.map((workflow) => {
      return workflowVersionRepository.create({
        workflowId: workflow.id,
        status: WorkflowVersionStatus.DRAFT,
        name: 'v1',
        position,
      });
    });

    await Promise.all(
      workflowVersionsToCreate.map((workflowVersion) => {
        return workflowVersionRepository.save(workflowVersion);
      }),
    );
  }
}
