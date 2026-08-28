import { Injectable } from '@nestjs/common';

import {
  MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES,
  validateWorkflowStructure,
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { getWorkflowRecordStepMetadataIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-record-step-metadata-issues.util';
import { validateWorkflowIteratorStep } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/validate-workflow-iterator-step.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowVersionValidationGateService {
  constructor(
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
  ) {}

  async assertWorkflowVersionIsWellFormedOrThrow({
    workspaceId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    trigger: WorkflowTrigger | null | undefined;
    steps: WorkflowAction[] | null | undefined;
  }): Promise<void> {
    const malformedIssues = (
      await this.getMalformedIssues({ workspaceId, trigger, steps })
    ).filter((issue) =>
      MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES.has(issue.code),
    );

    if (malformedIssues.length === 0) {
      return;
    }

    throw new WorkflowQueryValidationException(
      `Workflow version is invalid: ${malformedIssues
        .map((issue) => issue.message)
        .join('; ')}`,
      WorkflowQueryValidationExceptionCode.INVALID_WORKFLOW_VERSION,
    );
  }

  private async getMalformedIssues({
    workspaceId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    trigger: WorkflowTrigger | null | undefined;
    steps: WorkflowAction[] | null | undefined;
  }): Promise<WorkflowValidationIssue[]> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = await this.workflowMetadataReadService.getFlatEntityMaps(workspaceId);

    const structureResult = validateWorkflowStructure({ trigger, steps });

    const iteratorIssues = (steps ?? [])
      .filter(
        (step): step is WorkflowIteratorAction =>
          step.type === WorkflowActionType.ITERATOR,
      )
      .flatMap((step) =>
        validateWorkflowIteratorStep({
          step,
          steps: steps ?? [],
          trigger: trigger ?? null,
        }),
      );

    return [
      ...structureResult.errors,
      ...iteratorIssues,
      ...getWorkflowRecordStepMetadataIssues({
        steps: steps ?? [],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      }),
    ];
  }
}
