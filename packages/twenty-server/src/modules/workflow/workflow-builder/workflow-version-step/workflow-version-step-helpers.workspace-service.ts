import { Injectable } from '@nestjs/common';

import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowVersionStepHelpersWorkspaceService {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
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
    const updateData: Pick<
      Partial<WorkflowVersionWorkspaceEntity>,
      'steps' | 'trigger'
    > = {};

    if (steps !== undefined) {
      updateData.steps = steps;
    }

    if (trigger !== undefined) {
      updateData.trigger = trigger;
    }

    await this.workflowVersionCoreSyncService.writeWorkflowVersionAndMirror(
      workspaceId,
      async (workflowVersionRepository, entityManager) => {
        await workflowVersionRepository.update(
          workflowVersionId,
          updateData,
          undefined,
          entityManager,
        );

        return workflowVersionId;
      },
    );
  }
}
