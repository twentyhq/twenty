import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import {
  MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES,
  NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES,
  validateWorkflowStructure,
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';
import { In, Repository } from 'typeorm';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { OBJECT_TARGETING_ACTION_TYPES } from 'src/modules/workflow/workflow-builder/workflow-validation/constants/object-targeting-action-types.constant';
import {
  WorkflowVersionValidationException,
  WorkflowVersionValidationExceptionCode,
} from 'src/modules/workflow/workflow-builder/workflow-validation/exceptions/workflow-version-validation.exception';
import { getWorkflowConnectedAccountIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-connected-account-issues.util';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { getWorkflowStepConnectedAccountId } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-step-connected-account-id.util';
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
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
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

    const connectedAccountIssues = await this.validateConnectedAccounts({
      workspaceId,
      steps,
    });

    return [
      ...structureResult.errors,
      ...structureResult.warnings,
      ...stepTypeIssues,
      ...metadataIssues,
      ...connectedAccountIssues,
    ];
  }

  private async validateConnectedAccounts({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowValidationIssue[]> {
    const connectedAccountIds = steps
      .map(getWorkflowStepConnectedAccountId)
      .filter(isDefined);

    if (connectedAccountIds.length === 0) {
      return [];
    }

    const connectedAccounts = await this.connectedAccountRepository.find({
      where: { id: In(connectedAccountIds), workspaceId },
    });

    return getWorkflowConnectedAccountIssues({ steps, connectedAccounts });
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
