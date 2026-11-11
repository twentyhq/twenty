import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
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
import { getDatabaseEventTriggerConditionIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-database-event-trigger-condition-issues.util';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { getWorkflowStepConditionIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-step-condition-issues.util';
import { validateWorkflowAiAgentStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-ai-agent-step.util';
import { validateWorkflowClassifyStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-classify-step.util';
import { validateWorkflowConversationStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-conversation-step.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const isBlockingActivation = (issue: WorkflowValidationIssue): boolean =>
  MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES.has(issue.code) ||
  NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES.has(issue.code);

@Injectable()
export class WorkflowVersionValidationWorkspaceService {
  constructor(
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
  ) {}

  // Legacy versions written before the write-time gate can still hold malformed content, so both malformed and
  // non-activable issues are refused
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

    const stepTypeIssues = steps.flatMap((step) => {
      if (step.type === WorkflowActionType.AI_AGENT) {
        return [
          ...validateWorkflowAiAgentStep({ step }),
          ...validateWorkflowConversationStep(step),
        ];
      }

      if (step.type === WorkflowActionType.SEND_CHAT_MESSAGE) {
        return validateWorkflowConversationStep(step);
      }

      if (step.type === WorkflowActionType.CLASSIFY) {
        return validateWorkflowClassifyStep(step);
      }

      return getWorkflowStepConditionIssues(step);
    });

    const metadataIssues = await this.validateWorkspaceMetadata({
      workspaceId,
      trigger,
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
    trigger,
    steps,
  }: {
    workspaceId: string;
    trigger: WorkflowTrigger | null;
    steps: WorkflowAction[];
  }): Promise<WorkflowValidationIssue[]> {
    const hasRecordStep = steps.some((step) =>
      OBJECT_TARGETING_ACTION_TYPES.has(step.type),
    );
    const hasTriggerCondition =
      trigger?.type === WorkflowTriggerType.DATABASE_EVENT &&
      isNonEmptyString(trigger.settings.condition?.trim());

    if (!hasRecordStep && !hasTriggerCondition) {
      return [];
    }

    const {
      objectIdByNameSingular,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workflowMetadataReadService.getFlatEntityMaps(workspaceId);

    return [
      ...getDatabaseEventTriggerConditionIssues({
        trigger,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      }),
      ...getWorkflowRecordStepMetadataIssues({
        steps,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      }),
    ];
  }
}
