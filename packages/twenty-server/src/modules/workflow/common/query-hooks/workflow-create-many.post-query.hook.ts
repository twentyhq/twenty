import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { type WorkspacePostQueryHookInstance } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/interfaces/workspace-query-hook.interface';

import { WorkspaceQueryHook } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/decorators/workspace-query-hook.decorator';
import { WorkspaceQueryHookType } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/types/workspace-query-hook.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@WorkspaceQueryHook({
  key: `workflow.createMany`,
  type: WorkspaceQueryHookType.POST_HOOK,
})
export class WorkflowCreateManyPostQueryHook implements WorkspacePostQueryHookInstance {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly recordPositionService: RecordPositionService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
  ) {}

  async execute(
    authContext: WorkspaceAuthContext,
    _objectName: string,
    payload: WorkflowWorkspaceEntity[],
  ): Promise<void> {
    const workspace = authContext.workspace;

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    const position =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.recordPositionService.buildRecordPosition({
            value: 'first',
            objectMetadata: {
              isCustom: false,
              nameSingular: 'workflowVersion',
            },
            workspaceId: workspace.id,
          }),
        authContext,
      );

    for (const workflow of payload) {
      await this.workflowVersionCoreSyncService.writeWorkflowVersionAndMirror(
        workspace.id,
        async (workflowVersionRepository, entityManager) => {
          const insertResult = await workflowVersionRepository.insert(
            {
              workflowId: workflow.id,
              status: WorkflowVersionStatus.DRAFT,
              name: 'v1',
              position,
            },
            entityManager,
          );

          return (
            insertResult.generatedMaps[0] as WorkflowVersionWorkspaceEntity
          ).id;
        },
      );
    }
  }
}
