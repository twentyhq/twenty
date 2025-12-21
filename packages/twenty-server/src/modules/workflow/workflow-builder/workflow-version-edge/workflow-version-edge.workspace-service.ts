import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
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
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
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
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
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
      },
    );
  }

  async deleteWorkflowVersionEdge({
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
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
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
            sourceConnectionOptions,
          });
        }
      },
    );
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
        existingTrigger: trigger,
        existingSteps: steps,
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
      existingTrigger: trigger,
      existingSteps: steps,
      updatedTrigger,
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

    if (
      sourceStep.nextStepIds?.includes(target) &&
      !isDefined(sourceConnectionOptions)
    ) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
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
      existingTrigger: trigger,
      existingSteps: steps,
      updatedSteps,
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

        if (sourceConnectionOptions.settings.isConnectedToLoop) {
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
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
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
      existingTrigger: trigger,
      existingSteps: steps,
      updatedTrigger,
    });
  }

  private async deleteStepEdge({
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

    if (
      !sourceStep.nextStepIds?.includes(target) &&
      !isDefined(sourceConnectionOptions)
    ) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

    const { updatedSourceStep, shouldPersist } = isDefined(
      sourceConnectionOptions,
    )
      ? this.buildUpdatedSourceStepWithOptions({
          sourceStep,
          target,
          sourceConnectionOptions,
        })
      : {
          updatedSourceStep: {
            ...sourceStep,
            nextStepIds: sourceStep.nextStepIds?.filter(
              (nextStepId: string) => nextStepId !== target,
            ),
          },
          shouldPersist: true,
        };

    if (!shouldPersist) {
      return computeWorkflowVersionStepChanges({
        existingTrigger: trigger,
        existingSteps: steps,
      });
    }

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
      existingTrigger: trigger,
      existingSteps: steps,
      updatedSteps,
    });
  }

  private buildUpdatedSourceStepWithOptions({
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

        if (sourceConnectionOptions.settings.isConnectedToLoop) {
          const currentInitialLoopStepIds =
            sourceStep.settings.input.initialLoopStepIds;

          if (!currentInitialLoopStepIds?.includes(target)) {
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
                  initialLoopStepIds: currentInitialLoopStepIds.filter(
                    (id) => id !== target,
                  ),
                },
              },
            },
            shouldPersist: true,
          };
        }

        return {
          updatedSourceStep: {
            ...sourceStep,
            nextStepIds: sourceStep.nextStepIds?.filter((id) => id !== target),
          },
          shouldPersist: true,
        };

      default:
        return {
          updatedSourceStep: {
            ...sourceStep,
            nextStepIds: sourceStep.nextStepIds?.filter((id) => id !== target),
          },
          shouldPersist: true,
        };
    }
  }
}
