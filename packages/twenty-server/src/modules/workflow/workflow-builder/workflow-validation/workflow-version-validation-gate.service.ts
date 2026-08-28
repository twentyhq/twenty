import { Injectable } from '@nestjs/common';

import { validateWorkflowStepParams } from 'twenty-shared/workflow';

import {
  WorkflowQueryValidationException,
  WorkflowQueryValidationExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';
import { WorkflowMetadataReadService } from 'src/modules/workflow/common/workspace-services/workflow-metadata-read.workspace-service';
import { getRecordCrudRichTextIssuesForSteps } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-record-crud-rich-text-issues-for-steps.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Injectable()
export class WorkflowVersionValidationGateService {
  constructor(
    private readonly workflowMetadataReadService: WorkflowMetadataReadService,
  ) {}

  async assertWorkflowVersionIsValidOrThrow({
    workspaceId,
    trigger,
    steps,
  }: {
    workspaceId: string;
    trigger: WorkflowTrigger | null | undefined;
    steps: WorkflowAction[] | null | undefined;
  }): Promise<void> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectIdByNameSingular,
    } = await this.workflowMetadataReadService.getFlatEntityMaps(workspaceId);

    const blockingIssues = [
      ...validateWorkflowStepParams({ trigger, steps }),
      ...getRecordCrudRichTextIssuesForSteps({
        steps: steps ?? [],
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
        objectIdByNameSingular,
      }),
    ].filter((issue) => issue.severity === 'error');

    if (blockingIssues.length === 0) {
      return;
    }

    throw new WorkflowQueryValidationException(
      `Workflow version is invalid: ${blockingIssues
        .map((issue) => issue.message)
        .join('; ')}`,
      WorkflowQueryValidationExceptionCode.INVALID_WORKFLOW_VERSION,
    );
  }
}
