import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowVersionEdgeException,
  WorkflowVersionEdgeExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/WorkflowStepCreationOptions';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowVersionEdgeWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async createWorkflowVersionEdge({
    source,
    target,
    workflowVersionId,
    workspaceId,
    sourceConnectionOptions,
  }: {
    source: string;
    target: string;
    workflowVersionId: string;
    workspaceId: string;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workflowVersionId,
        workspaceId,
      });

    assertWorkflowVersionIsDraft(workflowVersion);

    const trigger = workflowVersion.trigger;
    const steps = workflowVersion.steps || [];

    const targetStep = steps.find((step) => step.id === target);

    if (!isDefined(targetStep)) {
      throw new WorkflowVersionEdgeException(
        `Target step '${target}' not found in workflowVersion '${workflowVersionId}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    const isSourceTrigger = source === TRIGGER_STEP_ID;

    if (isSourceTrigger) {
      return this.createTriggerEdge({
        trigger,
        steps,
        target,
        workflowVersion,
        workflowVersionRepository,
      });
    } else {
      return this.createStepEdge({
        trigger,
        steps,
        source,
        target,
        sourceConnectionOptions,
        workflowVersion,
        workflowVersionRepository,
      });
    }
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

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workflowVersionId,
        workspaceId,
      });

    assertWorkflowVersionIsDraft(workflowVersion);

    const trigger = workflowVersion.trigger;
    const steps = workflowVersion.steps || [];

    const targetStep = steps.find((step) => step.id === target);

    if (!isDefined(targetStep)) {
      throw new WorkflowVersionEdgeException(
        `Target step '${target}' not found in workflowVersion '${workflowVersionId}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    const isSourceTrigger = source === TRIGGER_STEP_ID;

    if (isSourceTrigger) {
      return this.deleteTriggerEdge({
        trigger,
        steps,
        target,
        workflowVersion,
        workflowVersionRepository,
      });
    } else {
      return this.deleteStepEdge({
        trigger,
        steps,
        source,
        target,
        workflowVersion,
        workflowVersionRepository,
      });
    }
  }

  private async createTriggerEdge({
    trigger,
    steps,
    target,
    workflowVersion,
    workflowVersionRepository,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    target: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
  }): Promise<WorkflowVersionStepChangesDTO> {
    if (!isDefined(trigger)) {
      throw new WorkflowVersionEdgeException(
        `Trigger not found in workflowVersion '${workflowVersion.id}'`,
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

  private async createStepEdge({
    trigger,
    steps,
    source,
    target,
    workflowVersion,
    workflowVersionRepository,
    sourceConnectionOptions,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    source: string;
    target: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
    sourceConnectionOptions?: WorkflowStepConnectionOptions;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const sourceStep = steps.find((step) => step.id === source);

    if (!isDefined(sourceStep)) {
      throw new WorkflowVersionEdgeException(
        `Source step '${source}' not found in workflowVersion '${workflowVersion.id}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    const { updatedSourceStep, shouldPersist } = isDefined(
      sourceConnectionOptions,
    )
      ? this.buildUpdatedSourceStepWithConnectionOptions({
          sourceStep,
          target,
          sourceConnectionOptions,
        })
      : this.buildUpdatedSourceStep({ sourceStep, target });

    const updatedSteps = steps.map((step) => {
      if (step.id === source) {
        return updatedSourceStep;
      }

      return step;
    });

    if (shouldPersist) {
      await workflowVersionRepository.update(workflowVersion.id, {
        steps: updatedSteps,
      });
    }

    return computeWorkflowVersionStepChanges({
      trigger,
      steps: updatedSteps,
    });
  }

  private buildUpdatedSourceStepWithConnectionOptions({
    sourceStep,
    target,
    sourceConnectionOptions,
  }: {
    sourceStep: WorkflowAction;
    target: string;
    sourceConnectionOptions: WorkflowStepConnectionOptions;
  }): {
    updatedSourceStep: WorkflowAction;
    shouldPersist: boolean;
  } {
    switch (sourceConnectionOptions.connectedStepType) {
      case WorkflowActionType.ITERATOR:
        if (sourceStep.type !== WorkflowActionType.ITERATOR) {
          throw new WorkflowVersionEdgeException(
            `Source step '${sourceStep.id}' is not an iterator`,
            WorkflowVersionEdgeExceptionCode.INVALID_REQUEST,
          );
        }

        if (sourceConnectionOptions.settings.shouldInsertToLoop) {
          const currentInitialLoopStepIds =
            sourceStep.settings.input.initialLoopStepIds;

          if (currentInitialLoopStepIds?.includes(target)) {
            return {
              updatedSourceStep: sourceStep,
              shouldPersist: false,
            };
          }

          return {
            updatedSourceStep: {
              ...sourceStep,
              settings: {
                ...sourceStep.settings,
                input: {
                  ...sourceStep.settings.input,
                  initialLoopStepIds: [
                    ...(currentInitialLoopStepIds ?? []),
                    target,
                  ],
                },
              },
            },
            shouldPersist: true,
          };
        } else {
          return this.buildUpdatedSourceStep({
            sourceStep,
            target,
          });
        }

      default:
        return this.buildUpdatedSourceStep({
          sourceStep,
          target,
        });
    }
  }

  private buildUpdatedSourceStep({
    sourceStep,
    target,
  }: {
    sourceStep: WorkflowAction;
    target: string;
  }): {
    updatedSourceStep: WorkflowAction;
    shouldPersist: boolean;
  } {
    if (sourceStep.nextStepIds?.includes(target)) {
      return {
        updatedSourceStep: sourceStep,
        shouldPersist: false,
      };
    }

    const updatedSourceStep = {
      ...sourceStep,
      nextStepIds: [...(sourceStep.nextStepIds ?? []), target],
    };

    return {
      updatedSourceStep,
      shouldPersist: true,
    };
  }

  private async deleteTriggerEdge({
    trigger,
    steps,
    target,
    workflowVersion,
    workflowVersionRepository,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    target: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
  }): Promise<WorkflowVersionStepChangesDTO> {
    if (!isDefined(trigger)) {
      throw new WorkflowVersionEdgeException(
        `Trigger not found in workflowVersion '${workflowVersion.id}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (!trigger.nextStepIds?.includes(target)) {
      return this.handleFilterBetweenTriggerAndTarget({
        trigger,
        steps,
        target,
        workflowVersionId: workflowVersion.id,
        workflowVersionRepository,
      });
    }

    const updatedTrigger = {
      ...trigger,
      nextStepIds: trigger.nextStepIds?.filter(
        (nextStepId: string) => nextStepId !== target,
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

  private async deleteStepEdge({
    trigger,
    steps,
    source,
    target,
    workflowVersion,
    workflowVersionRepository,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    source: string;
    target: string;
    workflowVersion: WorkflowVersionWorkspaceEntity;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const sourceStep = steps.find((step) => step.id === source);

    if (!isDefined(sourceStep)) {
      throw new WorkflowVersionEdgeException(
        `Source step '${source}' not found in workflowVersion '${workflowVersion.id}'`,
        WorkflowVersionEdgeExceptionCode.NOT_FOUND,
      );
    }

    if (!sourceStep.nextStepIds?.includes(target)) {
      return await this.handleFilterBetweenSourceAndTarget({
        trigger,
        steps,
        sourceStep,
        target,
        workflowVersionId: workflowVersion.id,
        workflowVersionRepository,
      });
    }

    const updatedSourceStep = {
      ...sourceStep,
      nextStepIds: sourceStep.nextStepIds?.filter(
        (nextStepId: string) => nextStepId !== target,
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

  private async handleFilterBetweenTriggerAndTarget({
    trigger,
    steps,
    target,
    workflowVersionId,
    workflowVersionRepository,
  }: {
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
    target: string;
    workflowVersionId: string;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const filterBetweenTriggerAndTarget = this.findFilterBetweenNodes({
      steps,
      sourceNextStepIds: trigger.nextStepIds,
      target,
    });

    if (!isDefined(filterBetweenTriggerAndTarget)) {
      return computeWorkflowVersionStepChanges({
        trigger,
        steps,
      });
    }

    const updatedTrigger = {
      ...trigger,
      nextStepIds: trigger.nextStepIds?.filter(
        (nextStepId: string) => nextStepId !== filterBetweenTriggerAndTarget.id,
      ),
    };

    const updatedSteps = steps.filter(
      (step) => step.id !== filterBetweenTriggerAndTarget.id,
    );

    await workflowVersionRepository.update(workflowVersionId, {
      trigger: updatedTrigger,
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      trigger: updatedTrigger,
      steps: updatedSteps,
    });
  }

  private async handleFilterBetweenSourceAndTarget({
    trigger,
    steps,
    sourceStep,
    target,
    workflowVersionRepository,
    workflowVersionId,
  }: {
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
    sourceStep: WorkflowAction;
    target: string;
    workflowVersionRepository: WorkspaceRepository<WorkflowVersionWorkspaceEntity>;
    workflowVersionId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const filterBetweenSourceAndTarget = this.findFilterBetweenNodes({
      steps,
      sourceNextStepIds: sourceStep.nextStepIds,
      target,
    });

    if (!isDefined(filterBetweenSourceAndTarget)) {
      return computeWorkflowVersionStepChanges({
        trigger,
        steps,
      });
    }

    const updatedSourceStep = {
      ...sourceStep,
      nextStepIds: sourceStep.nextStepIds?.filter(
        (nextStepId: string) => nextStepId !== filterBetweenSourceAndTarget.id,
      ),
    };

    const updatedSteps = steps
      .map((step) => {
        if (step.id === sourceStep.id) {
          return updatedSourceStep;
        }

        return step;
      })
      .filter((step) => step.id !== filterBetweenSourceAndTarget.id);

    await workflowVersionRepository.update(workflowVersionId, {
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      trigger,
      steps: updatedSteps,
    });
  }

  private findFilterBetweenNodes({
    steps,
    sourceNextStepIds,
    target,
  }: {
    steps: WorkflowAction[];
    sourceNextStepIds: string[] | undefined;
    target: string;
  }) {
    const nextStepFilters = steps.filter(
      (step) =>
        sourceNextStepIds?.includes(step.id) &&
        step.type === WorkflowActionType.FILTER,
    );

    return nextStepFilters.find((step) => step.nextStepIds?.includes(target));
  }
}
