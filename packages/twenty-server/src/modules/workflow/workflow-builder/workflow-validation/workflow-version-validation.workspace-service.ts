import { Injectable } from '@nestjs/common';

import {
  MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES,
  NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES,
  validateWorkflowStructure,
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { OBJECT_TARGETING_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/object-targeting-action-types.constant';
import {
  WorkflowVersionValidationException,
  WorkflowVersionValidationExceptionCode,
} from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { validateWorkflowAiAgentStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-ai-agent-step.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const isBlockingActivation = (issue: WorkflowValidationIssue): boolean =>
  MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES.has(issue.code) ||
  NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES.has(issue.code);

@Injectable()
export class WorkflowVersionValidationWorkspaceService {
  constructor(
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
  ) {}

  // Malformed content is rejected at the write chokepoint, but legacy versions
  // written before that gate can still hold some, so activation refuses both
  // the malformed and the non-activable codes.
  async assertWorkflowVersionIsActivableOrThrow({
    workspaceId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    trigger: WorkflowTrigger | null | undefined;
    steps: WorkflowAction[] | null | undefined;
  }): Promise<void> {
    const issues = await this.collectIssues({
      workspaceId,
      trigger: trigger ?? null,
      steps: steps ?? [],
    });

    const blockingIssues = issues.filter(isBlockingActivation);

    if (blockingIssues.length === 0) {
      return;
    }

    throw new WorkflowVersionValidationException(
      WorkflowVersionValidationExceptionCode.NON_ACTIVABLE_WORKFLOW_VERSION,
      blockingIssues,
    );
  }

  private async collectIssues({
    workspaceId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
  }): Promise<WorkflowValidationIssue[]> {
    const structureResult = validateWorkflowStructure({ trigger, steps });

    const stepTypeIssues = steps.flatMap((step) =>
      step.type === WorkflowActionType.AI_AGENT
        ? validateWorkflowAiAgentStep(step)
        : [],
    );

    const metadataIssues = await this.validateWorkspaceMetadata({
      workspaceId,
      steps,
    });

    return [
      ...structureResult.errors,
      ...structureResult.warnings,
      ...stepTypeIssues,
      ...metadataIssues,
    ];
  }

  private async validateWorkspaceMetadata({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowValidationIssue[]> {
    const hasRecordStep = steps.some((step) =>
      OBJECT_TARGETING_ACTION_TYPES.has(step.type),
    );

    if (!hasRecordStep) {
      return [];
    }

    const {
      objectIdByNameSingular,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowMetadataReadService.getFlatEntityMaps(workspaceId);

    return getWorkflowRecordStepMetadataIssues({
      steps,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    });
  }
}
