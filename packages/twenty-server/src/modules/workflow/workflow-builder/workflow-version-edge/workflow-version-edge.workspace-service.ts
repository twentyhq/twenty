import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import {
  WorkflowVersionEdgeException,
  WorkflowVersionEdgeExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class WorkflowVersionEdgeWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async createWorkflowVersionEdge({
    source,
    target,
    workflowVersionId,
    workspaceId,
  }: {
    source: string;
    target: string;
    workflowVersionId: string;
    workspaceId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowVersionEdgeException(
        'WorkflowVersion not found',
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionIsDraft(workflowVersion);

    const steps = workflowVersion.steps || [];

    const trigger = workflowVersion.trigger;

    const isSourceTrigger = source === 'trigger';

    const targetStep = steps.find((step) => step.id === target);

    if (!isDefined(targetStep)) {
      throw new WorkflowVersionEdgeException(
        `Target step '${target}' not found in workflowVersion '${workflowVersionId}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (isSourceTrigger) {
      if (!isDefined(trigger)) {
        throw new WorkflowVersionEdgeException(
          `Trigger not found in workflowVersion '${workflowVersionId}'`,
          WorkflowVersionEdgeExceptionCode.NOT_FOUND,
        );
      }

      if (trigger.nextStepIds?.includes(target)) {
        return computeWorkflowVersionStepChanges({
          trigger,
          steps,
        });
      }

      const updatedTrigger = {
        ...trigger,
        nextStepIds: [...(trigger.nextStepIds ?? []), target],
      };

      await workflowVersionRepository.update(workflowVersion.id, {
        trigger: updatedTrigger,
      });

      return computeWorkflowVersionStepChanges({
        trigger: updatedTrigger,
        steps,
      });
    }

    const sourceStep = steps.find((step) => step.id === source);

    if (!isDefined(sourceStep)) {
      throw new WorkflowVersionEdgeException(
        `Source step '${source}' not found in workflowVersion '${workflowVersionId}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (sourceStep.nextStepIds?.includes(target)) {
      return computeWorkflowVersionStepChanges({
        trigger,
        steps,
      });
    }

    const updatedSourceStep = {
      ...sourceStep,
      nextStepIds: [...(sourceStep.nextStepIds ?? []), target],
    };

    const updatedSteps = steps.map((step) => {
      if (step.id === source) {
        return updatedSourceStep;
      }

      return step;
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      trigger,
      steps: updatedSteps,
    });
  }

  async deleteWorkflowVersionEdge({
    source,
    target,
    workflowVersionId,
    workspaceId,
  }: {
    source: string;
    target: string;
    workflowVersionId: string;
    workspaceId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!isDefined(workflowVersion)) {
      throw new WorkflowVersionEdgeException(
        'WorkflowVersion not found',
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionIsDraft(workflowVersion);

    const steps = workflowVersion.steps || [];

    const trigger = workflowVersion.trigger;

    const isSourceTrigger = source === 'trigger';

    const targetStep = steps.find((step) => step.id === target);

    if (!isDefined(targetStep)) {
      throw new WorkflowVersionEdgeException(
        `Target step '${target}' not found in workflowVersion '${workflowVersionId}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (isSourceTrigger) {
      if (!isDefined(trigger)) {
        throw new WorkflowVersionEdgeException(
          `Trigger not found in workflowVersion '${workflowVersionId}'`,
          WorkflowVersionEdgeExceptionCode.NOT_FOUND,
        );
      }

      if (!trigger.nextStepIds?.includes(target)) {
        return computeWorkflowVersionStepChanges({
          trigger,
          steps,
        });
      }

      const updatedTrigger = {
        ...trigger,
        nextStepIds: trigger.nextStepIds?.filter(
          (nextStepId) => nextStepId !== target,
        ),
      };

      await workflowVersionRepository.update(workflowVersion.id, {
        trigger: updatedTrigger,
      });

      return computeWorkflowVersionStepChanges({
        trigger: updatedTrigger,
        steps,
      });
    }

    const sourceStep = steps.find((step) => step.id === source);

    if (!isDefined(sourceStep)) {
      throw new WorkflowVersionEdgeException(
        `Source step '${source}' not found in workflowVersion '${workflowVersionId}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (!sourceStep.nextStepIds?.includes(target)) {
      return computeWorkflowVersionStepChanges({
        trigger,
        steps,
      });
    }

    const updatedSourceStep = {
      ...sourceStep,
      nextStepIds: sourceStep.nextStepIds?.filter(
        (nextStepId) => nextStepId !== target,
      ),
    };

    const updatedSteps = steps.map((step) => {
      if (step.id === source) {
        return updatedSourceStep;
      }

      return step;
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      trigger,
      steps: updatedSteps,
    });
  }
}
