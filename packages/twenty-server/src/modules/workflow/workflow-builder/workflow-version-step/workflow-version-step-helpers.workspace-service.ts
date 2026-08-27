import { Injectable } from '@nestjs/common';

import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WORKFLOW_RECORD_CRUD_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/workflow-record-crud-action-types.constant';
import { validateRecordCrudObjectRecordRichTextOrThrow } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/validate-record-crud-object-record-rich-text.util';
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
    if (isDefined(steps)) {
      await this.validateRecordCrudSteps({ workspaceId, steps });
    }

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
      async (workflowVersionRepository) => {
        await workflowVersionRepository.update(workflowVersionId, updateData);

        return workflowVersionId;
      },
    );
  }

  private async validateRecordCrudSteps({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<void> {
    for (const step of steps) {
      if (!WORKFLOW_RECORD_CRUD_ACTION_TYPES.has(step.type)) {
        continue;
      }

      const input = 'input' in step.settings ? step.settings.input : undefined;

      if (!isObject(input)) {
        continue;
      }

      const objectName = 'objectName' in input ? input.objectName : undefined;
      const objectRecord =
        'objectRecord' in input ? input.objectRecord : undefined;

      if (typeof objectName !== 'string' || !isObject(objectRecord)) {
        continue;
      }

      // The object might not exist yet (validated elsewhere); skip when metadata
      // cannot be resolved rather than masking that error here.
      const objectMetadataInfo = await this.workflowCommonWorkspaceService
        .getObjectMetadataInfo(objectName, workspaceId)
        .catch(() => undefined);

      if (!isDefined(objectMetadataInfo)) {
        continue;
      }

      validateRecordCrudObjectRecordRichTextOrThrow({
        objectRecord: objectRecord as Record<string, unknown>,
        objectMetadataInfo,
        stepLabel: step.name ?? step.id,
      });
    }
  }
}
