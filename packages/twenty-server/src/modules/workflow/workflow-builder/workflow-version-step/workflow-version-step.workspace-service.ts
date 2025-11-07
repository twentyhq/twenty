import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/insert-step';
import { removeStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/remove-step';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowVersionStepWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
  ) {}

  async createWorkflowVersionStep({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateWorkflowVersionStepInput;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const {
      workflowVersionId,
      stepType,
      parentStepId,
      nextStepId,
      position,
      parentStepConnectionOptions,
      id,
    } = input;

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workflowVersionId,
        workspaceId,
      });

    assertWorkflowVersionIsDraft(workflowVersion);

    const existingSteps = workflowVersion.steps;

    const existingTrigger = workflowVersion.trigger;

    const { builtStep, additionalCreatedSteps } =
      await this.workflowVersionStepOperationsWorkspaceService.runStepCreationSideEffectsAndBuildStep(
        {
          type: stepType,
          workspaceId,
          position,
          workflowVersionId,
          id,
        },
      );

    const enrichedNewStep =
      await this.workflowSchemaWorkspaceService.enrichOutputSchema({
        step: builtStep,
        workspaceId,
        workflowVersionId,
      });

    const { updatedSteps, updatedTrigger } = insertStep({
      existingSteps: existingSteps ?? [],
      existingTrigger,
      insertedStep: enrichedNewStep,
      parentStepId,
      nextStepId,
      parentStepConnectionOptions,
    });

    if (isDefined(additionalCreatedSteps)) {
      updatedSteps.push(...additionalCreatedSteps);
    }

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await workflowVersionRepository.update(workflowVersion.id, {
      trigger: updatedTrigger,
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      existingTrigger,
      existingSteps,
      updatedTrigger,
      updatedSteps,
    });
  }

  async updateWorkflowVersionStep({
    workspaceId,
    workflowVersionId,
    step,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    step: WorkflowAction;
  }): Promise<WorkflowActionDTO> {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workflowVersionId,
        workspaceId,
      });

    assertWorkflowVersionIsDraft(workflowVersion);

    if (!isDefined(workflowVersion.steps)) {
      throw new WorkflowVersionStepException(
        "Can't update step from undefined steps",
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const existingStep = workflowVersion.steps.find(
      (existingStep) => existingStep.id === step.id,
    );

    if (!isDefined(existingStep)) {
      throw new WorkflowVersionStepException(
        'Step not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const isStepTypeChanged = existingStep.type !== step.type;

    const updatedStep = isStepTypeChanged
      ? await this.updateWorkflowVersionStepType({
          existingStep,
          newStep: step,
          workspaceId,
          workflowVersionId,
        })
      : await this.updateWorkflowVersionStepSettings({
          newStep: step,
          workspaceId,
          workflowVersionId,
        });

    const updatedSteps = workflowVersion.steps.map((existingStep) => {
      if (existingStep.id === step.id) {
        return updatedStep;
      } else {
        return existingStep;
      }
    });

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
    });

    return updatedStep;
  }

  async deleteWorkflowVersionStep({
    workspaceId,
    workflowVersionId,
    stepIdToDelete,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    stepIdToDelete: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workflowVersionId,
        workspaceId,
      });

    assertWorkflowVersionIsDraft(workflowVersion);

    const existingTrigger = workflowVersion.trigger;

    const isDeletingTrigger =
      stepIdToDelete === TRIGGER_STEP_ID && isDefined(existingTrigger);

    if (!isDeletingTrigger && !isDefined(workflowVersion.steps)) {
      throw new WorkflowVersionStepException(
        "Can't delete step from undefined steps",
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const stepToDelete = workflowVersion.steps?.find(
      (step) => step.id === stepIdToDelete,
    );

    if (!isDeletingTrigger && !isDefined(stepToDelete)) {
      throw new WorkflowVersionStepException(
        "Can't delete not existing step",
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const stepToDeleteChildrenIds = isDeletingTrigger
      ? (existingTrigger?.nextStepIds ?? [])
      : (stepToDelete?.nextStepIds ?? []);

    const { updatedSteps, updatedTrigger, removedStepIds } = removeStep({
      existingTrigger,
      existingSteps: workflowVersion.steps,
      stepIdToDelete,
      stepToDeleteChildrenIds,
    });

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
      trigger: updatedTrigger,
    });

    const removedSteps =
      workflowVersion.steps?.filter((step) =>
        removedStepIds.includes(step.id),
      ) ?? [];

    await Promise.all(
      removedSteps.map((step) =>
        this.workflowVersionStepOperationsWorkspaceService.runWorkflowVersionStepDeletionSideEffects(
          {
            step,
            workspaceId,
          },
        ),
      ),
    );

    return computeWorkflowVersionStepChanges({
      existingTrigger,
      existingSteps: workflowVersion.steps,
      updatedTrigger,
      updatedSteps,
    });
  }

  async duplicateWorkflowVersionStep({
    workspaceId,
    workflowVersionId,
    stepId,
  }: {
    workspaceId: string;
    workflowVersionId: string;
    stepId: string;
  }): Promise<WorkflowVersionStepChangesDTO> {
    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail({
        workflowVersionId,
        workspaceId,
      });

    assertWorkflowVersionIsDraft(workflowVersion);

    const stepToDuplicate = workflowVersion.steps?.find(
      (step) => step.id === stepId,
    );

    if (!isDefined(stepToDuplicate)) {
      throw new WorkflowVersionStepException(
        'Step not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    const clonedStep =
      await this.workflowVersionStepOperationsWorkspaceService.cloneStep({
        step: stepToDuplicate,
        workspaceId,
      });
    const duplicatedStep =
      this.workflowVersionStepOperationsWorkspaceService.markStepAsDuplicate({
        step: clonedStep,
      });

    const { updatedSteps, updatedTrigger } = insertStep({
      existingSteps: workflowVersion.steps ?? [],
      existingTrigger: workflowVersion.trigger,
      insertedStep: duplicatedStep,
    });

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
      trigger: updatedTrigger,
    });

    return computeWorkflowVersionStepChanges({
      existingTrigger: workflowVersion.trigger,
      existingSteps: workflowVersion.steps,
      updatedTrigger,
      updatedSteps,
    });
  }

  async createDraftStep({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    return this.workflowVersionStepOperationsWorkspaceService.createDraftStep({
      step,
      workspaceId,
    });
  }

  private async updateWorkflowVersionStepType({
    existingStep,
    newStep,
    workspaceId,
    workflowVersionId,
  }: {
    existingStep: WorkflowAction;
    newStep: WorkflowAction;
    workspaceId: string;
    workflowVersionId: string;
  }): Promise<WorkflowAction> {
    await this.workflowVersionStepOperationsWorkspaceService.runWorkflowVersionStepDeletionSideEffects(
      {
        step: existingStep,
        workspaceId,
      },
    );

    const { builtStep } =
      await this.workflowVersionStepOperationsWorkspaceService.runStepCreationSideEffectsAndBuildStep(
        {
          type: newStep.type,
          workspaceId,
          position: newStep.position,
          workflowVersionId,
        },
      );

    return this.workflowSchemaWorkspaceService.enrichOutputSchema({
      step: {
        ...builtStep,
        id: existingStep.id,
        nextStepIds: existingStep.nextStepIds,
        position: existingStep.position,
      },
      workspaceId,
      workflowVersionId,
    });
  }

  private async updateWorkflowVersionStepSettings({
    newStep,
    workspaceId,
    workflowVersionId,
  }: {
    newStep: WorkflowAction;
    workspaceId: string;
    workflowVersionId: string;
  }): Promise<WorkflowAction> {
    return this.workflowSchemaWorkspaceService.enrichOutputSchema({
      step: newStep,
      workspaceId,
      workflowVersionId,
    });
  }
}
