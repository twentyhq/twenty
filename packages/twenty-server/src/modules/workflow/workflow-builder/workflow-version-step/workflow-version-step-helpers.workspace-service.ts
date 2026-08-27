import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { getRecordCrudStepObjectRecord } from 'src/modules/workflow/common/utils/get-record-crud-step-object-record.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
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
    const recordCrudSteps = steps
      .map((step) => ({ step, parsed: getRecordCrudStepObjectRecord(step) }))
      .filter(
        (
          entry,
        ): entry is {
          step: WorkflowAction;
          parsed: NonNullable<typeof entry.parsed>;
        } => isDefined(entry.parsed),
      );

    if (recordCrudSteps.length === 0) {
      return;
    }

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } =
      await this.workflowCommonWorkspaceService.getFlatEntityMaps(workspaceId);

    for (const { step, parsed } of recordCrudSteps) {
      const objectId = objectIdByNameSingular[parsed.objectName];

      if (!isDefined(objectId)) {
        continue;
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        continue;
      }

      validateRecordCrudObjectRecordRichTextOrThrow({
        objectRecord: parsed.objectRecord,
        objectMetadataInfo: {
          flatObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        },
        stepLabel: step.name ?? step.id,
      });
    }
  }
}
