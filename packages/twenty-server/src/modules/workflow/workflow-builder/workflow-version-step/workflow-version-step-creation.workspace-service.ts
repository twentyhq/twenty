import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { computeWorkflowVersionStepChanges } from 'src/modules/workflow/workflow-builder/utils/compute-workflow-version-step-updates.util';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { insertStep } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/insert-step';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { WorkflowVersionStepHelpersWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-helpers.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowVersionStepCreationWorkspaceService {
  constructor(
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    private readonly workflowVersionStepHelpersWorkspaceService: WorkflowVersionStepHelpersWorkspaceService,
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
      await this.workflowVersionStepHelpersWorkspaceService.getValidatedDraftWorkflowVersion(
        {
          workflowVersionId,
          workspaceId,
        },
      );

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

    await this.workflowVersionStepHelpersWorkspaceService.updateWorkflowVersionStepsAndTrigger(
      {
        workspaceId,
        workflowVersionId: workflowVersion.id,
        trigger: updatedTrigger,
        steps: updatedSteps,
      },
    );

    return computeWorkflowVersionStepChanges({
      existingTrigger,
      existingSteps,
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
      await this.workflowVersionStepHelpersWorkspaceService.getValidatedDraftWorkflowVersion(
        {
          workflowVersionId,
          workspaceId,
        },
      );

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

    await this.workflowVersionStepHelpersWorkspaceService.updateWorkflowVersionStepsAndTrigger(
      {
        workspaceId,
        workflowVersionId: workflowVersion.id,
        steps: updatedSteps,
        trigger: updatedTrigger,
      },
    );

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
}
