import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES,
  NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES,
  validateWorkflowStructure,
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';
import { isDefined } from 'twenty-shared/utils';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { OBJECT_TARGETING_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/object-targeting-action-types.constant';
import {
  WorkflowVersionValidationException,
  WorkflowVersionValidationExceptionCode,
} from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { validateWorkflowAiAgentStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-ai-agent-step.util';
import {
  type WorkflowAction,
  type WorkflowRunWorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const isBlockingActivation = (issue: WorkflowValidationIssue): boolean =>
  MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES.has(issue.code) ||
  NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES.has(issue.code);

@Injectable()
export class WorkflowVersionValidationWorkspaceService {
  constructor(
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  // Malformed content is rejected at the write chokepoint, but legacy versions
  // written before that gate can still hold some, so activation refuses both
  // the malformed and the non-activable codes.
  async assertWorkflowVersionIsActivableOrThrow({
    workspaceId,
    workflowId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    workflowId?: string;
    trigger: WorkflowTrigger | null | undefined;
    steps: WorkflowAction[] | null | undefined;
  }): Promise<void> {
    const issues = await this.collectIssues({
      workspaceId,
      workflowId,
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
    workflowId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    workflowId?: string;
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

    const runWorkflowIssues = await this.validateRunWorkflowSteps({
      workspaceId,
      workflowId,
      steps,
    });

    return [
      ...structureResult.errors,
      ...structureResult.warnings,
      ...stepTypeIssues,
      ...metadataIssues,
      ...runWorkflowIssues,
    ];
  }

  // The UI hides the current workflow from the picker and the front-end
  // catches missing/no-active-version selections, but the AI tools and the
  // GraphQL API accept any UUID directly, so self-reference and dangling
  // callee ids must be caught here too.
  private async validateRunWorkflowSteps({
    workspaceId,
    workflowId,
    steps,
  }: {
    workspaceId: string;
    workflowId?: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowValidationIssue[]> {
    const runWorkflowSteps = steps.filter(
      (step): step is WorkflowRunWorkflowAction =>
        step.type === WorkflowActionType.RUN_WORKFLOW,
    );

    if (runWorkflowSteps.length === 0) {
      return [];
    }

    const issues: WorkflowValidationIssue[] = [];

    for (const step of runWorkflowSteps) {
      issues.push(
        ...(await this.validateRunWorkflowStep({
          step,
          workspaceId,
          workflowId,
        })),
      );
    }

    return issues;
  }

  private async validateRunWorkflowStep({
    step,
    workspaceId,
    workflowId,
  }: {
    step: WorkflowRunWorkflowAction;
    workspaceId: string;
    workflowId?: string;
  }): Promise<WorkflowValidationIssue[]> {
    const targetWorkflowId = step.settings.input?.workflowId;

    if (!isNonEmptyString(targetWorkflowId)) {
      return [
        {
          severity: 'error',
          code: 'INVALID_STEP_PARAMS',
          message: `Step "${step.name ?? step.id}" has no workflow selected.`,
          stepId: step.id,
        },
      ];
    }

    if (isDefined(workflowId) && targetWorkflowId === workflowId) {
      return [
        {
          severity: 'error',
          code: 'RUN_WORKFLOW_SELF_REFERENCE',
          message: `Step "${step.name ?? step.id}" cannot run the workflow it belongs to.`,
          stepId: step.id,
        },
      ];
    }

    const targetWorkflow =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        return workflowRepository.findOneBy({ id: targetWorkflowId });
      }, buildSystemAuthContext(workspaceId));

    if (!isDefined(targetWorkflow)) {
      return [
        {
          severity: 'error',
          code: 'RUN_WORKFLOW_TARGET_NOT_FOUND',
          message: `Step "${step.name ?? step.id}" references a workflow that does not exist in this workspace.`,
          stepId: step.id,
        },
      ];
    }

    if (!isDefined(targetWorkflow.lastPublishedVersionId)) {
      return [
        {
          severity: 'warning',
          code: 'INVALID_STEP_PARAMS',
          message: `Step "${step.name ?? step.id}" targets workflow "${targetWorkflow.name}" which has no active version.`,
          stepId: step.id,
        },
      ];
    }

    return [];
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
