import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { RecordPositionService } from 'src/engine/core-modules/record-position/services/record-position.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import {
  WorkflowVersionStatus,
  WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionHasSteps } from 'src/modules/workflow/common/utils/assert-workflow-version-has-steps';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';
import { WorkflowVersionStepWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step.workspace-service';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowStepPositionUpdateInput } from 'src/engine/core-modules/workflow/dtos/update-workflow-step-position-update-input.dto';

@Injectable()
export class WorkflowVersionWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowVersionStepWorkspaceService: WorkflowVersionStepWorkspaceService,
    private readonly recordPositionService: RecordPositionService,
  ) {}

  async createDraftFromWorkflowVersion({
    workspaceId,
    workflowId,
    workflowVersionIdToCopy,
  }: {
    workspaceId: string;
    workflowId: string;
    workflowVersionIdToCopy: string;
  }) {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionToCopy = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionIdToCopy,
        workflowId,
      },
    });

    if (!isDefined(workflowVersionToCopy)) {
      throw new WorkflowVersionStepException(
        'WorkflowVersion to copy not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionTriggerIsDefined(workflowVersionToCopy);
    assertWorkflowVersionHasSteps(workflowVersionToCopy);

    let draftWorkflowVersion = await workflowVersionRepository.findOne({
      where: {
        workflowId,
        status: WorkflowVersionStatus.DRAFT,
      },
    });

    if (!isDefined(draftWorkflowVersion)) {
      const workflowVersionsCount = await workflowVersionRepository.count({
        where: {
          workflowId,
        },
      });

      const position = await this.recordPositionService.buildRecordPosition({
        value: 'first',
        objectMetadata: {
          isCustom: false,
          nameSingular: 'workflowVersion',
        },
        workspaceId,
      });

      draftWorkflowVersion = await workflowVersionRepository.save({
        workflowId,
        name: `v${workflowVersionsCount + 1}`,
        status: WorkflowVersionStatus.DRAFT,
        position,
      });
    }

    assertWorkflowVersionIsDraft(draftWorkflowVersion);

    const newWorkflowVersionTrigger = workflowVersionToCopy.trigger;
    const newWorkflowVersionSteps: WorkflowAction[] = [];

    for (const step of workflowVersionToCopy.steps) {
      const duplicatedStep =
        await this.workflowVersionStepWorkspaceService.duplicateStep({
          step,
          workspaceId,
        });

      newWorkflowVersionSteps.push(duplicatedStep);
    }

    await workflowVersionRepository.update(draftWorkflowVersion.id, {
      steps: newWorkflowVersionSteps,
      trigger: newWorkflowVersionTrigger,
    });

    return draftWorkflowVersion.id;
  }

  async updateWorkflowVersionPositions({
    workflowVersionId,
    positions,
    workspaceId,
  }: {
    workflowVersionId: string;
    positions: WorkflowStepPositionUpdateInput[];
    workspaceId: string;
  }) {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion = await workflowVersionRepository.findOneOrFail({
      where: {
        id: workflowVersionId,
      },
    });

    assertWorkflowVersionIsDraft(workflowVersion);

    const triggerPosition = positions.find(
      (position) => position.id === 'trigger',
    );

    const updatedTrigger =
      isDefined(triggerPosition) && isDefined(workflowVersion.trigger)
        ? {
            ...workflowVersion.trigger,
            position: triggerPosition.position,
          }
        : undefined;

    const updatedSteps = workflowVersion.steps?.map((step) => {
      const updatedStep = positions.find((position) => position.id === step.id);

      if (updatedStep) {
        return {
          ...step,
          position: updatedStep.position,
        };
      }

      return step;
    });

    const updatePayload = {
      ...(!isDefined(updatedTrigger) ? {} : { trigger: updatedTrigger }),
      ...(!isDefined(updatedSteps) ? {} : { steps: updatedSteps }),
    };

    await workflowVersionRepository.update(workflowVersionId, updatePayload);
  }
}
