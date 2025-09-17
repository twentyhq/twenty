import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import { type CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionIsDraft } from 'src/modules/workflow/common/utils/assert-workflow-version-is-draft.util';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/insert-step';
import { removeStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/remove-step';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { isWorkflowFormAction } from 'src/modules/workflow/workflow-executor/workflow-actions/form/guards/is-workflow-form-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

@Injectable()
export class WorkflowVersionStepWorkspaceService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
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
    } = input;

    const newStep =
      await this.workflowVersionStepOperationsWorkspaceService.runStepCreationSideEffectsAndBuildStep(
        {
          type: stepType,
          workspaceId,
          position,
          workflowVersionId,
        },
      );

    const enrichedNewStep =
      await this.workflowSchemaWorkspaceService.enrichOutputSchema({
        step: newStep,
        workspaceId,
      });

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
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionIsDraft(workflowVersion);

    const existingSteps = workflowVersion.steps || [];

    const existingTrigger = workflowVersion.trigger;

    const { updatedSteps, updatedInsertedStep, updatedTrigger } = insertStep({
      existingSteps,
      existingTrigger,
      insertedStep: enrichedNewStep,
      parentStepId,
      nextStepId,
      parentStepConnectionOptions,
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      trigger: updatedTrigger,
      steps: updatedSteps,
    });

    return computeWorkflowVersionStepChanges({
      createdStep: updatedInsertedStep,
      trigger: updatedTrigger,
      steps: updatedSteps,
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
  }): Promise<WorkflowAction> {
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
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    assertWorkflowVersionIsDraft(workflowVersion);

    if (!isDefined(workflowVersion.steps)) {
      throw new WorkflowVersionStepException(
        "Can't update step from undefined steps",
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    const enrichedNewStep =
      await this.workflowSchemaWorkspaceService.enrichOutputSchema({
        step,
        workspaceId,
      });

    const updatedSteps = workflowVersion.steps.map((existingStep) => {
      if (existingStep.id === step.id) {
        return enrichedNewStep;
      } else {
        return existingStep;
      }
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
    });

    return enrichedNewStep;
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
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

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
      steps: updatedSteps,
      trigger: updatedTrigger,
      deletedStepIds: removedStepIds,
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
      throw new WorkflowVersionStepException(
        'WorkflowVersion not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

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

    const duplicatedStep =
      await this.workflowVersionStepOperationsWorkspaceService.createStepForDuplicate(
        {
          step: stepToDuplicate,
          workspaceId,
        },
      );

    const { updatedSteps, updatedInsertedStep, updatedTrigger } = insertStep({
      existingSteps: workflowVersion.steps ?? [],
      existingTrigger: workflowVersion.trigger,
      insertedStep: duplicatedStep,
    });

    await workflowVersionRepository.update(workflowVersion.id, {
      steps: updatedSteps,
      trigger: updatedTrigger,
    });

    return computeWorkflowVersionStepChanges({
      createdStep: updatedInsertedStep,
      trigger: updatedTrigger,
      steps: updatedSteps,
    });
  }

  async submitFormStep({
    workspaceId,
    stepId,
    workflowRunId,
    response,
  }: {
    workspaceId: string;
    stepId: string;
    workflowRunId: string;
    response: object;
  }) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    const step = workflowRun.state?.flow?.steps?.find(
      (step) => step.id === stepId,
    );

    if (!isDefined(step)) {
      throw new WorkflowVersionStepException(
        'Step not found',
        WorkflowVersionStepExceptionCode.NOT_FOUND,
      );
    }

    if (!isWorkflowFormAction(step)) {
      throw new WorkflowVersionStepException(
        'Step is not a form',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        {
          userFriendlyMessage: t`Step is not a form`,
        },
      );
    }

    const enrichedResponse =
      await this.workflowVersionStepOperationsWorkspaceService.enrichFormStepResponse(
        {
          workspaceId,
          step,
          response,
        },
      );

    await this.workflowRunWorkspaceService.updateWorkflowRunStepInfo({
      stepId,
      stepInfo: {
        status: StepStatus.SUCCESS,
        result: enrichedResponse,
      },
      workspaceId,
      workflowRunId,
    });

    await this.workflowRunnerWorkspaceService.resume({
      workspaceId,
      workflowRunId,
      lastExecutedStepId: stepId,
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
}
