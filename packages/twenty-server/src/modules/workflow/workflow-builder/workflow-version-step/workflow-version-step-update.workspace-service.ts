import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowVersionStepOperationsWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service';
import { WorkflowVersionStepHelpersWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-helpers.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowVersionStepUpdateWorkspaceService {
  constructor(
    private readonly workflowSchemaWorkspaceService: WorkflowSchemaWorkspaceService,
    private readonly workflowVersionStepOperationsWorkspaceService: WorkflowVersionStepOperationsWorkspaceService,
    private readonly workflowVersionStepHelpersWorkspaceService: WorkflowVersionStepHelpersWorkspaceService,
  ) {}

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
      await this.workflowVersionStepHelpersWorkspaceService.getValidatedDraftWorkflowVersion(
        {
          workflowVersionId,
          workspaceId,
        },
      );

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

    await this.workflowVersionStepHelpersWorkspaceService.updateWorkflowVersionStepsAndTrigger(
      {
        workspaceId,
        workflowVersionId: workflowVersion.id,
        steps: updatedSteps,
      },
    );

    return updatedStep;
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
