import { Injectable } from '@nestjs/common';

import { type CreateWorkflowVersionStepInput } from 'src/engine/core-modules/workflow/dtos/create-workflow-version-step-input.dto';
import { WorkflowActionDTO } from 'src/engine/core-modules/workflow/dtos/workflow-action.dto';
import { type WorkflowVersionStepChangesDTO } from 'src/engine/core-modules/workflow/dtos/workflow-version-step-changes.dto';
import { WorkflowVersionStepCreationWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-creation.workspace-service';
import { WorkflowVersionStepDeletionWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-deletion.workspace-service';
import { WorkflowVersionStepUpdateWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-update.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowVersionStepWorkspaceService {
  constructor(
    private readonly workflowVersionStepCreationWorkspaceService: WorkflowVersionStepCreationWorkspaceService,
    private readonly workflowVersionStepUpdateWorkspaceService: WorkflowVersionStepUpdateWorkspaceService,
    private readonly workflowVersionStepDeletionWorkspaceService: WorkflowVersionStepDeletionWorkspaceService,
  ) {}

  async createWorkflowVersionStep({
    workspaceId,
    input,
  }: {
    workspaceId: string;
    input: CreateWorkflowVersionStepInput;
  }): Promise<WorkflowVersionStepChangesDTO> {
    return this.workflowVersionStepCreationWorkspaceService.createWorkflowVersionStep(
      {
        workspaceId,
        input,
      },
    );
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
    return this.workflowVersionStepUpdateWorkspaceService.updateWorkflowVersionStep(
      {
        workspaceId,
        workflowVersionId,
        step,
      },
    );
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
    return this.workflowVersionStepDeletionWorkspaceService.deleteWorkflowVersionStep(
      {
        workspaceId,
        workflowVersionId,
        stepIdToDelete,
      },
    );
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
    return this.workflowVersionStepCreationWorkspaceService.duplicateWorkflowVersionStep(
      {
        workspaceId,
        workflowVersionId,
        stepId,
      },
    );
  }

  async createDraftStep({
    step,
    workspaceId,
  }: {
    step: WorkflowAction;
    workspaceId: string;
  }): Promise<WorkflowAction> {
    return this.workflowVersionStepCreationWorkspaceService.createDraftStep({
      step,
      workspaceId,
    });
  }
}
