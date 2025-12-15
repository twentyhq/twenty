import { Injectable } from '@nestjs/common';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowVersionStepHelpersWorkspaceService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async getValidatedDraftWorkflowVersion({
    workflowVersionId,
    workspaceId,
  }: {
    workflowVersionId: string;
    workspaceId: string;
  }): Promise<WorkflowVersionWorkspaceEntity> {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workflowVersionId,
        workspaceId,
      });

    assertWorkflowVersionIsDraft(workflowVersion);

    return workflowVersion;
  }

  async updateWorkflowVersionStepsAndTrigger({
    workspaceId,
    workflowVersionId,
    steps,
    trigger,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    steps?: WorkflowAction[] | null;
    trigger?: WorkflowTrigger | null;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const updateData: Partial<WorkflowVersionWorkspaceEntity> = {};

        if (steps !== undefined) {
          updateData.steps = steps;
        }

        if (trigger !== undefined) {
          updateData.trigger = trigger;
        }

        await workflowVersionRepository.update(workflowVersionId, updateData);
      },
    );
  }
}
